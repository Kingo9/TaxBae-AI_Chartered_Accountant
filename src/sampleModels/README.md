# TaxBae Sample Models

This folder contains mock data generators and sample models for the TaxBae app. These models provide realistic sample data and calculations for development and testing purposes.

## 📁 Files Overview

### 1. `deductionEngineSample.js`
Mock tax calculation engine with comprehensive Indian tax law features.

**Features:**
- Tax deduction calculations (80C, 80D, 24, etc.)
- Old vs New tax regime comparisons
- Quarterly tax planning
- Tax savings suggestions

### 2. `expenseTrackerSample.js`
Mock expense tracking and analytics system.

**Features:**
- Sample transaction generation
- Expense categorization
- Analytics and insights
- Budget recommendations
- Monthly/yearly trends

### 3. `chatbotSample.js`
Mock AI chatbot with Indian tax knowledge base.

**Features:**
- Tax query responses
- Conversation management
- Quick tips and suggestions
- Context-aware responses

### 4. `index.js`
Integration utilities and usage examples for all sample models.

### 5. `README.md`
This documentation file.

## 🚀 Quick Start

### Import Sample Models

```javascript
// Import specific functions
import { calculateTaxDeductions, compareRegimes } from './sampleModels/deductionEngineSample.js';
import { generateSampleTransactions, calculateExpenseAnalytics } from './sampleModels/expenseTrackerSample.js';
import { generateChatResponse, CONVERSATION_STARTERS } from './sampleModels/chatbotSample.js';

// Or import everything
import sampleModels from './sampleModels/index.js';
```

### Basic Usage Examples

#### Tax Deduction Calculator

```javascript
// Calculate tax deductions for a user
const taxResult = calculateTaxDeductions(1000000, {
  section80C: 150000,
  section80D: 25000,
  homeLoanInterest: 200000
});

console.log(`Tax Savings: ₹${taxResult.taxSavings}`);
console.log(`Taxable Income: ₹${taxResult.taxableIncome}`);
```

#### Expense Analytics

```javascript
// Generate sample transactions and analyze them
const transactions = generateSampleTransactions(30);
const analytics = calculateExpenseAnalytics(transactions);

console.log(`Total Expenses: ₹${analytics.summary.totalExpenses}`);
console.log(`Savings Rate: ${analytics.summary.savingsRate}%`);
```

#### AI Chatbot

```javascript
// Get AI response for tax query
const response = generateChatResponse('How can I save tax?');
console.log(response.text);
console.log(`Confidence: ${response.confidence}`);
```

## 📱 Component Integration

### Using React Hooks

```javascript
import { useTaxDeductionComponent } from './sampleModels/index.js';

const TaxCalculatorComponent = () => {
  const { deductions, loading, error, calculateDeductions } = useTaxDeductionComponent();

  const handleCalculate = () => {
    calculateDeductions(500000, { section80C: 100000 });
  };

  return (
    <View>
      <Button onPress={handleCalculate} disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate Tax'}
      </Button>
      {deductions && (
        <Text>Tax Savings: ₹{deductions.taxSavings}</Text>
      )}
    </View>
  );
};
```

### Direct Integration

```javascript
import { useState, useEffect } from 'react';
import { generateSampleTransactions, calculateExpenseAnalytics } from './sampleModels/expenseTrackerSample.js';

const ExpenseComponent = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const transactions = generateSampleTransactions(25);
    const result = calculateExpenseAnalytics(transactions);
    setAnalytics(result);
  }, []);

  return (
    <View>
      {analytics && (
        <View>
          <Text>Total Income: ₹{analytics.summary.totalIncome}</Text>
          <Text>Total Expenses: ₹{analytics.summary.totalExpenses}</Text>
          <Text>Savings Rate: {analytics.summary.savingsRate.toFixed(1)}%</Text>
        </View>
      )}
    </View>
  );
};
```

## 🎯 Use Cases

### 1. Development & Testing
- Generate realistic test data
- Test UI components with sample data
- Simulate various user scenarios
- Debug calculations and analytics

### 2. Demos & Presentations
- Show app functionality without backend
- Present to stakeholders or investors
- Create marketing materials
- User testing sessions

### 3. Offline Mode
- Provide basic functionality when offline
- Cache sample responses
- Educational content for users
- Fallback when API fails

## 📊 Sample Data Available

### Tax Deduction Engine
- **Income Ranges**: ₹3L to ₹50L+ scenarios
- **Deduction Sections**: 80C, 80D, 80E, 80G, 24, 80CCD(1B)
- **Tax Regimes**: Old vs New regime comparisons
- **User Types**: Individual, Corporate, Senior Citizens

### Expense Tracker
- **Categories**: 14 expense categories, 8 income categories
- **Time Periods**: Daily, monthly, yearly data
- **Transaction Types**: Income, expenses, investments
- **Analytics**: Trends, insights, budget suggestions

### AI Chatbot
- **Knowledge Base**: 100+ tax queries and responses
- **Categories**: Tax planning, compliance, investments
- **Conversation Flow**: Context-aware responses
- **Quick Actions**: Tips, suggestions, calculators

## 🔧 Customization

### Modify Sample Data

```javascript
// Customize tax deduction limits
const customTaxRules = {
  '80C': { limit: 200000 }, // Increased limit
  '80D': { limit: 30000 }   // Custom health insurance limit
};

// Modify expense categories
const customCategories = {
  'Custom Category': { 
    icon: '🎯', 
    color: '#FF6B6B', 
    taxDeductible: true 
  }
};

// Update chatbot responses
const customQueries = {
  'my custom query': {
    response: 'Your custom response here',
    category: 'custom',
    confidence: 0.95
  }
};
```

### Extend Functionality

```javascript
// Add new calculation methods
export const calculateCustomTax = (income, customRules) => {
  // Your custom logic here
  return {
    customTax: 0,
    customDeductions: 0,
    // ... other fields
  };
};

// Add new expense analytics
export const generateCustomAnalytics = (transactions) => {
  // Your custom analytics logic
  return {
    customMetrics: {},
    customInsights: []
  };
};
```

## 🎨 Styling & UI Integration

The sample models work seamlessly with the enhanced theme system:

```javascript
import { colors, typography, spacing, commonStyles } from '../utils/theme';

// Use enhanced colors
<Text style={{ color: colors.success }}>
  Tax Savings: ₹{taxSavings}
</Text>

// Use improved typography
<Text style={typography.textStyles.h2}>
  Financial Summary
</Text>

// Use common styles
<TouchableOpacity style={commonStyles.button}>
  <Text style={commonStyles.buttonText}>Calculate</Text>
</TouchableOpacity>
```

## 🚀 Migration to Production

When ready to replace sample models with real APIs:

1. **Replace Function Calls**:
   ```javascript
   // From: Sample model
   const result = calculateTaxDeductions(income, investments);
   
   // To: API call
   const result = await apiService.calculateTaxDeductions({ income, investments });
   ```

2. **Update Error Handling**:
   ```javascript
   try {
     const result = await apiService.getData();
     // Handle success
   } catch (error) {
     // Handle API errors
     console.error('API Error:', error);
   }
   ```

3. **Maintain Interface Compatibility**:
   Ensure your API responses match the sample model structure to minimize code changes.

## 📝 Best Practices

1. **Use TypeScript**: Add proper type definitions for better development experience
2. **Error Handling**: Always wrap sample model calls in try-catch blocks
3. **Loading States**: Show loading indicators when simulating API delays
4. **Data Validation**: Validate inputs before passing to sample models
5. **Consistent Formatting**: Use the provided utility functions for currency and date formatting

## 🔍 Testing

```javascript
// Example test using sample models
import { calculateTaxDeductions } from '../sampleModels/deductionEngineSample.js';

test('should calculate tax deductions correctly', () => {
  const result = calculateTaxDeductions(1000000, { section80C: 150000 });
  
  expect(result.totalIncome).toBe(1000000);
  expect(result.totalDeductions).toBe(150000);
  expect(result.taxSavings).toBeGreaterThan(0);
});
```

## 📞 Support

For questions or issues with sample models:

1. Check this README for usage examples
2. Look at the demo component (`SampleModelDemo.tsx`)
3. Review the integration guide in `index.js`
4. Test with the provided sample data

---

**Note**: These are mock models for development purposes. Replace with actual API calls and real tax calculations before production deployment.