// Financial Calculator Utilities
import { 
  EMICalculatorInput, 
  EMICalculatorResult,
  SIPCalculatorInput,
  SIPCalculatorResult,
  GoalSavingsInput,
  GoalSavingsResult,
  RentVsBuyInput,
  RentVsBuyResult
} from '../types';

// EMI Calculator
export const calculateEMI = (input: EMICalculatorInput): EMICalculatorResult => {
  const { principal, rate, tenure } = input;
  const monthlyRate = rate / (12 * 100);
  const numberOfPayments = tenure * 12;

  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const totalAmount = emi * numberOfPayments;
  const totalInterest = totalAmount - principal;

  return {
    emi: Math.round(emi),
    totalAmount: Math.round(totalAmount),
    totalInterest: Math.round(totalInterest),
  };
};

// SIP Calculator
export const calculateSIP = (input: SIPCalculatorInput): SIPCalculatorResult => {
  const { monthlyInvestment, annualReturn, tenure, stepUpPercentage = 0 } = input;
  const monthlyReturn = annualReturn / (12 * 100);
  const months = tenure * 12;

  let maturityAmount = 0;
  let investedAmount = 0;
  let currentSIP = monthlyInvestment;

  for (let month = 1; month <= months; month++) {
    // Calculate compound growth for current SIP installment
    const remainingMonths = months - month + 1;
    const sipMaturityValue = currentSIP * Math.pow(1 + monthlyReturn, remainingMonths - 1);
    maturityAmount += sipMaturityValue;
    investedAmount += currentSIP;

    // Apply step-up annually
    if (stepUpPercentage > 0 && month % 12 === 0 && month < months) {
      currentSIP *= (1 + stepUpPercentage / 100);
    }
  }

  return {
    maturityAmount: Math.round(maturityAmount),
    investedAmount: Math.round(investedAmount),
    returns: Math.round(maturityAmount - investedAmount),
  };
};

// Goal-based Savings Calculator
export const calculateGoalSavings = (input: GoalSavingsInput): GoalSavingsResult => {
  const { goalAmount, timeInYears, expectedReturn } = input;
  const monthlyReturn = expectedReturn / (12 * 100);
  const months = timeInYears * 12;

  // Calculate monthly investment needed using future value of annuity formula
  const monthlyInvestment = goalAmount * monthlyReturn / 
    (Math.pow(1 + monthlyReturn, months) - 1);

  const totalInvestment = monthlyInvestment * months;
  const returns = goalAmount - totalInvestment;

  return {
    monthlyInvestment: Math.round(monthlyInvestment),
    totalInvestment: Math.round(totalInvestment),
    returns: Math.round(returns),
  };
};

// Rent vs Buy Calculator
export const calculateRentVsBuy = (input: RentVsBuyInput): RentVsBuyResult => {
  const { 
    homePrice, 
    downPayment, 
    loanRate, 
    loanTenure, 
    monthlyRent, 
    rentIncrease, 
    timeHorizon 
  } = input;

  const loanAmount = homePrice - downPayment;
  const emi = calculateEMI({
    principal: loanAmount,
    rate: loanRate,
    tenure: loanTenure
  }).emi;

  // Calculate total rent cost with annual increases
  let totalRentCost = 0;
  let currentRent = monthlyRent;
  for (let year = 0; year < timeHorizon; year++) {
    totalRentCost += currentRent * 12;
    currentRent *= (1 + rentIncrease / 100);
  }

  // Calculate total buy cost (down payment + EMIs for time horizon)
  const monthsInHorizon = Math.min(timeHorizon * 12, loanTenure * 12);
  const totalBuyCost = downPayment + (emi * monthsInHorizon);

  const recommendation = totalRentCost < totalBuyCost ? 'rent' : 'buy';
  const savings = Math.abs(totalBuyCost - totalRentCost);

  return {
    totalRentCost: Math.round(totalRentCost),
    totalBuyCost: Math.round(totalBuyCost),
    recommendation,
    savings: Math.round(savings),
  };
};

// Tax Calculator Utilities
export const calculateTaxSavings = (income: number, deductions: number): number => {
  // Simplified Indian tax calculation for demonstration
  const taxableIncome = Math.max(0, income - deductions);
  let tax = 0;

  // FY 2024-25 tax slabs (new regime)
  if (taxableIncome > 300000) {
    if (taxableIncome <= 700000) {
      tax += (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax += 400000 * 0.05 + (taxableIncome - 700000) * 0.10;
    } else if (taxableIncome <= 1200000) {
      tax += 400000 * 0.05 + 300000 * 0.10 + (taxableIncome - 1000000) * 0.15;
    } else if (taxableIncome <= 1500000) {
      tax += 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + (taxableIncome - 1200000) * 0.20;
    } else {
      tax += 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + 300000 * 0.20 + (taxableIncome - 1500000) * 0.30;
    }
  }

  const taxWithoutDeductions = calculateTaxSavings(income, 0);
  return Math.round(taxWithoutDeductions - tax);
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(2)}%`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};
