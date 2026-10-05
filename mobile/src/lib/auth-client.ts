import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "./config";

// Signs in through the website's Better Auth server, so the app and the website share one account.
export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: "ilegoods",
      storagePrefix: "ilegoods",
      storage: SecureStore,
    }),
  ],
});
