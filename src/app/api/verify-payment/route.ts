import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/utils/stripe/stripe-server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 400 }
      );
    }
    
    // Get payment details from database
    const supabase = await createClient();
    const { data: packageData, error } = await supabase
      .from('user_packages')
      .select(`
        *,
        package:packages (
          name,
          listing_count,
          bonus_listing_count,
          duration_days
        )
      `)
      .eq('stripe_checkout_session_id', sessionId)
      .single();
      
    if (error) {
      console.error('Error retrieving payment details:', error);
    }
    
    return NextResponse.json({
      status: session.payment_status,
      customerId: session.customer,
      packageDetails: packageData?.package || null,
      amountTotal: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency?.toUpperCase() || 'AED'
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}