import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, ExpenseSummary, CategoryBreakdown } from '../types';
import { useAuth } from './AuthContext';

// Action types
type ExpenseAction =
  | { type: 'LOAD_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
interface ExpenseState {
  transactions: Transaction[];
  isLoading: boolean;
}

const initialState: ExpenseState = {
  transactions: [],
  isLoading: false,
};

// Expense reducer
const expenseReducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
  switch (action.type) {
    case 'LOAD_TRANSACTIONS':
      return { ...state, transactions: action.payload, isLoading: false };
    case 'ADD_TRANSACTION':
      return { 
        ...state, 
        transactions: [action.payload, ...state.transactions],
        isLoading: false 
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
        isLoading: false
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
        isLoading: false
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

// Context type
interface ExpenseContextType extends ExpenseState {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getExpenseSummary: (month?: number, year?: number) => ExpenseSummary;
  getCategoryBreakdown: (type: 'income' | 'expense', month?: number, year?: number) => CategoryBreakdown[];
  getTransactionsByMonth: (month: number, year: number) => Transaction[];
}

// Create context
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEY = 'taxbae_transactions';

// Expense provider component
interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  const { user } = useAuth();

  // Load transactions on mount
  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_${user?.id}`);
      if (stored) {
        const transactions: Transaction[] = JSON.parse(stored).map((t: any) => ({
          ...t,
          date: new Date(t.date),
          createdAt: new Date(t.createdAt),
        }));
        dispatch({ type: 'LOAD_TRANSACTIONS', payload: transactions });
      } else {
        dispatch({ type: 'LOAD_TRANSACTIONS', payload: [] });
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      dispatch({ type: 'LOAD_TRANSACTIONS', payload: [] });
    }
  };

  const saveTransactions = async (transactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEY}_${user?.id}`,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: user?.id || '',
        createdAt: new Date(),
      };

      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
      
      const updatedTransactions = [newTransaction, ...state.transactions];
      await saveTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error adding transaction:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTransaction = async (id: string, updateData: Partial<Transaction>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const existingTransaction = state.transactions.find(t => t.id === id);
      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }

      const updatedTransaction: Transaction = {
        ...existingTransaction,
        ...updateData,
        id, // Ensure ID doesn't change
        userId: user?.id || '', // Ensure userId doesn't change
      };

      dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
      
      const updatedTransactions = state.transactions.map(t =>
        t.id === id ? updatedTransaction : t
      );
      await saveTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error updating transaction:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      
      const updatedTransactions = state.transactions.filter(t => t.id !== id);
      await saveTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getExpenseSummary = (month?: number, year?: number): ExpenseSummary => {
    const filtered = month && year
      ? state.transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
        })
      : state.transactions;

    const totalIncome = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = getCategoryBreakdown('expense', month, year);

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      categoryBreakdown,
    };
  };

  const getCategoryBreakdown = (
    type: 'income' | 'expense',
    month?: number,
    year?: number
  ): CategoryBreakdown[] => {
    const filtered = state.transactions.filter(t => {
      const matchesType = t.type === type;
      
      if (month && year) {
        const transactionDate = new Date(t.date);
        return matchesType && 
               transactionDate.getMonth() === month && 
               transactionDate.getFullYear() === year;
      }
      
      return matchesType;
    });

    const categoryTotals = filtered.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getTransactionsByMonth = (month: number, year: number): Transaction[] => {
    return state.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });
  };

  const value: ExpenseContextType = {
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getExpenseSummary,
    getCategoryBreakdown,
    getTransactionsByMonth,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

// Custom hook to use expense context
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export default ExpenseContext;
