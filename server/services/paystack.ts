interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
}

interface InitializePaymentParams {
  email: string;
  amount: number; // in kobo
  reference: string;
  metadata?: any;
  callback_url?: string;
}

export class PaystackService {
  private readonly secretKey: string;
  private readonly baseUrl = "https://api.paystack.co";

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || "";
    if (!this.secretKey) {
      console.warn("Paystack secret key not provided. Payment features will be disabled.");
    }
  }

  private async makeRequest(endpoint: string, method: string = "GET", data?: any): Promise<PaystackResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
    };

    if (data && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Paystack API error");
      }
      
      return result;
    } catch (error) {
      console.error("Paystack API error:", error);
      throw error;
    }
  }

  async initializePayment(params: InitializePaymentParams): Promise<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }> {
    const response = await this.makeRequest("/transaction/initialize", "POST", params);
    
    if (!response.status) {
      throw new Error(response.message || "Failed to initialize payment");
    }

    return response.data;
  }

  async verifyPayment(reference: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    transaction_date: string;
    customer: any;
    metadata?: any;
  }> {
    const response = await this.makeRequest(`/transaction/verify/${reference}`);
    
    if (!response.status) {
      throw new Error(response.message || "Failed to verify payment");
    }

    return response.data;
  }

  async listTransactions(params?: {
    perPage?: number;
    page?: number;
    customer?: string;
    status?: string;
    from?: string;
    to?: string;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/transaction${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await this.makeRequest(endpoint);
    
    if (!response.status) {
      throw new Error(response.message || "Failed to fetch transactions");
    }

    return response.data;
  }

  async createPlan(params: {
    name: string;
    interval: "daily" | "weekly" | "monthly" | "quarterly" | "biannually" | "annually";
    amount: number; // in kobo
    description?: string;
    send_invoices?: boolean;
    send_sms?: boolean;
    currency?: string;
  }) {
    const response = await this.makeRequest("/plan", "POST", params);
    
    if (!response.status) {
      throw new Error(response.message || "Failed to create plan");
    }

    return response.data;
  }

  async subscribeCustomer(params: {
    customer: string;
    plan: string;
    authorization: string;
    start_date?: string;
  }) {
    const response = await this.makeRequest("/subscription", "POST", params);
    
    if (!response.status) {
      throw new Error(response.message || "Failed to create subscription");
    }

    return response.data;
  }

  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `edrac_${timestamp}_${random}`;
  }

  convertToKobo(nairaAmount: number): number {
    return Math.round(nairaAmount * 100);
  }

  convertFromKobo(koboAmount: number): number {
    return koboAmount / 100;
  }
}

export const paystackService = new PaystackService();
