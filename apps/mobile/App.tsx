import "./src/polyfills"; // keep this FIRST

import React, { useEffect } from "react";
import { AppState } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import {
  QueryClientProvider,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import { queryClient } from "./src/lib/query";

import { RootStackParamList, TabParamList } from "./src/navigation/types";
import { AuthProvider, useAuth } from "./src/hooks/useAuth";

import MarketsScreen from "./src/screens/MarketsScreen";
import CoinDetailScreen from "./src/screens/CoinDetailScreen";
import AlertsScreen from "./src/screens/AlertsScreen";
import AlertsListScreen from "./src/screens/AlertsListScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AccountScreen from "./src/screens/AccountScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: "#0B0B0B" },
};

// Optional: wire React Query to app focus + connectivity.
// NetInfo is optional—this works even if you didn't install it.
function useReactQueryAppLifecycle() {
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      focusManager.setFocused(state === "active");
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    try {
      // Lazy require so the app works even if NetInfo isn't installed
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const NetInfo = require("@react-native-community/netinfo").default;
      const unsub = NetInfo.addEventListener((s: any) => {
        onlineManager.setOnline(Boolean(s.isConnected));
      });
      return () => unsub();
    } catch {
      // If NetInfo isn't installed, assume we're online.
      onlineManager.setOnline(true);
    }
  }, []);
}

function TabsNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#111" },
      }}
    >
      <Tabs.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <Tabs.Screen
        name="MarketsTab"
        component={MarketsScreen}
        options={{ title: "Markets" }}
      />
      <Tabs.Screen
        name="AlertsTab"
        component={AlertsListScreen}
        options={{ title: "Alerts" }}
      />
      <Tabs.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{ title: "Account" }}
      />
    </Tabs.Navigator>
  );
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen
            name="MainTabs"
            component={TabsNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CoinDetail"
            component={CoinDetailScreen}
            options={{ title: "Details" }}
          />
          <Stack.Screen
            name="Alerts"
            component={AlertsScreen}
            options={{ title: "Set Alert" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Auth"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ title: "Create account" }}
          />
          <Stack.Screen
            name="CoinDetail"
            component={CoinDetailScreen}
            options={{ title: "Details" }}
          />
          <Stack.Screen
            name="Alerts"
            component={AlertsScreen}
            options={{ title: "Set Alert" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  useReactQueryAppLifecycle();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={theme}>
          <Root />
        </NavigationContainer>
      </QueryClientProvider>
    </AuthProvider>
  );
}
