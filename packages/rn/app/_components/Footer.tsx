import { Linking, Text, View } from "react-native";
import {
  themeColors,
  useTheme,
} from "../../components/scaffold-stark/ThemeProvider";

export default function Footer() {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  return (
    <View className="flex-row items-center justify-center gap-2">
      <Text
        className="underline"
        style={{ color: colors.text }}
        accessibilityRole="link"
        onPress={() =>
          Linking.openURL("https://github.com/Scaffold-Stark/scaffold-stark-rn")
        }
      >
        Folk me
      </Text>
      <Text className="underline" style={{ color: colors.text }}>
        Support
      </Text>
    </View>
  );
}
