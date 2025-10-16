import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class FallbackChatbotService {
  private taxResponses: { [key: string]: string };

  constructor() {
    // Pre-defined intelligent responses for common tax queries
    this.taxResponses = {
      '80c': `💰 **Section 80C Tax Deductions (Up to ₹1.5 Lakh)**

**Top Investment Options:**
• **ELSS Mutual Funds**: 3-year lock-in, market-linked returns (10-15% expected)
• **PPF**: 15-year lock-in, 7.1% tax-free returns
• **EPF**: Employer contribution, 8.25% returns
• **Life Insurance**: Premium up to 10% of sum assured
• **Home Loan Principal**: Reduces both EMI burden and taxes
• **NSC**: 5-year lock-in, 6.8% returns
• **Tax Saver FD**: 5-year lock-in, 5-7% returns

**Tax Savings**: Up to ₹46,500 in 30% bracket!

💡 **Pro Tip**: Diversify across ELSS (for growth) + PPF (for safety) for optimal returns.`,

      '80d': `🏥 **Section 80D - Health Insurance Deductions**

**Deduction Limits:**
• **Self & Family**: Up to ₹25,000 (₹50,000 if senior citizen)
• **Parents**: Additional ₹25,000 (₹50,000 if senior citizen)
• **Preventive Health Checkup**: Extra ₹5,000

**Maximum Total Deduction**: ₹1.05 Lakh per year!

**What Qualifies:**
✅ Health insurance premiums
✅ Mediclaim policies  
✅ Preventive health checkups
✅ Medical expenses for senior citizen parents

**Tax Savings**: Up to ₹31,500 in 30% tax bracket!`,

      'sip': `📈 **SIP (Systematic Investment Plan) Guide**

**How to Start:**
1. **Choose Amount**: Start with ₹1,000-5,000 monthly
2. **Select Funds**: Large Cap (stability) + Mid Cap (growth)
3. **Tax-Saving**: Include ELSS for 80C benefits
4. **Auto-Debit**: Set up bank mandate

**Recommended SIP Portfolio:**
• **40%** Large Cap Funds (Safe)
• **30%** ELSS Funds (Tax-saving)
• **20%** Mid/Small Cap (Growth)  
• **10%** International Funds (Diversification)

**Expected Returns**: 12-15% annually over 10+ years
**Power of Compounding**: ₹5,000 monthly = ₹1.17 Cr in 20 years!

🎯 **Action**: Start today, increase 10% annually!`,

      'tax': `💼 **Indian Tax Guide (AY 2024-25)**

**New Tax Regime (Recommended for most):**
• No tax up to ₹3 lakh
• 5% on ₹3-6 lakh  
• 10% on ₹6-9 lakh
• 15% on ₹9-12 lakh
• 20% on ₹12-15 lakh
• 30% above ₹15 lakh

**Old Tax Regime:**
• Higher tax rates but more deductions available
• Better if you have significant 80C, 80D investments

**Key Deductions:**
• 80C: ₹1.5 lakh (Investments)
• 80D: ₹1.05 lakh (Health Insurance)  
• 24(b): ₹2 lakh (Home Loan Interest)
• Standard Deduction: ₹50,000

🎯 **Choose regime based on your deductions!**`,

      'emi': `🏠 **EMI Planning & Calculation**

**Golden Rules:**
• **Total EMIs ≤ 40%** of monthly income
• **Home Loan**: Longest tenure for tax benefits
• **Personal Loan**: Pay off quickly (high interest)
• **Car Loan**: 3-5 years maximum

**EMI Formula**: 
EMI = P × r × (1+r)^n / [(1+r)^n - 1]

**Tax Benefits on Home Loans:**
• **Principal**: ₹1.5 lakh under 80C
• **Interest**: ₹2 lakh under 24(b)
• **Total Tax Saving**: Up to ₹1.05 lakh annually!

**Pro Tips:**
✅ Compare rates across banks
✅ Consider part-prepayment  
✅ Check for hidden charges
✅ Maintain good credit score (750+)

💡 Need specific calculation? Share loan amount, rate & tenure!`,

      'investment': `📊 **Smart Investment Strategy for Indians**

**Asset Allocation by Age:**
• **20-30 years**: 70% Equity, 20% Debt, 10% Gold
• **30-40 years**: 60% Equity, 30% Debt, 10% Gold  
• **40-50 years**: 50% Equity, 40% Debt, 10% Gold
• **50+ years**: 40% Equity, 50% Debt, 10% Gold

**Investment Priority:**
1. **Emergency Fund** (6 months expenses)
2. **Health Insurance** (₹10+ lakh cover)
3. **ELSS/PPF** (Tax saving)
4. **Equity Mutual Funds** (Long-term wealth)
5. **Real Estate** (After significant corpus)

**Monthly Investment Plan:**
• 20% in ELSS (Tax + Growth)
• 30% in Large Cap Funds
• 20% in Mid Cap Funds  
• 20% in PPF/Debt
• 10% in Gold ETF

🎯 **Start with ₹5,000 monthly, increase by 10% yearly!**`,

      'insurance': `🛡️ **Insurance Planning Guide**

**Essential Covers:**
1. **Term Life Insurance**: 10-15x annual income
2. **Health Insurance**: ₹10+ lakh family floater
3. **Disability Insurance**: Through employer
4. **Vehicle Insurance**: Comprehensive

**Health Insurance Strategy:**
• **Base Policy**: ₹5-10 lakh  
• **Top-up Policy**: Additional ₹20-50 lakh
• **Critical Illness**: Separate ₹25+ lakh cover
• **Parents**: Senior citizen plans

**Life Insurance Calculation:**
Annual Income × 10-15 = Required Cover
Example: ₹10 lakh income = ₹1-1.5 Cr term cover

**Tax Benefits:**
• Health Insurance: Up to ₹1.05 lakh (80D)
• Life Insurance: Premium under 80C
• Maturity: Tax-free in many cases

💡 **Buy young, save more on premiums!**`,

      'default': `🤖 **TaxBae AI Assistant**

I can help you with:

💰 **Tax Planning**
• Section 80C, 80D deductions
• Old vs New tax regime comparison
• Tax-saving investment strategies

📈 **Investments**  
• SIP planning & fund selection
• Asset allocation strategies
• Retirement planning

🏠 **Loans & EMIs**
• EMI calculations
• Home loan tax benefits
• Debt optimization

🛡️ **Insurance**
• Health insurance planning  
• Life insurance calculations
• Tax-efficient insurance

❓ **Ask me about**: "80C deductions", "SIP planning", "EMI calculation", "tax regime", "health insurance", etc.

*Note: For complex situations, please consult a qualified Chartered Accountant.*`
    };
  }

  // Smart response matching
  private getResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific keywords and return appropriate response
    if (lowerMessage.includes('80c') || lowerMessage.includes('elss') || lowerMessage.includes('ppf') || lowerMessage.includes('tax saving')) {
      return this.taxResponses['80c'];
    }
    
    if (lowerMessage.includes('80d') || lowerMessage.includes('health insurance') || lowerMessage.includes('medical insurance')) {
      return this.taxResponses['80d'];
    }
    
    if (lowerMessage.includes('sip') || lowerMessage.includes('systematic investment')) {
      return this.taxResponses['sip'];
    }
    
    if (lowerMessage.includes('tax regime') || lowerMessage.includes('tax rate') || lowerMessage.includes('income tax')) {
      return this.taxResponses['tax'];
    }
    
    if (lowerMessage.includes('emi') || lowerMessage.includes('loan') || lowerMessage.includes('equated monthly')) {
      return this.taxResponses['emi'];
    }
    
    if (lowerMessage.includes('investment') || lowerMessage.includes('mutual fund') || lowerMessage.includes('portfolio')) {
      return this.taxResponses['investment'];
    }
    
    if (lowerMessage.includes('insurance') || lowerMessage.includes('cover') || lowerMessage.includes('premium')) {
      return this.taxResponses['insurance'];
    }
    
    // Default response
    return this.taxResponses['default'];
  }

  async generateResponse(userId: string, message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      // Add personalization based on user context (if available)
      const baseResponse = this.getResponse(message);
      
      // Add user's name if available
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true }
        });
        
        if (user?.name) {
          return `Hi ${user.name}! 👋\n\n${baseResponse}`;
        }
      } catch (error) {
        // Continue with base response if user lookup fails
      }
      
      return baseResponse;
    } catch (error) {
      console.error('Fallback chatbot error:', error);
      return this.taxResponses['default'];
    }
  }

  // All the same methods as the original service
  async createChatSession(userId: string, initialMessage?: string): Promise<any> {
    try {
      const session = await prisma.chatSession.create({
        data: {
          userId,
          title: initialMessage ? 
            `${initialMessage.substring(0, 50)}${initialMessage.length > 50 ? '...' : ''}` :
            'New Tax Consultation',
          isActive: true,
        },
      });

      if (initialMessage) {
        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: 'USER',
            content: initialMessage,
          },
        });

        const aiResponse = await this.generateResponse(userId, initialMessage);
        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: 'ASSISTANT',
            content: aiResponse,
          },
        });
      }

      return session;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  async sendMessage(sessionId: string, userId: string, message: string): Promise<any> {
    try {
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId,
          isActive: true,
        },
      });

      if (!session) {
        throw new Error('Chat session not found or inactive');
      }

      const history = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: 20,
      });

      const conversationHistory: ChatMessage[] = history.map(msg => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        content: msg.content,
      }));

      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: 'USER',
          content: message,
        },
      });

      const aiResponse = await this.generateResponse(userId, message, conversationHistory);

      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: 'ASSISTANT',
          content: aiResponse,
        },
      });

      return {
        userMessage: { role: 'USER', content: message },
        assistantMessage: { role: 'ASSISTANT', content: aiResponse },
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getChatSessions(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const sessions = await prisma.chatSession.findMany({
        where: { userId, isActive: true },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: { messages: true },
          },
        },
      });

      return sessions.map(session => ({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session._count.messages,
        lastMessage: session.messages[0]?.content,
        lastMessageTime: session.messages[0]?.createdAt,
      }));
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      throw error;
    }
  }

  async getChatMessages(sessionId: string, userId: string): Promise<any[]> {
    try {
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
      });

      if (!session) {
        throw new Error('Chat session not found');
      }

      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
      });

      return messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
      }));
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  }

  async deleteChatSession(sessionId: string, userId: string): Promise<void> {
    try {
      await prisma.chatSession.updateMany({
        where: {
          id: sessionId,
          userId,
        },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
  }

  async getQuickTips(): Promise<string[]> {
    const currentMonth = new Date().getMonth() + 1;
    const tips = [];

    if (currentMonth >= 1 && currentMonth <= 3) {
      tips.push("🗓️ Financial Year ending soon! Complete your tax-saving investments before March 31st");
      tips.push("📊 Review your Form 16 and gather investment proofs for ITR filing");
    }

    if (currentMonth >= 4 && currentMonth <= 7) {
      tips.push("📄 ITR filing season! File your return before July 31st to avoid penalties");
      tips.push("🏦 Check if you need to pay advance tax for the new financial year");
    }

    if (currentMonth >= 10 && currentMonth <= 12) {
      tips.push("💼 Plan your tax-saving investments - ELSS, PPF, NSC still have time!");
      tips.push("📈 Review your portfolio performance and rebalance if needed");
    }

    tips.push("💡 Keep all your investment receipts organized for easy ITR filing");
    tips.push("🎯 SIP in ELSS funds can help you save tax while building wealth");

    return tips.slice(0, 3);
  }
}
