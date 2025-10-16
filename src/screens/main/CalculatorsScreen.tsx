import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  commonStyles,
} from '../../utils/theme';
import {
  calculateEMI,
  calculateSIP,
  calculateGoalSavings,
  calculateRentVsBuy,
  formatCurrency,
} from '../../utils/calculatorUtils';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

type CalculatorType = 'emi' | 'sip' | 'goal' | 'rentVsBuy' | 'retirement' | 'taxBenefit' | null;

export const CalculatorsScreen: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>(null);
  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // EMI Calculator State
  const [emiData, setEmiData] = useState({
    principal: '',
    rate: '',
    tenure: '',
  });

  // SIP Calculator State
  const [sipData, setSipData] = useState({
    monthlyInvestment: '',
    annualReturn: '',
    tenure: '',
    stepUpPercentage: '',
  });

  // Goal Calculator State
  const [goalData, setGoalData] = useState({
    goalAmount: '',
    timeInYears: '',
    expectedReturn: '',
  });

  // Rent vs Buy Calculator State
  const [rentBuyData, setRentBuyData] = useState({
    homePrice: '',
    downPayment: '',
    loanRate: '',
    loanTenure: '',
    monthlyRent: '',
    rentIncrease: '',
    timeHorizon: '',
  });

  // Retirement Planning Calculator State
  const [retirementData, setRetirementData] = useState({
    currentAge: '',
    retirementAge: '',
    currentSalary: '',
    currentSavings: '',
    expectedInflation: '6',
    expectedReturn: '12',
    retirementExpenseRatio: '0.8',
  });

  // Tax Benefit Calculator State
  const [taxBenefitData, setTaxBenefitData] = useState({
    income: '',
    taxRegime: 'OLD_REGIME',
    section80C: '',
    section80D: '',
    nps: '',
  });

  const calculators = [
    {
      id: 'emi',
      title: 'EMI Calculator',
      subtitle: 'Calculate loan EMI',
      icon: 'calculator',
      color: colors.primary,
    },
    {
      id: 'sip',
      title: 'SIP Calculator',
      subtitle: 'Plan your investments',
      icon: 'trending-up',
      color: colors.secondary,
    },
    {
      id: 'goal',
      title: 'Goal Planner',
      subtitle: 'Plan for your goals',
      icon: 'flag',
      color: colors.accent,
    },
    {
      id: 'rentVsBuy',
      title: 'Rent vs Buy',
      subtitle: 'Compare options',
      icon: 'home',
      color: colors.investment,
    },
    {
      id: 'retirement',
      title: 'Retirement Planning',
      subtitle: 'Plan your retirement',
      icon: 'time',
      color: colors.success,
    },
    {
      id: 'taxBenefit',
      title: 'Tax Benefits',
      subtitle: 'Calculate tax savings',
      icon: 'document',
      color: colors.error,
    },
  ];

  const handleEMICalculate = async () => {
    if (!emiData.principal || !emiData.rate || !emiData.tenure) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsCalculating(true);
    try {
      const response = await apiService.calculateEMI({
        principal: parseFloat(emiData.principal),
        rate: parseFloat(emiData.rate),
        tenure: parseFloat(emiData.tenure),
      });
      setResults(response.data);
    } catch (error) {
      console.error('EMI calculation error:', error);
      Alert.alert('Error', 'Failed to calculate EMI. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSIPCalculate = async () => {
    if (!sipData.monthlyInvestment || !sipData.annualReturn || !sipData.tenure) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    setIsCalculating(true);
    try {
      const response = await apiService.calculateSIP({
        monthlyInvestment: parseFloat(sipData.monthlyInvestment),
        annualReturn: parseFloat(sipData.annualReturn),
        tenure: parseFloat(sipData.tenure),
        stepUpPercentage: sipData.stepUpPercentage
          ? parseFloat(sipData.stepUpPercentage)
          : undefined,
      });
      setResults(response.data);
    } catch (error) {
      console.error('SIP calculation error:', error);
      Alert.alert('Error', 'Failed to calculate SIP. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGoalCalculate = async () => {
    if (!goalData.goalAmount || !goalData.timeInYears || !goalData.expectedReturn) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsCalculating(true);
    try {
      const response = await apiService.calculateGoalSavings({
        goalAmount: parseFloat(goalData.goalAmount),
        timeInYears: parseFloat(goalData.timeInYears),
        expectedReturn: parseFloat(goalData.expectedReturn),
      });
      setResults(response.data);
    } catch (error) {
      console.error('Goal calculation error:', error);
      Alert.alert('Error', 'Failed to calculate goal savings. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleRentVsBuyCalculate = async () => {
    if (
      !rentBuyData.homePrice ||
      !rentBuyData.downPayment ||
      !rentBuyData.loanRate ||
      !rentBuyData.loanTenure ||
      !rentBuyData.monthlyRent ||
      !rentBuyData.rentIncrease ||
      !rentBuyData.timeHorizon
    ) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsCalculating(true);
    try {
      const response = await apiService.calculateRentVsBuy({
        homePrice: parseFloat(rentBuyData.homePrice),
        downPayment: parseFloat(rentBuyData.downPayment),
        loanRate: parseFloat(rentBuyData.loanRate),
        loanTenure: parseFloat(rentBuyData.loanTenure),
        monthlyRent: parseFloat(rentBuyData.monthlyRent),
        rentIncrease: parseFloat(rentBuyData.rentIncrease),
        timeHorizon: parseFloat(rentBuyData.timeHorizon),
      });
      setResults(response.data);
    } catch (error) {
      console.error('Rent vs Buy calculation error:', error);
      Alert.alert('Error', 'Failed to analyze rent vs buy. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleRetirementCalculate = async () => {
    if (!retirementData.currentAge || !retirementData.retirementAge || !retirementData.currentSalary) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setIsCalculating(true);
    try {
      const response = await apiService.calculateRetirementPlanning({
        currentAge: parseInt(retirementData.currentAge),
        retirementAge: parseInt(retirementData.retirementAge),
        currentSalary: parseFloat(retirementData.currentSalary),
        currentSavings: retirementData.currentSavings ? parseFloat(retirementData.currentSavings) : 0,
        expectedInflation: parseFloat(retirementData.expectedInflation),
        expectedReturn: parseFloat(retirementData.expectedReturn),
        retirementExpenseRatio: parseFloat(retirementData.retirementExpenseRatio),
      });
      setResults(response.data);
    } catch (error: any) {
      console.error('Retirement calculation error:', error);
      Alert.alert('Error', error.message || 'Failed to calculate retirement planning. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleTaxBenefitCalculate = async () => {
    if (!taxBenefitData.income) {
      Alert.alert('Error', 'Please enter your annual income');
      return;
    }

    setIsCalculating(true);
    try {
      const investments: any = {};
      if (taxBenefitData.section80C) investments.section80C = parseFloat(taxBenefitData.section80C);
      if (taxBenefitData.section80D) investments.section80D = parseFloat(taxBenefitData.section80D);
      if (taxBenefitData.nps) investments.nps = parseFloat(taxBenefitData.nps);

      const response = await apiService.calculateTaxBenefit({
        income: parseFloat(taxBenefitData.income),
        taxRegime: taxBenefitData.taxRegime,
        investments: Object.keys(investments).length > 0 ? investments : undefined,
      });
      setResults(response.data);
    } catch (error) {
      console.error('Tax benefit calculation error:', error);
      Alert.alert('Error', 'Failed to calculate tax benefits. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const renderCalculatorGrid = () => (
    <View style={styles.calculatorGrid}>
      {calculators.map((calc) => (
        <TouchableOpacity
          key={calc.id}
          style={[styles.calculatorCard, { borderColor: calc.color }]}
          onPress={() => {
            setActiveCalculator(calc.id as CalculatorType);
            setResults(null);
          }}
        >
          <Ionicons
            name={calc.icon as keyof typeof Ionicons.glyphMap}
            size={32}
            color={calc.color}
          />
          <Text style={styles.calculatorTitle}>{calc.title}</Text>
          <Text style={styles.calculatorSubtitle}>{calc.subtitle}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEMICalculator = () => (
    <View style={styles.calculatorForm}>
      <Text style={styles.formTitle}>EMI Calculator</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Loan Amount (₹)</Text>
        <TextInput
          style={styles.input}
          value={emiData.principal}
          onChangeText={(text) => setEmiData({ ...emiData, principal: text })}
          placeholder="25,00,000"
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Interest Rate (% per annum)</Text>
        <TextInput
          style={styles.input}
          value={emiData.rate}
          onChangeText={(text) => setEmiData({ ...emiData, rate: text })}
          placeholder="e.g., 8.5"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Loan Tenure (Years)</Text>
        <TextInput
          style={styles.input}
          value={emiData.tenure}
          onChangeText={(text) => setEmiData({ ...emiData, tenure: text })}
          placeholder="e.g., 20"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.calculateButton} onPress={handleEMICalculate}>
        <Text style={styles.calculateButtonText}>Calculate EMI</Text>
      </TouchableOpacity>

      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Results</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Monthly EMI:</Text>
            <Text style={styles.resultValue}>{formatCurrency(results.emi)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Amount:</Text>
            <Text style={styles.resultValue}>{formatCurrency(results.totalAmount)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Interest:</Text>
            <Text style={[styles.resultValue, { color: colors.error }]}>
              {formatCurrency(results.totalInterest)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderSIPCalculator = () => (
    <View style={styles.calculatorForm}>
      <Text style={styles.formTitle}>SIP Calculator</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Monthly Investment (₹)</Text>
        <TextInput
          style={styles.input}
          value={sipData.monthlyInvestment}
          onChangeText={(text) => setSipData({ ...sipData, monthlyInvestment: text })}
          placeholder="e.g., 10000"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Expected Annual Return (%)</Text>
        <TextInput
          style={styles.input}
          value={sipData.annualReturn}
          onChangeText={(text) => setSipData({ ...sipData, annualReturn: text })}
          placeholder="e.g., 12"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Investment Period (Years)</Text>
        <TextInput
          style={styles.input}
          value={sipData.tenure}
          onChangeText={(text) => setSipData({ ...sipData, tenure: text })}
          placeholder="e.g., 15"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Annual Step-up (%) - Optional</Text>
        <TextInput
          style={styles.input}
          value={sipData.stepUpPercentage}
          onChangeText={(text) => setSipData({ ...sipData, stepUpPercentage: text })}
          placeholder="e.g., 5"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.calculateButton} onPress={handleSIPCalculate}>
        <Text style={styles.calculateButtonText}>Calculate SIP</Text>
      </TouchableOpacity>

      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Results</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Maturity Amount:</Text>
            <Text style={[styles.resultValue, { color: colors.success }]}>
              {formatCurrency(results.maturityAmount)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Investment:</Text>
            <Text style={styles.resultValue}>{formatCurrency(results.investedAmount)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Returns:</Text>
            <Text style={[styles.resultValue, { color: colors.success }]}>
              {formatCurrency(results.returns)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderGoalCalculator = () => (
    <View style={styles.calculatorForm}>
      <Text style={styles.formTitle}>Goal Planner</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Target Amount (₹)</Text>
        <TextInput
          style={styles.input}
          value={goalData.goalAmount}
          onChangeText={(text) => setGoalData({ ...goalData, goalAmount: text })}
          placeholder="e.g., 5000000"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Time to Achieve Goal (Years)</Text>
        <TextInput
          style={styles.input}
          value={goalData.timeInYears}
          onChangeText={(text) => setGoalData({ ...goalData, timeInYears: text })}
          placeholder="e.g., 10"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Expected Annual Return (%)</Text>
        <TextInput
          style={styles.input}
          value={goalData.expectedReturn}
          onChangeText={(text) => setGoalData({ ...goalData, expectedReturn: text })}
          placeholder="e.g., 12"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.calculateButton} onPress={handleGoalCalculate}>
        <Text style={styles.calculateButtonText}>Calculate Goal</Text>
      </TouchableOpacity>

      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Results</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Monthly Investment Needed:</Text>
            <Text style={[styles.resultValue, { color: colors.primary }]}>
              {formatCurrency(results.monthlyInvestment)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Investment:</Text>
            <Text style={styles.resultValue}>{formatCurrency(results.totalInvestment)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Expected Returns:</Text>
            <Text style={[styles.resultValue, { color: colors.success }]}>
              {formatCurrency(results.returns)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderRentVsBuyCalculator = () => (
    <View style={styles.calculatorForm}>
      <Text style={styles.formTitle}>Rent vs Buy Analyzer</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Home Price (₹)</Text>
        <TextInput
          style={styles.input}
          value={rentBuyData.homePrice}
          onChangeText={(text) => setRentBuyData({ ...rentBuyData, homePrice: text })}
          placeholder="e.g., 5000000"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Down Payment (₹)</Text>
        <TextInput
          style={styles.input}
          value={rentBuyData.downPayment}
          onChangeText={(text) => setRentBuyData({ ...rentBuyData, downPayment: text })}
          placeholder="e.g., 1000000"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Loan Interest Rate (%)</Text>
        <TextInput
          style={styles.input}
          value={rentBuyData.loanRate}
          onChangeText={(text) => setRentBuyData({ ...rentBuyData, loanRate: text })}
          placeholder="e.g., 8.5"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Loan Tenure (Years)</Text>
        <TextInput
          style={styles.input}
          value={rentBuyData.loanTenure}
          onChangeText={(text) => setRentBuyData({ ...rentBuyData, loanTenure: text })}
          placeholder="e.g., 20"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Monthly Rent (₹)</Text>
        <TextInput
          style={styles.input}
          value={rentBuyData.monthlyRent}
          onChangeText={(text) => setRentBuyData({ ...rentBuyData, monthlyRent: text })}
          placeholder="e.g., 35000"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Annual Rent Increase (%)</Text>
        <TextInput
          style={styles.input}
          value={rentBuyData.rentIncrease}
          onChangeText={(text) => setRentBuyData({ ...rentBuyData, rentIncrease: text })}
          placeholder="e.g., 5"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Time Horizon (Years)</Text>
        <TextInput
          style={styles.input}
          value={rentBuyData.timeHorizon}
          onChangeText={(text) => setRentBuyData({ ...rentBuyData, timeHorizon: text })}
          placeholder="e.g., 10"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.calculateButton} onPress={handleRentVsBuyCalculate}>
        <Text style={styles.calculateButtonText}>Analyze</Text>
      </TouchableOpacity>

      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Analysis Results</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Rent Cost:</Text>
            <Text style={styles.resultValue}>{formatCurrency(results.totalRentCost)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Buy Cost:</Text>
            <Text style={styles.resultValue}>{formatCurrency(results.totalBuyCost)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Recommendation:</Text>
            <Text style={[styles.resultValue, { 
              color: results.recommendation === 'rent' ? colors.success : colors.primary 
            }]}>
              {results.recommendation.toUpperCase()}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Potential Savings:</Text>
            <Text style={[styles.resultValue, { color: colors.success }]}>
              {formatCurrency(results.savings)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderRetirementCalculator = () => (
    <View style={styles.calculatorForm}>
      <Text style={styles.formTitle}>Retirement Planning Calculator</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Age *</Text>
        <TextInput
          style={styles.input}
          value={retirementData.currentAge}
          onChangeText={(text) => setRetirementData({ ...retirementData, currentAge: text })}
          placeholder="30"
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Retirement Age *</Text>
        <TextInput
          style={styles.input}
          value={retirementData.retirementAge}
          onChangeText={(text) => setRetirementData({ ...retirementData, retirementAge: text })}
          placeholder="60"
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Annual Salary (₹) *</Text>
        <TextInput
          style={styles.input}
          value={retirementData.currentSalary}
          onChangeText={(text) => setRetirementData({ ...retirementData, currentSalary: text })}
          placeholder="10,00,000"
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Savings (₹)</Text>
        <TextInput
          style={styles.input}
          value={retirementData.currentSavings}
          onChangeText={(text) => setRetirementData({ ...retirementData, currentSavings: text })}
          placeholder="5,00,000"
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Expected Inflation (%)</Text>
        <TextInput
          style={styles.input}
          value={retirementData.expectedInflation}
          onChangeText={(text) => setRetirementData({ ...retirementData, expectedInflation: text })}
          placeholder="6"
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Expected Return (%)</Text>
        <TextInput
          style={styles.input}
          value={retirementData.expectedReturn}
          onChangeText={(text) => setRetirementData({ ...retirementData, expectedReturn: text })}
          placeholder="12"
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Retirement Expense Ratio</Text>
        <TextInput
          style={styles.input}
          value={retirementData.retirementExpenseRatio}
          onChangeText={(text) => setRetirementData({ ...retirementData, retirementExpenseRatio: text })}
          placeholder="0.8 (80% of current expenses)"
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity 
        style={[styles.calculateButton, isCalculating && { opacity: 0.7 }]} 
        onPress={handleRetirementCalculate}
        disabled={isCalculating}
      >
        <Text style={styles.calculateButtonText}>
          {isCalculating ? 'Calculating...' : 'Calculate Retirement Plan'}
        </Text>
      </TouchableOpacity>

      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Retirement Plan Results</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Required Corpus:</Text>
            <Text style={[styles.resultValue, { color: colors.primary }]}>
              {formatCurrency(results.requiredCorpus)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Monthly Investment Needed:</Text>
            <Text style={[styles.resultValue, { color: colors.accent }]}>
              {formatCurrency(results.monthlyInvestmentNeeded)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Investment:</Text>
            <Text style={styles.resultValue}>{formatCurrency(results.totalInvestmentNeeded)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Monthly Expense at Retirement:</Text>
            <Text style={[styles.resultValue, { color: colors.warning }]}>
              {formatCurrency(results.monthlyExpenseAtRetirement)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Years to Retirement:</Text>
            <Text style={styles.resultValue}>{results.yearsToRetirement} years</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderTaxBenefitCalculator = () => (
    <View style={styles.calculatorForm}>
      <Text style={styles.formTitle}>Tax Benefit Calculator</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Annual Income (₹) *</Text>
        <TextInput
          style={styles.input}
          value={taxBenefitData.income}
          onChangeText={(text) => setTaxBenefitData({ ...taxBenefitData, income: text })}
          placeholder="10,00,000"
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Tax Regime</Text>
        <View style={styles.regimeButtonContainer}>
          <TouchableOpacity
            style={[
              styles.regimeButton,
              taxBenefitData.taxRegime === 'OLD_REGIME' && styles.regimeButtonActive
            ]}
            onPress={() => setTaxBenefitData({ ...taxBenefitData, taxRegime: 'OLD_REGIME' })}
          >
            <Text style={[
              styles.regimeButtonText,
              taxBenefitData.taxRegime === 'OLD_REGIME' && styles.regimeButtonTextActive
            ]}>Old Regime</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.regimeButton,
              taxBenefitData.taxRegime === 'NEW_REGIME' && styles.regimeButtonActive
            ]}
            onPress={() => setTaxBenefitData({ ...taxBenefitData, taxRegime: 'NEW_REGIME' })}
          >
            <Text style={[
              styles.regimeButtonText,
              taxBenefitData.taxRegime === 'NEW_REGIME' && styles.regimeButtonTextActive
            ]}>New Regime</Text>
          </TouchableOpacity>
        </View>
      </View>

      {taxBenefitData.taxRegime === 'OLD_REGIME' && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Section 80C Investments (₹)</Text>
            <TextInput
              style={styles.input}
              value={taxBenefitData.section80C}
              onChangeText={(text) => setTaxBenefitData({ ...taxBenefitData, section80C: text })}
              placeholder="1,50,000 (EPF, PPF, ELSS, etc.)"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Section 80D - Health Insurance (₹)</Text>
            <TextInput
              style={styles.input}
              value={taxBenefitData.section80D}
              onChangeText={(text) => setTaxBenefitData({ ...taxBenefitData, section80D: text })}
              placeholder="25,000"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NPS Investment (₹)</Text>
            <TextInput
              style={styles.input}
              value={taxBenefitData.nps}
              onChangeText={(text) => setTaxBenefitData({ ...taxBenefitData, nps: text })}
              placeholder="50,000"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
            />
          </View>
        </>
      )}

      <TouchableOpacity 
        style={[styles.calculateButton, isCalculating && { opacity: 0.7 }]} 
        onPress={handleTaxBenefitCalculate}
        disabled={isCalculating}
      >
        <Text style={styles.calculateButtonText}>
          {isCalculating ? 'Calculating...' : 'Calculate Tax Benefits'}
        </Text>
      </TouchableOpacity>

      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Tax Calculation Results</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Taxable Income:</Text>
            <Text style={styles.resultValue}>{formatCurrency(results.taxableIncome)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Tax:</Text>
            <Text style={[styles.resultValue, { color: colors.error }]}>
              {formatCurrency(results.totalTax)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Tax Savings:</Text>
            <Text style={[styles.resultValue, { color: colors.success }]}>
              {formatCurrency(results.taxSavings)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Deductions:</Text>
            <Text style={[styles.resultValue, { color: colors.info }]}>
              {formatCurrency(results.totalDeductions)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Effective Tax Rate:</Text>
            <Text style={styles.resultValue}>{results.effectiveTaxRate}%</Text>
          </View>
        </View>
      )}
    </View>
  );

  if (isCalculating) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Calculating..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Calculators</Text>
        {activeCalculator && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setActiveCalculator(null);
              setResults(null);
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!activeCalculator && renderCalculatorGrid()}
        {activeCalculator === 'emi' && renderEMICalculator()}
        {activeCalculator === 'sip' && renderSIPCalculator()}
        {activeCalculator === 'goal' && renderGoalCalculator()}
        {activeCalculator === 'rentVsBuy' && renderRentVsBuyCalculator()}
        {activeCalculator === 'retirement' && renderRetirementCalculator()}
        {activeCalculator === 'taxBenefit' && renderTaxBenefitCalculator()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  backButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  calculatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  calculatorCard: {
    width: '47%',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.md,
  },
  calculatorTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  calculatorSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  calculatorForm: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: spacing.md,
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
  calculateButton: {
    ...commonStyles.button,
    marginTop: spacing.md,
    ...shadows.md,
  },
  calculateButtonText: {
    ...commonStyles.buttonText,
  },
  resultsContainer: {
    marginTop: spacing.lg,
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  resultsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    flex: 1,
  },
  resultValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  // Tax regime button styles
  regimeButtonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  regimeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
  },
  regimeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  regimeButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  regimeButtonTextActive: {
    color: colors.textWhite,
  },
});

export default CalculatorsScreen;
