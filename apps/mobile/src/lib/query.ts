import {
  QueryClient,
  onlineManager,
  focusManager,
} from "@tanstack/react-query";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { AppState } from "react-native";

// Keep React Query in sync with device connectivity (RN)
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state: NetInfoState) => {
    setOnline(Boolean(state.isConnected));
  }),
);

// Refetch when the app returns to foreground
focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener("change", (status) => {
    handleFocus(status === "active");
  });
  return () => sub.remove();
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnReconnect: true,
      // Note: in React Query v5, `refetchOnWindowFocus` is web-only;
      // in RN we use focusManager above instead.
    },
  },
});
