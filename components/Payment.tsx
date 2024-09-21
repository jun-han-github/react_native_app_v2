import { useStripe } from "@stripe/stripe-react-native";
import CustomButton from "./CustomButton";
import { Alert } from "react-native";
import { useState } from "react";
import { fetchAPI } from "@/libs/fetch";
import { PaymentProps } from "@/types/type";
import { useLocationStore } from "@/store";
import { useAuth } from "@clerk/clerk-expo";
import { IntentCreationCallbackParams } from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentSheet";
import { Result } from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentMethod";
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
    const { userAddress, userLatitude, userLongitude, destinationAddress, destinationLatitude, destinationLongitude } = useLocationStore();

    const confirmHandler = async (
        paymentMethod: Result,
        _: Boolean,
        intentCreationCallback: (result: IntentCreationCallbackParams) => void): Promise<void> => {

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
            const { result } = await fetchAPI("/(api)/(stripe)/pay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    payment_method_id: paymentMethod.id,
                    payment_intent_id: paymentIntent.id,
                    customer_id: customer.id
                })
            });

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
        const { error } = await initPaymentSheet({
            merchantDisplayName: "Example, Inc.",
            intentConfiguration: {
                mode: {
                    amount: 1099,
                    currencyCode: "usd",
                },
                confirmHandler: confirmHandler
            },
            returnURL:'myapp"//book-ride',
        })
        
        if (error) {
            // handle error
        }
    };

    const openPaymentSheet = async () => {
        
        await initializePaymentSheet();

        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert(`Error code: ${error.code}`, error.message);
        } else {
            setSuccess(true);
        }
    };

    return (
        <CustomButton
            title="Confirm Ride"
            className="my-10"
            onPress={openPaymentSheet}
        />
    )
}

export default Payment;