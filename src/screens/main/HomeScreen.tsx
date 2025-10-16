import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows, commonStyles } from '../../utils/theme';
import TaxDeductionFinder from '../../components/TaxDeductionFinder';
import LoadingSpinner from '../../components/LoadingSpinner';
import { apiService } from '../../services/api';
import { MainTabParamList } from '../../types';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 3) / 2;

interface QuickAccessCard {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: string[];
  onPress: () => void;
}

type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [showTaxDeductionFinder, setShowTaxDeductionFinder] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<any>(null);

  // Quick access cards based on user type
  const getQuickAccessCards = (): QuickAccessCard[] => {
    const baseCards: QuickAccessCard[] = [
      {
        title: 'Calculators',
        subtitle: 'EMI, SIP & more',
        icon: 'calculator',
        color: colors.primary,
        gradient: [colors.primary, colors.primaryLight],
        onPress: () => {
          navigation.navigate('Calculators');
        },
      },
      {
        title: 'Investments',
        subtitle: 'Get recommendations',
        icon: 'pie-chart',
        color: colors.investment,
        gradient: [colors.investment, '#A855F7'],
        onPress: () => {
          navigation.navigate('Investments');
        },
      },
      {
        title: 'Expense Tracker',
        subtitle: 'Track your spending',
        icon: 'trending-up',
        color: colors.secondary,
        gradient: [colors.secondary, colors.secondaryLight],
        onPress: () => {
          navigation.navigate('Tracker');
        },
      },
      {
        title: 'AI Assistant',
        subtitle: 'Get tax advice',
        icon: 'chatbubble-ellipses',
        color: colors.accent,
        gradient: [colors.accent, colors.accentLight],
        onPress: () => {
          navigation.navigate('Chat');
        },
      },
      {
        title: 'Tax Deductions',
        subtitle: 'Find all deductions',
        icon: 'document-text',
        color: colors.investment,
        gradient: [colors.investment, '#A855F7'],
        onPress: () => {
          setShowTaxDeductionFinder(true);
        },
      },
    ];

    if (user?.userType === 'corporate') {
      baseCards.push({
        title: 'Business Tax',
        subtitle: 'Corporate deductions',
        icon: 'business',
        color: colors.info,
        gradient: [colors.info, '#60A5FA'],
        onPress: () => {
          // For now, show an alert since this might need special business features
          Alert.alert(
            'Business Tax Features', 
            'Advanced corporate tax features will be available soon! For now, you can use the general calculators and tax deduction finder.',
            [
              { text: 'Calculators', onPress: () => navigation.navigate('Calculators') },
              { text: 'Tax Deductions', onPress: () => setShowTaxDeductionFinder(true) },
              { text: 'OK', style: 'cancel' }
            ]
          );
        },
      });
    }

    return baseCards;
  };

  const quickAccessCards = getQuickAccessCards();

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      const [dashboardResponse, notificationsResponse, marketResponse] = await Promise.allSettled([
        apiService.getDashboard(),
        apiService.getNotifications(),
        apiService.getMarketData(),
      ]);

      if (dashboardResponse.status === 'fulfilled') {
        setDashboardData(dashboardResponse.value.data);
      }

      if (notificationsResponse.status === 'fulfilled') {
        setNotifications(notificationsResponse.value.data?.slice(0, 3) || []);
      }

      if (marketResponse.status === 'fulfilled') {
        setMarketData(marketResponse.value.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Don't show error alert for dashboard data as it's not critical
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const renderQuickAccessCard = (card: QuickAccessCard, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.cardWrapper}
      onPress={card.onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={card.gradient as [string, string, ...string[]]}
        style={styles.quickAccessCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardIcon}>
          <Ionicons name={card.icon} size={24} color={colors.textWhite} />
        </View>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Use real notifications data or fallback to sample data
  const notificationItems = notifications.length > 0 ? notifications.map(notif => ({
    title: notif.title,
    message: notif.body,
    type: notif.type === 'TAX_DEADLINE' ? 'warning' as const : 'info' as const,
    time: new Date(notif.createdAt).toLocaleDateString(),
    id: notif.id,
  })) : [
    {
      title: 'Welcome to TaxBae!',
      message: 'Start by adding your income and expenses to get personalized tax advice',
      type: 'info' as const,
      time: 'Today',
    },
  ];

  const renderNotificationItem = (item: typeof notificationItems[0], index: number) => (
    <View key={index} style={styles.notificationItem}>
      <View style={styles.notificationIcon}>
        <Ionicons
          name={item.type === 'warning' ? 'warning' : 'information-circle'}
          size={20}
          color={item.type === 'warning' ? colors.warning : colors.info}
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </View>
  );

  if (isLoading && !dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading your dashboard..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}!
            </Text>
            <Text style={styles.userName}>Welcome, {user?.name}</Text>
            <Text style={styles.userType}>
              {user?.userType === 'individual' ? 'Individual Account' : 
               user?.userType === 'corporate' ? 'Corporate Account' : 
               'Professional Account'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => Alert.alert('Notifications', 'Notification center coming soon!')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            {notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Access Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            {quickAccessCards.map((card, index) => renderQuickAccessCard(card, index))}
          </View>
        </View>

        {/* Tax Summary Card */}
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Tax Year 2024-25</Text>
              <TouchableOpacity onPress={() => Alert.alert('Tax Details', 'Detailed tax view coming soon!')}>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
            {dashboardData ? (
              <View style={styles.summaryContent}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Income</Text>
                  <Text style={styles.summaryValue}>
                    ₹{dashboardData.financialSummary.totalIncome.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Net Savings</Text>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    ₹{dashboardData.financialSummary.netSavings.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Investments</Text>
                  <Text style={[styles.summaryValue, { color: colors.investment }]}>
                    ₹{dashboardData.financialSummary.totalInvestments.toLocaleString()}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.summaryContent}>
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="document-text-outline" size={48} color={colors.textLight} />
                  <Text style={styles.emptyStateTitle}>No financial data yet</Text>
                  <Text style={styles.emptyStateText}>
                    Start by adding your income and expenses to see your tax summary
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Investment Advisory */}
        <View style={styles.section}>
          <View style={styles.investmentReminderCard}>
            <View style={styles.reminderHeader}>
              <Ionicons name="pie-chart" size={24} color={colors.investment} />
              <Text style={styles.reminderTitle}>Investment Advisory</Text>
            </View>
            <Text style={styles.reminderText}>
              Get personalized investment recommendations based on your age, income, and risk appetite. Start building wealth today!
            </Text>
            <TouchableOpacity 
              style={styles.reminderButton}
              onPress={() => navigation.navigate('Investments')}
            >
              <Text style={styles.reminderButtonText}>Get Recommendations</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.investment} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <View style={styles.notificationsList}>
            {notificationItems.map((item, index) => renderNotificationItem(item, index))}
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Notifications</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Market Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Updates</Text>
          <View style={styles.marketCard}>
            <View style={styles.marketItem}>
              <Text style={styles.marketLabel}>Nifty 50</Text>
              <View style={styles.marketValueContainer}>
                <Text style={styles.marketValue}>
                  {marketData?.nifty ? marketData.nifty.toLocaleString() : '24,587'}
                </Text>
                <Text style={[styles.marketChange, { color: colors.success }]}>+1.2%</Text>
              </View>
            </View>
            <View style={styles.marketItem}>
              <Text style={styles.marketLabel}>Repo Rate</Text>
              <View style={styles.marketValueContainer}>
                <Text style={styles.marketValue}>
                  {marketData?.repoRate ? `${marketData.repoRate}%` : '6.50%'}
                </Text>
                <Text style={styles.marketChange}>No change</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View More Data</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Tax Deduction Finder Modal */}
      <TaxDeductionFinder
        visible={showTaxDeductionFinder}
        onClose={() => setShowTaxDeductionFinder(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginVertical: spacing.xs,
  },
  userType: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textWhite,
    fontWeight: typography.fontWeight.semibold,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardWrapper: {
    width: cardWidth,
  },
  quickAccessCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    minHeight: 120,
    justifyContent: 'space-between',
    ...shadows.md,
  },
  cardIcon: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textWhite,
    opacity: 0.9,
  },
  summaryCard: {
    ...commonStyles.card,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  viewDetailsText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  summaryContent: {
    gap: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  notificationsList: {
    gap: spacing.md,
  },
  notificationItem: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  notificationIcon: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  notificationMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  viewAllText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginRight: spacing.xs,
  },
  marketCard: {
    ...commonStyles.card,
    gap: spacing.md,
  },
  marketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marketLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  marketValueContainer: {
    alignItems: 'flex-end',
  },
  marketValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  marketChange: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  // Investment reminder styles
  investmentReminderCard: {
    ...commonStyles.card,
    backgroundColor: colors.backgroundLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.investment,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reminderTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  reminderText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  reminderButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.investment,
    fontWeight: typography.fontWeight.medium,
    marginRight: spacing.xs,
  },
  // Empty state styles
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeScreen;
