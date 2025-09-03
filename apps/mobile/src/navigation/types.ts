export type RootStackParamList = {
  Auth: undefined;
  Signup: undefined;
  MainTabs: undefined;
  CoinDetail: { coinId: string };
  Alerts: { coinId: string; coinName: string };
};

export type TabParamList = {
  HomeTab: undefined;
  MarketsTab: undefined;
  AlertsTab: undefined;
  AccountTab: undefined;
};
