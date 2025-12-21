import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context"

export default function SyncScreen() {
  return (
    <SafeAreaView className="bg-background flex-1" edges={["top"]}>
      <Text>Sync Screen</Text>
    </SafeAreaView>
  );
}
