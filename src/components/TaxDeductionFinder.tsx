import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  commonStyles,
} from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import {
  getApplicableDeductions,
  calculateMaxTaxSavings,
  getTaxPlanningTips,
  formatDeductionAmount,
} from '../utils/taxDeductions';
import { TaxDeduction } from '../types';
import { formatCurrency } from '../utils/calculatorUtils';

interface TaxDeductionFinderProps {
  visible: boolean;
  onClose: () => void;
}

export const TaxDeductionFinder: React.FC<TaxDeductionFinderProps> = ({
  visible,
  onClose,
}) => {
  const { user } = useAuth();
  const [income, setIncome] = useState('');
  const [age, setAge] = useState('');
  const [isSalaried, setIsSalaried] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [selectedDeductions, setSelectedDeductions] = useState<Record<string, boolean>>({});
  const [investmentAmounts, setInvestmentAmounts] = useState<Record<string, string>>({});

  const userType = user?.userType || 'individual';
  const numericIncome = parseFloat(income) || 0;
  const numericAge = parseInt(age) || 30;

  const applicableDeductions = useMemo(() => {
    if (!numericIncome) return [];
    return getApplicableDeductions(
      userType,
      numericIncome,
      false, // isMarried - can be expanded
      false, // hasChildren - can be expanded
      numericAge,
      isSalaried
    );
  }, [userType, numericIncome, numericAge, isSalaried]);

  const maxTaxSavings = useMemo(() => {
    const investments = Object.entries(investmentAmounts).reduce((acc, [section, amount]) => {
      acc[section] = parseFloat(amount) || 0;
      return acc;
    }, {} as Record<string, number>);

    return calculateMaxTaxSavings(applicableDeductions, numericIncome, investments);
  }, [applicableDeductions, numericIncome, investmentAmounts]);

  const taxPlanningTips = useMemo(() => {
    const totalInvestments = Object.values(investmentAmounts)
      .reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
    return getTaxPlanningTips(userType, numericIncome, totalInvestments);
  }, [userType, numericIncome, investmentAmounts]);

  const handleFindDeductions = () => {
    if (!income.trim()) {
      Alert.alert('Error', 'Please enter your annual income');
      return;
    }
    setShowResults(true);
  };

  const toggleDeduction = (section: string) => {
    setSelectedDeductions(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateInvestmentAmount = (section: string, amount: string) => {
    setInvestmentAmounts(prev => ({
      ...prev,
      [section]: amount,
    }));
  };

  const getSectionIcon = (section: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      '80C': 'shield-checkmark',
      '80D': 'medical',
      '80E': 'school',
      '80G': 'heart',
      'HRA': 'home',
      '80TTA': 'card',
      '80TTB': 'card',
      '24': 'home',
      '80EE': 'home',
      '35(1)(ii)': 'flask',
      '35AD': 'construct',
      '80JJAA': 'people',
      '80IA': 'build',
      '80IB': 'business',
    };
    return iconMap[section] || 'document-text';
  };

  const getSectionColor = (section: string): string => {
    const colorMap: Record<string, string> = {
      '80C': colors.primary,
      '80D': colors.error,
      '80E': colors.accent,
      '80G': colors.success,
      'HRA': colors.investment,
      '80TTA': colors.secondary,
      '80TTB': colors.secondary,
      '24': colors.investment,
      '80EE': colors.investment,
      '35(1)(ii)': colors.primary,
      '35AD': colors.secondary,
      '80JJAA': colors.accent,
      '80IA': colors.success,
      '80IB': colors.primary,
    };
    return colorMap[section] || colors.textSecondary;
  };

  const renderDeductionItem = (deduction: TaxDeduction) => {
    const isSelected = selectedDeductions[deduction.section];
    const investmentAmount = investmentAmounts[deduction.section] || '';
    const sectionColor = getSectionColor(deduction.section);

    return (
      <View key={`${deduction.section}-${deduction.name}`} style={styles.deductionItem}>
        <TouchableOpacity
          style={styles.deductionHeader}
          onPress={() => toggleDeduction(deduction.section)}
        >
          <View style={styles.deductionLeft}>
            <View style={[styles.deductionIcon, { backgroundColor: sectionColor + '20' }]}>
              <Ionicons
                name={getSectionIcon(deduction.section)}
                size={20}
                color={sectionColor}
              />
            </View>
            <View style={styles.deductionInfo}>
              <Text style={styles.deductionName}>{deduction.name}</Text>
              <Text style={styles.deductionSection}>Section {deduction.section}</Text>
              <Text style={styles.deductionLimit}>
                Limit: {formatDeductionAmount(deduction.maxLimit)}
              </Text>
            </View>
          </View>
          <View style={styles.deductionRight}>
            <Ionicons
              name={isSelected ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.deductionDetails}>
            <Text style={styles.deductionDescription}>{deduction.description}</Text>
            
            <View style={styles.eligibilityContainer}>
              <Text style={styles.eligibilityTitle}>Eligibility:</Text>
              {deduction.eligibility.map((item, index) => (
                <Text key={index} style={styles.eligibilityItem}>
                  • {item}
                </Text>
              ))}
            </View>

            {deduction.maxLimit > 0 && (
              <View style={styles.investmentInput}>
                <Text style={styles.inputLabel}>Your Investment/Payment (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={investmentAmount}
                  onChangeText={(text) => updateInvestmentAmount(deduction.section, text)}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderInputForm = () => (
    <View style={styles.inputForm}>
      <Text style={styles.formTitle}>Find Your Tax Deductions</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Annual Income (₹)</Text>
        <TextInput
          style={styles.input}
          value={income}
          onChangeText={setIncome}
          placeholder="e.g., 800000"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Your Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="e.g., 30"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Employment Type</Text>
        <View style={styles.employmentSelector}>
          <TouchableOpacity
            style={[
              styles.employmentButton,
              isSalaried && styles.employmentButtonActive,
            ]}
            onPress={() => setIsSalaried(true)}
          >
            <Text style={[
              styles.employmentButtonText,
              isSalaried && styles.employmentButtonTextActive,
            ]}>Salaried</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.employmentButton,
              !isSalaried && styles.employmentButtonActive,
            ]}
            onPress={() => setIsSalaried(false)}
          >
            <Text style={[
              styles.employmentButtonText,
              !isSalaried && styles.employmentButtonTextActive,
            ]}>Self-Employed</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.findButton}
        onPress={handleFindDeductions}
      >
        <Text style={styles.findButtonText}>Find All Deductions</Text>
      </TouchableOpacity>
    </View>
  );

  const renderResults = () => (
    <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tax Savings Summary</Text>
        <Text style={styles.summaryIncome}>
          Annual Income: {formatCurrency(numericIncome)}
        </Text>
        <Text style={styles.summaryDeductions}>
          Available Deductions: {applicableDeductions.length}
        </Text>
        <Text style={styles.summaryMaxSavings}>
          Potential Tax Savings: {formatCurrency(maxTaxSavings)}
        </Text>
      </View>

      {/* Available Deductions */}
      <View style={styles.deductionsContainer}>
        <Text style={styles.deductionsTitle}>
          Available Deductions ({userType === 'individual' ? 'Individual' : 'Corporate'})
        </Text>
        
        {applicableDeductions.map(renderDeductionItem)}
      </View>

      {/* Tax Planning Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tax Planning Tips</Text>
        {taxPlanningTips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setShowResults(false)}
      >
        <Text style={styles.backButtonText}>Back to Input</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tax Deduction Finder</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {!showResults ? renderInputForm() : renderResults()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  inputForm: {
    padding: spacing.lg,
  },
  formTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    ...commonStyles.input,
  },
  employmentSelector: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  employmentButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  employmentButtonActive: {
    backgroundColor: colors.primary,
  },
  employmentButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  employmentButtonTextActive: {
    color: colors.textWhite,
  },
  findButton: {
    ...commonStyles.button,
    marginTop: spacing.lg,
    ...shadows.md,
  },
  findButtonText: {
    ...commonStyles.buttonText,
  },
  resultsContainer: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  summaryIncome: {
    fontSize: typography.fontSize.base,
    color: colors.textWhite,
    marginBottom: spacing.sm,
    opacity: 0.9,
  },
  summaryDeductions: {
    fontSize: typography.fontSize.base,
    color: colors.textWhite,
    marginBottom: spacing.sm,
    opacity: 0.9,
  },
  summaryMaxSavings: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  deductionsContainer: {
    margin: spacing.lg,
    marginTop: 0,
  },
  deductionsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  deductionItem: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
    overflow: 'hidden',
  },
  deductionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  deductionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deductionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  deductionInfo: {
    flex: 1,
  },
  deductionName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  deductionSection: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  deductionLimit: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  deductionRight: {
    padding: spacing.sm,
  },
  deductionDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
  },
  deductionDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.md,
  },
  eligibilityContainer: {
    marginBottom: spacing.md,
  },
  eligibilityTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  eligibilityItem: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
  },
  investmentInput: {
    marginTop: spacing.md,
  },
  tipsContainer: {
    margin: spacing.lg,
    marginTop: 0,
  },
  tipsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tipItem: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  tipText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  backButton: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    margin: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default TaxDeductionFinder;
