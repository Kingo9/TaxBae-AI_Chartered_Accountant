/**
 * Sample Deduction Engine for TaxBae App
 * Generates mock responses for tax deduction calculations
 */

// Sample tax deduction categories with limits and descriptions
export const TAX_DEDUCTION_CATEGORIES = {
  '80C': {
    limit: 150000,
    sections: [
      'ELSS Mutual Funds',
      'PPF (Public Provident Fund)',
      'EPF (Employee Provident Fund)',
      'NSC (National Savings Certificate)',
      'Tax Saver Fixed Deposits',
      'Life Insurance Premium',
      'Home Loan Principal',
      'Tuition Fees',
      'ULIP',
    ]
  },
  '80D': {
    limit: 25000,
    seniorCitizenLimit: 50000,
    sections: [
      'Health Insurance Premium - Self/Family',
      'Health Insurance Premium - Parents',
      'Preventive Health Checkup',
    ]
  },
  '80E': {
    limit: null, // No limit
    description: 'Education Loan Interest'
  },
  '80G': {
    limit: null,
    description: 'Donations to Charitable Organizations'
  },
  '80TTA': {
    limit: 10000,
    description: 'Interest on Savings Account'
  },
  '24': {
    limit: 200000,
    description: 'Home Loan Interest (Self-occupied)',
    rentedLimit: null // No limit for rented property
  }
};

// Sample calculation functions
export const calculateTaxDeductions = (income, investments = {}) => {
  const calculations = {
    totalIncome: income,
    totalDeductions: 0,
    taxableIncome: 0,
    taxSavings: 0,
    deductionBreakdown: {},
    suggestions: []
  };

  // Calculate Section 80C deductions
  const section80C = Math.min(investments.section80C || 0, TAX_DEDUCTION_CATEGORIES['80C'].limit);
  calculations.deductionBreakdown['80C'] = section80C;
  calculations.totalDeductions += section80C;

  // Calculate Section 80D deductions
  const section80D = Math.min(investments.section80D || 0, TAX_DEDUCTION_CATEGORIES['80D'].limit);
  calculations.deductionBreakdown['80D'] = section80D;
  calculations.totalDeductions += section80D;

  // Calculate other deductions
  if (investments.section80E) {
    calculations.deductionBreakdown['80E'] = investments.section80E;
    calculations.totalDeductions += investments.section80E;
  }

  if (investments.section80G) {
    calculations.deductionBreakdown['80G'] = investments.section80G;
    calculations.totalDeductions += investments.section80G;
  }

  if (investments.homeLoanInterest) {
    const homeLoanDeduction = Math.min(investments.homeLoanInterest, TAX_DEDUCTION_CATEGORIES['24'].limit);
    calculations.deductionBreakdown['24'] = homeLoanDeduction;
    calculations.totalDeductions += homeLoanDeduction;
  }

  // Calculate taxable income
  calculations.taxableIncome = Math.max(0, income - calculations.totalDeductions - 50000); // Standard deduction

  // Calculate tax savings (approximate)
  calculations.taxSavings = calculateTaxSavings(income, calculations.taxableIncome);

  // Generate suggestions
  calculations.suggestions = generateTaxSavingSuggestions(income, investments);

  return calculations;
};

// Calculate tax savings based on old regime
const calculateTaxSavings = (grossIncome, taxableIncome) => {
  const originalTax = calculateIncomeTax(grossIncome - 50000); // Original tax without deductions
  const actualTax = calculateIncomeTax(taxableIncome);
  return Math.max(0, originalTax - actualTax);
};

// Simple tax calculation for old regime
const calculateIncomeTax = (taxableIncome) => {
  let tax = 0;
  
  if (taxableIncome <= 250000) return 0;
  
  if (taxableIncome > 250000) {
    tax += Math.min(taxableIncome - 250000, 250000) * 0.05; // 5% for 2.5L to 5L
  }
  
  if (taxableIncome > 500000) {
    tax += Math.min(taxableIncome - 500000, 500000) * 0.20; // 20% for 5L to 10L
  }
  
  if (taxableIncome > 1000000) {
    tax += (taxableIncome - 1000000) * 0.30; // 30% for above 10L
  }

  return tax;
};

// Generate tax saving suggestions
const generateTaxSavingSuggestions = (income, currentInvestments = {}) => {
  const suggestions = [];
  const remaining80C = TAX_DEDUCTION_CATEGORIES['80C'].limit - (currentInvestments.section80C || 0);
  const remaining80D = TAX_DEDUCTION_CATEGORIES['80D'].limit - (currentInvestments.section80D || 0);

  if (remaining80C > 0) {
    suggestions.push({
      section: '80C',
      suggestion: `Invest ₹${remaining80C.toLocaleString()} more in ELSS, PPF, or other 80C instruments`,
      potentialSaving: remaining80C * 0.3, // Assuming 30% tax bracket
      priority: 'high'
    });
  }

  if (remaining80D > 0) {
    suggestions.push({
      section: '80D',
      suggestion: `Consider health insurance premium up to ₹${remaining80D.toLocaleString()}`,
      potentialSaving: remaining80D * 0.3,
      priority: 'medium'
    });
  }

  if (!currentInvestments.section80E && income > 500000) {
    suggestions.push({
      section: '80E',
      suggestion: 'If you have education loans, you can claim interest deduction under 80E',
      potentialSaving: 'Variable',
      priority: 'medium'
    });
  }

  if (!currentInvestments.nps) {
    suggestions.push({
      section: '80CCD(1B)',
      suggestion: 'Invest up to ₹50,000 in NPS for additional tax benefits',
      potentialSaving: 15000,
      priority: 'high'
    });
  }

  return suggestions;
};

// Sample response for tax regime comparison
export const compareRegimes = (income, investments = {}) => {
  // Old regime calculation
  const oldRegimeCalc = calculateTaxDeductions(income, investments);
  
  // New regime calculation (simplified)
  const newRegimeTax = calculateNewRegimeTax(income);
  const oldRegimeTax = calculateIncomeTax(oldRegimeCalc.taxableIncome);

  return {
    oldRegime: {
      taxableIncome: oldRegimeCalc.taxableIncome,
      tax: oldRegimeTax,
      takeHome: income - oldRegimeTax,
      deductions: oldRegimeCalc.totalDeductions
    },
    newRegime: {
      taxableIncome: income - 50000, // Only standard deduction
      tax: newRegimeTax,
      takeHome: income - newRegimeTax,
      deductions: 50000
    },
    recommendation: oldRegimeTax < newRegimeTax ? 'old' : 'new',
    savings: Math.abs(oldRegimeTax - newRegimeTax)
  };
};

// New regime tax calculation (simplified)
const calculateNewRegimeTax = (income) => {
  const taxableIncome = income - 50000; // Standard deduction
  let tax = 0;

  if (taxableIncome <= 300000) return 0;
  
  if (taxableIncome > 300000) {
    tax += Math.min(taxableIncome - 300000, 300000) * 0.05; // 5% for 3L to 6L
  }
  
  if (taxableIncome > 600000) {
    tax += Math.min(taxableIncome - 600000, 300000) * 0.10; // 10% for 6L to 9L
  }
  
  if (taxableIncome > 900000) {
    tax += Math.min(taxableIncome - 900000, 300000) * 0.15; // 15% for 9L to 12L
  }

  if (taxableIncome > 1200000) {
    tax += Math.min(taxableIncome - 1200000, 300000) * 0.20; // 20% for 12L to 15L
  }

  if (taxableIncome > 1500000) {
    tax += (taxableIncome - 1500000) * 0.30; // 30% for above 15L
  }

  return tax;
};

// Sample quarterly tax planning
export const generateQuarterlyTaxPlan = (annualIncome) => {
  const quarterlyIncome = annualIncome / 4;
  const advanceTaxDates = [
    { quarter: 'Q1', date: 'June 15', percentage: 15 },
    { quarter: 'Q2', date: 'September 15', percentage: 30 }, // Cumulative 45%
    { quarter: 'Q3', date: 'December 15', percentage: 30 }, // Cumulative 75%
    { quarter: 'Q4', date: 'March 15', percentage: 25 }, // Remaining 25%
  ];

  const estimatedTax = calculateIncomeTax(annualIncome - 200000); // Assuming some deductions

  return {
    annualIncome,
    estimatedTax,
    advanceTaxSchedule: advanceTaxDates.map(quarter => ({
      ...quarter,
      amount: estimatedTax * (quarter.percentage / 100)
    })),
    recommendations: [
      'Track your income quarterly to ensure accurate advance tax payments',
      'Consider tax-saving investments by December to optimize final quarter payment',
      'Keep receipts and documents ready for ITR filing by July 31st'
    ]
  };
};

// Export sample data for testing
export const SAMPLE_RESPONSES = {
  basicCalculation: {
    input: { income: 1000000, investments: { section80C: 150000, section80D: 25000 } },
    output: calculateTaxDeductions(1000000, { section80C: 150000, section80D: 25000 })
  },
  regimeComparison: {
    input: { income: 1200000, investments: { section80C: 100000 } },
    output: compareRegimes(1200000, { section80C: 100000 })
  },
  quarterlyPlan: {
    input: { income: 1500000 },
    output: generateQuarterlyTaxPlan(1500000)
  }
};