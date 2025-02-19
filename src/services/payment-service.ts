import { getStripe } from '@/utils/stripe/stripe-client';

export interface CreatePaymentIntentResponse {
  clientSecret: string;
}

export async function createPaymentIntent(packageId: string, userId: string): Promise<CreatePaymentIntentResponse> {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packageId,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment service error:', error);
    throw error;
  }
}

export async function redirectToCheckout(packageId: string): Promise<void> {
  try {
    // Get Stripe instance
    const stripe = await getStripe();
    if (!stripe) throw new Error('Failed to load Stripe');

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: packageId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/payment/canceled`,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}