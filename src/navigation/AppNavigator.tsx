import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing } from '../utils/theme';
import { RootStackParamList, MainTabParamList } from '../types';

// Screens
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import HomeScreen from '../screens/main/HomeScreen';
import CalculatorsScreen from '../screens/main/CalculatorsScreen';
import InvestmentScreen from '../screens/main/InvestmentScreen';
import TrackerScreen from '../screens/main/TrackerScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator component
const MainTabNavigator = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Calculators':
              iconName = focused ? 'calculator' : 'calculator-outline';
              break;
            case 'Investments':
              iconName = focused ? 'pie-chart' : 'pie-chart-outline';
              break;
            case 'Tracker':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            case 'Chat':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.backgroundLight,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
        },
        headerShown: false,
      })}
    >
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTab.Screen 
        name="Calculators" 
        component={CalculatorsScreen}
        options={{ tabBarLabel: 'Calculators' }}
      />
      <MainTab.Screen 
        name="Investments" 
        component={InvestmentScreen}
        options={{ tabBarLabel: 'Investments' }}
      />
      <MainTab.Screen 
        name="Tracker" 
        component={TrackerScreen}
        options={{ tabBarLabel: 'Tracker' }}
      />
      <MainTab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ tabBarLabel: 'AI Chat' }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </MainTab.Navigator>
  );
};

// Root navigator component
export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
      >
        {isLoading ? (
          <RootStack.Screen 
            name="Splash" 
            component={SplashScreen}
            options={{
              animationEnabled: false,
            }}
          />
        ) : !isAuthenticated ? (
          <RootStack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{
              animationTypeForReplace: 'pop',
            }}
          />
        ) : (
          <RootStack.Screen 
            name="Main" 
            component={MainTabNavigator}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
