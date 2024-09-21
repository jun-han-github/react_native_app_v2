import { useStripe } from "@stripe/stripe-react-native";
import CustomButton from "./CustomButton";
import { Alert, Image, Text, View } from "react-native";
import { useState } from "react";
import { fetchAPI } from "@/libs/fetch";
import { PaymentProps } from "@/types/type";
import { useLocationStore } from "@/store";
import { useAuth } from "@clerk/clerk-expo";
import { IntentCreationCallbackParams } from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentSheet";
import { Result } from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentMethod";
import ReactNativeModal from "react-native-modal";
import { images } from "@/constants";
import { router } from "expo-router";
const Payment = ({
    fullName,
    email,
    amount,
    driverId,
    rideTime,
}: PaymentProps) => {

    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [success, setSuccess] = useState(false);
    const { userId } = useAuth();
    const {
        userAddress,
        userLatitude,
        userLongitude,
        destinationAddress,
        destinationLatitude,
        destinationLongitude
    } = useLocationStore();

    const confirmHandler = async (
        paymentMethod: Result,
        _: Boolean,
        intentCreationCallback: (result: IntentCreationCallbackParams) => void
    ): Promise<void> => {

        console.log("[confirmHandler] runs...");
        const { paymentIntent, customer } = await fetchAPI("/(api)/(stripe)/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: fullName || email.split("@")[0],
                email,
                amount,
                paymentMethodId: paymentMethod.id,
            }),
        });

        if (paymentIntent.client_secret) {
            console.log("[confirmHandler > paymentIntent]: ", paymentIntent);
            console.log("[confirmHandler > customer]: ", customer);
            const { result } = await fetchAPI("/(api)/(stripe)/pay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    payment_method_id: paymentMethod.id,
                    payment_intent_id: paymentIntent.id,
                    customer_id: customer
                })
            });

            console.log("[confirmHandler > pay]: ", result);

            if (result.client_secret) {
                await fetchAPI("/(api)/ride/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        origin_address: userAddress,
                        destination_address: destinationAddress,
                        origin_latitude: userLatitude,
                        origin_longitude: userLongitude, 
                        destination_latitude: destinationLatitude, 
                        destination_longitude: destinationLongitude, 
                        ride_time: rideTime.toFixed(0), 
                        fare_price: parseInt(amount) * 100, 
                        payment_status: 'paid',
                        driver_id: driverId,
                        user_id: userId,
                    })
                });

                intentCreationCallback({
                    clientSecret: result.client_secret
                });
            };

            console.log("[PAYMENT RESULT]: ", result);
        };
    };

    const initializePaymentSheet = async () => {
        console.log("[initializePaymentSheet] runs...");

        const { error } = await initPaymentSheet({
            merchantDisplayName: "Ryde, Inc",
            intentConfiguration: {
                mode: {
                    amount: parseInt(amount) * 100,
                    currencyCode: "usd",
                },
                confirmHandler: confirmHandler
            },
            returnURL:'myapp"//book-ride',
        })
        
        if (error) {
            console.log(error);
        }
    };

    const openPaymentSheet = async () => {
        console.log("[openPaymentSheet] runs...");
        await initializePaymentSheet();

        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert(`Error code: ${error.code}`, error.message);
        } else {
            console.log("Successfully open payment sheet");
            setSuccess(true);
        }
    };

    return (
        <>        
            <CustomButton
                title="Confirm Ride"
                className="my-10"
                onPress={openPaymentSheet}
            />

            <ReactNativeModal
                isVisible={success}
                onBackdropPress={() => setSuccess(false)}
            >
                <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
                    <Image source={images.check} className="w-28 h-28 mt-5" />
                    <Text className="text-2xl text-center font-bold mt-5">
                        Ride booked!
                    </Text>

                    <Text className="text-md text-general-200 text-center mt-3">
                        Thank you for booking. Your reservation has been placed. Please proceed with your trip!
                    </Text>

                    <CustomButton
                        title="Back"
                        onPress={() => {
                            setSuccess(false);
                            router.push("/(root)/(tabs)/home");
                        }}
                        className="mt-5"
                    />
                </View>
            </ReactNativeModal>
        </>
    )
}

export default Payment;