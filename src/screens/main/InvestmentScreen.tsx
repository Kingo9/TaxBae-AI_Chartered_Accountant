import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows, commonStyles } from '../../utils/theme';
import { InvestmentInput, InvestmentProfile, InvestmentRecommendation, PortfolioAllocation } from '../../types';
import { getInvestmentRecommendations, getPortfolioAllocation } from '../../sampleModels/investmentSample';

export const InvestmentScreen: React.FC = () => {
  const [formData, setFormData] = useState<InvestmentInput>({
    annualIncome: 0,
    currentAge: 0,
    riskAppetite: 'Medium',
  });
  const [recommendations, setRecommendations] = useState<InvestmentProfile | null>(null);
  const [portfolioAllocation, setPortfolioAllocation] = useState<PortfolioAllocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const riskOptions = ['Low', 'Medium', 'High'] as const;

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.annualIncome || formData.annualIncome <= 0) {
      newErrors.annualIncome = 'Please enter a valid annual income';
    } else if (formData.annualIncome < 100000) {
      newErrors.annualIncome = 'Annual income should be at least ₹1,00,000';
    }

    if (!formData.currentAge || formData.currentAge <= 0) {
      newErrors.currentAge = 'Please enter a valid age';
    } else if (formData.currentAge < 18 || formData.currentAge > 80) {
      newErrors.currentAge = 'Age should be between 18 and 80 years';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetRecommendations = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const recs = getInvestmentRecommendations(
        formData.annualIncome,
        formData.currentAge,
        formData.riskAppetite
      );
      const allocation = getPortfolioAllocation(formData.riskAppetite);
      
      setRecommendations(recs);
      setPortfolioAllocation(allocation);
    } catch (error) {
      Alert.alert('Error', 'Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof InvestmentInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderInputForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Investment Profile</Text>
      
      {/* Annual Income Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Annual Income (₹)</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="cash-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, errors.annualIncome ? styles.inputError : null]}
            value={formData.annualIncome ? formData.annualIncome.toString() : ''}
            onChangeText={(text) => handleInputChange('annualIncome', parseInt(text) || 0)}
            placeholder="Enter your annual income"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
          />
        </View>
        {errors.annualIncome ? <Text style={styles.errorText}>{errors.annualIncome}</Text> : null}
      </View>

      {/* Current Age Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Current Age</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, errors.currentAge ? styles.inputError : null]}
            value={formData.currentAge ? formData.currentAge.toString() : ''}
            onChangeText={(text) => handleInputChange('currentAge', parseInt(text) || 0)}
            placeholder="Enter your age"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
          />
        </View>
        {errors.currentAge ? <Text style={styles.errorText}>{errors.currentAge}</Text> : null}
      </View>

      {/* Risk Appetite Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Risk Appetite</Text>
        <View style={styles.riskButtons}>
          {riskOptions.map((risk) => (
            <TouchableOpacity
              key={risk}
              style={[
                styles.riskButton,
                formData.riskAppetite === risk && styles.riskButtonSelected,
              ]}
              onPress={() => handleInputChange('riskAppetite', risk)}
            >
              <Text
                style={[
                  styles.riskButtonText,
                  formData.riskAppetite === risk && styles.riskButtonTextSelected,
                ]}
              >
                {risk}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Get Recommendations Button */}
      <TouchableOpacity
        style={[styles.recommendationButton, isLoading && styles.buttonDisabled]}
        onPress={handleGetRecommendations}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.textWhite} />
        ) : (
          <>
            <Ionicons name="analytics-outline" size={20} color={colors.textWhite} />
            <Text style={styles.buttonText}>Get Investment Recommendations</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPortfolioAllocation = () => {
    if (!portfolioAllocation) return null;

    return (
      <View style={styles.allocationSection}>
        <Text style={styles.sectionTitle}>Recommended Portfolio Allocation</Text>
        <View style={styles.allocationContainer}>
          {Object.entries(portfolioAllocation).map(([key, value]) => (
            <View key={key} style={styles.allocationItem}>
              <View style={[styles.allocationBar, { width: `${value}%` }]} />
              <Text style={styles.allocationLabel}>
                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRecommendationCard = (rec: InvestmentRecommendation, index: number) => (
    <View key={index} style={styles.recommendationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{rec.name}</Text>
        <View style={styles.returnBadge}>
          <Text style={styles.returnText}>{rec.expectedReturn}</Text>
        </View>
      </View>
      
      <Text style={styles.cardDescription}>{rec.description}</Text>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.primary} />
          <Text style={styles.detailText}>Lock-in: {rec.lockIn}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
          <Text style={styles.detailText}>{rec.taxBenefit}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>Min: {rec.minInvestment}</Text>
        </View>
      </View>

      {rec.suitability && (
        <View style={styles.suitabilityContainer}>
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
          <Text style={styles.suitabilityText}>{rec.suitability}</Text>
        </View>
      )}

      {rec.suggestedAmount && (
        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionLabel}>Suggested Amount:</Text>
          <Text style={styles.suggestionAmount}>{rec.suggestedAmount}</Text>
        </View>
      )}
    </View>
  );

  const renderRecommendations = () => {
    if (!recommendations) return null;

    return (
      <View style={styles.recommendationsSection}>
        <Text style={styles.sectionTitle}>
          Investment Recommendations for {recommendations.risk} Risk Profile
        </Text>
        <Text style={styles.sectionSubtitle}>
          Based on ₹{recommendations.income.toLocaleString()} annual income, Age {recommendations.age}
        </Text>
        
        {renderPortfolioAllocation()}
        
        <View style={styles.recommendationsList}>
          {recommendations.recommendations.map((rec, index) => 
            renderRecommendationCard(rec, index)
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Investment Advisory</Text>
          <Text style={styles.subtitle}>
            Get personalized investment recommendations based on your profile
          </Text>
        </View>

        {renderInputForm()}
        {renderRecommendations()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  formSection: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    ...commonStyles.input,
    flex: 1,
    paddingLeft: spacing.xl + spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  riskButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  riskButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  riskButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  riskButtonTextSelected: {
    color: colors.textWhite,
  },
  recommendationButton: {
    ...commonStyles.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  buttonDisabled: {
    backgroundColor: colors.textLight,
  },
  buttonText: {
    ...commonStyles.buttonText,
  },
  allocationSection: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  allocationContainer: {
    gap: spacing.md,
  },
  allocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  allocationBar: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  allocationLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  recommendationsSection: {
    marginBottom: spacing.xl,
  },
  recommendationsList: {
    gap: spacing.md,
  },
  recommendationCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  returnBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  returnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textWhite,
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  cardDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  suitabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success + '10',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  suitabilityText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  suggestionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  suggestionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  suggestionAmount: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
});

export default InvestmentScreen;