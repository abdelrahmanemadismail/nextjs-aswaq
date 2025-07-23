// utils/paymob/paymob-server.ts
interface PaymobAuthResponse {
    token: string;
  }
  
  interface PaymobOrderResponse {
    id: number;
    created_at: string;
    delivery_needed: boolean;
    merchant: {
      id: number;
      created_at: string;
      phones: string[];
      company_emails: string[];
      company_name: string;
      state: string;
      country: string;
      city: string;
      postal_code: string;
      street: string;
    };
    collector: null;
    amount_cents: number;
    shipping_data: {
      id: number;
      first_name: string;
      last_name: string;
      street: string;
      building: string;
      floor: string;
      apartment: string;
      city: string;
      state: string;
      country: string;
      email: string;
      phone_number: string;
      postal_code: string;
      extra_description: string;
      shipping_method: string;
      order_id: number;
    };
    currency: string;
    is_payment_locked: boolean;
    is_return: boolean;
    is_cancel: boolean;
    is_returned: boolean;
    is_canceled: boolean;
    merchant_order_id: string;
    wallet_notification: null;
    paid_amount_cents: number;
    notify_user_with_email: boolean;
    items: any[];
    order_url: string;
    commission_fees: number;
    delivery_fees_cents: number;
    delivery_vat_cents: number;
    payment_method: string;
    merchant_staff_tag: null;
    api_source: string;
    data: Record<string, any>;
  }
  
  interface PaymobPaymentKeyResponse {
    token: string;
  }
  
  interface PaymobPaymentResponse {
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
    order: PaymobOrderResponse;
    created_at: string;
    transaction_processed_callback_at: string;
    currency: string;
    source_data: {
      pan: string;
      type: string;
      tenure: null;
      sub_type: string;
    };
    api_source: string;
    terminal_id: null;
    merchant_commission: number;
    installment: null;
    discount_details: any[];
    is_void: boolean;
    is_refund: boolean;
    data: {
      gateway_integration_pk: number;
      klass: string;
      created_at: string;
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
      biller_response: string;
    };
    is_hidden: boolean;
    payment_key_claims: {
      user_id: number;
      currency: string;
      pk: number;
      amount_cents: number;
      integration_id: number;
      billing_data: any;
      order_id: number;
      lock_order_when_paid: boolean;
      single_payment_attempt: boolean;
    };
    error_occured: boolean;
    is_live: boolean;
    other_endpoint_reference: null;
    refunded_amount_cents: number;
    source_id: number;
    is_captured: boolean;
    captured_amount: number;
    merchant_staff_tag: null;
    updated_at: string;
    is_settled: boolean;
    bill_balanced: boolean;
    is_bill: boolean;
    owner: number;
    parent_transaction: null;
  }
  
  class PaymobService {
    private baseUrl: string;
    private apiKey: string;
    private integrationId: string;
    private iframeId: string;
  
    constructor() {
      this.baseUrl = process.env.PAYMOB_BASE_URL || 'https://uae.paymob.com/api';
      this.apiKey = process.env.PAYMOB_API_KEY || '';
      this.integrationId = process.env.PAYMOB_INTEGRATION_ID || '';
      this.iframeId = process.env.PAYMOB_IFRAME_ID || '';
  
      if (!this.apiKey || !this.integrationId || !this.iframeId) {
        throw new Error('Missing required Paymob configuration. Please check your environment variables.');
      }
    }
  
    // Helper function to log detailed error information
    private async logDetailedError(response: Response, context: string): Promise<never> {
      let errorDetails = '';
      try {
        const errorBody = await response.text();
        errorDetails = errorBody;
        console.error(`${context} - Status: ${response.status}, Body:`, errorBody);
      } catch (e) {
        console.error(`${context} - Status: ${response.status}, Could not read response body`);
      }
      
      throw new Error(`${context} failed: ${response.status} ${response.statusText}${errorDetails ? ` - ${errorDetails}` : ''}`);
    }
  
    // Step 1: Authenticate and get auth token
    async authenticate(): Promise<string> {
      try {
        console.log('Authenticating with Paymob...');
        
        const response = await fetch(`${this.baseUrl}/auth/tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: this.apiKey,
          }),
        });
  
        if (!response.ok) {
          await this.logDetailedError(response, 'Authentication');
        }
  
        const data: PaymobAuthResponse = await response.json();
        console.log('Authentication successful');
        return data.token;
      } catch (error) {
        console.error('Paymob authentication error:', error);
        throw error;
      }
    }
  
    // Step 2: Create order
    async createOrder(
      authToken: string,
      orderData: {
        amount: number;
        currency: string;
        merchantOrderId: string;
        items?: any[];
        shippingData?: any;
      }
    ): Promise<PaymobOrderResponse> {
      try {
        console.log('Creating order with data:', {
          amount: orderData.amount,
          currency: orderData.currency,
          merchantOrderId: orderData.merchantOrderId
        });
  
        const requestBody = {
          auth_token: authToken,
          delivery_needed: 'false',
          amount_cents: Math.round(orderData.amount * 100), // Convert to cents
          currency: orderData.currency.toUpperCase(),
          merchant_order_id: orderData.merchantOrderId,
          items: orderData.items || [],
          shipping_data: orderData.shippingData || {
            apartment: 'NA',
            email: 'customer@example.com',
            floor: 'NA',
            first_name: 'Customer',
            street: 'NA',
            building: 'NA',
            phone_number: '+971501234567',
            postal_code: 'NA',
            extra_description: 'NA',
            city: 'Dubai',
            state: 'Dubai',
            country: 'AE',
            last_name: 'Customer',
            shipping_method: 'PKG',
          },
        };
  
        console.log('Order request body:', JSON.stringify(requestBody, null, 2));
  
        const response = await fetch(`${this.baseUrl}/ecommerce/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
          await this.logDetailedError(response, 'Order creation');
        }
  
        const data: PaymobOrderResponse = await response.json();
        console.log('Order created successfully:', data.id);
        return data;
      } catch (error) {
        console.error('Paymob order creation error:', error);
        throw error;
      }
    }
  
    // Step 3: Get payment key
    async getPaymentKey(
      authToken: string,
      orderData: {
        orderId: number;
        amount: number;
        currency: string;
        billingData: any;
      }
    ): Promise<string> {
      try {
        console.log('Getting payment key for order:', orderData.orderId);
  
        // Ensure billing data has all required fields
        const standardBillingData = {
          apartment: orderData.billingData.apartment || 'NA',
          email: orderData.billingData.email || 'customer@example.com',
          floor: orderData.billingData.floor || 'NA',
          first_name: orderData.billingData.first_name || 'Customer',
          street: orderData.billingData.street || 'NA',
          building: orderData.billingData.building || 'NA',
          phone_number: orderData.billingData.phone_number || '+971501234567',
          postal_code: orderData.billingData.postal_code || 'NA',
          city: orderData.billingData.city || 'Dubai',
          state: orderData.billingData.state || 'Dubai',
          country: orderData.billingData.country || 'AE',
          last_name: orderData.billingData.last_name || 'Customer',
          shipping_method: orderData.billingData.shipping_method || 'PKG',
          extra_description: orderData.billingData.extra_description || 'Package Purchase',
        };
  
        const requestBody = {
          auth_token: authToken,
          amount_cents: Math.round(orderData.amount * 100),
          expiration: 3600, // 1 hour
          order_id: orderData.orderId,
          billing_data: standardBillingData,
          currency: orderData.currency.toUpperCase(),
          integration_id: parseInt(this.integrationId),
          lock_order_when_paid: 'false'
        };
  
        console.log('Payment key request body:', JSON.stringify(requestBody, null, 2));
  
        const response = await fetch(`${this.baseUrl}/acceptance/payment_keys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
          await this.logDetailedError(response, 'Payment key generation');
        }
  
        const data: PaymobPaymentKeyResponse = await response.json();
        console.log('Payment key generated successfully');
        return data.token;
      } catch (error) {
        console.error('Paymob payment key error:', error);
        throw error;
      }
    }
  
    // Verify payment
    async verifyPayment(transactionId: string): Promise<PaymobPaymentResponse> {
      try {
        console.log('Verifying payment for transaction:', transactionId);
        const authToken = await this.authenticate();
        
        const response = await fetch(
          `${this.baseUrl}/acceptance/transactions/${transactionId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Token ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
  
        if (!response.ok) {
          await this.logDetailedError(response, 'Payment verification');
        }
  
        const data: PaymobPaymentResponse = await response.json();
        console.log('Payment verification successful');
        return data;
      } catch (error) {
        console.error('Paymob payment verification error:', error);
        throw error;
      }
    }
  
    // Create payment URL for iframe
    createPaymentUrl(paymentKey: string): string {
      return `https://uae.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;
    }
  }
  
  // Export singleton instance
  export const paymobService = new PaymobService();
  
  // Main functions to replace Stripe functions
  export async function createPaymobSession({
    packageId,
    userId,
    name,
    description,
    amount,
    currency = 'AED',
    userEmail,
    userPhone,
    userFirstName,
    userLastName,
  }: {
    packageId: string;
    userId: string;
    name: string;
    description: string;
    amount: number;
    currency?: string;
    userEmail?: string;
    userPhone?: string;
    userFirstName?: string;
    userLastName?: string;
  }) {
    try {
      console.log('Creating Paymob session for package:', packageId);
  
      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
  
      // Step 1: Authenticate
      const authToken = await paymobService.authenticate();
  
      // Step 2: Create order
      const merchantOrderId = `${packageId}_${userId}_${Date.now()}`;
      
      // Prepare shipping data with user information
      const shippingData = {
        apartment: 'NA',
        email: userEmail || 'customer@example.com',
        floor: 'NA',
        first_name: userFirstName || 'Customer',
        street: 'NA',
        building: 'NA',
        phone_number: userPhone || '+971501234567',
        postal_code: 'NA',
        extra_description: description || 'Package Purchase',
        city: 'Dubai',
        state: 'Dubai',
        country: 'AE',
        last_name: userLastName || 'Customer',
        shipping_method: 'PKG',
      };
  
      const order = await paymobService.createOrder(authToken, {
        amount,
        currency,
        merchantOrderId,
        items: [
          {
            name,
            description: description || name,
            amount_cents: Math.round(amount * 100),
            quantity: 1,
          },
        ],
        shippingData,
      });
  
      // Step 3: Get payment key with proper billing data
      const billingData = {
        apartment: 'NA',
        email: userEmail || 'customer@example.com',
        floor: 'NA',
        first_name: userFirstName || 'Customer',
        street: 'NA',
        building: 'NA',
        phone_number: userPhone || '+971501234567',
        postal_code: 'NA',
        city: 'Dubai',
        state: 'Dubai',
        country: 'AE',
        last_name: userLastName || 'Customer',
        shipping_method: 'PKG',
        extra_description: description || 'Package Purchase',
      };
  
      const paymentKey = await paymobService.getPaymentKey(authToken, {
        orderId: order.id,
        amount,
        currency,
        billingData,
      });
  
      // Step 4: Create payment URL
      const paymentUrl = paymobService.createPaymentUrl(paymentKey);
  
      console.log('Paymob session created successfully');
  
      return {
        orderId: order.id.toString(),
        paymentKey,
        url: paymentUrl,
        merchantOrderId,
      };
    } catch (error) {
      console.error('Error creating Paymob session:', error);
      throw error;
    }
  }
  
  export async function verifyPaymobPayment(transactionId: string) {
    try {
      const paymentData = await paymobService.verifyPayment(transactionId);
      
      return {
        isComplete: paymentData.success && !paymentData.pending,
        orderId: paymentData.order.id,
        merchantOrderId: paymentData.order.merchant_order_id,
        amountTotal: paymentData.amount_cents / 100,
        currency: paymentData.currency,
        transactionId: paymentData.id,
      };
    } catch (error) {
      console.error('Error verifying Paymob payment:', error);
      throw error;
    }
  }