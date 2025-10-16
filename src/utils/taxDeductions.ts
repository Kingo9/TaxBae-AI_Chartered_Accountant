import { TaxDeduction } from '../types';

// Indian Tax Deductions for FY 2024-25
export const TAX_DEDUCTIONS: TaxDeduction[] = [
  // Section 80C Deductions
  {
    section: '80C',
    name: 'Life Insurance Premium',
    description: 'Premium paid for life insurance policies',
    maxLimit: 150000,
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },
  {
    section: '80C',
    name: 'PPF (Public Provident Fund)',
    description: 'Investment in Public Provident Fund',
    maxLimit: 150000,
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },
  {
    section: '80C',
    name: 'ELSS Mutual Funds',
    description: 'Equity Linked Savings Scheme mutual funds',
    maxLimit: 150000,
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },
  {
    section: '80C',
    name: 'EPF (Employee Provident Fund)',
    description: 'Employee contribution to Provident Fund',
    maxLimit: 150000,
    eligibility: ['Salaried Individual'],
    userType: 'individual',
    isApplicable: true,
  },
  {
    section: '80C',
    name: 'NSC (National Savings Certificate)',
    description: 'Investment in National Savings Certificate',
    maxLimit: 150000,
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },
  {
    section: '80C',
    name: 'Tax Saving Fixed Deposit',
    description: '5-year tax saving fixed deposit',
    maxLimit: 150000,
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },
  {
    section: '80C',
    name: 'Home Loan Principal Repayment',
    description: 'Principal repayment of home loan',
    maxLimit: 150000,
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },
  {
    section: '80C',
    name: 'Tuition Fees',
    description: 'Tuition fees for children education (max 2 children)',
    maxLimit: 150000,
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },

  // Section 80D Deductions
  {
    section: '80D',
    name: 'Health Insurance Premium - Self & Family',
    description: 'Health insurance premium for self, spouse, and children',
    maxLimit: 25000,
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },
  {
    section: '80D',
    name: 'Health Insurance Premium - Parents',
    description: 'Health insurance premium for parents',
    maxLimit: 25000,
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },
  {
    section: '80D',
    name: 'Health Insurance Premium - Senior Citizen Parents',
    description: 'Health insurance premium for senior citizen parents (60+)',
    maxLimit: 50000,
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },
  {
    section: '80D',
    name: 'Preventive Health Check-up',
    description: 'Preventive health check-up for self, family, and parents',
    maxLimit: 5000,
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },

  // Section 80E
  {
    section: '80E',
    name: 'Education Loan Interest',
    description: 'Interest paid on education loan for higher studies',
    maxLimit: 0, // No limit
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },

  // Section 80G
  {
    section: '80G',
    name: 'Donations to Charitable Organizations',
    description: 'Donations to approved charitable organizations',
    maxLimit: 0, // Varies by organization
    eligibility: ['Individual', 'HUF', 'Company'],
    userType: 'both',
    isApplicable: true,
  },

  // HRA
  {
    section: 'HRA',
    name: 'House Rent Allowance',
    description: 'Rent paid for accommodation (metro: 50% of salary, non-metro: 40%)',
    maxLimit: 0, // Calculated based on salary
    eligibility: ['Salaried Individual'],
    userType: 'individual',
    isApplicable: true,
  },

  // Section 80TTA
  {
    section: '80TTA',
    name: 'Savings Account Interest',
    description: 'Interest earned on savings bank account',
    maxLimit: 10000,
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },

  // Section 80TTB
  {
    section: '80TTB',
    name: 'Senior Citizen Interest Income',
    description: 'Interest income from deposits (for senior citizens)',
    maxLimit: 50000,
    eligibility: ['Senior Citizens (60+)'],
    userType: 'individual',
    isApplicable: true,
  },

  // Section 24 - Home Loan Interest
  {
    section: '24',
    name: 'Home Loan Interest',
    description: 'Interest paid on home loan for self-occupied property',
    maxLimit: 200000,
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },
  {
    section: '24',
    name: 'Home Loan Interest - Rented Property',
    description: 'Interest paid on home loan for rented property',
    maxLimit: 0, // No limit
    eligibility: ['Individual', 'HUF'],
    userType: 'individual',
    isApplicable: true,
  },

  // Section 80EE
  {
    section: '80EE',
    name: 'First Time Home Buyer Interest',
    description: 'Additional deduction for first-time home buyers',
    maxLimit: 50000,
    eligibility: ['First-time Home Buyers'],
    userType: 'individual',
    isApplicable: true,
  },

  // Corporate Deductions
  {
    section: '35(1)(ii)',
    name: 'Research & Development',
    description: 'Expenditure on scientific research',
    maxLimit: 0, // 200% deduction
    eligibility: ['Companies'],
    userType: 'corporate',
    isApplicable: true,
  },
  {
    section: '35AD',
    name: 'Infrastructure Development',
    description: 'Capital expenditure on specified infrastructure',
    maxLimit: 0, // 100% deduction
    eligibility: ['Companies'],
    userType: 'corporate',
    isApplicable: true,
  },
  {
    section: '80JJAA',
    name: 'Employment Generation',
    description: 'Additional employee cost for new employment',
    maxLimit: 0, // 30% of additional employee cost
    eligibility: ['Companies'],
    userType: 'corporate',
    isApplicable: true,
  },
  {
    section: '80IA',
    name: 'Infrastructure Development Projects',
    description: 'Profit from infrastructure development projects',
    maxLimit: 0, // 100% for 10 consecutive years
    eligibility: ['Companies'],
    userType: 'corporate',
    isApplicable: true,
  },
  {
    section: '80IB',
    name: 'Industrial Development',
    description: 'Profit from industrial undertakings',
    maxLimit: 0, // Various percentages
    eligibility: ['Companies'],
    userType: 'corporate',
    isApplicable: true,
  },
];

// Function to get applicable deductions based on user profile
export const getApplicableDeductions = (
  userType: 'individual' | 'corporate',
  income: number,
  isMarried: boolean = false,
  hasChildren: boolean = false,
  age: number = 30,
  isSalaried: boolean = true
): TaxDeduction[] => {
  return TAX_DEDUCTIONS.filter(deduction => {
    // Filter by user type
    if (deduction.userType !== 'both' && deduction.userType !== userType) {
      return false;
    }

    // Additional filtering logic based on profile
    if (deduction.section === '80TTB' && age < 60) {
      return false; // Senior citizen benefit
    }

    if (deduction.name === 'EPF (Employee Provident Fund)' && !isSalaried) {
      return false; // Only for salaried individuals
    }

    if (deduction.section === 'HRA' && !isSalaried) {
      return false; // Only for salaried individuals
    }

    return true;
  });
};

// Function to calculate maximum tax savings
export const calculateMaxTaxSavings = (
  deductions: TaxDeduction[],
  income: number,
  investments: Record<string, number> = {}
): number => {
  let totalDeductions = 0;

  deductions.forEach(deduction => {
    const invested = investments[deduction.section] || 0;
    if (deduction.maxLimit === 0) {
      // No limit or special calculation required
      totalDeductions += invested;
    } else {
      totalDeductions += Math.min(invested, deduction.maxLimit);
    }
  });

  // Calculate tax savings (assuming 30% tax bracket)
  const taxRate = income > 1000000 ? 0.30 : income > 500000 ? 0.20 : income > 250000 ? 0.05 : 0;
  return Math.round(totalDeductions * taxRate);
};

// Tax planning suggestions
export const getTaxPlanningTips = (
  userType: 'individual' | 'corporate',
  income: number,
  currentDeductions: number
): string[] => {
  const tips: string[] = [];

  if (userType === 'individual') {
    if (currentDeductions < 150000) {
      tips.push('💡 Invest up to ₹1.5 lakh in 80C options like ELSS, PPF, or life insurance');
    }
    
    if (income > 500000) {
      tips.push('💡 Consider health insurance for additional ₹25,000 deduction under 80D');
    }
    
    if (income > 1000000) {
      tips.push('💡 Look into NPS for additional ₹50,000 deduction under 80CCD(1B)');
    }
    
    tips.push('💡 Keep receipts for preventive health check-ups (₹5,000 under 80D)');
    tips.push('💡 Consider home loan for interest deduction under Section 24');
  } else {
    tips.push('💡 Invest in R&D activities for 200% deduction under Section 35');
    tips.push('💡 Consider CSR spending for tax benefits and social impact');
    tips.push('💡 Look into infrastructure projects for Section 80IA benefits');
    tips.push('💡 Employment generation schemes provide 30% additional deduction');
  }

  return tips;
};

// Export helper functions
export const formatDeductionAmount = (amount: number): string => {
  if (amount === 0) return 'No Limit';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
