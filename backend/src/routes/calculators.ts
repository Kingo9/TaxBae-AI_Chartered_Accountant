import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// EMI Calculator
router.post('/emi', 
  optionalAuth,
  [
    body('principal').isFloat({ min: 1000 }).withMessage('Principal amount must be at least ₹1,000'),
    body('rate').isFloat({ min: 0.01, max: 50 }).withMessage('Interest rate must be between 0.01% and 50%'),
    body('tenure').isFloat({ min: 1, max: 50 }).withMessage('Tenure must be between 1 and 50 years'),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(errors.array());
      }

      const { principal, rate, tenure } = req.body;
      
      const monthlyRate = rate / (12 * 100);
      const numberOfPayments = tenure * 12;
      
      const emi = monthlyRate === 0 
        ? principal / numberOfPayments
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      
      const totalAmount = emi * numberOfPayments;
      const totalInterest = totalAmount - principal;

      res.json({
        message: 'EMI calculated successfully',
        data: {
          emi: Math.round(emi),
          totalAmount: Math.round(totalAmount),
          totalInterest: Math.round(totalInterest),
          principal,
          rate,
          tenure,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// SIP Calculator
router.post('/sip',
  optionalAuth,
  [
    body('monthlyInvestment').isFloat({ min: 500 }).withMessage('Monthly investment must be at least ₹500'),
    body('annualReturn').isFloat({ min: 1, max: 50 }).withMessage('Expected annual return must be between 1% and 50%'),
    body('tenure').isFloat({ min: 1, max: 50 }).withMessage('Investment period must be between 1 and 50 years'),
    body('stepUpPercentage').optional().isFloat({ min: 0, max: 50 }),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(errors.array());
      }

      const { monthlyInvestment, annualReturn, tenure, stepUpPercentage = 0 } = req.body;
      
      const monthlyReturn = annualReturn / (12 * 100);
      const totalMonths = tenure * 12;
      let maturityAmount = 0;
      let totalInvested = 0;
      let currentMonthlyInvestment = monthlyInvestment;

      for (let month = 1; month <= totalMonths; month++) {
        // Step up annually
        if (stepUpPercentage > 0 && month > 1 && (month - 1) % 12 === 0) {
          currentMonthlyInvestment = currentMonthlyInvestment * (1 + stepUpPercentage / 100);
        }

        const remainingMonths = totalMonths - month + 1;
        const futureValue = currentMonthlyInvestment * Math.pow(1 + monthlyReturn, remainingMonths - 1);
        maturityAmount += futureValue;
        totalInvested += currentMonthlyInvestment;
      }

      const returns = maturityAmount - totalInvested;

      res.json({
        message: 'SIP calculated successfully',
        data: {
          maturityAmount: Math.round(maturityAmount),
          investedAmount: Math.round(totalInvested),
          returns: Math.round(returns),
          monthlyInvestment,
          annualReturn,
          tenure,
          stepUpPercentage,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Goal-based Savings Calculator
router.post('/goal-savings',
  optionalAuth,
  [
    body('goalAmount').isFloat({ min: 10000 }).withMessage('Goal amount must be at least ₹10,000'),
    body('timeInYears').isFloat({ min: 1, max: 50 }).withMessage('Time period must be between 1 and 50 years'),
    body('expectedReturn').isFloat({ min: 1, max: 50 }).withMessage('Expected return must be between 1% and 50%'),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(errors.array());
      }

      const { goalAmount, timeInYears, expectedReturn } = req.body;
      
      const monthlyReturn = expectedReturn / (12 * 100);
      const totalMonths = timeInYears * 12;
      
      // PMT formula for monthly investment needed
      const monthlyInvestment = monthlyReturn === 0 
        ? goalAmount / totalMonths
        : (goalAmount * monthlyReturn) / (Math.pow(1 + monthlyReturn, totalMonths) - 1);
      
      const totalInvestment = monthlyInvestment * totalMonths;
      const returns = goalAmount - totalInvestment;

      res.json({
        message: 'Goal-based savings calculated successfully',
        data: {
          monthlyInvestment: Math.round(monthlyInvestment),
          totalInvestment: Math.round(totalInvestment),
          returns: Math.round(returns),
          goalAmount,
          timeInYears,
          expectedReturn,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Rent vs Buy Calculator
router.post('/rent-vs-buy',
  optionalAuth,
  [
    body('homePrice').isFloat({ min: 100000 }).withMessage('Home price must be at least ₹1,00,000'),
    body('downPayment').isFloat({ min: 0 }).withMessage('Down payment must be non-negative'),
    body('loanRate').isFloat({ min: 1, max: 30 }).withMessage('Loan rate must be between 1% and 30%'),
    body('loanTenure').isFloat({ min: 5, max: 30 }).withMessage('Loan tenure must be between 5 and 30 years'),
    body('monthlyRent').isFloat({ min: 1000 }).withMessage('Monthly rent must be at least ₹1,000'),
    body('rentIncrease').isFloat({ min: 0, max: 20 }).withMessage('Rent increase must be between 0% and 20%'),
    body('timeHorizon').isFloat({ min: 5, max: 30 }).withMessage('Time horizon must be between 5 and 30 years'),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(errors.array());
      }

      const { homePrice, downPayment, loanRate, loanTenure, monthlyRent, rentIncrease, timeHorizon } = req.body;
      
      const loanAmount = homePrice - downPayment;
      const monthlyRate = loanRate / (12 * 100);
      const numberOfPayments = loanTenure * 12;
      
      // Calculate EMI
      const emi = monthlyRate === 0 
        ? loanAmount / numberOfPayments
        : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      
      // Calculate total rent cost with annual increase
      let totalRentCost = 0;
      let currentRent = monthlyRent;
      
      for (let year = 1; year <= timeHorizon; year++) {
        totalRentCost += currentRent * 12;
        currentRent = currentRent * (1 + rentIncrease / 100);
      }
      
      // Calculate total buy cost
      const totalEMIPaid = Math.min(emi * timeHorizon * 12, emi * numberOfPayments);
      const maintenanceAndTaxes = homePrice * 0.02 * timeHorizon; // 2% annually
      const totalBuyCost = downPayment + totalEMIPaid + maintenanceAndTaxes;
      
      const savings = totalRentCost - totalBuyCost;
      const recommendation = savings > 0 ? 'buy' : 'rent';

      res.json({
        message: 'Rent vs Buy analysis completed successfully',
        data: {
          totalRentCost: Math.round(totalRentCost),
          totalBuyCost: Math.round(totalBuyCost),
          recommendation,
          savings: Math.abs(Math.round(savings)),
          emi: Math.round(emi),
          homePrice,
          downPayment,
          loanAmount,
          timeHorizon,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// NEW: Retirement Planning Calculator
router.post('/retirement-planning',
  optionalAuth,
  [
    body('currentAge').isInt({ min: 18, max: 65 }).withMessage('Current age must be between 18 and 65'),
    body('retirementAge').isInt({ min: 50, max: 75 }).withMessage('Retirement age must be between 50 and 75'),
    body('currentSalary').isFloat({ min: 10000 }).withMessage('Current salary must be at least ₹10,000'),
    body('currentSavings').optional().isFloat({ min: 0 }),
    body('expectedInflation').optional().isFloat({ min: 1, max: 15 }),
    body('expectedReturn').optional().isFloat({ min: 5, max: 20 }),
    body('retirementExpenseRatio').optional().isFloat({ min: 0.3, max: 1.5 }),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(errors.array());
      }

      const {
        currentAge,
        retirementAge,
        currentSalary,
        currentSavings = 0,
        expectedInflation = 6,
        expectedReturn = 12,
        retirementExpenseRatio = 0.8, // 80% of current salary
      } = req.body;

      if (retirementAge <= currentAge) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Retirement age must be greater than current age',
        });
      }

      const yearsToRetirement = retirementAge - currentAge;
      const yearsInRetirement = 85 - retirementAge; // Assuming life expectancy of 85

      // Calculate required monthly expense at retirement (inflation-adjusted)
      const monthlyExpenseAtRetirement = (currentSalary * retirementExpenseRatio) / 12 * 
        Math.pow(1 + expectedInflation / 100, yearsToRetirement);

      // Calculate required corpus using 4% withdrawal rule
      const requiredCorpus = monthlyExpenseAtRetirement * 12 / 0.04;

      // Future value of current savings
      const futureValueOfCurrentSavings = currentSavings * 
        Math.pow(1 + expectedReturn / 100, yearsToRetirement);

      // Additional corpus needed
      const additionalCorpusNeeded = Math.max(0, requiredCorpus - futureValueOfCurrentSavings);

      // Calculate monthly SIP needed
      const monthlyReturn = expectedReturn / (12 * 100);
      const totalMonths = yearsToRetirement * 12;
      
      const monthlyInvestmentNeeded = monthlyReturn === 0 
        ? additionalCorpusNeeded / totalMonths
        : (additionalCorpusNeeded * monthlyReturn) / (Math.pow(1 + monthlyReturn, totalMonths) - 1);

      // Calculate total investment
      const totalInvestmentNeeded = monthlyInvestmentNeeded * totalMonths + currentSavings;

      res.json({
        message: 'Retirement planning calculated successfully',
        data: {
          requiredCorpus: Math.round(requiredCorpus),
          monthlyInvestmentNeeded: Math.round(monthlyInvestmentNeeded),
          totalInvestmentNeeded: Math.round(totalInvestmentNeeded),
          futureValueOfCurrentSavings: Math.round(futureValueOfCurrentSavings),
          monthlyExpenseAtRetirement: Math.round(monthlyExpenseAtRetirement),
          yearsToRetirement,
          yearsInRetirement,
          currentAge,
          retirementAge,
          currentSalary,
          currentSavings,
          expectedInflation,
          expectedReturn,
          retirementExpenseRatio,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Tax Benefit Calculator
router.post('/tax-benefit',
  optionalAuth,
  [
    body('income').isFloat({ min: 100000 }).withMessage('Annual income must be at least ₹1,00,000'),
    body('taxRegime').isIn(['OLD_REGIME', 'NEW_REGIME']).withMessage('Invalid tax regime'),
    body('investments').optional().isObject(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(errors.array());
      }

      const { income, taxRegime, investments = {} } = req.body;
      
      let taxableIncome = income;
      let totalDeductions = 0;
      const deductionBreakdown: any = {};

      if (taxRegime === 'OLD_REGIME') {
        // Standard deduction
        const standardDeduction = Math.min(50000, income);
        totalDeductions += standardDeduction;
        deductionBreakdown.standardDeduction = standardDeduction;

        // 80C deductions
        const section80C = Math.min(investments.section80C || 0, 150000);
        totalDeductions += section80C;
        deductionBreakdown.section80C = section80C;

        // 80D deductions (Health Insurance)
        const section80D = Math.min(investments.section80D || 0, 25000);
        totalDeductions += section80D;
        deductionBreakdown.section80D = section80D;

        // Other deductions
        if (investments.nps) {
          const npsDeduction = Math.min(investments.nps, 50000);
          totalDeductions += npsDeduction;
          deductionBreakdown.nps = npsDeduction;
        }
      } else {
        // New regime - limited deductions
        const standardDeduction = Math.min(50000, income);
        totalDeductions += standardDeduction;
        deductionBreakdown.standardDeduction = standardDeduction;
      }

      taxableIncome = Math.max(0, income - totalDeductions);

      // Calculate tax based on regime
      let tax = 0;
      if (taxRegime === 'OLD_REGIME') {
        // Old regime tax slabs
        if (taxableIncome <= 250000) tax = 0;
        else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
        else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.2;
        else tax = 112500 + (taxableIncome - 1000000) * 0.3;
      } else {
        // New regime tax slabs
        if (taxableIncome <= 300000) tax = 0;
        else if (taxableIncome <= 600000) tax = (taxableIncome - 300000) * 0.05;
        else if (taxableIncome <= 900000) tax = 15000 + (taxableIncome - 600000) * 0.1;
        else if (taxableIncome <= 1200000) tax = 45000 + (taxableIncome - 900000) * 0.15;
        else if (taxableIncome <= 1500000) tax = 90000 + (taxableIncome - 1200000) * 0.2;
        else tax = 150000 + (taxableIncome - 1500000) * 0.3;
      }

      // Add cess
      const cess = tax * 0.04;
      const totalTax = tax + cess;

      // Tax without deductions
      let taxWithoutDeductions = 0;
      if (taxRegime === 'OLD_REGIME') {
        const incomeWithoutDeductions = income - 50000; // Only standard deduction
        if (incomeWithoutDeductions <= 250000) taxWithoutDeductions = 0;
        else if (incomeWithoutDeductions <= 500000) taxWithoutDeductions = (incomeWithoutDeductions - 250000) * 0.05;
        else if (incomeWithoutDeductions <= 1000000) taxWithoutDeductions = 12500 + (incomeWithoutDeductions - 500000) * 0.2;
        else taxWithoutDeductions = 112500 + (incomeWithoutDeductions - 1000000) * 0.3;
        taxWithoutDeductions += taxWithoutDeductions * 0.04; // Add cess
      } else {
        taxWithoutDeductions = totalTax; // Same in new regime
      }

      const taxSavings = taxWithoutDeductions - totalTax;

      res.json({
        message: 'Tax benefit calculated successfully',
        data: {
          taxableIncome: Math.round(taxableIncome),
          totalTax: Math.round(totalTax),
          taxSavings: Math.round(taxSavings),
          totalDeductions,
          deductionBreakdown,
          effectiveTaxRate: income > 0 ? ((totalTax / income) * 100).toFixed(2) : 0,
          income,
          taxRegime,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as calculatorRoutes };
