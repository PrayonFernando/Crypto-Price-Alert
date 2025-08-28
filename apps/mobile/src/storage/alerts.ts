import AsyncStorage from "@react-native-async-storage/async-storage";

export type AlertMode = "notify" | "alarm";
export type AlertRule = {
  id: string; // uuid
  coinId: string;
  above?: number;
  below?: number;
  mode: AlertMode;
  createdAt: number;
};

const KEY = "alerts:v1";

export async function getAlerts(): Promise<AlertRule[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AlertRule[];
  } catch {
    return [];
  }
}

export async function addAlert(a: AlertRule): Promise<void> {
  const list = await getAlerts();
  list.push(a);
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function getAlertsByCoin(coinId: string): Promise<AlertRule[]> {
  const list = await getAlerts();
  return list.filter((a) => a.coinId === coinId);
}
