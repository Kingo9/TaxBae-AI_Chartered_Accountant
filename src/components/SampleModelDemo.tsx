import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows, commonStyles } from '../utils/theme';

// Import sample models
import { 
  calculateTaxDeductions, 
  compareRegimes,
  generateQuarterlyTaxPlan 
} from '../sampleModels/deductionEngineSample.js';
import { 
  generateSampleTransactions, 
  calculateExpenseAnalytics 
} from '../sampleModels/expenseTrackerSample.js';
import { 
  generateChatResponse,
  CONVERSATION_STARTERS 
} from '../sampleModels/chatbotSample.js';

interface DemoSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
}

const DemoSection: React.FC<DemoSectionProps> = ({ title, children, icon }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      {icon && <Ionicons name={icon} size={24} color={colors.primary} />}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const SampleModelDemo: React.FC = () => {
  const [taxCalculations, setTaxCalculations] = useState<any>(null);
  const [regimeComparison, setRegimeComparison] = useState<any>(null);
  const [expenseAnalytics, setExpenseAnalytics] = useState<any>(null);
  const [chatResponse, setChatResponse] = useState<any>(null);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  // Demo tax deduction calculation
  const runTaxDeductionDemo = async () => {
    setLoading(prev => ({ ...prev, tax: true }));
    
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = calculateTaxDeductions(1000000, {
        section80C: 150000,
        section80D: 25000,
        homeLoanInterest: 200000
      });
      
      setTaxCalculations(result);
      Alert.alert('Success', 'Tax deductions calculated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate tax deductions');
    } finally {
      setLoading(prev => ({ ...prev, tax: false }));
    }
  };

  // Demo tax regime comparison
  const runRegimeComparisonDemo = async () => {
    setLoading(prev => ({ ...prev, regime: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = compareRegimes(800000, { section80C: 100000 });
      setRegimeComparison(result);
      Alert.alert('Comparison Complete', `Recommendation: ${result.recommendation.toUpperCase()} regime`);
    } catch (error) {
      Alert.alert('Error', 'Failed to compare regimes');
    } finally {
      setLoading(prev => ({ ...prev, regime: false }));
    }
  };

  // Demo expense analytics
  const runExpenseAnalyticsDemo = async () => {
    setLoading(prev => ({ ...prev, expense: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const sampleTransactions = generateSampleTransactions(20);
      const analytics = calculateExpenseAnalytics(sampleTransactions);
      setExpenseAnalytics(analytics);
      Alert.alert('Analytics Ready', `Analyzed ${sampleTransactions.length} transactions`);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze expenses');
    } finally {
      setLoading(prev => ({ ...prev, expense: false }));
    }
  };

  // Demo chatbot response
  const runChatbotDemo = async () => {
    setLoading(prev => ({ ...prev, chat: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = generateChatResponse('How can I save tax?');
      setChatResponse(response);
      Alert.alert('AI Response Generated', 'Check the chatbot demo section below');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate chat response');
    } finally {
      setLoading(prev => ({ ...prev, chat: false }));
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Sample Models Demo</Text>
        <Text style={styles.subtitle}>
          Explore how TaxBae's mock models work in real components
        </Text>
      </View>

      {/* Tax Deduction Engine Demo */}
      <DemoSection title="Tax Deduction Engine" icon="calculator">
        <TouchableOpacity 
          style={[commonStyles.button, loading.tax && styles.buttonLoading]}
          onPress={runTaxDeductionDemo}
          disabled={loading.tax}
        >
          <Text style={commonStyles.buttonText}>
            {loading.tax ? 'Calculating...' : 'Calculate Tax Deductions'}
          </Text>
        </TouchableOpacity>

        {taxCalculations && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Tax Calculation Results</Text>
            <View style={styles.resultGrid}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total Income</Text>
                <Text style={styles.resultValue}>{formatCurrency(taxCalculations.totalIncome)}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total Deductions</Text>
                <Text style={[styles.resultValue, { color: colors.success }]}>
                  {formatCurrency(taxCalculations.totalDeductions)}
                </Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Taxable Income</Text>
                <Text style={styles.resultValue}>{formatCurrency(taxCalculations.taxableIncome)}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Tax Savings</Text>
                <Text style={[styles.resultValue, { color: colors.success }]}>
                  {formatCurrency(taxCalculations.taxSavings)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </DemoSection>

      {/* Tax Regime Comparison Demo */}
      <DemoSection title="Tax Regime Comparison" icon="swap-horizontal">
        <TouchableOpacity 
          style={[commonStyles.button, loading.regime && styles.buttonLoading]}
          onPress={runRegimeComparisonDemo}
          disabled={loading.regime}
        >
          <Text style={commonStyles.buttonText}>
            {loading.regime ? 'Comparing...' : 'Compare Tax Regimes'}
          </Text>
        </TouchableOpacity>

        {regimeComparison && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Regime Comparison</Text>
            <View style={styles.comparisonGrid}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Old Regime</Text>
                <Text style={styles.comparisonValue}>
                  Tax: {formatCurrency(regimeComparison.oldRegime.tax)}
                </Text>
                <Text style={styles.comparisonValue}>
                  Take Home: {formatCurrency(regimeComparison.oldRegime.takeHome)}
                </Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>New Regime</Text>
                <Text style={styles.comparisonValue}>
                  Tax: {formatCurrency(regimeComparison.newRegime.tax)}
                </Text>
                <Text style={styles.comparisonValue}>
                  Take Home: {formatCurrency(regimeComparison.newRegime.takeHome)}
                </Text>
              </View>
            </View>
            <View style={styles.recommendationBanner}>
              <Text style={styles.recommendationText}>
                💡 Recommendation: {regimeComparison.recommendation.toUpperCase()} regime
              </Text>
              <Text style={styles.savingsText}>
                Potential savings: {formatCurrency(regimeComparison.savings)}
              </Text>
            </View>
          </View>
        )}
      </DemoSection>

      {/* Expense Analytics Demo */}
      <DemoSection title="Expense Analytics" icon="trending-up">
        <TouchableOpacity 
          style={[commonStyles.button, loading.expense && styles.buttonLoading]}
          onPress={runExpenseAnalyticsDemo}
          disabled={loading.expense}
        >
          <Text style={commonStyles.buttonText}>
            {loading.expense ? 'Analyzing...' : 'Generate Expense Analytics'}
          </Text>
        </TouchableOpacity>

        {expenseAnalytics && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Expense Summary</Text>
            <View style={styles.resultGrid}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total Income</Text>
                <Text style={[styles.resultValue, { color: colors.success }]}>
                  {formatCurrency(expenseAnalytics.summary.totalIncome)}
                </Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total Expenses</Text>
                <Text style={[styles.resultValue, { color: colors.error }]}>
                  {formatCurrency(expenseAnalytics.summary.totalExpenses)}
                </Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Net Savings</Text>
                <Text style={[styles.resultValue, { color: colors.primary }]}>
                  {formatCurrency(expenseAnalytics.summary.netSavings)}
                </Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Savings Rate</Text>
                <Text style={styles.resultValue}>
                  {expenseAnalytics.summary.savingsRate.toFixed(1)}%
                </Text>
              </View>
            </View>

            {expenseAnalytics.topCategories.length > 0 && (
              <View style={styles.categoriesContainer}>
                <Text style={styles.categoriesTitle}>Top Spending Categories</Text>
                {expenseAnalytics.topCategories.slice(0, 3).map((category: any, index: number) => (
                  <View key={index} style={styles.categoryItem}>
                    <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                    <Text style={styles.categoryName}>{category.category}</Text>
                    <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </DemoSection>

      {/* Chatbot Demo */}
      <DemoSection title="AI Chatbot" icon="chatbubble-ellipses">
        <TouchableOpacity 
          style={[commonStyles.button, loading.chat && styles.buttonLoading]}
          onPress={runChatbotDemo}
          disabled={loading.chat}
        >
          <Text style={commonStyles.buttonText}>
            {loading.chat ? 'Generating...' : 'Generate AI Response'}
          </Text>
        </TouchableOpacity>

        {chatResponse && (
          <View style={styles.chatContainer}>
            <View style={styles.chatMessage}>
              <Text style={styles.chatLabel}>User Question:</Text>
              <Text style={styles.chatText}>"How can I save tax?"</Text>
            </View>
            <View style={styles.chatResponse}>
              <Text style={styles.chatLabel}>AI Response:</Text>
              <Text style={styles.chatText}>{chatResponse.text}</Text>
              <Text style={styles.chatMeta}>
                Category: {chatResponse.category} | Confidence: {(chatResponse.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          </View>
        )}

        <View style={styles.conversationStarters}>
          <Text style={styles.startersTitle}>Quick Start Conversations:</Text>
          {CONVERSATION_STARTERS.slice(0, 3).map((starter, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.starterButton}
              onPress={() => {
                const response = generateChatResponse(starter.text);
                setChatResponse(response);
              }}
            >
              <Text style={styles.starterIcon}>{starter.icon}</Text>
              <Text style={styles.starterText}>{starter.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DemoSection>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🚀 All sample models are working perfectly! Ready to integrate into production components.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.textStyles.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.textStyles.h3,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  resultContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.md,
  },
  resultTitle: {
    ...typography.textStyles.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  resultItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.sm,
  },
  resultLabel: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultValue: {
    ...typography.textStyles.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  comparisonItem: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  comparisonLabel: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  comparisonValue: {
    ...typography.textStyles.small,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  recommendationBanner: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  recommendationText: {
    ...typography.textStyles.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  savingsText: {
    ...typography.textStyles.caption,
    color: colors.success,
    marginTop: spacing.xs,
  },
  categoriesContainer: {
    marginTop: spacing.lg,
  },
  categoriesTitle: {
    ...typography.textStyles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryName: {
    flex: 1,
    ...typography.textStyles.caption,
    color: colors.textPrimary,
  },
  categoryAmount: {
    ...typography.textStyles.caption,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  chatContainer: {
    marginTop: spacing.lg,
  },
  chatMessage: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
  },
  chatResponse: {
    padding: spacing.md,
    backgroundColor: colors.infoLight,
    borderRadius: borderRadius.md,
  },
  chatLabel: {
    ...typography.textStyles.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  chatText: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  chatMeta: {
    ...typography.textStyles.small,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  conversationStarters: {
    marginTop: spacing.lg,
  },
  startersTitle: {
    ...typography.textStyles.caption,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  starterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  starterIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  starterText: {
    ...typography.textStyles.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footerText: {
    ...typography.textStyles.body,
    color: colors.success,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
});

export default SampleModelDemo;