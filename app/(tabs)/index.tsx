import { Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <Text className={"text-grey-300"}>React Native V2</Text>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}