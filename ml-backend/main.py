from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import os
import joblib
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

app = FastAPI(title="TaxBae ML Backend", version="1.0.0")
security = HTTPBearer()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:19006", "http://localhost:8081", "http://localhost:3000"],  # Expo dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models (in production, these would be loaded from files)
expense_model = None
investment_model = None
anomaly_detector = None

# Data models
class Transaction(BaseModel):
    amount: float
    category: str
    type: str  # 'INCOME' or 'EXPENSE'
    description: str
    date: str
    isTaxDeductible: Optional[bool] = False
    taxSection: Optional[str] = None

class InvestmentProfile(BaseModel):
    age: int
    income: float
    riskTolerance: str  # 'LOW', 'MEDIUM', 'HIGH'
    investmentGoals: List[str]
    timeHorizon: int  # years
    currentSavings: float
    monthlyInvestmentCapacity: float

class ExpenseAnalysisRequest(BaseModel):
    transactions: List[Transaction]
    userId: str
    
class InvestmentSuggestionRequest(BaseModel):
    profile: InvestmentProfile
    transactions: List[Transaction]
    userId: str

# Response models
class ExpenseInsight(BaseModel):
    category: str
    averageSpending: float
    trend: str  # 'INCREASING', 'DECREASING', 'STABLE'
    recommendation: str
    potentialSavings: float

class InvestmentSuggestion(BaseModel):
    instrument: str
    allocation: float  # percentage
    expectedReturn: float
    riskLevel: str
    taxBenefits: str
    reason: str

class ExpenseAnalysisResponse(BaseModel):
    insights: List[ExpenseInsight]
    totalMonthlySpending: float
    savingsRate: float
    budgetRecommendations: Dict[str, float]
    anomalies: List[Dict[str, Any]]
    
class InvestmentSuggestionResponse(BaseModel):
    suggestions: List[InvestmentSuggestion]
    portfolioAllocation: Dict[str, float]
    expectedAnnualReturn: float
    taxSavings: float

# Authentication (verify JWT token from Node.js backend)
async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    try:
        # In a real implementation, verify JWT token with same secret as Node.js backend
        # For now, we'll accept any token for development
        return {"userId": "user_id_from_jwt"}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@app.get("/")
async def root():
    return {"message": "TaxBae ML Backend", "version": "1.0.0"}

@app.post("/analyze/expenses", response_model=ExpenseAnalysisResponse)
async def analyze_expenses(
    request: ExpenseAnalysisRequest,
    current_user: dict = Depends(verify_token)
):
    """Analyze user expenses and provide insights"""
    try:
        transactions_df = pd.DataFrame([t.dict() for t in request.transactions])
        
        if transactions_df.empty:
            return ExpenseAnalysisResponse(
                insights=[],
                totalMonthlySpending=0,
                savingsRate=0,
                budgetRecommendations={},
                anomalies=[]
            )
        
        # Filter expenses only
        expenses_df = transactions_df[transactions_df['type'] == 'EXPENSE'].copy()
        income_df = transactions_df[transactions_df['type'] == 'INCOME'].copy()
        
        # Calculate basic metrics
        total_expenses = expenses_df['amount'].sum() if not expenses_df.empty else 0
        total_income = income_df['amount'].sum() if not income_df.empty else 0
        savings_rate = max(0, (total_income - total_expenses) / total_income * 100) if total_income > 0 else 0
        
        # Category-wise analysis
        insights = []
        budget_recommendations = {}
        
        if not expenses_df.empty:
            category_spending = expenses_df.groupby('category')['amount'].agg(['sum', 'mean', 'count']).reset_index()
            
            for _, row in category_spending.iterrows():
                category = row['category']
                avg_spending = row['mean']
                total_spending = row['sum']
                
                # Simple trend analysis (would be more sophisticated with historical data)
                trend = 'STABLE'  # Default
                
                # Generate recommendations
                if category in ['🍕 Food & Dining', '🎬 Entertainment']:
                    recommendation = f"Consider reducing {category} spending by 15-20% to optimize savings"
                    potential_savings = total_spending * 0.15
                elif category in ['🏠 Housing & Rent', '⚡ Utilities']:
                    recommendation = f"Essential category. Look for energy-efficient alternatives"
                    potential_savings = total_spending * 0.05
                elif category in ['📈 Investments', '🛡️ Insurance']:
                    recommendation = f"Great! Keep investing in {category} for tax benefits"
                    potential_savings = 0
                else:
                    recommendation = f"Monitor {category} spending and look for optimization opportunities"
                    potential_savings = total_spending * 0.10
                
                insights.append(ExpenseInsight(
                    category=category,
                    averageSpending=avg_spending,
                    trend=trend,
                    recommendation=recommendation,
                    potentialSavings=potential_savings
                ))
                
                # Budget recommendations (50% of average as recommended budget)
                budget_recommendations[category] = avg_spending * 1.2
        
        # Anomaly detection (simple threshold-based)
        anomalies = []
        if not expenses_df.empty:
            category_medians = expenses_df.groupby('category')['amount'].median()
            for _, transaction in expenses_df.iterrows():
                median_for_category = category_medians.get(transaction['category'], 0)
                if transaction['amount'] > median_for_category * 3:  # 3x median threshold
                    anomalies.append({
                        'transaction_id': getattr(transaction, 'id', 'unknown'),
                        'amount': transaction['amount'],
                        'category': transaction['category'],
                        'description': transaction['description'],
                        'date': transaction['date'],
                        'reason': f"Amount is {transaction['amount'] / median_for_category:.1f}x higher than usual for this category",
                        'severity': 'HIGH' if transaction['amount'] > median_for_category * 5 else 'MEDIUM'
                    })
        
        return ExpenseAnalysisResponse(
            insights=insights,
            totalMonthlySpending=total_expenses,
            savingsRate=savings_rate,
            budgetRecommendations=budget_recommendations,
            anomalies=anomalies
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing expenses: {str(e)}")

@app.post("/suggestions/investments", response_model=InvestmentSuggestionResponse)
async def get_investment_suggestions(
    request: InvestmentSuggestionRequest,
    current_user: dict = Depends(verify_token)
):
    """Generate personalized investment suggestions"""
    try:
        profile = request.profile
        transactions = request.transactions
        
        # Calculate available investment amount
        monthly_expenses = sum(t.amount for t in transactions if t.type == 'EXPENSE') / max(1, len([t for t in transactions if t.type == 'EXPENSE']))
        available_investment = profile.monthlyInvestmentCapacity
        
        suggestions = []
        portfolio_allocation = {}
        
        # Tax-saving investments (Section 80C)
        if available_investment > 5000:  # Minimum for ELSS
            elss_allocation = min(30, 150000 / 12 / available_investment * 100)  # Max 1.5L per year
            suggestions.append(InvestmentSuggestion(
                instrument="ELSS Mutual Fund",
                allocation=elss_allocation,
                expectedReturn=12.0,
                riskLevel="MEDIUM",
                taxBenefits="Section 80C - Up to ₹1.5L deduction",
                reason="Tax-saving equity mutual fund with 3-year lock-in"
            ))
            portfolio_allocation["ELSS"] = elss_allocation
        
        # PPF for conservative investors
        if profile.riskTolerance in ['LOW', 'MEDIUM']:
            ppf_allocation = min(20, 150000 / 12 / available_investment * 100)
            suggestions.append(InvestmentSuggestion(
                instrument="Public Provident Fund (PPF)",
                allocation=ppf_allocation,
                expectedReturn=7.5,
                riskLevel="LOW",
                taxBenefits="Section 80C + Tax-free returns",
                reason="Conservative long-term wealth building with tax benefits"
            ))
            portfolio_allocation["PPF"] = ppf_allocation
        
        # Equity investments based on risk tolerance
        if profile.riskTolerance == 'HIGH' and profile.age < 50:
            equity_allocation = 50
            suggestions.append(InvestmentSuggestion(
                instrument="Large Cap Mutual Fund",
                allocation=equity_allocation,
                expectedReturn=13.0,
                riskLevel="MEDIUM",
                taxBenefits="LTCG tax benefits after 1 year",
                reason="Stable large-cap equity exposure for long-term growth"
            ))
            portfolio_allocation["Equity"] = equity_allocation
        elif profile.riskTolerance == 'MEDIUM':
            equity_allocation = 30
            suggestions.append(InvestmentSuggestion(
                instrument="Hybrid Mutual Fund",
                allocation=equity_allocation,
                expectedReturn=10.5,
                riskLevel="MEDIUM",
                taxBenefits="Balanced taxation",
                reason="Balanced equity-debt mix for moderate risk"
            ))
            portfolio_allocation["Hybrid"] = equity_allocation
        
        # Debt instruments
        if profile.age > 35 or profile.riskTolerance == 'LOW':
            debt_allocation = 25
            suggestions.append(InvestmentSuggestion(
                instrument="Debt Mutual Fund",
                allocation=debt_allocation,
                expectedReturn=7.0,
                riskLevel="LOW",
                taxBenefits="Indexation benefits after 3 years",
                reason="Capital preservation with inflation beating returns"
            ))
            portfolio_allocation["Debt"] = debt_allocation
        
        # Gold for diversification
        if available_investment > 10000:
            gold_allocation = 10
            suggestions.append(InvestmentSuggestion(
                instrument="Gold ETF",
                allocation=gold_allocation,
                expectedReturn=8.0,
                riskLevel="MEDIUM",
                taxBenefits="LTCG after 3 years",
                reason="Portfolio diversification and inflation hedge"
            ))
            portfolio_allocation["Gold"] = gold_allocation
        
        # Calculate expected returns
        total_allocation = sum(portfolio_allocation.values())
        if total_allocation > 0:
            expected_annual_return = sum(
                s.allocation * s.expectedReturn / 100 for s in suggestions
            ) / total_allocation * 100
        else:
            expected_annual_return = 0
        
        # Calculate tax savings
        tax_savings = 0
        for suggestion in suggestions:
            if "80C" in suggestion.taxBenefits:
                tax_savings += min(available_investment * suggestion.allocation / 100, 150000) * 0.3  # 30% tax bracket
        
        return InvestmentSuggestionResponse(
            suggestions=suggestions,
            portfolioAllocation=portfolio_allocation,
            expectedAnnualReturn=expected_annual_return,
            taxSavings=tax_savings
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating investment suggestions: {str(e)}")

@app.post("/analyze/spending-pattern")
async def analyze_spending_pattern(
    transactions: List[Transaction],
    current_user: dict = Depends(verify_token)
):
    """Analyze spending patterns and predict future expenses"""
    try:
        if not transactions:
            return {"patterns": [], "predictions": {}, "insights": []}
        
        transactions_df = pd.DataFrame([t.dict() for t in transactions])
        transactions_df['date'] = pd.to_datetime(transactions_df['date'])
        transactions_df = transactions_df[transactions_df['type'] == 'EXPENSE']
        
        if transactions_df.empty:
            return {"patterns": [], "predictions": {}, "insights": []}
        
        # Monthly spending pattern
        monthly_spending = transactions_df.groupby([
            transactions_df['date'].dt.year,
            transactions_df['date'].dt.month,
            'category'
        ])['amount'].sum().reset_index()
        
        patterns = []
        for category in transactions_df['category'].unique():
            category_data = transactions_df[transactions_df['category'] == category]
            avg_amount = category_data['amount'].mean()
            frequency = len(category_data) / max(1, len(transactions_df)) * 100
            
            patterns.append({
                'category': category,
                'averageAmount': avg_amount,
                'frequency': frequency,
                'totalSpent': category_data['amount'].sum(),
                'trend': 'stable'  # Simplified for demo
            })
        
        # Simple predictions (next month spending by category)
        predictions = {}
        for category in transactions_df['category'].unique():
            category_spending = transactions_df[transactions_df['category'] == category]['amount']
            predictions[category] = float(category_spending.mean()) if len(category_spending) > 0 else 0
        
        # Generate insights
        insights = []
        total_spending = transactions_df['amount'].sum()
        
        # Top spending categories
        top_categories = transactions_df.groupby('category')['amount'].sum().nlargest(3)
        for category, amount in top_categories.items():
            percentage = (amount / total_spending) * 100
            insights.append({
                'type': 'HIGH_SPENDING',
                'category': category,
                'message': f"{category} accounts for {percentage:.1f}% of your total expenses",
                'amount': float(amount),
                'actionable': percentage > 30
            })
        
        # Recurring expenses
        recurring_categories = transactions_df['category'].value_counts()
        for category, count in recurring_categories.head(5).items():
            if count >= 3:  # At least 3 transactions
                avg_amount = transactions_df[transactions_df['category'] == category]['amount'].mean()
                insights.append({
                    'type': 'RECURRING_EXPENSE',
                    'category': category,
                    'message': f"You spend an average of ₹{avg_amount:.0f} on {category} regularly",
                    'frequency': int(count),
                    'suggestion': "Consider setting up automatic investments for this recurring expense"
                })
        
        return {
            "patterns": patterns,
            "predictions": predictions,
            "insights": insights,
            "totalTransactions": len(transactions_df),
            "analysisDate": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing spending pattern: {str(e)}")

@app.post("/predict/tax-savings")
async def predict_tax_savings(
    transactions: List[Transaction],
    annual_income: float,
    current_user: dict = Depends(verify_token)
):
    """Predict potential tax savings based on spending patterns"""
    try:
        # Calculate current tax-deductible investments
        tax_deductible_amount = sum(
            t.amount for t in transactions 
            if t.isTaxDeductible and t.type == 'EXPENSE'
        )
        
        # Tax calculation logic for Indian tax system (simplified)
        def calculate_tax(income: float, deductions: float = 0) -> float:
            taxable_income = max(0, income - deductions - 50000)  # Standard deduction
            
            if taxable_income <= 250000:
                return 0
            elif taxable_income <= 500000:
                return (taxable_income - 250000) * 0.05
            elif taxable_income <= 750000:
                return 12500 + (taxable_income - 500000) * 0.10
            elif taxable_income <= 1000000:
                return 37500 + (taxable_income - 750000) * 0.15
            elif taxable_income <= 1250000:
                return 75000 + (taxable_income - 1000000) * 0.20
            elif taxable_income <= 1500000:
                return 125000 + (taxable_income - 1250000) * 0.25
            else:
                return 187500 + (taxable_income - 1500000) * 0.30
        
        # Current tax
        current_tax = calculate_tax(annual_income, tax_deductible_amount)
        
        # Maximum possible 80C deductions
        max_80c_deduction = 150000
        remaining_80c_capacity = max(0, max_80c_deduction - tax_deductible_amount)
        
        # Tax with maximum deductions
        optimized_tax = calculate_tax(annual_income, max_80c_deduction)
        potential_savings = current_tax - optimized_tax
        
        # Investment recommendations for tax savings
        recommendations = []
        if remaining_80c_capacity > 0:
            recommendations.extend([
                {
                    'instrument': 'ELSS Mutual Fund',
                    'amount': min(remaining_80c_capacity, 50000),
                    'taxSaving': min(remaining_80c_capacity, 50000) * 0.3,
                    'expectedReturn': 12.0,
                    'lockIn': '3 years'
                },
                {
                    'instrument': 'PPF',
                    'amount': min(remaining_80c_capacity, 150000),
                    'taxSaving': min(remaining_80c_capacity, 150000) * 0.3,
                    'expectedReturn': 7.5,
                    'lockIn': '15 years'
                },
                {
                    'instrument': 'Tax Saver FD',
                    'amount': min(remaining_80c_capacity, 100000),
                    'taxSaving': min(remaining_80c_capacity, 100000) * 0.3,
                    'expectedReturn': 6.5,
                    'lockIn': '5 years'
                }
            ])
        
        return {
            'currentTaxLiability': current_tax,
            'optimizedTaxLiability': optimized_tax,
            'potentialTaxSavings': potential_savings,
            'currentDeductions': tax_deductible_amount,
            'remaining80CCapacity': remaining_80c_capacity,
            'recommendations': recommendations,
            'taxBracket': '30%' if annual_income > 1500000 else '20%' if annual_income > 1000000 else '10%' if annual_income > 500000 else '5%'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting tax savings: {str(e)}")

@app.post("/analyze/investment-performance")
async def analyze_investment_performance(
    transactions: List[Transaction],
    current_user: dict = Depends(verify_token)
):
    """Analyze investment performance and portfolio health"""
    try:
        investment_transactions = [
            t for t in transactions 
            if t.type == 'EXPENSE' and any(keyword in t.category.lower() for keyword in ['investment', 'mutual fund', 'sip', 'equity', 'debt'])
        ]
        
        if not investment_transactions:
            return {
                'totalInvested': 0,
                'portfolioHealth': 'NO_INVESTMENTS',
                'diversification': {},
                'recommendations': [
                    'Start investing in ELSS for tax benefits',
                    'Consider SIP in large-cap mutual funds',
                    'Build emergency fund before investing'
                ]
            }
        
        total_invested = sum(t.amount for t in investment_transactions)
        
        # Portfolio diversification analysis
        investment_categories = {}
        for transaction in investment_transactions:
            category = transaction.category
            investment_categories[category] = investment_categories.get(category, 0) + transaction.amount
        
        # Portfolio health score (simplified)
        diversification_score = min(len(investment_categories) * 20, 100)  # Max 100 for 5+ categories
        investment_frequency = len(investment_transactions) / max(1, len(transactions)) * 100
        
        if diversification_score >= 80 and investment_frequency >= 15:
            portfolio_health = 'EXCELLENT'
        elif diversification_score >= 60 and investment_frequency >= 10:
            portfolio_health = 'GOOD'
        elif diversification_score >= 40 and investment_frequency >= 5:
            portfolio_health = 'AVERAGE'
        else:
            portfolio_health = 'NEEDS_IMPROVEMENT'
        
        # Generate recommendations
        recommendations = []
        if len(investment_categories) < 3:
            recommendations.append('Diversify your portfolio across more asset classes')
        if investment_frequency < 10:
            recommendations.append('Increase your investment frequency with SIP')
        if total_invested < profile.monthlyInvestmentCapacity * 6:
            recommendations.append('Consider increasing your investment amount')
        
        # Calculate diversification percentages
        diversification = {
            category: (amount / total_invested) * 100 
            for category, amount in investment_categories.items()
        }
        
        return {
            'totalInvested': total_invested,
            'portfolioHealth': portfolio_health,
            'diversificationScore': diversification_score,
            'diversification': diversification,
            'investmentFrequency': investment_frequency,
            'recommendations': recommendations,
            'monthlyAverage': total_invested / max(1, len(investment_transactions))
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing investment performance: {str(e)}")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": {
            "expense_analyzer": True,
            "investment_advisor": True,
            "anomaly_detector": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
