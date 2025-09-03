import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { QueryClientProvider } from "@tanstack/react-query";
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
  if (loading) return null; // optional splash

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
