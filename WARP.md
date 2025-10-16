# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TaxBae is a React Native + Expo cross-platform mobile application for Indian tax management and financial planning. It provides AI-powered tax advice, financial calculators, expense tracking, and role-based features for both individual and corporate users.

## Development Commands

### Start Development Server
```bash
# Start Expo development server (all platforms)
npm start
# or
npx expo start

# Platform-specific starts
npm run web          # Web development
npm run android      # Android development  
npm run ios          # iOS development (Mac only)
```

### Dependencies Management
```bash
# Install dependencies
npm install

# Install Expo-specific dependencies  
npx expo install react-dom react-native-web @expo/metro-runtime

# Add new Expo SDK packages
npx expo install [package-name]
```

### Testing & Quality
```bash
# Type checking
npx tsc --noEmit

# Linting (if configured)
npx eslint src/

# Run tests (if configured)
npm test
```

### Environment Setup
Create `.env` file in root:
```bash
OPENAI_API_KEY=your_openai_api_key
RBI_API_KEY=your_rbi_api_key  
NSE_API_KEY=your_market_data_api_key
```

## Architecture Overview

### State Management Architecture
The app uses **React Context** for global state management with two main contexts:
- **AuthContext** (`src/context/AuthContext.tsx`): Handles authentication, user management, and role-based access
- **ExpenseContext** (`src/context/ExpenseContext.tsx`): Manages expense tracking, transactions, and financial data

Both contexts use `useReducer` for complex state updates and persist data using AsyncStorage.

### Navigation Structure
- **Stack Navigation** for auth flow (Login/Signup)
- **Bottom Tab Navigation** for main app (5 tabs: Home, Calculators, Tracker, Chat, Profile)
- **Role-based routing** that shows different features based on user type (individual vs corporate)

### Data Persistence Strategy
- **AsyncStorage**: User preferences, transaction data, authentication tokens
- **Expo SecureStore**: Secure token storage for authentication
- **User-scoped storage**: Data is stored with user ID prefixes for multi-user support

### Component Architecture Patterns

#### Screen Components
Located in `src/screens/`:
- `auth/`: Authentication screens (LoginScreen, SignupScreen, AuthScreen wrapper)
- `main/`: Main app screens (HomeScreen, CalculatorsScreen, TrackerScreen, ChatScreen, ProfileScreen)

#### Reusable Components
Located in `src/components/`:
- **TaxDeductionFinder**: Complex modal component for tax deduction discovery
- Components follow consistent styling patterns using theme system

#### Utility Architecture
- **Theme System** (`src/utils/theme.ts`): Centralized design tokens (colors, typography, spacing, shadows)
- **Calculator Utils** (`src/utils/calculatorUtils.ts`): Financial calculation logic (EMI, SIP, Goal Planning)
- **Tax Deductions** (`src/utils/taxDeductions.ts`): Indian tax law data and calculation logic

### Key Architectural Decisions

#### Financial Calculator Engine
The app implements a comprehensive financial calculator system:
- **EMI Calculator**: Uses standard loan amortization formulas
- **SIP Calculator**: Supports step-up SIPs with compound growth calculations  
- **Goal-based Planning**: Future value calculations for financial goals
- **Rent vs Buy Analysis**: Multi-year cost comparison with inflation modeling

#### Tax Deduction System
Complex tax deduction finder with:
- **Static Tax Data**: Comprehensive Indian tax deductions for FY 2024-25
- **Role-based Filtering**: Different deductions for individual vs corporate users
- **Eligibility Logic**: Dynamic filtering based on user profile (age, employment type, etc.)
- **Tax Savings Calculator**: Estimates potential savings based on investments

#### AI Chat Integration
Mock AI assistant (ready for OpenAI integration):
- **Context-aware Responses**: Uses user type and message content for personalized advice
- **Financial Domain Knowledge**: Pre-built responses for common tax and investment queries
- **Conversation Management**: Message history with timestamps

## Development Guidelines

### Working with Context Providers
Both AuthContext and ExpenseContext follow consistent patterns:
```typescript
// Always check loading states
const { user, isLoading, isAuthenticated } = useAuth();
if (isLoading) return <LoadingScreen />;

// Handle async operations with proper error handling
try {
  await addTransaction(transactionData);
} catch (error) {
  // Handle errors appropriately
}
```

### Theme System Usage
Use the centralized theme system for consistency:
```typescript
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  }
});
```

### Navigation Patterns
The app uses conditional navigation based on auth state:
- **Splash Screen**: Shows while checking authentication
- **Auth Stack**: Login/Signup flow for unauthenticated users
- **Main Tabs**: Full app experience for authenticated users

### Form Handling Patterns
Forms consistently use:
- Controlled inputs with validation
- Error state management
- Loading states during submission
- Success/error feedback via alerts

### Mock Data Integration
Several components use mock data that should be replaced with real APIs:
- Chat responses in `ChatScreen.tsx`
- Market data in `HomeScreen.tsx`
- Authentication in `AuthContext.tsx`

### TypeScript Usage
The app uses comprehensive TypeScript definitions in `src/types/index.ts`:
- **Domain Types**: User, Transaction, TaxDeduction, etc.
- **Calculator Types**: Input/Output interfaces for all calculators  
- **Navigation Types**: Proper type safety for React Navigation
- **API Types**: Response interfaces for external APIs

### Indian Tax Compliance
The tax system is specifically designed for Indian tax laws:
- **Section-wise Deductions**: 80C, 80D, HRA, etc.
- **FY 2024-25 Tax Slabs**: Current Indian tax brackets
- **Role-based Tax Benefits**: Different deductions for individuals vs corporations
- **Regional Considerations**: Metro vs non-metro HRA calculations

## Common Development Patterns

### Adding New Calculators
1. Add calculator logic to `src/utils/calculatorUtils.ts`
2. Define input/output types in `src/types/index.ts`
3. Add UI component to `CalculatorsScreen.tsx`
4. Follow existing validation and result display patterns

### Adding New Screens
1. Create screen component in appropriate `src/screens/` subdirectory
2. Add navigation types to `src/types/index.ts`
3. Register in navigation stack/tabs in `AppNavigator.tsx`
4. Use consistent styling patterns from theme system

### Working with AsyncStorage
Always use user-scoped keys for data persistence:
```typescript
const key = `${STORAGE_KEY}_${user?.id}`;
await AsyncStorage.setItem(key, JSON.stringify(data));
```

### Error Handling Strategy
- Use try/catch for async operations
- Display user-friendly error messages via Alert.alert()
- Log errors to console for debugging
- Graceful degradation for network failures

This codebase represents a production-ready fintech application with comprehensive Indian tax and financial planning features, built using modern React Native patterns and ready for scaling.
