import AsyncStorage from "@react-native-async-storage/async-storage";

export type AlertRule = {
  above?: number;
  below?: number;
  enabled: boolean;
  updatedAt: number;
  coinName?: string;
};

const KEY = "alerts:v1"; // single bucket

type Store = Record<string, AlertRule>; // coinId -> rule

export async function loadAllAlerts(): Promise<Store> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

export async function saveAlert(coinId: string, rule: AlertRule) {
  const store = await loadAllAlerts();
  store[coinId] = rule;
  await AsyncStorage.setItem(KEY, JSON.stringify(store));
}

export async function getAlert(coinId: string): Promise<AlertRule | undefined> {
  const store = await loadAllAlerts();
  return store[coinId];
}

export async function setEnabled(coinId: string, enabled: boolean) {
  const store = await loadAllAlerts();
  const cur = store[coinId];
  if (!cur) return;
  store[coinId] = { ...cur, enabled, updatedAt: Date.now() };
  await AsyncStorage.setItem(KEY, JSON.stringify(store));
}

export async function deleteAlert(coinId: string) {
  const store = await loadAllAlerts();
  delete store[coinId];
  await AsyncStorage.setItem(KEY, JSON.stringify(store));
}
