import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  commonStyles,
} from '../../utils/theme';
import { formatCurrency } from '../../utils/calculatorUtils';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { apiService } from '../../services/api';

const { width } = Dimensions.get('window');
const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

type ViewMode = 'summary' | 'transactions' | 'add';

const EXPENSE_CATEGORIES = [
  '🍕 Food & Dining',
  '🚗 Transportation',
  '🏠 Housing & Rent',
  '🛒 Shopping',
  '⚡ Utilities',
  '🏥 Healthcare',
  '🎬 Entertainment',
  '🎓 Education',
  '✈️ Travel',
  '📱 Technology',
  '👕 Clothing',
  '🔧 Maintenance',
  '🏦 EMI & Loans',
  '🛡️ Insurance',
  '🎁 Gifts & Donations',
  '💰 Other',
];

const INCOME_CATEGORIES = [
  '💼 Salary',
  '💰 Business',
  '📈 Investments',
  '🎯 Freelance',
  '🏆 Bonus',
  '🎁 Gift',
  '🔄 Rental',
  '💎 Other',
];

type ExpenseBreakdownItem = {
        category: string; // make sure category is string
        amount: number;
        percentage: number;
        };

export const TrackerScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Form state for adding transactions
  const [formData, setFormData] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    amount: '',
    category: '',
    description: '',
    date: new Date(),
    isTaxDeductible: false,
    taxSection: '',
  });

  // Load transactions and analytics
  const loadTransactions = async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);

      const [transactionsResponse, analyticsResponse] = await Promise.allSettled([
        apiService.getTransactions({ limit: 50 }),
        apiService.getTransactionAnalytics({ year: selectedYear.toString() }),
      ]);

      if (transactionsResponse.status === 'fulfilled') {
  const data = transactionsResponse.value.data.transactions || [];
  const transactionsData = data.map((t: any) => ({
    ...t,
    amount: typeof t.amount === 'bigint' ? Number(t.amount) : t.amount,
  }));
  setTransactions(transactionsData);
}

if (analyticsResponse.status === 'fulfilled') {
  const analyticsData = analyticsResponse.value.data;

  if (analyticsData?.categoryData) {
    analyticsData.categoryData = analyticsData.categoryData.map((item: any) => ({
      ...item,
      _sum: {
        ...item._sum,
        amount: typeof item._sum?.amount === 'bigint' ? Number(item._sum.amount) : item._sum?.amount,
      },
    }));
  }

  setAnalytics(analyticsData);
}

    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedYear]);

  const onRefresh = () => loadTransactions(true);

  // Calculate summary from transactions
  const summary = {
    totalIncome: transactions
      .filter(t => t.type === 'INCOME' && new Date(t.date).getMonth() === selectedMonth)
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions
      .filter(t => t.type === 'EXPENSE' && new Date(t.date).getMonth() === selectedMonth)
      .reduce((sum, t) => sum + t.amount, 0),
    get netAmount() { return this.totalIncome - this.totalExpenses; }
  };

  // Calculate expense breakdown
  const expenseBreakdown = analytics?.categoryData
    ?.filter((item: any) => item.type === 'EXPENSE')
    ?.map((item: any) => ({
      category: item.category,
      amount: item._sum?.amount || 0,
      percentage: ((item._sum?.amount || 0) / summary.totalExpenses) * 100 || 0
    })) || [];

  const recentTransactions = transactions.slice(0, 10);

  const handleAddTransaction = async () => {
    if (!formData.amount || !formData.category || !formData.description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setIsLoading(true);
      const transactionData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date.toISOString(),
        isTaxDeductible: formData.isTaxDeductible,
        taxSection: formData.taxSection || null,
      };

      await apiService.createTransaction(transactionData);

      // Reset form
      setFormData({
        type: 'EXPENSE',
        amount: '',
        category: '',
        description: '',
        date: new Date(),
        isTaxDeductible: false,
        taxSection: '',
      });

      setModalVisible(false);
      await loadTransactions(); // Reload transactions
      Alert.alert('Success', 'Transaction added successfully!');
    } catch (error) {
      console.error('Add transaction error:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteTransaction(id);
              await loadTransactions(); // Reload transactions
              Alert.alert('Success', 'Transaction deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction.');
            }
          },
        },
      ]
    );
  };

  const renderSummaryView = () => {
    const chartData = expenseBreakdown.slice(0, 5).map((item: { category: any; amount: any; }, index: number) => ({
      name: item.category,
      amount: item.amount,
      color: colors.chartColors[index % colors.chartColors.length],
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    }));

    return (
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity
            onPress={() => {
              const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
              const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
              setSelectedMonth(newMonth);
              setSelectedYear(newYear);
            }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <TouchableOpacity
            onPress={() => {
              const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
              const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
              setSelectedMonth(newMonth);
              setSelectedYear(newYear);
            }}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { borderLeftColor: colors.success }]}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {formatCurrency(summary.totalIncome)}
            </Text>
          </View>
          
          <View style={[styles.summaryCard, { borderLeftColor: colors.error }]}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryValue, { color: colors.error }]}>
              {formatCurrency(summary.totalExpenses)}
            </Text>
          </View>
          
          <View style={[styles.summaryCard, { borderLeftColor: colors.primary }]}>
            <Text style={styles.summaryLabel}>Net Amount</Text>
            <Text style={[
              styles.summaryValue,
              { color: summary.netAmount >= 0 ? colors.success : colors.error }
            ]}>
              {formatCurrency(summary.netAmount)}
            </Text>
          </View>
        </View>

        {/* Expense Chart */}
        {chartData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Expense Breakdown</Text>
            <PieChart
              data={chartData}
              width={width - spacing.lg * 2}
              height={200}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}

        
        {/* Category Breakdown */}
        <View style={styles.categoryContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {expenseBreakdown.map((item: ExpenseBreakdownItem, index: number) => (
            <View key={item.category || index} style={styles.categoryItem}>
              <View style={styles.categoryLeft}>
                <View style={[
                  styles.categoryColor,
                  { backgroundColor: colors.chartColors[index % colors.chartColors.length] }
                ]} />
                <Text style={styles.categoryName}>{item.category}</Text>
              </View>
              <View style={styles.categoryRight}>
                <Text style={styles.categoryAmount}>
                  {formatCurrency(item.amount)}
                </Text>
                <Text style={styles.categoryPercentage}>
                  {item.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderTransactionItem = ({ item }: { item: any }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[
          styles.transactionIcon,
          { backgroundColor: item.type === 'INCOME' ? colors.success + '20' : colors.error + '20' }
        ]}>
          <Ionicons
            name={item.type === 'INCOME' ? 'trending-up' : 'trending-down'}
            size={16}
            color={item.type === 'INCOME' ? colors.success : colors.error}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          <Text style={styles.transactionDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          { color: item.type === 'INCOME' ? colors.success : colors.error }
        ]}>
          {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
        {item.isTaxDeductible && (
          <View style={styles.taxBadge}>
            <Text style={styles.taxBadgeText}>{item.taxSection || 'Tax Saver'}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTransaction(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTransactionsView = () => {
    if (isLoading) {
      return <LoadingSpinner message="Loading transactions..." />;
    }

    if (recentTransactions.length === 0) {
      return (
        <EmptyState
          icon="receipt-outline"
          title="No Transactions Yet"
          message="Start by adding your first income or expense to see your transaction history."
          actionText="Add Transaction"
          onActionPress={() => setModalVisible(true)}
        />
      );
    }

    return (
      <View style={styles.transactionsContainer}>
        <FlatList
          data={recentTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.transactionsList}
        />
      </View>
    );
  };

  const renderAddTransactionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            {/* Type Selector */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === 'INCOME' && styles.typeButtonActive
                ]}
                onPress={() => setFormData({ ...formData, type: 'INCOME', category: '' })}
              >
                <Text style={[
                  styles.typeButtonText,
                  formData.type === 'INCOME' && styles.typeButtonTextActive
                ]}>Income</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === 'EXPENSE' && styles.typeButtonActive
                ]}
                onPress={() => setFormData({ ...formData, type: 'EXPENSE', category: '' })}
              >
                <Text style={[
                  styles.typeButtonText,
                  formData.type === 'EXPENSE' && styles.typeButtonTextActive
                ]}>Expense</Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount (₹)</Text>
              <TextInput
                style={styles.input}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="Enter amount"
                keyboardType="numeric"
              />
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categorySelector}>
                {(formData.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      formData.category === category && styles.categoryChipActive
                    ]}
                    onPress={() => setFormData({ ...formData, category })}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      formData.category === category && styles.categoryChipTextActive
                    ]}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.input}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Enter description"
              />
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddTransaction}
              disabled={isLoading}
            >
              <Text style={styles.addButtonText}>
                {isLoading ? 'Adding...' : 'Add Transaction'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expense Tracker</Text>
        <TouchableOpacity
          style={styles.addTransactionButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'summary' && styles.tabActive]}
          onPress={() => setViewMode('summary')}
        >
          <Text style={[
            styles.tabText,
            viewMode === 'summary' && styles.tabTextActive
          ]}>Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'transactions' && styles.tabActive]}
          onPress={() => setViewMode('transactions')}
        >
          <Text style={[
            styles.tabText,
            viewMode === 'transactions' && styles.tabTextActive
          ]}>Transactions</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === 'summary' ? renderSummaryView() : renderTransactionsView()}
      
      {/* Add Transaction Modal */}
      {renderAddTransactionModal()}
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
  addTransactionButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.textWhite,
  },
  scrollView: {
    flex: 1,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  monthText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    ...shadows.md,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  chartContainer: {
    backgroundColor: colors.backgroundLight,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  categoryContainer: {
  backgroundColor: colors.backgroundLight,
  margin: spacing.lg,
  marginTop: spacing.md, // <-- ensure separation
  borderRadius: borderRadius.lg,
  padding: spacing.md,
  ...shadows.md,
},
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryName: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  categoryPercentage: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  transactionsContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  transactionsList: {
    paddingBottom: spacing.xl,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  transactionCategory: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  transactionDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  separator: {
    height: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  modalForm: {
    padding: spacing.lg,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  typeButtonTextActive: {
    color: colors.textWhite,
  },
  inputGroup: {
    marginBottom: spacing.lg,
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
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.textWhite,
  },
  addButton: {
    ...commonStyles.button,
    marginTop: spacing.lg,
    ...shadows.md,
  },
  addButtonText: {
    ...commonStyles.buttonText,
  },
  // Tax badge styles
  taxBadge: {
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    marginBottom: spacing.xs,
  },
  taxBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
});

export default TrackerScreen;
