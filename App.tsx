import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { ExpenseProvider } from './src/context/ExpenseContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { colors } from './src/utils/theme';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ExpenseProvider>
          <StatusBar style="auto" backgroundColor={colors.primary} />
          <AppNavigator />
        </ExpenseProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
