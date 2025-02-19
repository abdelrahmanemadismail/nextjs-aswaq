import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/utils/stripe/stripe-server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing stripe signature or webhook secret' },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook Error: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update user package in the database
      try {
        const supabase = await createClient();
        
        // Get metadata from the payment intent
        // const { user_id, package_id } = paymentIntent.metadata;
        
        // Update user_packages table with successful payment
        await supabase
          .from('user_packages')
          .update({
            payment_status: 'succeeded',
            status: 'active',
            activated_at: new Date().toISOString(),
            stripe_payment_intent_id: paymentIntent.id
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);
          
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      } catch (error) {
        console.error('Error updating user package:', error);
      }
      break;
      
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      // Update payment status to failed
      try {
        const supabase = await createClient();
        await supabase
          .from('user_packages')
          .update({
            payment_status: 'failed'
          })
          .eq('stripe_payment_intent_id', failedPaymentIntent.id);
          
        console.log(`Payment failed for PaymentIntent: ${failedPaymentIntent.id}`);
      } catch (error) {
        console.error('Error updating failed payment:', error);
      }
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

export const GET = async () => {
  return NextResponse.json(
    { error: 'This endpoint only accepts POST requests' },
    { status: 405 }
  );
};