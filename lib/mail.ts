import FormData from "form-data";
import Mailgun from "mailgun.js";
import { formatNaira } from "./money";
import { PAYMENT_LABELS, type Order, type OrderItem } from "./orders";

function client() {
  const key = process.env.MAILGUN_API_KEY;
  if (!key) throw new Error("MAILGUN_API_KEY is not set");
  return new Mailgun(FormData).client({
    username: "api",
    key,
    url: process.env.MAILGUN_URL || "https://api.mailgun.net",
  });
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function nextSteps(order: Order) {
  return order.payment_method === "bank_transfer"
    ? "We'll email our bank details within the hour. Your order ships as soon as the transfer lands."
    : "Have the exact amount ready in cash or by card when the rider arrives. Most Lagos orders arrive in 2-3 working days, other states in 4-6.";
}

export async function sendOrderConfirmation(order: Order, items: OrderItem[], siteUrl: string) {
  const orderUrl = `${siteUrl}/orders/${order.id}`;
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eaeaea">${escape(i.name)} <span style="color:#787774">x ${i.quantity}</span></td>
        <td style="padding:10px 0;border-bottom:1px solid #eaeaea;text-align:right">${formatNaira(i.unit_price_kobo * i.quantity)}</td>
      </tr>`,
    )
    .join("");
  const line = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:4px 0;color:${bold ? "#111" : "#787774"};${bold ? "font-weight:600" : ""}">${label}</td>
     <td style="padding:4px 0;text-align:right;${bold ? "font-weight:600" : ""}">${value}</td></tr>`;

  const html = `<!doctype html><html><body style="margin:0;background:#f7f6f3;font-family:Helvetica,Arial,sans-serif;color:#2f3437">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <p style="font-family:Georgia,serif;font-size:22px;margin:0 0 32px">Ilé Goods</p>
    <div style="background:#fff;border:1px solid #eaeaea;border-radius:12px;padding:32px">
      <h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;margin:0 0 8px">Thanks, ${escape(order.full_name.split(" ")[0])}. Your order is in.</h1>
      <p style="color:#787774;margin:0 0 24px">Order ${order.order_number}</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px">${rows}</table>
      <table style="width:100%;border-collapse:collapse;font-size:15px;margin-top:16px">
        ${line("Subtotal", formatNaira(order.subtotal_kobo))}
        ${line("Delivery", order.shipping_kobo ? formatNaira(order.shipping_kobo) : "Free")}
        ${line("Includes VAT (7.5%)", formatNaira(order.vat_kobo))}
        ${line("Total", formatNaira(order.total_kobo), true)}
      </table>
      <h2 style="font-size:15px;margin:28px 0 6px">What happens next</h2>
      <p style="margin:0;line-height:1.6">${nextSteps(order)}</p>
      <h2 style="font-size:15px;margin:24px 0 6px">Delivering to</h2>
      <p style="margin:0;line-height:1.6">${escape(order.full_name)}<br>${escape(order.address)}<br>${escape(order.city)}, ${escape(order.state)}<br>${escape(order.phone)}</p>
      <p style="margin:24px 0 0;line-height:1.6">Payment: ${PAYMENT_LABELS[order.payment_method]}</p>
      <a href="${orderUrl}" style="display:inline-block;margin-top:28px;background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px">View your order</a>
    </div>
    <p style="color:#787774;font-size:13px;line-height:1.6;margin-top:24px">Questions? Reply to this email and a person on our team will answer.</p>
  </div></body></html>`;

  const text = [
    `Thanks, ${order.full_name}. Your order ${order.order_number} is in.`,
    "",
    ...items.map((i) => `${i.name} x ${i.quantity}: ${formatNaira(i.unit_price_kobo * i.quantity)}`),
    "",
    `Subtotal: ${formatNaira(order.subtotal_kobo)}`,
    `Delivery: ${order.shipping_kobo ? formatNaira(order.shipping_kobo) : "Free"}`,
    `Includes VAT (7.5%): ${formatNaira(order.vat_kobo)}`,
    `Total: ${formatNaira(order.total_kobo)}`,
    "",
    `What happens next: ${nextSteps(order)}`,
    "",
    `View your order: ${orderUrl}`,
  ].join("\n");

  return client().messages.create(process.env.MAILGUN_DOMAIN!, {
    from: process.env.MAILGUN_FROM!,
    to: [`${order.full_name} <${order.email}>`],
    subject: `Order ${order.order_number} confirmed`,
    text,
    html,
  });
}
