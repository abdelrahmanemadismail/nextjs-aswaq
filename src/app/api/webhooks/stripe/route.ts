import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/utils/stripe/stripe-server';
import { createClient as supabaseClient} from '@supabase/supabase-js'
import type Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const headerStore = await headers();
  const signature = headerStore.get('Stripe-Signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  try {
    // Verify the webhook signature
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Ensure we have the required metadata
      if (!session.metadata?.packageId || !session.metadata?.userId) {
        console.error('Missing required metadata in session', session.id);
        return NextResponse.json(
          { error: 'Missing metadata in session' },
          { status: 400 }
        );
      }

      await handleSuccessfulPayment(session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
}

// Process successful payment and update database
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const supabase = supabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)
  const packageId = session.metadata?.packageId;
  const userId = session.metadata?.userId;
  const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

  // Check if payment is already processed (idempotency)
  const { data: existingUserPackage } = await supabase
    .from('user_packages')
    .select('id')
    .eq('stripe_payment_intent_id', session.payment_intent)
    .single();

  if (existingUserPackage) {
    console.log('Payment already processed:', session.payment_intent);
    return;
  }

  try {
    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (packageError || !packageData) {
      throw new Error(`Failed to fetch package: ${packageError?.message || 'Package not found'}`);
    }

    // Calculate expiration date based on validity_days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + packageData.validity_days);

    // Create user package record
    const { data: userPackage, error: insertError } = await supabase
      .from('user_packages')
      .insert({
        user_id: userId,
        package_id: packageId,
        stripe_payment_intent_id: session.payment_intent,
        amount: amountPaid,
        currency: session.currency || 'usd',
        payment_status: 'succeeded',
        status: 'active',
        listings_remaining: packageData.listing_count,
        bonus_listings_remaining: packageData.bonus_listing_count,
        is_featured: packageData.is_featured,
        activated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create user package: ${insertError.message}`);
    }

    console.log('User package created successfully:', userPackage.id);
  } catch (error) {
    console.error('Failed to process payment:', error);
    throw error;
  }
}