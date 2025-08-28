// apps/mobile/app.config.js
const path = require("path");
module.exports = {
  expo: {
    name: "Crypto Alert",
    slug: "crypto-alert",
    icon: path.resolve(__dirname, "./assets/icon.png"),
    splash: {
      image: path.resolve(__dirname, "./assets/splash.png"),
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: path.resolve(__dirname, "./assets/adaptive-icon.png"),
        backgroundColor: "#000000",
      },
      notification: {
        icon: path.resolve(__dirname, "./assets/notification-icon.png"),
        color: "#FFD400",
        channel: "price-alerts",
      },
    },
    plugins: ["expo-notifications"],
    runtimeVersion: { policy: "sdkVersion" },
  },
};
