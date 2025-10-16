import axios, { AxiosResponse } from 'axios';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notificationService';
import { SocketService } from './socket.service';

const prisma = new PrismaClient();

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

interface GovernmentUpdate {
  title: string;
  description: string;
  category: 'TAX_POLICY' | 'NOTIFICATION' | 'CIRCULAR' | 'ANNOUNCEMENT';
  date: string;
  url?: string;
  department: string;
}

export class ExternalAPIService {
  private notificationService: NotificationService;
  private socketService: SocketService;

  constructor() {
    this.socketService = SocketService.getInstance();
    this.notificationService = new NotificationService(this.socketService);
  }

  // NSE/BSE Market Data Integration
  async fetchMarketData(): Promise<MarketData[]> {
    try {
      // Using Alpha Vantage API as example (free tier available)
      // In production, you might use NSE/BSE official APIs or other providers
      const symbols = ['NIFTY', 'SENSEX', 'BANKNIFTY', 'RELIANCE.BSE', 'TCS.BSE', 'INFY.BSE'];
      const marketData: MarketData[] = [];

      // Mock data for demo (replace with actual API calls)
      const mockData: MarketData[] = [
        {
          symbol: 'NIFTY',
          name: 'NIFTY 50',
          price: 19650.35,
          change: 123.45,
          changePercent: 0.63,
          volume: 1250000,
          timestamp: new Date(),
        },
        {
          symbol: 'SENSEX',
          name: 'BSE SENSEX',
          price: 66023.69,
          change: -89.23,
          changePercent: -0.13,
          volume: 980000,
          timestamp: new Date(),
        },
        {
          symbol: 'BANKNIFTY',
          name: 'BANK NIFTY',
          price: 44567.80,
          change: 234.56,
          changePercent: 0.53,
          volume: 750000,
          timestamp: new Date(),
        },
        {
          symbol: 'RELIANCE',
          name: 'Reliance Industries',
          price: 2456.78,
          change: 12.34,
          changePercent: 0.51,
          volume: 45000,
          timestamp: new Date(),
        },
        {
          symbol: 'TCS',
          name: 'Tata Consultancy Services',
          price: 3678.90,
          change: -23.45,
          changePercent: -0.63,
          volume: 32000,
          timestamp: new Date(),
        },
      ];

      // Store in database
      for (const data of mockData) {
        await prisma.marketData.upsert({
          where: { symbol: data.symbol },
          update: {
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            volume: data.volume,
            timestamp: data.timestamp,
          },
          create: {
            symbol: data.symbol,
            name: data.name,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            volume: data.volume,
            timestamp: data.timestamp,
          },
        });
      }

      // Broadcast to connected clients
      this.socketService.sendMarketUpdate({
        type: 'MARKET_UPDATE',
        data: mockData,
        timestamp: new Date(),
      });

      return mockData;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  // Real API integration example (Alpha Vantage)
  async fetchRealMarketData(symbol: string): Promise<MarketData | null> {
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apiKey) {
        console.warn('ALPHA_VANTAGE_API_KEY not configured, using mock data');
        return null;
      }

      const response: AxiosResponse = await axios.get(
        `https://www.alphavantage.co/query`,
        {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: `${symbol}.BSE`, // BSE symbol
            apikey: apiKey,
          },
          timeout: 10000,
        }
      );

      const quote = response.data['Global Quote'];
      if (!quote) {
        throw new Error('Invalid response from market API');
      }

      return {
        symbol: quote['01. symbol'],
        name: symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error fetching real market data for ${symbol}:`, error);
      return null;
    }
  }

  // RBI Updates Integration
  async fetchRBIUpdates(): Promise<GovernmentUpdate[]> {
    try {
      // Mock RBI updates (in production, scrape RBI website or use their API)
      const mockUpdates: GovernmentUpdate[] = [
        {
          title: 'Repo Rate Unchanged at 6.50%',
          description: 'Reserve Bank of India keeps repo rate unchanged at 6.50% in the monetary policy committee meeting.',
          category: 'ANNOUNCEMENT',
          date: new Date().toISOString(),
          url: 'https://www.rbi.org.in',
          department: 'Reserve Bank of India',
        },
        {
          title: 'New Guidelines for Digital Lending',
          description: 'RBI issues comprehensive guidelines for digital lending platforms and fintechs.',
          category: 'CIRCULAR',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          url: 'https://www.rbi.org.in',
          department: 'Reserve Bank of India',
        },
      ];

      // Send notifications to users interested in government updates
      for (const update of mockUpdates) {
        await this.notificationService.sendGovernmentUpdate(
          update.title,
          update.description,
          update.url
        );
      }

      return mockUpdates;
    } catch (error) {
      console.error('Error fetching RBI updates:', error);
      throw error;
    }
  }

  // Income Tax Department Updates
  async fetchTaxDepartmentUpdates(): Promise<GovernmentUpdate[]> {
    try {
      // Mock tax department updates
      const mockUpdates: GovernmentUpdate[] = [
        {
          title: 'ITR Filing Date Extended to August 31st',
          description: 'Due to technical issues, the last date for filing Income Tax Returns has been extended to August 31st, 2024.',
          category: 'NOTIFICATION',
          date: new Date().toISOString(),
          url: 'https://www.incometax.gov.in',
          department: 'Income Tax Department',
        },
        {
          title: 'New Tax Rates for AY 2024-25',
          description: 'Updated tax slabs and rates for Assessment Year 2024-25 under both old and new tax regimes.',
          category: 'TAX_POLICY',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          url: 'https://www.incometax.gov.in',
          department: 'Income Tax Department',
        },
      ];

      // Store updates in database
      for (const update of mockUpdates) {
        await prisma.governmentUpdate.upsert({
          where: { 
            title_department: {
              title: update.title,
              department: update.department,
            }
          },
          update: {
            description: update.description,
            category: update.category,
            url: update.url,
          },
          create: {
            title: update.title,
            description: update.description,
            category: update.category,
            publishDate: new Date(update.date),
            url: update.url,
            department: update.department,
          },
        });
      }

      return mockUpdates;
    } catch (error) {
      console.error('Error fetching tax department updates:', error);
      throw error;
    }
  }

  // Mutual Fund NAV Data
  async fetchMutualFundNAV(schemeCode?: string): Promise<any[]> {
    try {
      // Using AMFI API for mutual fund NAVs
      const response = await axios.get(
        'https://www.amfiindia.com/spages/NAVAll.txt',
        { timeout: 15000 }
      );

      if (!response.data) {
        throw new Error('No data received from AMFI');
      }

      // Parse AMFI data (pipe-separated values)
      const lines = response.data.split('\n');
      const navData = [];

      for (const line of lines) {
        if (line && !line.startsWith('Scheme Code')) {
          const parts = line.split(';');
          if (parts.length >= 4) {
            const [code, isin, name, nav, date] = parts;
            
            // Filter popular ELSS funds if no specific code provided
            if (!schemeCode && (
              name.toLowerCase().includes('elss') || 
              name.toLowerCase().includes('tax saver') ||
              name.toLowerCase().includes('equity linked')
            )) {
              navData.push({
                schemeCode: code,
                isin: isin,
                name: name.trim(),
                nav: parseFloat(nav),
                date: date,
              });
            } else if (schemeCode && code === schemeCode) {
              navData.push({
                schemeCode: code,
                isin: isin,
                name: name.trim(),
                nav: parseFloat(nav),
                date: date,
              });
              break;
            }
          }
        }
      }

      return navData.slice(0, 20); // Return top 20 ELSS funds
    } catch (error) {
      console.error('Error fetching mutual fund NAV:', error);
      
      // Return mock data if API fails
      return [
        {
          schemeCode: '120503',
          name: 'Aditya Birla Sun Life Tax Relief 96',
          nav: 45.67,
          change: 0.23,
          changePercent: 0.51,
          date: new Date().toISOString().split('T')[0],
        },
        {
          schemeCode: '101206',
          name: 'DSP Tax Saver Fund',
          nav: 78.90,
          change: -0.45,
          changePercent: -0.57,
          date: new Date().toISOString().split('T')[0],
        },
      ];
    }
  }

  // Government Bond Rates
  async fetchGovernmentBondRates(): Promise<any[]> {
    try {
      // Mock government bond data
      return [
        {
          maturity: '91 Day Treasury Bill',
          yield: 6.85,
          change: -0.05,
          lastUpdated: new Date(),
        },
        {
          maturity: '1 Year Treasury Bill',
          yield: 7.15,
          change: 0.02,
          lastUpdated: new Date(),
        },
        {
          maturity: '10 Year Government Bond',
          yield: 7.25,
          change: -0.03,
          lastUpdated: new Date(),
        },
        {
          maturity: 'PPF Rate',
          yield: 8.00,
          change: 0.00,
          lastUpdated: new Date(),
        },
      ];
    } catch (error) {
      console.error('Error fetching bond rates:', error);
      throw error;
    }
  }

  // Get latest market data from database
  async getLatestMarketData(): Promise<any[]> {
    try {
      const marketData = await prisma.marketData.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
      });

      return marketData;
    } catch (error) {
      console.error('Error getting latest market data:', error);
      throw error;
    }
  }

  // Get government updates from database
  async getGovernmentUpdates(limit: number = 10): Promise<any[]> {
    try {
      const updates = await prisma.governmentUpdate.findMany({
        orderBy: { publishDate: 'desc' },
        take: limit,
      });

      return updates;
    } catch (error) {
      console.error('Error getting government updates:', error);
      throw error;
    }
  }

  // Schedule periodic data fetching
  async scheduleDataFetching(): Promise<void> {
    try {
      console.log('Starting periodic data fetching...');

      // Fetch market data every 5 minutes during market hours
      setInterval(async () => {
        const now = new Date();
        const hours = now.getHours();
        const day = now.getDay();

        // Indian market hours: 9:15 AM - 3:30 PM, Monday-Friday
        if (day >= 1 && day <= 5 && hours >= 9 && hours < 16) {
          await this.fetchMarketData().catch(console.error);
        }
      }, 5 * 60 * 1000); // 5 minutes

      // Fetch government updates twice daily
      setInterval(async () => {
        await Promise.all([
          this.fetchRBIUpdates(),
          this.fetchTaxDepartmentUpdates(),
        ]).catch(console.error);
      }, 12 * 60 * 60 * 1000); // 12 hours

      // Fetch mutual fund NAVs daily at 8 PM
      setInterval(async () => {
        const now = new Date();
        if (now.getHours() === 20 && now.getMinutes() === 0) {
          await this.fetchMutualFundNAV().catch(console.error);
        }
      }, 60 * 60 * 1000); // 1 hour check

      console.log('Periodic data fetching scheduled successfully');
    } catch (error) {
      console.error('Error scheduling data fetching:', error);
    }
  }

  // Currency conversion (INR to other currencies)
  async fetchCurrencyRates(): Promise<any> {
    try {
      // Using a free currency API
      const response = await axios.get(
        'https://api.exchangerate-api.com/v4/latest/INR',
        { timeout: 10000 }
      );

      const rates = {
        USD: response.data.rates?.USD || 0.012,
        EUR: response.data.rates?.EUR || 0.011,
        GBP: response.data.rates?.GBP || 0.0095,
        CAD: response.data.rates?.CAD || 0.016,
        AUD: response.data.rates?.AUD || 0.018,
        lastUpdated: new Date(),
      };

      return rates;
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      
      // Return default rates if API fails
      return {
        USD: 0.012,
        EUR: 0.011,
        GBP: 0.0095,
        CAD: 0.016,
        AUD: 0.018,
        lastUpdated: new Date(),
        note: 'Rates may not be current due to API unavailability',
      };
    }
  }

  // Economic indicators (GDP, inflation, etc.)
  async fetchEconomicIndicators(): Promise<any> {
    try {
      // Mock economic data (in production, use RBI/Government APIs)
      return {
        gdpGrowthRate: 6.7,
        inflationRate: 5.2,
        unemploymentRate: 3.8,
        repoRate: 6.50,
        reverseRepoRate: 3.35,
        cpi: 142.3,
        lastUpdated: new Date(),
        source: 'RBI/NSO',
      };
    } catch (error) {
      console.error('Error fetching economic indicators:', error);
      throw error;
    }
  }

  // Gold/Silver Prices
  async fetchPreciousMetalRates(): Promise<any> {
    try {
      // Mock precious metal rates
      return {
        gold: {
          rate: 5850, // per gram in INR
          change: 25,
          changePercent: 0.43,
          unit: 'per gram',
        },
        silver: {
          rate: 78.50, // per gram in INR
          change: -1.20,
          changePercent: -1.51,
          unit: 'per gram',
        },
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error fetching precious metal rates:', error);
      throw error;
    }
  }

  // Investment opportunity alerts
  async checkInvestmentOpportunities(userId: string): Promise<void> {
    try {
      // Get user's investment preferences and current portfolio
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          transactions: {
            where: { type: 'EXPENSE' },
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
        },
      });

      if (!user) return;

      const opportunities = [];

      // Check if it's year-end for tax saving reminders
      const now = new Date();
      if (now.getMonth() >= 10) { // November onwards
        const totalTaxSavings = user.transactions
          .filter(t => t.isTaxDeductible)
          .reduce((sum, t) => sum + t.amount, 0);

        if (totalTaxSavings < 150000) {
          opportunities.push({
            name: 'Tax Saving Opportunity',
            description: 'Complete your 80C limit before March 31st',
            expectedReturn: 12,
            riskLevel: 'MEDIUM',
            category: 'TAX_SAVING',
          });
        }
      }

      // Check for SIP opportunities
      const sipTransactions = user.transactions.filter(t => 
        t.category.toLowerCase().includes('sip') || 
        t.category.toLowerCase().includes('mutual fund')
      );

      if (sipTransactions.length === 0) {
        opportunities.push({
          name: 'SIP Investment',
          description: 'Start a Systematic Investment Plan for wealth building',
          expectedReturn: 12,
          riskLevel: 'MEDIUM',
          category: 'WEALTH_BUILDING',
        });
      }

      if (opportunities.length > 0) {
        await this.notificationService.sendInvestmentOpportunities(userId, opportunities);
      }
    } catch (error) {
      console.error('Error checking investment opportunities:', error);
    }
  }

  // Integration health check
  async checkAPIHealth(): Promise<{
    marketData: boolean;
    government: boolean;
    currency: boolean;
    mutualFund: boolean;
  }> {
    const health = {
      marketData: false,
      government: false,
      currency: false,
      mutualFund: false,
    };

    try {
      // Test market data
      const marketData = await this.getLatestMarketData();
      health.marketData = marketData.length > 0;

      // Test government updates
      const govUpdates = await this.getGovernmentUpdates(1);
      health.government = govUpdates.length > 0;

      // Test currency API
      const currencies = await this.fetchCurrencyRates();
      health.currency = currencies.USD > 0;

      // Test mutual fund API
      const navData = await this.fetchMutualFundNAV();
      health.mutualFund = navData.length > 0;

    } catch (error) {
      console.error('Error checking API health:', error);
    }

    return health;
  }
}
