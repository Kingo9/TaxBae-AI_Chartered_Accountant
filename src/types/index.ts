// User Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  userType: 'individual' | 'corporate';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Financial Calculator Types
export interface EMICalculatorInput {
  principal: number;
  rate: number;
  tenure: number;
}

export interface EMICalculatorResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
}

export interface SIPCalculatorInput {
  monthlyInvestment: number;
  annualReturn: number;
  tenure: number;
  stepUpPercentage?: number;
}

export interface SIPCalculatorResult {
  maturityAmount: number;
  investedAmount: number;
  returns: number;
}

export interface GoalSavingsInput {
  goalAmount: number;
  timeInYears: number;
  expectedReturn: number;
}

export interface GoalSavingsResult {
  monthlyInvestment: number;
  totalInvestment: number;
  returns: number;
}

export interface RentVsBuyInput {
  homePrice: number;
  downPayment: number;
  loanRate: number;
  loanTenure: number;
  monthlyRent: number;
  rentIncrease: number;
  timeHorizon: number;
}

export interface RentVsBuyResult {
  totalRentCost: number;
  totalBuyCost: number;
  recommendation: 'rent' | 'buy';
  savings: number;
}

// Expense Tracker Types
export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface ExpenseSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

// Tax Deduction Types
export interface TaxDeduction {
  section: string;
  name: string;
  description: string;
  maxLimit: number;
  eligibility: string[];
  userType: 'individual' | 'corporate' | 'both';
  isApplicable: boolean;
}

export interface DeductionCalculatorInput {
  income: number;
  investments: Record<string, number>;
  userType: 'individual' | 'corporate';
}

export interface DeductionCalculatorResult {
  taxableIncome: number;
  taxSavings: number;
  applicableDeductions: TaxDeduction[];
}

// Chat Types
export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Calculators: undefined;
  Investments: undefined;
  Tracker: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type CalculatorStackParamList = {
  CalculatorList: undefined;
  EMICalculator: undefined;
  SIPCalculator: undefined;
  GoalSavings: undefined;
  RentVsBuy: undefined;
  TaxBenefit: undefined;
};

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Financial Data Types
export interface FinancialData {
  rbiRates: {
    repoRate: number;
    bankRate: number;
    crrRate: number;
    slrRate: number;
    lastUpdated: Date;
  };
  marketData: {
    nifty: number;
    sensex: number;
    lastUpdated: Date;
  };
}

// Investment Types
export interface InvestmentRecommendation {
  name: string;
  expectedReturn: string;
  lockIn: string;
  taxBenefit: string;
  description: string;
  minInvestment: string;
  maxInvestment: string;
  suitability?: string;
  suggestedAmount?: string;
}

export interface InvestmentProfile {
  income: number;
  age: number;
  risk: 'Low' | 'Medium' | 'High';
  recommendations: InvestmentRecommendation[];
}

export interface InvestmentInput {
  annualIncome: number;
  currentAge: number;
  riskAppetite: 'Low' | 'Medium' | 'High';
}

export interface PortfolioAllocation {
  equity: number;
  debt: number;
  gold: number;
  cash: number;
}

// Notification Types
export interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: 'tax_deadline' | 'investment_reminder' | 'general';
  data?: Record<string, any>;
  scheduledDate?: Date;
  sent: boolean;
}
