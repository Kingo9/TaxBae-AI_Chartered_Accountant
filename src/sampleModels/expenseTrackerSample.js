/**
 * Sample Expense Tracker for TaxBae App
 * Generates mock responses for expense tracking and categorization
 */

// Sample expense categories with icons and colors
export const EXPENSE_CATEGORIES = {
  'Food & Dining': { icon: '🍕', color: '#FF6B6B', taxDeductible: false },
  'Transportation': { icon: '🚗', color: '#4ECDC4', taxDeductible: true, section: 'Business Travel' },
  'Housing & Rent': { icon: '🏠', color: '#45B7D1', taxDeductible: true, section: '24(b)' },
  'Shopping': { icon: '🛒', color: '#F7DC6F', taxDeductible: false },
  'Utilities': { icon: '⚡', color: '#BB8FCE', taxDeductible: false },
  'Healthcare': { icon: '🏥', color: '#58D68D', taxDeductible: true, section: '80D' },
  'Entertainment': { icon: '🎬', color: '#F1948A', taxDeductible: false },
  'Education': { icon: '🎓', color: '#85C1E9', taxDeductible: true, section: '80C' },
  'Travel': { icon: '✈️', color: '#82E0AA', taxDeductible: true, section: 'LTA' },
  'Technology': { icon: '📱', color: '#D2B4DE', taxDeductible: true, section: 'Business Expense' },
  'EMI & Loans': { icon: '🏦', color: '#F8C471', taxDeductible: true, section: '80C/24' },
  'Insurance': { icon: '🛡️', color: '#AED6F1', taxDeductible: true, section: '80C/80D' },
  'Investments': { icon: '📈', color: '#A9DFBF', taxDeductible: true, section: '80C' },
  'Other': { icon: '💰', color: '#FADBD8', taxDeductible: false }
};

export const INCOME_CATEGORIES = {
  'Salary': { icon: '💼', color: '#58D68D', taxable: true },
  'Business Income': { icon: '💰', color: '#F39C12', taxable: true },
  'Investment Returns': { icon: '📈', color: '#3498DB', taxable: true, section: 'LTCG/STCG' },
  'Freelance': { icon: '🎯', color: '#9B59B6', taxable: true },
  'Rental Income': { icon: '🏠', color: '#E74C3C', taxable: true, section: '24' },
  'Bonus': { icon: '🏆', color: '#F1C40F', taxable: true },
  'Gift': { icon: '🎁', color: '#E67E22', taxable: false },
  'Other': { icon: '💎', color: '#95A5A6', taxable: false }
};

// Generate sample transaction data
export const generateSampleTransactions = (count = 50) => {
  const transactions = [];
  const categories = Object.keys(EXPENSE_CATEGORIES);
  const incomeCategories = Object.keys(INCOME_CATEGORIES);
  
  const descriptions = {
    'Food & Dining': ['Lunch at office cafeteria', 'Grocery shopping', 'Dinner at restaurant', 'Coffee with friends', 'Food delivery'],
    'Transportation': ['Metro card recharge', 'Uber ride to office', 'Petrol expense', 'Car service', 'Auto rickshaw'],
    'Housing & Rent': ['Monthly rent', 'Electricity bill', 'Water bill', 'Maintenance charge', 'Internet bill'],
    'Shopping': ['Clothes shopping', 'Electronics purchase', 'Home decor items', 'Books and stationery', 'Gifts'],
    'Healthcare': ['Doctor consultation', 'Medicine purchase', 'Health insurance premium', 'Dental treatment', 'Lab tests'],
    'Entertainment': ['Movie tickets', 'Concert tickets', 'Gaming subscription', 'Streaming service', 'Sports event'],
    'Education': ['Course fee', 'Books purchase', 'Online certification', 'Training program', 'Workshop fee'],
    'Travel': ['Flight tickets', 'Hotel booking', 'Travel insurance', 'Visa processing', 'Local transport'],
    'EMI & Loans': ['Home loan EMI', 'Car loan EMI', 'Personal loan EMI', 'Credit card payment', 'Education loan EMI'],
    'Insurance': ['Life insurance premium', 'Health insurance', 'Car insurance', 'Home insurance', 'Term insurance'],
    'Investments': ['Mutual fund SIP', 'PPF deposit', 'ELSS investment', 'Fixed deposit', 'Gold purchase'],
    'Salary': ['Monthly salary', 'Bonus payment', 'Overtime payment', 'Performance bonus', 'Annual increment'],
    'Business Income': ['Consulting income', 'Product sales', 'Service charges', 'Commission earned', 'Partnership profit'],
    'Investment Returns': ['Dividend received', 'Capital gains', 'Interest earned', 'Rental yield', 'Mutual fund returns']
  };

  for (let i = 0; i < count; i++) {
    const isIncome = Math.random() < 0.3; // 30% chance of income
    const categoryList = isIncome ? incomeCategories : categories;
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];
    const categoryDescriptions = descriptions[category] || ['Sample transaction'];
    
    const baseAmount = isIncome ? 
      Math.floor(Math.random() * 100000) + 20000 : // Income: 20k to 120k
      Math.floor(Math.random() * 15000) + 500;     // Expense: 500 to 15k
    
    const transaction = {
      id: `txn_${Date.now()}_${i}`,
      type: isIncome ? 'INCOME' : 'EXPENSE',
      category,
      amount: baseAmount,
      description: categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)],
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
      isTaxDeductible: isIncome ? false : (EXPENSE_CATEGORIES[category]?.taxDeductible || false),
      taxSection: isIncome ? 
        (INCOME_CATEGORIES[category]?.section || null) : 
        (EXPENSE_CATEGORIES[category]?.section || null),
      paymentMethod: Math.random() > 0.5 ? 'UPI' : Math.random() > 0.5 ? 'Card' : 'Cash'
    };
    
    transactions.push(transaction);
  }
  
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Calculate expense analytics
export const calculateExpenseAnalytics = (transactions) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const txnDate = new Date(t.date);
    return txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear;
  });
  
  const expenses = monthlyTransactions.filter(t => t.type === 'EXPENSE');
  const income = monthlyTransactions.filter(t => t.type === 'INCOME');
  
  // Calculate totals
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  
  // Category-wise breakdown
  const categoryBreakdown = {};
  expenses.forEach(expense => {
    const category = expense.category;
    if (!categoryBreakdown[category]) {
      categoryBreakdown[category] = {
        amount: 0,
        count: 0,
        color: EXPENSE_CATEGORIES[category]?.color || '#95A5A6',
        icon: EXPENSE_CATEGORIES[category]?.icon || '💰'
      };
    }
    categoryBreakdown[category].amount += expense.amount;
    categoryBreakdown[category].count += 1;
  });
  
  // Calculate percentages
  Object.keys(categoryBreakdown).forEach(category => {
    categoryBreakdown[category].percentage = (categoryBreakdown[category].amount / totalExpenses) * 100;
  });
  
  // Top spending categories
  const topCategories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b.amount - a.amount)
    .slice(0, 5)
    .map(([category, data]) => ({ category, ...data }));
  
  // Tax deductible expenses
  const taxDeductibleExpenses = expenses
    .filter(t => t.isTaxDeductible)
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Monthly trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(currentYear, currentMonth - i, 1);
    const monthTransactions = transactions.filter(t => {
      const txnDate = new Date(t.date);
      return txnDate.getMonth() === monthDate.getMonth() && 
             txnDate.getFullYear() === monthDate.getFullYear();
    });
    
    const monthExpenses = monthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthIncome = monthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    
    monthlyTrend.push({
      month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      expenses: monthExpenses,
      income: monthIncome,
      savings: monthIncome - monthExpenses
    });
  }
  
  return {
    summary: {
      totalExpenses,
      totalIncome,
      netSavings: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      taxDeductibleExpenses,
      totalTransactions: monthlyTransactions.length
    },
    categoryBreakdown,
    topCategories,
    monthlyTrend,
    insights: generateInsights(categoryBreakdown, totalExpenses, totalIncome)
  };
};

// Generate spending insights and recommendations
const generateInsights = (categoryBreakdown, totalExpenses, totalIncome) => {
  const insights = [];
  
  // High spending category alert
  const topCategory = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b.amount - a.amount)[0];
  
  if (topCategory && topCategory[1].percentage > 25) {
    insights.push({
      type: 'warning',
      title: 'High Spending Alert',
      message: `${topCategory[0]} accounts for ${topCategory[1].percentage.toFixed(1)}% of your expenses. Consider reviewing this category.`,
      actionable: true
    });
  }
  
  // Savings rate insight
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  if (savingsRate < 20) {
    insights.push({
      type: 'tip',
      title: 'Improve Savings Rate',
      message: `Your current savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20% to build a strong financial foundation.`,
      actionable: true
    });
  } else if (savingsRate > 30) {
    insights.push({
      type: 'success',
      title: 'Great Savings Rate!',
      message: `Excellent! You're saving ${savingsRate.toFixed(1)}% of your income. Consider investing the surplus for better returns.`,
      actionable: false
    });
  }
  
  // Tax saving opportunity
  const taxDeductibleTotal = Object.entries(categoryBreakdown)
    .filter(([category]) => EXPENSE_CATEGORIES[category]?.taxDeductible)
    .reduce((sum, [, data]) => sum + data.amount, 0);
  
  if (taxDeductibleTotal > 0) {
    insights.push({
      type: 'info',
      title: 'Tax Saving Opportunity',
      message: `You have ₹${taxDeductibleTotal.toLocaleString()} in potentially tax-deductible expenses. Ensure you have proper receipts.`,
      actionable: true
    });
  }
  
  // Budget recommendations
  if (categoryBreakdown['Food & Dining'] && categoryBreakdown['Food & Dining'].percentage > 15) {
    insights.push({
      type: 'tip',
      title: 'Food Budget Tip',
      message: 'Consider meal planning and home cooking to reduce dining expenses. This can save 20-30% on food costs.',
      actionable: true
    });
  }
  
  return insights;
};

// Generate budget suggestions
export const generateBudgetSuggestions = (analytics) => {
  const { totalIncome, totalExpenses } = analytics.summary;
  
  // 50/30/20 rule suggestions
  const needs = totalIncome * 0.5;  // 50% for needs
  const wants = totalIncome * 0.3;  // 30% for wants
  const savings = totalIncome * 0.2; // 20% for savings
  
  return {
    budgetRule: '50/30/20 Rule',
    recommended: {
      needs: needs,
      wants: wants,
      savings: savings
    },
    current: {
      expenses: totalExpenses,
      savings: totalIncome - totalExpenses
    },
    adjustments: {
      needsAdjustment: totalExpenses > needs ? totalExpenses - needs : 0,
      savingsGap: savings - (totalIncome - totalExpenses)
    },
    tips: [
      'Track daily expenses to identify unnecessary spending',
      'Use the envelope method for discretionary spending',
      'Automate savings to ensure consistent saving habits',
      'Review subscriptions and cancel unused services',
      'Set spending limits for entertainment and dining'
    ]
  };
};

// Export sample data for testing
export const SAMPLE_RESPONSES = {
  transactions: generateSampleTransactions(30),
  analytics: null, // Will be calculated from transactions
  budgetSuggestions: null, // Will be calculated from analytics
};

// Initialize sample analytics
SAMPLE_RESPONSES.analytics = calculateExpenseAnalytics(SAMPLE_RESPONSES.transactions);
SAMPLE_RESPONSES.budgetSuggestions = generateBudgetSuggestions(SAMPLE_RESPONSES.analytics);

// Utility functions for formatting
export const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
};