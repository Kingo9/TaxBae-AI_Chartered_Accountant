import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface TaxKnowledgeBase {
  sections: {
    '80C': string;
    '80D': string;
    '80E': string;
    '80G': string;
    '24': string;
    'LTCG': string;
    'STCG': string;
    'ITR': string;
  };
  calculations: {
    oldRegime: string;
    newRegime: string;
    hraExemption: string;
  };
  deadlines: {
    itr: string;
    tds: string;
    advance: string;
  };
}

export class GeminiChatbotService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private taxKnowledgeBase: TaxKnowledgeBase;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Same tax knowledge base as OpenAI version
    this.taxKnowledgeBase = {
      sections: {
        '80C': `Section 80C allows deduction up to ₹1.5 lakh for investments in ELSS, PPF, EPF, NSC, Tax Saver FD, life insurance premiums, principal repayment of home loan, tuition fees, ULIP, etc. These investments reduce taxable income and help save tax.`,
        
        '80D': `Section 80D provides deduction for medical insurance premiums. For individuals below 60: ₹25,000 for self/family + ₹25,000 for parents. For senior citizens (60+): ₹50,000 for self + ₹50,000 for parents. Additional ₹5,000 for preventive health checkup.`,
        
        '80E': `Section 80E allows deduction for interest paid on education loans for higher studies. No upper limit on deduction amount. Available for 8 years or until interest is paid, whichever is earlier. Applies only to interest component, not principal repayment.`,
        
        '80G': `Section 80G provides deduction for donations to eligible charities and NGOs. Some donations qualify for 100% deduction (PM CARES, CM Relief Fund), while others get 50% deduction. Always get receipts and verify 80G registration of recipient organization.`,
        
        '24': `Section 24 allows deduction for home loan interest. For self-occupied property: ₹2 lakh per year. For let-out property: no limit on interest deduction. Pre-construction interest can be claimed in 5 equal installments after completion.`,
        
        'LTCG': `Long Term Capital Gains on equity/mutual funds: Gains above ₹1 lakh taxed at 10%. For other assets: 20% with indexation benefit after 3 years (2 years for immovable property). Debt mutual funds: 20% with indexation after 3 years.`,
        
        'STCG': `Short Term Capital Gains: Equity/mutual funds taxed at 15%. Other assets taxed as per income tax slab. No indexation benefit available. Holding period: Less than 1 year for equity, less than 3 years for debt instruments.`,
        
        'ITR': `Income Tax Return must be filed by July 31st for individuals (extended dates may apply). ITR-1 for salary income, ITR-2 for multiple sources, ITR-3 for business income. Late filing attracts penalty of ₹5,000-₹10,000. E-verification within 120 days mandatory.`
      },
      
      calculations: {
        oldRegime: `Old Tax Regime: No tax up to ₹2.5 lakh. 5% for ₹2.5L-₹5L, 20% for ₹5L-₹10L, 30% for above ₹10L. All deductions under Chapter VI-A (80C, 80D, etc.) available. Standard deduction of ₹50,000 for salaried individuals.`,
        
        newRegime: `New Tax Regime (2023): No tax up to ₹3 lakh. 5% for ₹3L-₹6L, 10% for ₹6L-₹9L, 15% for ₹9L-₹12L, 20% for ₹12L-₹15L, 30% for above ₹15L. Most deductions not allowed except employer NPS, standard deduction ₹50,000.`,
        
        hraExemption: `HRA exemption is minimum of: (a) Actual HRA received, (b) 50% of salary for metro cities/40% for non-metro, (c) Actual rent minus 10% of salary. Available only if you pay rent and don't own house in the same city.`
      },
      
      deadlines: {
        itr: `ITR filing deadline: July 31st for individuals. Extended deadline may apply for certain cases. Late filing penalty: ₹5,000 (income up to ₹5L), ₹10,000 (above ₹5L). File even if no tax liability for carry forward of losses.`,
        
        tds: `TDS on salary: Monthly by employer. TDS on other income: On receipt/credit whichever is earlier. TDS rates: 10% on interest, 10% on dividends, 1% on property sale, 2% on property rent. TDS certificate (Form 16/16A) required.`,
        
        advance: `Advance tax due if tax liability exceeds ₹10,000. Payment dates: 15% by June 15, 45% by Sept 15, 75% by Dec 15, 100% by March 15. Interest at 1% per month for default. Self-assessment tax can be paid till filing date.`
      }
    };
  }

  // RAG: Retrieve relevant tax information based on query
  private retrieveRelevantContext(query: string): string {
    const queryLower = query.toLowerCase();
    let relevantContext = '';

    if (queryLower.includes('80c') || queryLower.includes('elss') || queryLower.includes('ppf') || queryLower.includes('tax saving')) {
      relevantContext += `${this.taxKnowledgeBase.sections['80C']} `;
    }

    if (queryLower.includes('80d') || queryLower.includes('medical') || queryLower.includes('health insurance')) {
      relevantContext += `${this.taxKnowledgeBase.sections['80D']} `;
    }

    if (queryLower.includes('80e') || queryLower.includes('education loan')) {
      relevantContext += `${this.taxKnowledgeBase.sections['80E']} `;
    }

    if (queryLower.includes('80g') || queryLower.includes('donation') || queryLower.includes('charity')) {
      relevantContext += `${this.taxKnowledgeBase.sections['80G']} `;
    }

    if (queryLower.includes('home loan') || queryLower.includes('housing loan') || queryLower.includes('section 24')) {
      relevantContext += `${this.taxKnowledgeBase.sections['24']} `;
    }

    if (queryLower.includes('capital gain') || queryLower.includes('ltcg') || queryLower.includes('long term')) {
      relevantContext += `${this.taxKnowledgeBase.sections['LTCG']} `;
    }

    if (queryLower.includes('stcg') || queryLower.includes('short term')) {
      relevantContext += `${this.taxKnowledgeBase.sections['STCG']} `;
    }

    if (queryLower.includes('itr') || queryLower.includes('return filing') || queryLower.includes('deadline')) {
      relevantContext += `${this.taxKnowledgeBase.sections['ITR']} ${this.taxKnowledgeBase.deadlines.itr} `;
    }

    if (queryLower.includes('old regime') || queryLower.includes('new regime') || queryLower.includes('tax regime')) {
      relevantContext += `${this.taxKnowledgeBase.calculations.oldRegime} ${this.taxKnowledgeBase.calculations.newRegime} `;
    }

    if (queryLower.includes('hra') || queryLower.includes('house rent')) {
      relevantContext += `${this.taxKnowledgeBase.calculations.hraExemption} `;
    }

    if (queryLower.includes('tds') || queryLower.includes('tax deducted')) {
      relevantContext += `${this.taxKnowledgeBase.deadlines.tds} `;
    }

    if (queryLower.includes('advance tax') || queryLower.includes('quarterly tax')) {
      relevantContext += `${this.taxKnowledgeBase.deadlines.advance} `;
    }

    return relevantContext.trim();
  }

  // Get user financial context for personalized responses
  private async getUserContext(userId: string): Promise<string> {
    try {
      const [transactions, user] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            type: true,
            amount: true,
            category: true,
            isTaxDeductible: true,
            taxSection: true,
          },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        }),
      ]);

      let context = `User: ${user?.name || 'User'}\n`;

      const expenses = transactions.filter(t => t.type === 'EXPENSE');
      const income = transactions.filter(t => t.type === 'INCOME');
      const taxSavings = transactions.filter(t => t.isTaxDeductible);

      if (expenses.length > 0) {
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        context += `Recent monthly expenses: ₹${totalExpenses.toLocaleString()}\n`;

        const categoryTotals: { [key: string]: number } = {};
        expenses.forEach(t => {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
        const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
          categoryTotals[a] > categoryTotals[b] ? a : b
        );
        context += `Highest spending category: ${topCategory} (₹${categoryTotals[topCategory].toLocaleString()})\n`;
      }

      if (income.length > 0) {
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        context += `Recent monthly income: ₹${totalIncome.toLocaleString()}\n`;
      }

      if (taxSavings.length > 0) {
        const totalTaxSavings = taxSavings.reduce((sum, t) => sum + t.amount, 0);
        const sections = [...new Set(taxSavings.map(t => t.taxSection).filter(Boolean))];
        context += `Current tax-saving investments: ₹${totalTaxSavings.toLocaleString()} (${sections.join(', ')})\n`;
      }

      return context;
    } catch (error) {
      console.error('Error getting user context:', error);
      return 'User financial data not available.\n';
    }
  }

  // Create system prompt with RAG context
  private createSystemPrompt(taxContext: string, userContext: string): string {
    return `You are TaxBae AI, an expert Indian tax advisor and financial planner. You provide accurate, helpful, and personalized advice on Indian taxation, investments, and financial planning.

KNOWLEDGE BASE:
${taxContext}

USER CONTEXT:
${userContext}

GUIDELINES:
1. Always provide accurate information based on current Indian tax laws (AY 2024-25)
2. Give practical, actionable advice
3. Use simple language and avoid jargon
4. Include specific amounts, deadlines, and procedures when relevant
5. Suggest tax-saving opportunities when appropriate
6. Be personalized based on user's financial situation
7. If unsure about recent changes, mention that tax laws may have updates
8. Always recommend consulting a CA for complex situations
9. Use emojis appropriately to make responses engaging
10. Keep responses concise but comprehensive

Remember: You're helping users save tax legally and plan their finances better. Be friendly, professional, and trustworthy.`;
  }

  // Generate AI response using Gemini with RAG context
  async generateResponse(
    userId: string,
    message: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // RAG: Retrieve relevant tax knowledge
      const taxContext = this.retrieveRelevantContext(message);
      
      // Get user's financial context
      const userContext = await this.getUserContext(userId);
      
      // Create system prompt with context
      const systemPrompt = this.createSystemPrompt(taxContext, userContext);

      // Prepare conversation for Gemini
      let fullPrompt = systemPrompt + '\n\n';
      
      // Add conversation history (last 5 messages for context)
      const recentHistory = conversationHistory.slice(-5);
      for (const msg of recentHistory) {
        if (msg.role === 'user') {
          fullPrompt += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          fullPrompt += `Assistant: ${msg.content}\n`;
        }
      }
      
      // Add current message
      fullPrompt += `User: ${message}\nAssistant: `;

      // Generate response with Gemini
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response.text();

      return response || "I'm sorry, I couldn't generate a response at the moment. Please try again.";
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      
      // Fallback response with basic tax info
      if (message.toLowerCase().includes('80c')) {
        return "💰 Section 80C allows you to save tax by investing up to ₹1.5 lakh in ELSS, PPF, EPF, NSC, and other qualifying instruments. This can save you up to ₹46,500 in tax (30% bracket). Would you like specific investment recommendations based on your profile?";
      }
      
      return "I apologize, but I'm experiencing technical difficulties. Please try asking your question again, or contact support if the issue persists.";
    }
  }

  // All other methods remain the same as OpenAI version...
  // (createChatSession, sendMessage, getChatSessions, etc.)
  
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
