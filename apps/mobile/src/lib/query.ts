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
      staleTime: 15_000, // 15s fresh
      gcTime: 5 * 60_000, // 5 min cache
      retry: 1, // be gentle on flaky networks
      refetchOnReconnect: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false, // RN has no window; we’ll manage focus manually
    },
  },
});
