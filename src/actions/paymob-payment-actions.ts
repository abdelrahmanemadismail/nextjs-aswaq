'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as supabaseClient} from '@supabase/supabase-js'
import { createPaymobSession, verifyPaymobPayment } from '@/utils/paymob/paymob-server'
import { packageSelectionSchema } from '@/schemas/package-schema'
import { revalidatePath } from 'next/cache'

// Initiate checkout with Paymob
export async function initiateCheckout({ packageId }: { packageId: string }) {
  try {
    console.log('Starting checkout process for package:', packageId);
    
    // Validate input
    const validatedData = packageSelectionSchema.parse({ packageId })
    
    // Get current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'You must be logged in to purchase a package' }
    }

    console.log('User authenticated:', user.id);

    // Get user profile for email and phone
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, phone_number, full_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    console.log('User profile data:', profile);
    
    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', validatedData.packageId)
      .single()
      
    if (packageError || !packageData) {
      console.error('Package error:', packageError);
      return { error: 'Package not found or unavailable' }
    }

    console.log('Package data:', packageData);

    // Validate package price
    if (packageData.price <= 0) {
      return { error: 'Invalid package price' }
    }

    // Extract user names from full_name
    const fullName = profile?.full_name || 'Customer Customer';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    // Ensure phone number is in correct format
    let phoneNumber = profile?.phone_number || '+971501234567';
    if (phoneNumber && !phoneNumber.startsWith('+')) {
      phoneNumber = '+971' + phoneNumber;
    }

    console.log('Creating Paymob session with:', {
      packageId: packageData.id,
      userId: user.id,
      amount: packageData.price,
      userEmail: profile?.email || user.email,
      firstName,
      lastName,
      phoneNumber
    });
    
    // Create checkout session with Paymob
    const { orderId, paymentKey, url, merchantOrderId } = await createPaymobSession({
      packageId: packageData.id,
      userId: user.id,
      name: packageData.name,
      description: packageData.description || `${packageData.name} Package`,
      amount: packageData.price,
      currency: 'AED', // UAE Dirham
      userEmail: profile?.email || user.email,
      userPhone: phoneNumber,
      userFirstName: firstName,
      userLastName: lastName,
    })
    
    console.log('Paymob session created:', { orderId, merchantOrderId });

    // Store payment session in database for tracking
    const { error: sessionError } = await supabase
      .from('payment_sessions')
      .insert({
        user_id: user.id,
        package_id: packageData.id,
        paymob_order_id: orderId,
        merchant_order_id: merchantOrderId,
        payment_key: paymentKey,
        amount: packageData.price,
        currency: 'AED',
        status: 'pending'
      })

    if (sessionError) {
      console.error('Error storing payment session:', sessionError)
      // Continue anyway, as this is not critical for the payment flow
    } else {
      console.log('Payment session stored successfully');
    }
    
    return { success: true, orderId, checkoutUrl: url }
  } catch (error) {
    console.error('Payment initiation error:', error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred'
    }
  }
}

// Verify payment and create user package
export async function verifyPayment(transactionId: string) {
  try {
    console.log('Verifying payment for transaction:', transactionId);
    
    const supabase = supabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Verify the payment with Paymob
    const { isComplete, orderId, merchantOrderId, amountTotal, currency, transactionId: txnId } = await verifyPaymobPayment(transactionId)
    
    console.log('Payment verification result:', {
      isComplete,
      orderId,
      merchantOrderId,
      amountTotal,
      currency,
      txnId
    });
    
    if (!isComplete) {
      return { error: 'Payment has not been completed' }
    }
    
    // Extract package and user info from merchant_order_id
    const orderParts = merchantOrderId.split('_')
    if (orderParts.length < 2) {
      console.error('Invalid merchant order ID format:', merchantOrderId);
      return { error: 'Invalid merchant order ID format' }
    }
    
    const packageId = orderParts[0]
    const userId = orderParts[1]
    
    console.log('Extracted from merchant order ID:', { packageId, userId });
    
    // Check if payment has already been processed
    const { data: existingPackage } = await supabase
      .from('user_packages')
      .select('id')
      .eq('paymob_transaction_id', txnId.toString())
      .single()
      
    if (existingPackage) {
      console.log('Payment already processed:', txnId);
      return { success: true, packageId: existingPackage.id, alreadyProcessed: true }
    }
    
    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single()
      
    if (packageError || !packageData) {
      console.error('Package not found:', packageError);
      return { error: 'Package not found' }
    }
    
    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + packageData.validity_days)
    
    console.log('Creating user package with data:', {
      userId,
      packageId,
      amount: amountTotal,
      listings_remaining: packageData.listing_count,
      bonus_listings_remaining: packageData.bonus_listing_count,
      expires_at: expiresAt.toISOString()
    });
    
    // Create user package
    const { data: userPackage, error: insertError } = await supabase
      .from('user_packages')
      .insert({
        user_id: userId,
        package_id: packageId,
        paymob_transaction_id: txnId.toString(),
        paymob_order_id: orderId.toString(),
        amount: amountTotal,
        currency: currency || 'AED',
        payment_status: 'succeeded',
        status: 'active',
        listings_remaining: packageData.listing_count,
        bonus_listings_remaining: packageData.bonus_listing_count,
        is_featured: packageData.is_featured,
        activated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()
      
    if (insertError) {
      console.error('Failed to create user package:', insertError);
      return { error: `Failed to create user package: ${insertError.message}` }
    }

    console.log('User package created successfully:', userPackage.id);

    // Update payment session status
    const { error: updateError } = await supabase
      .from('payment_sessions')
      .update({ 
        status: 'completed',
        paymob_transaction_id: txnId.toString()
      })
      .eq('paymob_order_id', orderId.toString())

    if (updateError) {
      console.error('Error updating payment session:', updateError);
      // Not critical, continue
    }
    
    // Revalidate paths that might show package information
    revalidatePath('/profile')
    revalidatePath('/packages')
    
    return { success: true, packageId: userPackage.id }
  } catch (error) {
    console.error('Payment verification error:', error)
    return { 
      error: error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during payment verification' 
    }
  }
}

// Helper function to get active packages for a user
export async function getUserPackages() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'User not authenticated' }
  }
  
  try {
    const { data, error } = await supabase
      .from('user_packages')
      .select(`
        *,
        package:packages (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      
    if (error) {
      throw error
    }
    
    return { packages: data }
  } catch (error) {
    console.error('Error fetching user packages:', error)
    return { error: 'Failed to fetch packages' }
  }
}

// Get all available packages
export async function getAvailablePackages() {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })
      
    if (error) {
      throw error
    }
    
    // Group packages by type
    const groupedPackages = {
      free_tier: data.filter(pkg => pkg.package_type === 'free_tier'),
      duration: data.filter(pkg => pkg.package_type === 'duration'),
      bulk: data.filter(pkg => pkg.package_type === 'bulk'),
      unlimited: data.filter(pkg => pkg.package_type === 'unlimited'),
    }
    
    return { 
      success: true, 
      packages: groupedPackages 
    }
  } catch (error) {
    console.error('Error fetching packages:', error)
    return { error: 'Failed to fetch packages' }
  }
}