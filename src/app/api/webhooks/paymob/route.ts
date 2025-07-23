import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient as supabaseClient} from '@supabase/supabase-js'
import crypto from 'crypto';

interface PaymobWebhookData {
  obj: {
    id: number;
    pending: boolean;
    amount_cents: number;
    success: boolean;
    is_auth: boolean;
    is_capture: boolean;
    is_standalone_payment: boolean;
    is_voided: boolean;
    is_refunded: boolean;
    is_3d_secure: boolean;
    integration_id: number;
    profile_id: number;
    has_parent_transaction: boolean;
    order: {
      id: number;
      created_at: string;
      delivery_needed: boolean;
      merchant_order_id: string;
      amount_cents: number;
      currency: string;
      is_payment_locked: boolean;
      paid_amount_cents: number;
      items: any[];
    };
    created_at: string;
    currency: string;
    source_data: {
      pan: string;
      type: string;
      sub_type: string;
    };
    api_source: string;
    merchant_commission: number;
    is_void: boolean;
    is_refund: boolean;
    data: {
      gateway_integration_pk: number;
      amount: number;
      currency: string;
      email: string;
      order_id: number;
      merchant_txn_ref: string;
      txn_response_code: string;
      gateway_integration_id: number;
      acq_response_code: string;
      merchant_order_id: string;
      message: string;
    };
    is_hidden: boolean;
    error_occured: boolean;
    is_live: boolean;
    refunded_amount_cents: number;
    source_id: number;
    is_captured: boolean;
    captured_amount: number;
    updated_at: string;
    is_settled: boolean;
    owner: number;
  };
  type: string;
}

// Function to verify Paymob webhook signature
function verifyPaymobSignature(body: string, signature: string): boolean {
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  if (!hmacSecret) {
    console.error('PAYMOB_HMAC_SECRET not configured');
    return false;
  }

  // Parse the webhook data
  const data = JSON.parse(body);
  
  // Create the concatenated string as per Paymob documentation
  const concatenatedString = [
    data.obj.amount_cents,
    data.obj.created_at,
    data.obj.currency,
    data.obj.error_occured,
    data.obj.has_parent_transaction,
    data.obj.id,
    data.obj.integration_id,
    data.obj.is_3d_secure,
    data.obj.is_auth,
    data.obj.is_capture,
    data.obj.is_refunded,
    data.obj.is_standalone_payment,
    data.obj.is_voided,
    data.obj.order.id,
    data.obj.owner,
    data.obj.pending,
    data.obj.source_data.pan,
    data.obj.source_data.sub_type,
    data.obj.source_data.type,
    data.obj.success,
  ].join('');

  // Create HMAC signature
  const expectedSignature = crypto
    .createHmac('sha512', hmacSecret)
    .update(concatenatedString)
    .digest('hex');

  return signature === expectedSignature;
}

export async function POST(request: Request) {
  const body = await request.text();
  const headerStore = await headers();
  const signature = headerStore.get('X-Paymob-Signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  // Verify webhook signature
  if (!verifyPaymobSignature(body, signature)) {
    console.error('Invalid Paymob webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const webhookData: PaymobWebhookData = JSON.parse(body);

    // Handle successful payment
    if (webhookData.type === 'TRANSACTION' && webhookData.obj.success && !webhookData.obj.pending) {
      await handleSuccessfulPayment(webhookData.obj);
    }

    // Handle failed payment
    if (webhookData.type === 'TRANSACTION' && !webhookData.obj.success) {
      await handleFailedPayment(webhookData.obj);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}

// Process successful payment and update database
async function handleSuccessfulPayment(transactionData: PaymobWebhookData['obj']) {
  const supabase = supabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const transactionId = transactionData.id.toString();
  const orderId = transactionData.order.id.toString();
  const merchantOrderId = transactionData.order.merchant_order_id;
  const amountPaid = transactionData.amount_cents / 100;

  // Check if payment is already processed (idempotency)
  const { data: existingUserPackage } = await supabase
    .from('user_packages')
    .select('id')
    .eq('paymob_transaction_id', transactionId)
    .single();

  if (existingUserPackage) {
    console.log('Payment already processed:', transactionId);
    return;
  }

  try {
    // Extract package and user info from merchant_order_id
    const orderParts = merchantOrderId.split('_');
    if (orderParts.length < 2) {
      throw new Error(`Invalid merchant order ID format: ${merchantOrderId}`);
    }

    const packageId = orderParts[0];
    const userId = orderParts[1];

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
        paymob_transaction_id: transactionId,
        paymob_order_id: orderId,
        amount: amountPaid,
        currency: transactionData.currency || 'AED',
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

    // Update payment session status
    await supabase
      .from('payment_sessions')
      .update({ 
        status: 'completed',
        paymob_transaction_id: transactionId
      })
      .eq('paymob_order_id', orderId);

    console.log('User package created successfully:', userPackage.id);
  } catch (error) {
    console.error('Failed to process successful payment:', error);
    
    // Update payment session with error
    await supabase
      .from('payment_sessions')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('paymob_order_id', orderId);
    
    throw error;
  }
}

// Handle failed payment
async function handleFailedPayment(transactionData: PaymobWebhookData['obj']) {
  const supabase = supabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const transactionId = transactionData.id.toString();
  const orderId = transactionData.order.id.toString();

  try {
    // Update payment session with failed status
    await supabase
      .from('payment_sessions')
      .update({ 
        status: 'failed',
        paymob_transaction_id: transactionId,
        error_message: transactionData.data?.message || 'Payment failed'
      })
      .eq('paymob_order_id', orderId);

    console.log('Payment failed, session updated:', transactionId);
  } catch (error) {
    console.error('Failed to update failed payment session:', error);
  }
}