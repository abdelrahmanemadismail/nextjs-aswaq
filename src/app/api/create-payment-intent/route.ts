import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/utils/stripe/stripe-server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Validate the request body
const requestSchema = z.object({
  packageId: z.string().uuid(),
  userId: z.string().uuid()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { packageId, userId } = validation.data;
    
    // Get package details from database
    const supabase = await createClient();
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();
      
    if (packageError || !packageData) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }
    
    // Create the PaymentIntent with the package amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(packageData.stripe_price_id * 100), // Convert to cents
      currency: 'aed',
      metadata: {
        package_id: packageId,
        user_id: userId,
        package_name: packageData.name
      },
      automatic_payment_methods: { enabled: true }
    });
    
    // Create a pending record in user_packages
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + packageData.validity_days);
    
    const { error: insertError } = await supabase
      .from('user_packages')
      .insert({
        user_id: userId,
        package_id: packageId,
        amount: packageData.stripe_price_id,
        currency: 'aed',
        payment_status: 'pending',
        status: 'pending',
        listings_remaining: packageData.listing_count,
        bonus_listings_remaining: packageData.bonus_listing_count || 0,
        is_featured: packageData.is_featured,
        stripe_payment_intent_id: paymentIntent.id,
        expires_at: expirationDate.toISOString()
      });
      
    if (insertError) {
      console.error('Error creating user package record:', insertError);
      return NextResponse.json(
        { error: 'Failed to create package record' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    });
    
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}