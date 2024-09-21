import { useUser } from "@clerk/clerk-expo";
import { Image, Text, View } from "react-native";

import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { formatTime } from "@/libs/utils";
import { useDriverStore, useLocationStore } from "@/store";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";

const BookRide = () => {
    const { user } = useUser();
    const { userAddress, destinationAddress } = useLocationStore();
    const { drivers, selectedDriver } = useDriverStore();

    const driverDetails = drivers?.filter(
        (driver) => driver.driver_id === selectedDriver,
    )[0];

    return (
        <RideLayout title="Book Ride">
            <>
                <Text className="text-xl mb-3">
                    Ride Information
                </Text>

                <View className="flex flex-col w-full items-center justify-center mt-10">
                    <Image
                        source={{
                            uri: driverDetails?.profile_image_url
                        }}
                        className="w-28 h-28 rounded-full"
                    />

                    <View className="flex flex-row items-center justify-center mt-5 space-x-2">
                        <Text className="text-lg">
                            { driverDetails?.title }
                        </Text>

                        <View className="flex flex-row items-center space-x-0.5">
                            <Image
                                source={icons.star}
                                className="w-5 h-5"
                                resizeMode="contain"
                            />
                            <Text className="text-lg">
                                { driverDetails?.rating }
                            </Text>
                        </View>
                    </View>
                </View>

                <View
                    className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
                    <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
                        <Text className="text-lg">Ride Price</Text>
                        <Text className="text-lg text-[#0CC25F]">
                            ${ driverDetails?.price }
                        </Text>
                    </View>

                    <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
                        <Text className="text-lg">Pickup Time</Text>
                        <Text className="text-lg">
                            { formatTime(driverDetails?.time!) || 5 }
                        </Text>
                    </View>

                    <View className="flex flex-row items-center justify-between w-full py-3">
                        <Text className="text-lg">Car Seats</Text>
                        <Text className="text-lg">
                            { driverDetails?.car_seats }
                        </Text>
                    </View>
                </View>

                <View className="flex flex-col w-full items-start justify-center mt-5">
                    <View
                        className="flex flex-row items-center justify-start mt-3 border-t border-b border-general-700 w-full py-3">
                        <Image source={icons.to} className="w-6 h-6"/>
                        <Text className="text-lg ml-2">
                            { userAddress }
                        </Text>
                    </View>

                    <View className="flex flex-row items-center justify-start border-b border-general-700 w-full py-3">
                        <Image source={icons.point} className="w-6 h-6"/>
                        <Text className="text-lg ml-2">
                            { destinationAddress }
                        </Text>
                    </View>
                </View>

                <View>
                    <CustomButton
                        title="Find My Ride"
                        className="mt-5"
                        onPress={() => router.push("/(root)/confirm-ride")}
                    />
                </View>
            </>
        </RideLayout>
    );
};

export default BookRide;