// The website this app syncs with. Override with EXPO_PUBLIC_API_URL to point at a local `next dev`.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "https://ile-goods.netlify.app").replace(/\/$/, "");
