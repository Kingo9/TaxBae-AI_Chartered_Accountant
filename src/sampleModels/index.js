/**
 * Sample Models Integration Guide for TaxBae App
 * This file shows how to use the sample models in your components
 */

// Import all sample models
import { 
  calculateTaxDeductions, 
  compareRegimes, 
  generateQuarterlyTaxPlan,
  SAMPLE_RESPONSES as DEDUCTION_SAMPLES 
} from './deductionEngineSample.js';

import { 
  generateSampleTransactions, 
  calculateExpenseAnalytics, 
  generateBudgetSuggestions,
  SAMPLE_RESPONSES as TRACKER_SAMPLES
} from './expenseTrackerSample.js';

import { 
  generateChatResponse, 
  generateChatSummary,
  SAMPLE_RESPONSES as CHATBOT_SAMPLES,
  CONVERSATION_STARTERS,
  QUICK_TIPS
} from './chatbotSample.js';

import {
  getInvestmentRecommendations,
  getPortfolioAllocation,
  investmentSampleData
} from './investmentSample.js';

// ====================
// USAGE EXAMPLES
// ====================

// 1. TAX DEDUCTION ENGINE USAGE
export const useTaxDeductionEngine = () => {
  // Example: Calculate tax deductions for a user
  const calculateUserTaxSavings = (userIncome, userInvestments) => {
    try {
      const result = calculateTaxDeductions(userIncome, userInvestments);
      return {
        success: true,
        data: result,
        message: 'Tax calculations completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to calculate tax deductions',
        data: null
      };
    }
  };

  // Example: Compare tax regimes
  const compareUserRegimes = (income, investments = {}) => {
    try {
      const comparison = compareRegimes(income, investments);
      return {
        success: true,
        data: comparison,
        recommendation: comparison.recommendation === 'old' ? 
          'Old regime will save you more tax' : 
          'New regime is better for your income'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to compare regimes'
      };
    }
  };

  // Example: Generate quarterly tax plan
  const createTaxPlan = (annualIncome) => {
    try {
      const plan = generateQuarterlyTaxPlan(annualIncome);
      return {
        success: true,
        data: plan,
        message: 'Quarterly tax plan generated'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate tax plan'
      };
    }
  };

  return {
    calculateUserTaxSavings,
    compareUserRegimes,
    createTaxPlan,
    sampleData: DEDUCTION_SAMPLES
  };
};

// 2. EXPENSE TRACKER USAGE
export const useExpenseTracker = () => {
  // Example: Generate sample transactions for testing
  const generateMockData = (transactionCount = 30) => {
    try {
      const transactions = generateSampleTransactions(transactionCount);
      const analytics = calculateExpenseAnalytics(transactions);
      const budgetSuggestions = generateBudgetSuggestions(analytics);

      return {
        success: true,
        data: {
          transactions,
          analytics,
          budgetSuggestions
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate expense data'
      };
    }
  };

  // Example: Analyze user's transactions
  const analyzeExpenses = (userTransactions) => {
    try {
      const analytics = calculateExpenseAnalytics(userTransactions);
      return {
        success: true,
        data: analytics,
        insights: analytics.insights,
        topCategories: analytics.topCategories
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to analyze expenses'
      };
    }
  };

  // Example: Get budget recommendations
  const getBudgetRecommendations = (analytics) => {
    try {
      const suggestions = generateBudgetSuggestions(analytics);
      return {
        success: true,
        data: suggestions,
        message: 'Budget recommendations generated'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate budget suggestions'
      };
    }
  };

  return {
    generateMockData,
    analyzeExpenses,
    getBudgetRecommendations,
    sampleData: TRACKER_SAMPLES
  };
};

// 3. INVESTMENT ADVISORY USAGE
export const useInvestmentAdvisory = () => {
  // Example: Get investment recommendations for a user
  const getRecommendations = (income, age, riskAppetite) => {
    try {
      const recommendations = getInvestmentRecommendations(income, age, riskAppetite);
      const allocation = getPortfolioAllocation(riskAppetite);
      
      return {
        success: true,
        data: {
          recommendations,
          portfolioAllocation: allocation
        },
        message: 'Investment recommendations generated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate investment recommendations',
        data: null
      };
    }
  };

  // Example: Get sample investment data by risk profile
  const getSampleByRiskProfile = (riskProfile) => {
    const riskKey = riskProfile.toLowerCase() + 'Risk';
    const sampleData = investmentSampleData[riskKey] || investmentSampleData.mediumRisk;
    
    return {
      success: true,
      data: sampleData,
      riskProfile: sampleData.risk
    };
  };

  return {
    getRecommendations,
    getSampleByRiskProfile,
    sampleData: investmentSampleData
  };
};

// 4. CHATBOT USAGE
export const useChatbot = () => {
  // Example: Generate AI response
  const getAIResponse = (userMessage, userContext = {}) => {
    try {
      const response = generateChatResponse(userMessage, userContext);
      return {
        success: true,
        data: response,
        suggestions: response.suggestions
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate AI response'
      };
    }
  };

  // Example: Get conversation starters
  const getConversationStarters = () => {
    return {
      success: true,
      data: CONVERSATION_STARTERS,
      count: CONVERSATION_STARTERS.length
    };
  };

  // Example: Get quick tips
  const getQuickTips = (priority = null) => {
    const tips = priority ? 
      QUICK_TIPS.filter(tip => tip.priority === priority) : 
      QUICK_TIPS;
    
    return {
      success: true,
      data: tips,
      count: tips.length
    };
  };

  // Example: Analyze chat session
  const analyzeChatSession = (messages) => {
    try {
      const summary = generateChatSummary(messages);
      return {
        success: true,
        data: summary,
        primaryTopic: summary.primaryCategory
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to analyze chat session'
      };
    }
  };

  return {
    getAIResponse,
    getConversationStarters,
    getQuickTips,
    analyzeChatSession,
    sampleData: CHATBOT_SAMPLES
  };
};

// ====================
// COMPONENT INTEGRATION EXAMPLES
// ====================

// Example Hook for Tax Deduction Component
export const useTaxDeductionComponent = () => {
  const [deductions, setDeductions] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const calculateDeductions = async (income, investments) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      // For now, we use the sample model
      const result = calculateTaxDeductions(income, investments);
      setDeductions(result);
    } catch (err) {
      setError('Failed to calculate tax deductions');
      console.error('Tax calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    deductions,
    loading,
    error,
    calculateDeductions
  };
};

// Example Hook for Expense Analytics
export const useExpenseAnalytics = () => {
  const [analytics, setAnalytics] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const loadAnalytics = async (transactions) => {
    setLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = calculateExpenseAnalytics(transactions);
      setAnalytics(result);
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    loadAnalytics
  };
};

// Example Hook for Chatbot
export const useChatbotComponent = () => {
  const [messages, setMessages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const sendMessage = async (userMessage) => {
    const userMsg = {
      id: Date.now().toString(),
      type: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const botResponse = generateChatResponse(userMessage);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        ...botResponse
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    conversationStarters: CONVERSATION_STARTERS
  };
};

// ====================
// READY-TO-USE SAMPLE DATA
// ====================

// Export ready-to-use sample data for immediate testing
export const SAMPLE_DATA = {
  // Tax deduction samples
  taxCalculations: DEDUCTION_SAMPLES,
  
  // Expense tracker samples
  expenseData: TRACKER_SAMPLES,
  
  // Chatbot samples
  chatData: CHATBOT_SAMPLES,

  // Investment advisory samples
  investmentData: investmentSampleData,

  // Quick access to common use cases
  quickSamples: {
    // Sample user with 10L income
    highIncomeUser: {
      income: 1000000,
      investments: {
        section80C: 150000,
        section80D: 25000,
        homeLoanInterest: 200000
      },
      expectedTaxSavings: 116250 // Pre-calculated
    },

    // Sample user with 5L income  
    midIncomeUser: {
      income: 500000,
      investments: {
        section80C: 75000,
        section80D: 15000
      },
      expectedTaxSavings: 27000 // Pre-calculated
    },

    // Sample expense data for a month
    monthlyExpenses: {
      totalIncome: 75000,
      totalExpenses: 58000,
      netSavings: 17000,
      topCategories: ['Housing & Rent', 'Food & Dining', 'Transportation']
    }
  }
};

// Default export with all utilities
export default {
  useTaxDeductionEngine,
  useExpenseTracker,
  useInvestmentAdvisory,
  useChatbot,
  useTaxDeductionComponent,
  useExpenseAnalytics,  
  useChatbotComponent,
  SAMPLE_DATA
};
