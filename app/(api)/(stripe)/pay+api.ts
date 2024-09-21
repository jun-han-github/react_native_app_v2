import Stripe from "stripe";

const publishableKey = process.env.STRIPE_SECRET_KEY;
const stripe =  new Stripe(publishableKey!);

export async function POST(request: Request) {
    console.log("[pay+api POST] runs...");
    try {
        const body = await request.json();
        console.log("[pay+api POST] request...", body);
        const { payment_method_id, payment_intent_id, customer_id } = body;
    
        if (!payment_method_id || !payment_intent_id || !customer_id) {
            return new Response(
                JSON.stringify({ error: "Missing required payment information" }),
                { status: 400 },
            );
        }
    
        const paymentMethod = await stripe.paymentMethods.attach(
            payment_method_id,
            { customer: customer_id }
        );

        console.log("[pay+api POST] paymentMethods...", paymentMethod);
    
        const result = await stripe.paymentIntents.confirm(payment_intent_id, {
            payment_method: paymentMethod.id
        });

        console.log("[pay+api POST] paymentIntents...", result);

        return new Response(
            JSON.stringify({
                success: true,
                message: "Payment confirmed successfully",
                result: result
            })
        );

    } catch (error) {
        console.error(error);

        return new Response(JSON.stringify({
            success: true,
        }), {
            status: 500
        });
    }
};