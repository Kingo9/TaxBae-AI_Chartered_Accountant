// Investment Utility Functions
import { InvestmentRecommendation, PortfolioAllocation } from '../types';

/**
 * Calculate compound interest for SIP investments
 */
export const calculateSIPReturns = (
  monthlyAmount: number,
  annualReturn: number,
  years: number
): { maturityAmount: number; investedAmount: number; returns: number } => {
  const monthlyRate = annualReturn / 12 / 100;
  const totalMonths = years * 12;
  const investedAmount = monthlyAmount * totalMonths;
  
  const maturityAmount = monthlyAmount * 
    (((1 + monthlyRate) ** totalMonths - 1) / monthlyRate) * 
    (1 + monthlyRate);
  
  const returns = maturityAmount - investedAmount;
  
  return {
    maturityAmount: Math.round(maturityAmount),
    investedAmount,
    returns: Math.round(returns)
  };
};

/**
 * Calculate lump sum investment returns
 */
export const calculateLumpSumReturns = (
  principal: number,
  annualReturn: number,
  years: number
): { maturityAmount: number; returns: number } => {
  const maturityAmount = principal * ((1 + annualReturn / 100) ** years);
  const returns = maturityAmount - principal;
  
  return {
    maturityAmount: Math.round(maturityAmount),
    returns: Math.round(returns)
  };
};

/**
 * Calculate tax savings from ELSS investments
 */
export const calculateTaxSavings = (
  investment: number,
  taxSlab: number
): { taxSaved: number; effectiveInvestment: number } => {
  const maxDeduction = Math.min(investment, 150000); // 80C limit
  const taxSaved = maxDeduction * (taxSlab / 100);
  const effectiveInvestment = investment - taxSaved;
  
  return {
    taxSaved: Math.round(taxSaved),
    effectiveInvestment: Math.round(effectiveInvestment)
  };
};

/**
 * Determine tax slab based on income
 */
export const getTaxSlab = (income: number): number => {
  if (income <= 250000) return 0;
  if (income <= 500000) return 5;
  if (income <= 1000000) return 20;
  return 30;
};

/**
 * Calculate emergency fund requirement
 */
export const calculateEmergencyFund = (monthlyExpenses: number): number => {
  return monthlyExpenses * 6; // 6 months of expenses
};

/**
 * Get risk-adjusted portfolio allocation
 */
export const getOptimalAllocation = (
  age: number,
  riskAppetite: 'Low' | 'Medium' | 'High',
  income: number
): PortfolioAllocation => {
  // Age-based equity allocation rule: 100 - age = equity percentage
  let baseEquityAllocation = Math.max(20, Math.min(80, 100 - age));
  
  // Adjust based on risk appetite
  const riskMultiplier = {
    'Low': 0.7,
    'Medium': 1.0,
    'High': 1.3
  };
  
  let equityAllocation = Math.round(baseEquityAllocation * riskMultiplier[riskAppetite]);
  equityAllocation = Math.max(10, Math.min(85, equityAllocation));
  
  // Remaining allocation
  const remaining = 100 - equityAllocation;
  
  // Distribute remaining between debt, gold, and cash
  const debtAllocation = Math.round(remaining * 0.7);
  const goldAllocation = Math.round(remaining * 0.2);
  const cashAllocation = 100 - equityAllocation - debtAllocation - goldAllocation;
  
  return {
    equity: equityAllocation,
    debt: debtAllocation,
    gold: goldAllocation,
    cash: cashAllocation
  };
};

/**
 * Filter investments based on user criteria
 */
export const filterInvestmentsByProfile = (
  investments: InvestmentRecommendation[],
  age: number,
  income: number,
  riskAppetite: 'Low' | 'Medium' | 'High'
): InvestmentRecommendation[] => {
  return investments.filter(investment => {
    // Age-based filtering
    if (age < 25 && investment.name.includes('Fixed Deposit')) return false;
    if (age > 50 && investment.name.includes('Small Cap')) return false;
    
    // Income-based filtering
    const monthlyIncome = income / 12;
    const minInvestmentAmount = parseFloat(investment.minInvestment.replace(/[₹,]/g, ''));
    
    if (minInvestmentAmount > monthlyIncome * 0.1) return false; // Don't suggest if min > 10% of monthly income
    
    // Risk-based filtering
    if (riskAppetite === 'Low' && investment.name.includes('Equity')) return false;
    if (riskAppetite === 'High' && investment.name.includes('Fixed')) return false;
    
    return true;
  });
};

/**
 * Calculate investment priority score
 */
export const calculatePriorityScore = (
  investment: InvestmentRecommendation,
  age: number,
  income: number,
  riskAppetite: 'Low' | 'Medium' | 'High'
): number => {
  let score = 50; // Base score
  
  // Age factor
  if (age < 30) {
    if (investment.name.includes('Equity') || investment.name.includes('SIP')) score += 20;
    if (investment.name.includes('PPF') || investment.name.includes('ELSS')) score += 15;
  } else if (age < 50) {
    if (investment.name.includes('Balanced') || investment.name.includes('Hybrid')) score += 15;
    if (investment.name.includes('ELSS')) score += 10;
  } else {
    if (investment.name.includes('Fixed') || investment.name.includes('Conservative')) score += 20;
    if (investment.name.includes('PPF')) score += 10;
  }
  
  // Risk appetite factor
  const riskScores = {
    'Low': { 'Fixed': 20, 'PPF': 15, 'NSC': 10, 'Equity': -10 },
    'Medium': { 'ELSS': 15, 'Balanced': 10, 'NPS': 10, 'Fixed': 5 },
    'High': { 'Equity': 20, 'Mutual Fund': 15, 'Stock': 10, 'Fixed': -5 }
  };
  
  const currentRiskScores = riskScores[riskAppetite];
  Object.entries(currentRiskScores).forEach(([key, value]) => {
    if (investment.name.includes(key)) {
      score += value;
    }
  });
  
  // Tax benefit factor
  if (investment.taxBenefit.includes('80C') || investment.taxBenefit.includes('80CCD')) {
    score += 10;
  }
  
  // Liquidity factor (higher score for no lock-in when younger)
  if (age < 35 && investment.lockIn === 'No lock-in') {
    score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Generate personalized investment advice
 */
export const generateInvestmentAdvice = (
  age: number,
  income: number,
  riskAppetite: 'Low' | 'Medium' | 'High'
): string[] => {
  const advice: string[] = [];
  
  // Age-based advice
  if (age < 25) {
    advice.push("Start investing early to benefit from compound growth over time.");
    advice.push("Focus on equity-based investments for long-term wealth creation.");
    advice.push("Consider SIPs to build investment discipline.");
  } else if (age < 35) {
    advice.push("This is the prime time for wealth accumulation through equity investments.");
    advice.push("Maximize tax-saving investments under Section 80C.");
    advice.push("Start planning for major life goals like home purchase.");
  } else if (age < 50) {
    advice.push("Balance growth and stability in your investment portfolio.");
    advice.push("Increase allocation to debt instruments gradually.");
    advice.push("Focus on retirement planning with NPS and PPF.");
  } else {
    advice.push("Prioritize capital preservation over high growth.");
    advice.push("Increase allocation to fixed-income instruments.");
    advice.push("Ensure adequate emergency fund and insurance coverage.");
  }
  
  // Income-based advice
  const monthlyIncome = income / 12;
  if (monthlyIncome < 50000) {
    advice.push("Start with small SIPs of ₹1,000-₹2,000 per month.");
    advice.push("Focus on tax-saving investments first to reduce tax burden.");
  } else if (monthlyIncome < 100000) {
    advice.push("Diversify across different asset classes for better risk management.");
    advice.push("Consider direct mutual funds to save on expense ratios.");
  } else {
    advice.push("Explore advanced investment options like international funds.");
    advice.push("Consider portfolio rebalancing quarterly or half-yearly.");
  }
  
  // Risk-based advice
  if (riskAppetite === 'Low') {
    advice.push("Focus on guaranteed returns through FDs, PPF, and NSC.");
    advice.push("Limit equity exposure to maximum 20-30% of portfolio.");
  } else if (riskAppetite === 'Medium') {
    advice.push("Maintain balanced allocation between equity and debt instruments.");
    advice.push("Consider systematic transfer plans (STP) for gradual equity exposure.");
  } else {
    advice.push("You can take higher equity exposure for potentially higher returns.");
    advice.push("Consider direct stock investments along with mutual funds.");
    advice.push("Regular portfolio review is crucial for high-risk investments.");
  }
  
  return advice;
};

export default {
  calculateSIPReturns,
  calculateLumpSumReturns,
  calculateTaxSavings,
  getTaxSlab,
  calculateEmergencyFund,
  getOptimalAllocation,
  filterInvestmentsByProfile,
  calculatePriorityScore,
  generateInvestmentAdvice
};