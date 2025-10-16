import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.0.119:3001/api';

function safeStringify(obj: any) {
  return JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
}

class ApiService {
  private getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('taxbae_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = await this.getAuthHeaders();
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  

  // Auth endpoints
  async login(email: string, password: string) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    userType: string;
    phone?: string;
  }) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.makeRequest('/auth/logout', { method: 'POST' });
  }

  // User endpoints
  async getProfile() {
    return this.makeRequest('/users/profile');
  }

  async updateProfile(profileData: any) {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getDashboard() {
    return this.makeRequest('/users/dashboard');
  }

  // Transaction endpoints
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    return this.makeRequest(`/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async createTransaction(transactionData: any) {
    return this.makeRequest('/transactions', {
      method: 'POST',
      body: safeStringify(transactionData)
    });
  }

  async updateTransaction(id: string, transactionData: any) {
    return this.makeRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: safeStringify(transactionData)
    });
  }

  async deleteTransaction(id: string) {
    return this.makeRequest(`/transactions/${id}`, { method: 'DELETE' });
  }

  async getTransactionAnalytics(params?: { period?: string; year?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value);
        }
      });
    }
    
    const queryString = queryParams.toString();
    return this.makeRequest(`/transactions/analytics${queryString ? `?${queryString}` : ''}`);
  }

  // Calculator endpoints
  async calculateEMI(data: {
    principal: number;
    rate: number;
    tenure: number;
  }) {
    return this.makeRequest('/calculators/emi', {
      method: 'POST',
      body: safeStringify(data)

    });
  }

  async calculateSIP(data: {
    monthlyInvestment: number;
    annualReturn: number;
    tenure: number;
    stepUpPercentage?: number;
  }) {
    return this.makeRequest('/calculators/sip', {
      method: 'POST',
      body: safeStringify(data),
    });
  }

  async calculateGoalSavings(data: {
    goalAmount: number;
    timeInYears: number;
    expectedReturn: number;
  }) {
    return this.makeRequest('/calculators/goal-savings', {
      method: 'POST',
      body: safeStringify(data),
    });
  }

  async calculateRentVsBuy(data: {
    homePrice: number;
    downPayment: number;
    loanRate: number;
    loanTenure: number;
    monthlyRent: number;
    rentIncrease: number;
    timeHorizon: number;
  }) {
    return this.makeRequest('/calculators/rent-vs-buy', {
      method: 'POST',
      body: safeStringify(data),
    });
  }

  async calculateRetirementPlanning(data: {
    currentAge: number;
    retirementAge: number;
    currentSalary: number;
    currentSavings?: number;
    expectedInflation?: number;
    expectedReturn?: number;
    retirementExpenseRatio?: number;
  }) {
    return this.makeRequest('/calculators/retirement-planning', {
      method: 'POST',
      body: safeStringify(data),
    });
  }

  async calculateTaxBenefit(data: {
    income: number;
    taxRegime: string;
    investments?: any;
  }) {
    return this.makeRequest('/calculators/tax-benefit', {
      method: 'POST',
      body: safeStringify(data),
    });
  }

  // Notifications endpoints
  async getNotifications() {
    return this.makeRequest('/notifications');
  }

  async markNotificationAsRead(id: string) {
    return this.makeRequest(`/notifications/${id}/read`, { method: 'PUT' });
  }

  // Market data endpoints
  async getMarketData() {
    return this.makeRequest('/market-data');
  }

  // Chat endpoints
  async getChatSessions(limit?: number) {
    const queryParams = limit ? `?limit=${limit}` : '';
    return this.makeRequest(`/chat/sessions${queryParams}`);
  }

  async createChatSession(initialMessage?: string) {
    return this.makeRequest('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ initialMessage }),
    });
  }

  async getChatMessages(sessionId: string) {
    return this.makeRequest(`/chat/sessions/${sessionId}/messages`);
  }

  async sendChatMessage(sessionId: string, message: string) {
    return this.makeRequest(`/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async deleteChatSession(sessionId: string) {
    return this.makeRequest(`/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async getQuickTips() {
    return this.makeRequest('/chat/tips');
  }

  async askQuickQuestion(question: string) {
    return this.makeRequest('/chat/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
