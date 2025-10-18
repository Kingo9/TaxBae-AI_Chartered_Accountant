# TaxBae - Your AI Chartered Accountant 🧮

A modern, beginner-friendly platform that helps individuals and corporates manage taxes, expenses, and financial planning in India. Built with React Native + Expo for cross-platform compatibility.

![TaxBae Logo](assets/icon.png)

## 🎯 Purpose

TaxBae simplifies tax management and financial planning for Indian users by providing:
- Easy-to-use calculators for EMI, SIP, and tax planning
- Intelligent expense tracking and analytics  
- AI-powered tax advice and deduction finder
- Real-time market data and financial insights
- Role-based features for individuals and businesses

## ✨ Features

### 🔐 User Authentication
- **Login/Signup** with email or phone number
- **Role Selection** - Choose between Individual or Corporate account
- **Secure Storage** with AsyncStorage and Expo SecureStore

### 🏠 Role-Based Dashboard
- **Personalized Homepage** with quick access cards
- **Individual Account**: Personal tax tools, expense tracking, investment calculators
- **Corporate Account**: Business tax deductions, corporate financial tools
- **Smart Notifications** for tax deadlines and reminders
- **Market Updates** with live Nifty, Sensex, and RBI rates

### 🧮 Financial Calculators
- **EMI Calculator** - Calculate loan EMI with principal, rate, and tenure
- **SIP Calculator** - Plan systematic investments with step-up options
- **Goal-based Savings** - Calculate monthly investment needed for financial goals
- **Rent vs Buy** - Compare renting vs home buying over time
- **Tax Benefit Projection** - Estimate savings from various deductions

### 📊 Expense Tracker
- **Income & Expense Forms** - Easy data input with categories
- **Data Storage** - Persistent user data across sessions
- **Monthly & Yearly Summaries** - Track spending patterns over time
- **Visual Charts** - Pie charts and bar graphs for expense breakdown

### 📋 Tax Deduction Finder
- **"Give me all deductions" button** - One-click deduction discovery
- **Indian Tax Laws** - 80C, 80D, HRA, and all major sections
- **Personalized Suggestions** - Based on user profile and income
- **Corporate Deductions** - Special deductions for business users

### 🤖 AI Chatbot Assistant
- **OpenAI Integration** - GPT-powered tax and investment advice
- **Context-Aware Responses** - Personalized suggestions based on user data
- **Investment Guidance** - Safe investment recommendations
- **Tax Query Resolution** - Instant answers to tax questions

### 📱 Real-Time Data Integration
- **RBI Data** - Live repo rates, bank rates, CRR, SLR
- **Stock Market** - Real-time NSE/BSE indices
- **Tax Updates** - Latest rules and deadline information
- **Auto-refresh** - Background data updates

## 🎨 Design & UX

### Modern UI/UX
- **Pastel Theme** - Soft blue, green, and white color palette
- **Clean Navigation** - Bottom tab navigation with icons
- **Mobile-First Design** - Responsive layout for all screen sizes
- **Accessibility** - Tooltips and help guides for beginners
- **Smooth Animations** - Micro-interactions for better UX

### Component Architecture
- **Reusable Components** - Consistent design system
- **TypeScript Support** - Type-safe development
- **Styled Components** - Centralized theme management
- **Error Handling** - Graceful error states and validation

## 🛠️ Technical Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Managed React Native workflow
- **TypeScript** - Type safety and better development experience
- **React Navigation** - Navigation management
- **React Hook Form** - Form handling and validation

### State Management
- **React Context** - Authentication and global state
- **AsyncStorage** - Local data persistence
- **Expo SecureStore** - Secure token storage

### UI/UX Libraries
- **Expo Vector Icons** - Icon library
- **React Native Safe Area Context** - Safe area management
- **React Native Linear Gradient** - Beautiful gradient effects
- **React Native Chart Kit** - Data visualization

### APIs & Integrations
- **OpenAI API** - AI chatbot functionality
- **Financial Data APIs** - Real-time market data
- **Push Notifications** - Expo Notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TaxBae
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install additional dependencies**
   ```bash
   npx expo install react-dom react-native-web @expo/metro-runtime
   ```

4. **Start the development server**
   ```bash
   # For web
   npm run web
   
   # For iOS (Mac only)
   npm run ios
   
   # For Android
   npm run android
   
   # For all platforms
   npx expo start
   ```

### Environment Setup

Create a `.env` file in the root directory:
```bash
OPENAI_API_KEY=your_openai_api_key
RBI_API_KEY=your_rbi_api_key
NSE_API_KEY=your_market_data_api_key
```

## 📁 Project Structure

```
TaxBae/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   │   ├── auth/          # Authentication screens
│   │   └── main/          # Main app screens
│   ├── navigation/         # Navigation configuration
│   ├── context/           # React Context providers
│   ├── services/          # API services
│   ├── utils/             # Utility functions and theme
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript type definitions
├── assets/                 # Images, fonts, etc.
├── App.tsx                # Root component
└── README.md              # Project documentation
```

## 🔧 Development Guide

### Adding New Features

1. **Create Component**
   ```tsx
   // src/components/NewComponent.tsx
   import React from 'react';
   import { View, Text } from 'react-native';
   
   export const NewComponent: React.FC = () => {
     return (
       <View>
         <Text>New Component</Text>
       </View>
     );
   };
   ```

2. **Update Types**
   ```tsx
   // src/types/index.ts
   export interface NewFeatureType {
     id: string;
     name: string;
   }
   ```

3. **Add to Navigation** (if needed)
   ```tsx
   // src/navigation/AppNavigator.tsx
   <Tab.Screen 
     name="NewFeature" 
     component={NewFeatureScreen}
   />
   ```

### Custom Hooks Example
```tsx
// src/hooks/useFinancialData.ts
import { useState, useEffect } from 'react';

export const useFinancialData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch financial data
    fetchData();
  }, []);

  return { data, loading };
};
```

## 🎯 Current Development Status

### ✅ Completed Features
- [x] Project setup and architecture
- [x] Authentication system with role selection
- [x] Role-based dashboard with quick access
- [x] Bottom tab navigation
- [x] Theme system with pastel colors
- [x] User profile management
- [x] Responsive design foundation

### 🚧 In Progress Features
- [ ] Financial calculators implementation
- [ ] Expense tracker with charts
- [ ] Tax deduction finder logic
- [ ] AI chatbot integration
- [ ] Real-time data integration
- [ ] Push notifications
- [ ] Backend integration

### 📋 Planned Features
- [ ] Advanced analytics dashboard
- [ ] Tax document upload and OCR
- [ ] Investment portfolio tracking
- [ ] Multi-language support (Hindi, Tamil, etc.)
- [ ] Dark mode theme
- [ ] Offline mode support

## 🧪 Testing

```bash
# Run tests
npm test

# Run type checking
npx tsc --noEmit

# Lint code
npx eslint src/
```

## 📱 Platform Support

- ✅ **Web** - Responsive web application
- ✅ **iOS** - Native iOS app (requires Mac for development)
- ✅ **Android** - Native Android app
- 🔄 **Desktop** - Electron wrapper (planned)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **TaxBae Team** - Asad Shaikh, Siddique Shayan, Muaviyah Shelia.


## 🙏 Acknowledgments

- React Native community for excellent cross-platform framework
- Expo team for simplifying mobile development
- OpenAI for AI capabilities
- Indian government APIs for tax and financial data

## 📞 Support

- 📧 Email: support@taxbae.com
- 📱 Phone: +91 9168274756
- 🌐 Website: Hosting is in Progress
- 💬 Discord: [TaxBae Community](https://discord.gg/taxbae)

---

Made with ❤️ for the Indian tax and finance community
