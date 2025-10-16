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
    const investmentAmount = investmentAmounts[deduction.section] || '';\n    const sectionColor = getSectionColor(deduction.section);\n\n    return (\n      <View key={`${deduction.section}-${deduction.name}`} style={styles.deductionItem}>\n        <TouchableOpacity\n          style={styles.deductionHeader}\n          onPress={() => toggleDeduction(deduction.section)}\n        >\n          <View style={styles.deductionLeft}>\n            <View style={[styles.deductionIcon, { backgroundColor: sectionColor + '20' }]}>\n              <Ionicons\n                name={getSectionIcon(deduction.section)}\n                size={20}\n                color={sectionColor}\n              />\n            </View>\n            <View style={styles.deductionInfo}>\n              <Text style={styles.deductionName}>{deduction.name}</Text>\n              <Text style={styles.deductionSection}>Section {deduction.section}</Text>\n              <Text style={styles.deductionLimit}>\n                Limit: {formatDeductionAmount(deduction.maxLimit)}\n              </Text>\n            </View>\n          </View>\n          <View style={styles.deductionRight}>\n            <Ionicons\n              name={isSelected ? 'chevron-up' : 'chevron-down'}\n              size={20}\n              color={colors.textSecondary}\n            />\n          </View>\n        </TouchableOpacity>\n\n        {isSelected && (\n          <View style={styles.deductionDetails}>\n            <Text style={styles.deductionDescription}>{deduction.description}</Text>\n            \n            <View style={styles.eligibilityContainer}>\n              <Text style={styles.eligibilityTitle}>Eligibility:</Text>\n              {deduction.eligibility.map((item, index) => (\n                <Text key={index} style={styles.eligibilityItem}>\n                  \u2022 {item}\n                </Text>\n              ))}\n            </View>\n\n            {deduction.maxLimit > 0 && (\n              <View style={styles.investmentInput}>\n                <Text style={styles.inputLabel}>Your Investment/Payment (\u20b9)</Text>\n                <TextInput\n                  style={styles.input}\n                  value={investmentAmount}\n                  onChangeText={(text) => updateInvestmentAmount(deduction.section, text)}\n                  placeholder=\"Enter amount\"\n                  keyboardType=\"numeric\"\n                />\n              </View>\n            )}\n          </View>\n        )}\n      </View>\n    );\n  };\n\n  const renderInputForm = () => (\n    <View style={styles.inputForm}>\n      <Text style={styles.formTitle}>Find Your Tax Deductions</Text>\n      \n      <View style={styles.inputGroup}>\n        <Text style={styles.inputLabel}>Annual Income (\u20b9)</Text>\n        <TextInput\n          style={styles.input}\n          value={income}\n          onChangeText={setIncome}\n          placeholder=\"e.g., 800000\"\n          keyboardType=\"numeric\"\n        />\n      </View>\n\n      <View style={styles.inputGroup}>\n        <Text style={styles.inputLabel}>Your Age</Text>\n        <TextInput\n          style={styles.input}\n          value={age}\n          onChangeText={setAge}\n          placeholder=\"e.g., 30\"\n          keyboardType=\"numeric\"\n        />\n      </View>\n\n      <View style={styles.inputGroup}>\n        <Text style={styles.inputLabel}>Employment Type</Text>\n        <View style={styles.employmentSelector}>\n          <TouchableOpacity\n            style={[\n              styles.employmentButton,\n              isSalaried && styles.employmentButtonActive,\n            ]}\n            onPress={() => setIsSalaried(true)}\n          >\n            <Text style={[\n              styles.employmentButtonText,\n              isSalaried && styles.employmentButtonTextActive,\n            ]}>Salaried</Text>\n          </TouchableOpacity>\n          <TouchableOpacity\n            style={[\n              styles.employmentButton,\n              !isSalaried && styles.employmentButtonActive,\n            ]}\n            onPress={() => setIsSalaried(false)}\n          >\n            <Text style={[\n              styles.employmentButtonText,\n              !isSalaried && styles.employmentButtonTextActive,\n            ]}>Self-Employed</Text>\n          </TouchableOpacity>\n        </View>\n      </View>\n\n      <TouchableOpacity\n        style={styles.findButton}\n        onPress={handleFindDeductions}\n      >\n        <Text style={styles.findButtonText}>Find All Deductions</Text>\n      </TouchableOpacity>\n    </View>\n  );\n\n  const renderResults = () => (\n    <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>\n      {/* Summary Card */}\n      <View style={styles.summaryCard}>\n        <Text style={styles.summaryTitle}>Tax Savings Summary</Text>\n        <Text style={styles.summaryIncome}>\n          Annual Income: {formatCurrency(numericIncome)}\n        </Text>\n        <Text style={styles.summaryDeductions}>\n          Available Deductions: {applicableDeductions.length}\n        </Text>\n        <Text style={styles.summaryMaxSavings}>\n          Potential Tax Savings: {formatCurrency(maxTaxSavings)}\n        </Text>\n      </View>\n\n      {/* Available Deductions */}\n      <View style={styles.deductionsContainer}>\n        <Text style={styles.deductionsTitle}>\n          Available Deductions ({userType === 'individual' ? 'Individual' : 'Corporate'})\n        </Text>\n        \n        {applicableDeductions.map(renderDeductionItem)}\n      </View>\n\n      {/* Tax Planning Tips */}\n      <View style={styles.tipsContainer}>\n        <Text style={styles.tipsTitle}>Tax Planning Tips</Text>\n        {taxPlanningTips.map((tip, index) => (\n          <View key={index} style={styles.tipItem}>\n            <Text style={styles.tipText}>{tip}</Text>\n          </View>\n        ))}\n      </View>\n\n      <TouchableOpacity\n        style={styles.backButton}\n        onPress={() => setShowResults(false)}\n      >\n        <Text style={styles.backButtonText}>Back to Input</Text>\n      </TouchableOpacity>\n    </ScrollView>\n  );\n\n  return (\n    <Modal\n      animationType=\"slide\"\n      transparent={true}\n      visible={visible}\n      onRequestClose={onClose}\n    >\n      <View style={styles.modalOverlay}>\n        <View style={styles.modalContent}>\n          <View style={styles.modalHeader}>\n            <Text style={styles.modalTitle}>Tax Deduction Finder</Text>\n            <TouchableOpacity onPress={onClose}>\n              <Ionicons name=\"close\" size={24} color={colors.textPrimary} />\n            </TouchableOpacity>\n          </View>\n\n          {!showResults ? renderInputForm() : renderResults()}\n        </View>\n      </View>\n    </Modal>\n  );\n};\n\nconst styles = StyleSheet.create({\n  modalOverlay: {\n    flex: 1,\n    backgroundColor: 'rgba(0, 0, 0, 0.5)',\n    justifyContent: 'flex-end',\n  },\n  modalContent: {\n    backgroundColor: colors.backgroundLight,\n    borderTopLeftRadius: borderRadius.xl,\n    borderTopRightRadius: borderRadius.xl,\n    height: '90%',\n  },\n  modalHeader: {\n    flexDirection: 'row',\n    justifyContent: 'space-between',\n    alignItems: 'center',\n    padding: spacing.lg,\n    borderBottomWidth: 1,\n    borderBottomColor: colors.border,\n  },\n  modalTitle: {\n    fontSize: typography.fontSize.xl,\n    fontWeight: typography.fontWeight.bold,\n    color: colors.textPrimary,\n  },\n  inputForm: {\n    padding: spacing.lg,\n  },\n  formTitle: {\n    fontSize: typography.fontSize.lg,\n    fontWeight: typography.fontWeight.semibold,\n    color: colors.textPrimary,\n    textAlign: 'center',\n    marginBottom: spacing.xl,\n  },\n  inputGroup: {\n    marginBottom: spacing.lg,\n  },\n  inputLabel: {\n    fontSize: typography.fontSize.sm,\n    fontWeight: typography.fontWeight.medium,\n    color: colors.textPrimary,\n    marginBottom: spacing.sm,\n  },\n  input: {\n    ...commonStyles.input,\n  },\n  employmentSelector: {\n    flexDirection: 'row',\n    backgroundColor: colors.backgroundDark,\n    borderRadius: borderRadius.md,\n    padding: spacing.xs,\n  },\n  employmentButton: {\n    flex: 1,\n    paddingVertical: spacing.sm,\n    alignItems: 'center',\n    borderRadius: borderRadius.sm,\n  },\n  employmentButtonActive: {\n    backgroundColor: colors.primary,\n  },\n  employmentButtonText: {\n    fontSize: typography.fontSize.base,\n    color: colors.textSecondary,\n    fontWeight: typography.fontWeight.medium,\n  },\n  employmentButtonTextActive: {\n    color: colors.textWhite,\n  },\n  findButton: {\n    ...commonStyles.button,\n    marginTop: spacing.lg,\n    ...shadows.md,\n  },\n  findButtonText: {\n    ...commonStyles.buttonText,\n  },\n  resultsContainer: {\n    flex: 1,\n  },\n  summaryCard: {\n    backgroundColor: colors.primary,\n    margin: spacing.lg,\n    borderRadius: borderRadius.lg,\n    padding: spacing.lg,\n    ...shadows.md,\n  },\n  summaryTitle: {\n    fontSize: typography.fontSize.lg,\n    fontWeight: typography.fontWeight.bold,\n    color: colors.textWhite,\n    marginBottom: spacing.md,\n    textAlign: 'center',\n  },\n  summaryIncome: {\n    fontSize: typography.fontSize.base,\n    color: colors.textWhite,\n    marginBottom: spacing.sm,\n    opacity: 0.9,\n  },\n  summaryDeductions: {\n    fontSize: typography.fontSize.base,\n    color: colors.textWhite,\n    marginBottom: spacing.sm,\n    opacity: 0.9,\n  },\n  summaryMaxSavings: {\n    fontSize: typography.fontSize.xl,\n    fontWeight: typography.fontWeight.bold,\n    color: colors.textWhite,\n    textAlign: 'center',\n    marginTop: spacing.sm,\n  },\n  deductionsContainer: {\n    margin: spacing.lg,\n    marginTop: 0,\n  },\n  deductionsTitle: {\n    fontSize: typography.fontSize.lg,\n    fontWeight: typography.fontWeight.semibold,\n    color: colors.textPrimary,\n    marginBottom: spacing.md,\n  },\n  deductionItem: {\n    backgroundColor: colors.backgroundLight,\n    borderRadius: borderRadius.lg,\n    marginBottom: spacing.md,\n    ...shadows.sm,\n    overflow: 'hidden',\n  },\n  deductionHeader: {\n    flexDirection: 'row',\n    justifyContent: 'space-between',\n    alignItems: 'center',\n    padding: spacing.md,\n  },\n  deductionLeft: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    flex: 1,\n  },\n  deductionIcon: {\n    width: 40,\n    height: 40,\n    borderRadius: 20,\n    justifyContent: 'center',\n    alignItems: 'center',\n    marginRight: spacing.md,\n  },\n  deductionInfo: {\n    flex: 1,\n  },\n  deductionName: {\n    fontSize: typography.fontSize.base,\n    fontWeight: typography.fontWeight.medium,\n    color: colors.textPrimary,\n    marginBottom: spacing.xs,\n  },\n  deductionSection: {\n    fontSize: typography.fontSize.sm,\n    color: colors.textSecondary,\n    marginBottom: spacing.xs,\n  },\n  deductionLimit: {\n    fontSize: typography.fontSize.sm,\n    color: colors.primary,\n    fontWeight: typography.fontWeight.medium,\n  },\n  deductionRight: {\n    padding: spacing.sm,\n  },\n  deductionDetails: {\n    borderTopWidth: 1,\n    borderTopColor: colors.border,\n    padding: spacing.md,\n  },\n  deductionDescription: {\n    fontSize: typography.fontSize.base,\n    color: colors.textSecondary,\n    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,\n    marginBottom: spacing.md,\n  },\n  eligibilityContainer: {\n    marginBottom: spacing.md,\n  },\n  eligibilityTitle: {\n    fontSize: typography.fontSize.sm,\n    fontWeight: typography.fontWeight.semibold,\n    color: colors.textPrimary,\n    marginBottom: spacing.xs,\n  },\n  eligibilityItem: {\n    fontSize: typography.fontSize.sm,\n    color: colors.textSecondary,\n    marginLeft: spacing.sm,\n    marginBottom: spacing.xs,\n  },\n  investmentInput: {\n    marginTop: spacing.md,\n  },\n  tipsContainer: {\n    margin: spacing.lg,\n    marginTop: 0,\n  },\n  tipsTitle: {\n    fontSize: typography.fontSize.lg,\n    fontWeight: typography.fontWeight.semibold,\n    color: colors.textPrimary,\n    marginBottom: spacing.md,\n  },\n  tipItem: {\n    backgroundColor: colors.backgroundLight,\n    borderRadius: borderRadius.md,\n    padding: spacing.md,\n    marginBottom: spacing.sm,\n    borderLeftWidth: 4,\n    borderLeftColor: colors.success,\n  },\n  tipText: {\n    fontSize: typography.fontSize.base,\n    color: colors.textPrimary,\n    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,\n  },\n  backButton: {\n    backgroundColor: colors.backgroundLight,\n    borderWidth: 1,\n    borderColor: colors.primary,\n    borderRadius: borderRadius.md,\n    padding: spacing.md,\n    margin: spacing.lg,\n    alignItems: 'center',\n    ...shadows.sm,\n  },\n  backButtonText: {\n    fontSize: typography.fontSize.base,\n    color: colors.primary,\n    fontWeight: typography.fontWeight.semibold,\n  },\n});\n\nexport default TaxDeductionFinder;", "search_start_line_number": 1}]
