// Investment Sample Data - Mock responses for testing
// This provides sample investment recommendations based on user profile

export const investmentSampleData = {
  // Sample responses for different risk profiles
  lowRisk: {
    income: 800000,
    age: 35,
    risk: "Low",
    recommendations: [
      {
        name: "Public Provident Fund (PPF)",
        expectedReturn: "7-8% annually",
        lockIn: "15 years",
        taxBenefit: "80C eligible up to ₹1.5L + Tax-free returns",
        description: "Government-backed long-term savings scheme with guaranteed returns",
        minInvestment: "₹500",
        maxInvestment: "₹1.5L per year"
      },
      {
        name: "Fixed Deposits",
        expectedReturn: "6-7% annually",
        lockIn: "1-10 years",
        taxBenefit: "Tax Saver FDs under 80C up to ₹1.5L",
        description: "Safe investment option with guaranteed returns",
        minInvestment: "₹1,000",
        maxInvestment: "No limit"
      },
      {
        name: "National Savings Certificate (NSC)",
        expectedReturn: "6.8% annually",
        lockIn: "5 years",
        taxBenefit: "80C eligible up to ₹1.5L",
        description: "Government-backed fixed income investment",
        minInvestment: "₹1,000",
        maxInvestment: "No limit"
      },
      {
        name: "Liquid Mutual Funds",
        expectedReturn: "4-6% annually",
        lockIn: "No lock-in",
        taxBenefit: "No specific tax benefit",
        description: "High liquidity with stable returns for emergency funds",
        minInvestment: "₹1,000",
        maxInvestment: "No limit"
      }
    ]
  },

  mediumRisk: {
    income: 1200000,
    age: 28,
    risk: "Medium",
    recommendations: [
      {
        name: "Equity Linked Savings Scheme (ELSS)",
        expectedReturn: "10-12% annually",
        lockIn: "3 years",
        taxBenefit: "80C eligible up to ₹1.5L",
        description: "Tax-saving mutual funds with equity exposure",
        minInvestment: "₹500",
        maxInvestment: "₹1.5L per year for tax benefit"
      },
      {
        name: "NPS (National Pension System)",
        expectedReturn: "9-10% annually",
        lockIn: "Till age 60",
        taxBenefit: "80CCD(1B) additional ₹50k + 80CCD(1) up to ₹1.5L",
        description: "Government-sponsored pension scheme with tax benefits",
        minInvestment: "₹1,000",
        maxInvestment: "No limit"
      },
      {
        name: "Balanced Mutual Funds",
        expectedReturn: "8-10% annually",
        lockIn: "No lock-in",
        taxBenefit: "LTCG tax applicable after ₹1L profit",
        description: "Mix of equity and debt for balanced growth",
        minInvestment: "₹500",
        maxInvestment: "No limit"
      },
      {
        name: "Index Funds",
        expectedReturn: "10-12% annually",
        lockIn: "No lock-in",
        taxBenefit: "LTCG tax applicable after ₹1L profit",
        description: "Low-cost funds tracking market indices",
        minInvestment: "₹1,000",
        maxInvestment: "No limit"
      }
    ]
  },

  highRisk: {
    income: 1800000,
    age: 25,
    risk: "High",
    recommendations: [
      {
        name: "Equity Mutual Funds (Large Cap)",
        expectedReturn: "12-15% annually",
        lockIn: "No lock-in",
        taxBenefit: "LTCG tax applicable after ₹1L profit",
        description: "Investment in established large companies",
        minInvestment: "₹500",
        maxInvestment: "No limit"
      },
      {
        name: "Mid & Small Cap Funds",
        expectedReturn: "15-18% annually",
        lockIn: "No lock-in",
        taxBenefit: "LTCG tax applicable after ₹1L profit",
        description: "Higher growth potential with increased volatility",
        minInvestment: "₹500",
        maxInvestment: "No limit"
      },
      {
        name: "Direct Equity Stocks",
        expectedReturn: "12-20% annually",
        lockIn: "No lock-in",
        taxBenefit: "LTCG tax applicable after ₹1L profit",
        description: "Direct investment in individual company stocks",
        minInvestment: "1 share price",
        maxInvestment: "No limit"
      },
      {
        name: "Sectoral/Thematic Funds",
        expectedReturn: "10-25% annually",
        lockIn: "No lock-in",
        taxBenefit: "LTCG tax applicable after ₹1L profit",
        description: "Focused investment in specific sectors or themes",
        minInvestment: "₹500",
        maxInvestment: "No limit"
      },
      {
        name: "International Funds",
        expectedReturn: "8-15% annually",
        lockIn: "No lock-in",
        taxBenefit: "No specific tax benefit",
        description: "Diversification through global market exposure",
        minInvestment: "₹1,000",
        maxInvestment: "No limit"
      }
    ]
  }
};

// Function to get recommendations based on user input
export const getInvestmentRecommendations = (income, age, riskAppetite) => {
  const riskKey = riskAppetite.toLowerCase() + 'Risk';
  const baseData = investmentSampleData[riskKey] || investmentSampleData.mediumRisk;
  
  // Customize recommendations based on age and income
  const customizedData = {
    ...baseData,
    income: income,
    age: age,
    risk: riskAppetite,
    recommendations: baseData.recommendations.map(rec => ({
      ...rec,
      // Adjust recommendations based on age
      suitability: getAgeSuitability(age, rec.name),
      // Adjust investment amount suggestions based on income
      suggestedAmount: getSuggestedAmount(income, rec.name)
    }))
  };
  
  return customizedData;
};

// Helper function to determine age-based suitability
const getAgeSuitability = (age, investmentName) => {
  if (age < 30) {
    if (investmentName.includes('Equity') || investmentName.includes('Stock')) {
      return "Highly Suitable - Long investment horizon";
    }
    if (investmentName.includes('PPF') || investmentName.includes('NPS')) {
      return "Excellent - Start early for maximum benefit";
    }
  } else if (age < 45) {
    if (investmentName.includes('Balanced') || investmentName.includes('ELSS')) {
      return "Very Suitable - Good balance of growth and stability";
    }
  } else {
    if (investmentName.includes('Fixed') || investmentName.includes('NSC')) {
      return "Suitable - Focus on capital preservation";
    }
  }
  return "Suitable for your age group";
};

// Helper function to suggest investment amounts based on income
const getSuggestedAmount = (income, investmentName) => {
  const monthlyIncome = income / 12;
  const suggestedPercentage = getSuggestedPercentage(investmentName);
  const suggestedAmount = Math.round((monthlyIncome * suggestedPercentage) / 100);
  
  return `₹${suggestedAmount.toLocaleString()} per month`;
};

// Helper function to get suggested percentage based on investment type
const getSuggestedPercentage = (investmentName) => {
  if (investmentName.includes('Emergency') || investmentName.includes('Liquid')) return 10;
  if (investmentName.includes('PPF') || investmentName.includes('Tax')) return 15;
  if (investmentName.includes('Equity') || investmentName.includes('Stock')) return 20;
  if (investmentName.includes('NPS')) return 10;
  return 12; // Default percentage
};

// Sample portfolio allocation based on risk profile
export const getPortfolioAllocation = (riskAppetite) => {
  const allocations = {
    Low: {
      equity: 20,
      debt: 60,
      gold: 10,
      cash: 10
    },
    Medium: {
      equity: 50,
      debt: 35,
      gold: 10,
      cash: 5
    },
    High: {
      equity: 75,
      debt: 15,
      gold: 5,
      cash: 5
    }
  };
  
  return allocations[riskAppetite] || allocations.Medium;
};

export default {
  investmentSampleData,
  getInvestmentRecommendations,
  getPortfolioAllocation
};