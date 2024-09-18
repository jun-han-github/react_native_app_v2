import { icons } from "@/constants";
import { router } from "expo-router";
import { ReactNode, useRef } from "react"
import { Image, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Map from "./Map";

const RideLayout = ({ title, children }: { title?: string; children: ReactNode }) => {

    const bottomSheetRef =  useRef<BottomSheet>(null);
    return <GestureHandlerRootView>
        <View className="flex-1 bg-white">
            <View className="flex flex-col h-screen bg-blue-500">
                <View className="flex flex-row absolute z-10 top-16 items-center justify-start px-5">
                    <TouchableOpacity onPress={() => router.back()}>
                        <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                            <Image
                                source={icons.backArrow}
                                resizeMode="contain"
                                className="w-6 h-6"
                            />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-xl ml-5">{ title || 'Go Back' }</Text>
                </View>
                <Map/>
            </View>

            <BottomSheet 
                ref={bottomSheetRef}
                snapPoints={['40%', '85%']}
                index={0}
            >
                <BottomSheetView style={{ flex: 1, padding: 20 }}>
                    { children }
                </BottomSheetView>
            </BottomSheet>
        </View>
    </GestureHandlerRootView>
};

export default RideLayout;