import { View, Text } from "react-native";

export default function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View style={{ backgroundColor: "#3d0f0f", padding: 10 }}>
      <Text style={{ color: "#ffb3b3" }}>{message}</Text>
    </View>
  );
}
