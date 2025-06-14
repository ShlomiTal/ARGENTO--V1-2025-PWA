#!/bin/bash
echo "🔄 Updating Expo-related packages to match expected versions..."

npx expo install \
expo@53.0.11 \
expo-blur@14.1.5 \
expo-constants@17.1.6 \
expo-image@2.3.0 \
expo-linear-gradient@14.1.5 \
expo-linking@7.1.5 \
expo-location@18.1.5 \
expo-router@5.1.0 \
expo-splash-screen@0.30.9 \
expo-symbols@0.4.5 \
expo-system-ui@5.0.8 \
react-native@0.79.3 \
react-native-safe-area-context@5.4.0 \
react-native-screens@4.11.1

echo "✅ Packages updated. You can now restart the Railway container."
