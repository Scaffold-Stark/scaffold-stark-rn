import { InfoCard } from "@/app/_components/InfoCard";
import { WelcomeSection } from "@/app/_components/WelcomeSection";
import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { ScrollView, StatusBar, View } from "react-native";

// STRK Address: 0x4718F5A0FC34CC1AF16A1CDEE98FFB20C31F5CD61D6AB07201858F4287C938D

export default function Index() {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const router = useRouter();

  const handleDebugPress = () => {
    router.push("/debug");
  };

  return (
    <View className="flex-1">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <WelcomeSection />
        <View className="px-4 py-6">
          <InfoCard
            icon={<Ionicons name="bug" size={24} color={colors.text} />}
            title="Tinker with your smart contract using the Debug Contracts tab."
            description=""
            onPress={handleDebugPress}
          />
          <InfoCard
            icon={<Ionicons name="pricetag" size={24} color={colors.text} />}
            title="Play around with Multiwrite transactions using useScaffoldMultiWrite() hook"
            description=""
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </View>
  );
}
