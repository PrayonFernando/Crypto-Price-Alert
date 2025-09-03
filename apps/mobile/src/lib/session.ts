import * as SecureStore from "expo-secure-store";

const KEY = "auth_token";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(KEY, token);
}
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY);
}
export async function clearToken() {
  await SecureStore.deleteItemAsync(KEY);
}
