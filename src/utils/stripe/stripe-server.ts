import Stripe from 'stripe';

// Initialize the Stripe client with the secret key
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY||"", {
      apiVersion: '2025-01-27.acacia', // Use the latest API version
      appInfo: {
        name: 'ASWAQ Online',
        version: '1.0.0',
      },
    });
  }
  return stripeInstance;
}

// Function to create a checkout session
export async function createCheckoutSession({
  packageId,
  userId,
  name,
  description,
  amount,
  currency = 'usd',
}: {
  packageId: string;
  userId: string;
  name: string;
  description: string;
  amount: number;
  currency?: string;
}) {
  try {
    const stripe = getStripe();

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: name,
              description: description,
            },
            unit_amount: Math.round(amount * 100), // Amount in smallest currency unit
          },
          quantity: 1,
        },
      ],
      metadata: {
        packageId: packageId,
        userId: userId,
      },
      mode: 'payment', // one-time payment
      success_url: `${process.env.NEXT_PUBLIC_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/payment-cancelled`,
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Function to verify a session is complete
export async function verifyCheckoutSession(sessionId: string) {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return {
      isComplete: session.payment_status === 'paid',
      metadata: session.metadata,
      amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
    };
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    throw error;
  }
}