/**
 * Sample Chatbot for TaxBae App
 * Generates mock conversational responses for tax and financial queries
 */

// Sample knowledge base for tax queries
export const TAX_KNOWLEDGE_BASE = {
  // Common tax queries and responses
  queries: {
    'what is section 80c': {
      response: `Section 80C allows you to claim deductions up to ₹1.5 lakh on investments like:
      
📈 ELSS mutual funds
🏛️ PPF (Public Provident Fund)
💼 EPF contributions
🏠 Home loan principal
🎓 Tuition fees
💡 Life insurance premiums

These investments not only save tax but also help build wealth! 💰`,
      category: 'tax_sections',
      confidence: 0.95
    },
    
    'section 80d medical insurance': {
      response: `Section 80D offers great tax benefits on health insurance! 🏥

For individuals under 60:
• ₹25,000 for self & family
• ₹25,000 for parents
• ₹5,000 for preventive health checkup

For senior citizens (60+):
• ₹50,000 for self
• ₹50,000 for parents

Remember: Health insurance is not just tax-saving, it's essential protection! 🛡️`,
      category: 'tax_sections',
      confidence: 0.98
    },
    
    'old vs new tax regime': {
      response: `Let me explain both regimes! 📊

**Old Regime:**
• Lower tax rates but with deductions
• All 80C, 80D benefits available
• Good if you have many investments

**New Regime (2023):**
• Higher exemption limit (₹3L)
• Limited deductions allowed
• Simpler calculation

💡 **Quick tip:** Calculate tax under both regimes and choose the one with lower tax liability!

Would you like me to help compare based on your income?`,
      category: 'tax_regimes',
      confidence: 0.92
    },
    
    'how to save tax': {
      response: `Here are the best tax-saving strategies! 💡

🎯 **Quick wins:**
• ELSS mutual funds (₹1.5L under 80C)
• Health insurance (₹25K under 80D)
• NPS investment (₹50K under 80CCD(1B))

🏠 **If you have home loan:**
• Principal payment (80C)
• Interest payment (24B)

📚 **Other options:**
• Education loan interest (80E)
• Donations to PM CARES (80G)

Start with ELSS - it saves tax AND creates wealth! 📈`,
      category: 'tax_planning',
      confidence: 0.94
    },
    
    'when to file itr': {
      response: `ITR filing deadline is **July 31st** for most individuals! 📅

⏰ **Important dates:**
• Original deadline: July 31
• Extended deadline: Sometimes given
• Late filing penalty: ₹5,000-10,000

🚨 **Pro tip:** Don't wait till the last moment! File by June end to avoid the rush.

Which ITR form do you need? I can help you identify! 📝`,
      category: 'compliance',
      confidence: 0.96
    },
    
    'nps national pension system': {
      response: `NPS is an excellent retirement planning tool! 🚀

**Tax Benefits:**
• Section 80CCD(1): Up to 10% of salary
• Section 80CCD(1B): Additional ₹50,000
• Section 80CCD(2): Employer contribution

**NPS Features:**
🎯 Professional fund management
💰 Low cost (0.01-2.5% charges)
🌍 Portable across jobs
🔒 Lock-in till age 60

**Asset Allocation:**
• Equity: 0-75%
• Corporate bonds: 0-100%
• Government securities: 0-100%

Start early to build a strong retirement corpus! 🎆`,
      category: 'investment',
      confidence: 0.93
    },
    
    'home loan tax benefits': {
      response: `Home loans offer fantastic tax benefits! 🏠💰

**Section 24(b) - Interest Benefit:**
• Self-occupied: Up to ₹2 lakh
• Let-out property: No limit

**Section 80C - Principal Benefit:**
• Up to ₹1.5 lakh (part of 80C limit)

**Section 80EEA (First-time buyers):**
• Additional ₹1.5 lakh interest benefit
• Property value < ₹45 lakh

**Documentation needed:**
📄 Loan certificate from bank
📄 Property registration documents
📄 Possession certificate

**Smart tip:** Complete documentation before March 31st! 📅`,
      category: 'tax_sections',
      confidence: 0.95
    }
  },
  
  // Fallback responses for different categories
  fallbacks: {
    tax_planning: [
      "That's a great tax planning question! 🤔 Could you be more specific about your situation?",
      "I'd love to help with your tax planning! Can you share more details about your income or investments?",
      "Tax planning can be complex, but I'm here to help! What specific aspect are you curious about?"
    ],
    investment: [
      "Investment questions are my favorite! 📈 What type of investment are you considering?",
      "Smart thinking about investments! Are you looking for tax-saving options or general investment advice?",
      "Let's explore investment options together! What's your risk appetite and investment horizon?"
    ],
    compliance: [
      "Compliance is crucial! 📋 Which specific requirement are you asking about?",
      "I can help with tax compliance! Are you asking about ITR filing, TDS, or something else?",
      "Staying compliant is smart! What compliance topic can I assist you with?"
    ],
    general: [
      "That's an interesting question! 💭 Could you provide a bit more context?",
      "I'm here to help with all your tax and finance queries! Can you elaborate on what you're looking for?",
      "Great question! To give you the best answer, could you share some more details?"
    ]
  }
};

// Sample conversation starters
export const CONVERSATION_STARTERS = [
  {
    text: "How can I save tax this year?",
    category: "tax_planning",
    icon: "💰"
  },
  {
    text: "Explain Section 80C benefits",
    category: "tax_sections", 
    icon: "📚"
  },
  {
    text: "Should I choose old or new tax regime?",
    category: "tax_regimes",
    icon: "⚖️"
  },
  {
    text: "When should I file my ITR?",
    category: "compliance",
    icon: "📅"
  },
  {
    text: "Best investment options for tax saving",
    category: "investment",
    icon: "📈"
  },
  {
    text: "How does home loan save tax?",
    category: "tax_sections",
    icon: "🏠"
  }
];

// Sample quick tips
export const QUICK_TIPS = [
  {
    title: "Tax Saving Deadline ⏰",
    message: "Don't forget to complete your tax-saving investments by March 31st to claim deductions!",
    category: "reminder",
    priority: "high"
  },
  {
    title: "ITR Filing Tip 📝",
    message: "Keep all your investment receipts ready - you'll need them for ITR filing!",
    category: "compliance",
    priority: "medium"
  },
  {
    title: "Health Insurance 🏥",
    message: "Health insurance premiums not only provide coverage but also save tax under Section 80D!",
    category: "tax_planning",
    priority: "medium"
  },
  {
    title: "ELSS Investment 📈",
    message: "ELSS mutual funds have the shortest lock-in period (3 years) among 80C investments!",
    category: "investment",
    priority: "low"
  },
  {
    title: "Advance Tax 💳",
    message: "If your tax liability exceeds ₹10,000, you need to pay advance tax in 4 instalments!",
    category: "compliance",
    priority: "high"
  }
];

// Function to generate contextual responses
export const generateChatResponse = (userMessage, userContext = {}) => {
  const message = userMessage.toLowerCase().trim();
  const userName = userContext.userName || 'there';
  
  // Enhanced greeting with user name
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return {
      text: `Hello ${userName}! 👋 Welcome to TaxBae AI!

I'm here to help you with:
• Tax planning & saving strategies 💰
• Investment guidance 📈
• ITR filing assistance 📝
• Section-wise deduction explanations 📚
• Personalized financial advice 🎯

What would you like to know about today?`,
      category: 'greeting',
      confidence: 0.95,
      suggestions: CONVERSATION_STARTERS.slice(0, 3).map(s => s.text),
      timestamp: new Date().toISOString()
    };
  }
  
  // Check for exact matches first
  for (const [key, value] of Object.entries(TAX_KNOWLEDGE_BASE.queries)) {
    if (message.includes(key.toLowerCase()) || 
        key.toLowerCase().split(' ').some(word => message.includes(word) && word.length > 3)) {
      return {
        text: value.response,
        category: value.category,
        confidence: value.confidence,
        suggestions: getSuggestions(value.category),
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Pattern matching for common queries
  if (message.includes('save tax') || message.includes('tax saving')) {
    return {
      text: TAX_KNOWLEDGE_BASE.queries['how to save tax'].response,
      category: 'tax_planning',
      confidence: 0.88,
      suggestions: getSuggestions('tax_planning'),
      timestamp: new Date().toISOString()
    };
  }
  
  if (message.includes('80c') || message.includes('section 80c')) {
    return {
      text: TAX_KNOWLEDGE_BASE.queries['what is section 80c'].response,
      category: 'tax_sections',
      confidence: 0.90,
      suggestions: getSuggestions('tax_sections'),
      timestamp: new Date().toISOString()
    };
  }
  
  if (message.includes('health insurance') || message.includes('medical insurance')) {
    return {
      text: TAX_KNOWLEDGE_BASE.queries['section 80d medical insurance'].response,
      category: 'tax_sections',
      confidence: 0.92,
      suggestions: getSuggestions('tax_sections'),
      timestamp: new Date().toISOString()
    };
  }
  
  if (message.includes('regime') || (message.includes('old') && message.includes('new'))) {
    return {
      text: TAX_KNOWLEDGE_BASE.queries['old vs new tax regime'].response,
      category: 'tax_regimes',
      confidence: 0.89,
      suggestions: getSuggestions('tax_regimes'),
      timestamp: new Date().toISOString()
    };
  }
  
  if (message.includes('itr') || message.includes('file') || message.includes('return')) {
    return {
      text: TAX_KNOWLEDGE_BASE.queries['when to file itr'].response,
      category: 'compliance',
      confidence: 0.91,
      suggestions: getSuggestions('compliance'),
      timestamp: new Date().toISOString()
    };
  }
  
  // Investment related queries
  if (message.includes('invest') || message.includes('mutual fund') || message.includes('sip')) {
    return {
      text: `Great question about investments! 📈

Here are some popular tax-saving investment options:

🏆 **ELSS Mutual Funds:**
• Best for wealth creation + tax saving
• 3-year lock-in period
• Potential for higher returns

💰 **PPF (Public Provident Fund):**
• 15-year lock-in
• Tax-free returns
• Currently ~7.1% interest rate

🏦 **NPS (National Pension System):**
• Additional ₹50K deduction
• Retirement-focused investment
• Market-linked returns

Which investment option interests you the most? 🤔`,
      category: 'investment',
      confidence: 0.85,
      suggestions: getSuggestions('investment'),
      timestamp: new Date().toISOString()
    };
  }
  
  // Additional comprehensive patterns
  if (message.includes('emi') || message.includes('loan calculator')) {
    return {
      text: `EMI Calculator Help! 📊

I can help you calculate EMI for:
• Home loans 🏠
• Car loans 🚗
• Personal loans 💳
• Education loans 🎓

EMI = [P x R x (1+R)^N] / [(1+R)^N-1]

Where:
• P = Principal loan amount
• R = Monthly interest rate
• N = Number of monthly installments

💡 **Pro tip:** Lower interest rates and longer tenure reduce EMI but increase total interest paid!`,
      category: 'calculators',
      confidence: 0.92,
      suggestions: ['Calculate home loan EMI', 'Compare loan options', 'Tax benefits on home loan'],
      timestamp: new Date().toISOString()
    };
  }
  
  if (message.includes('sip') || (message.includes('systematic') && message.includes('investment'))) {
    return {
      text: `SIP (Systematic Investment Plan) is great! 📈

**Benefits of SIP:**
• Rupee cost averaging
• Power of compounding
• Disciplined investing
• Flexibility to start/stop

**Best SIP Options:**
🏆 ELSS funds (Tax saving + Growth)
🔅 Index funds (Low cost, market returns)
🎯 Balanced funds (Moderate risk)
🚀 Large cap funds (Stable growth)

**SIP Amount Suggestion:**
Start with 10-15% of your monthly income

Ready to start your wealth creation journey? 🎆`,
      category: 'investment',
      confidence: 0.94,
      suggestions: ['Best SIP amount for my income', 'ELSS vs regular mutual funds', 'How to start SIP online'],
      timestamp: new Date().toISOString()
    };
  }
  
  if (message.includes('hra') || message.includes('house rent')) {
    return {
      text: `HRA (House Rent Allowance) Tax Benefits! 🏠

**HRA Exemption Calculation:**
Lowest of these three:
1. Actual HRA received
2. 50% of salary (metro) / 40% (non-metro)
3. Rent paid minus 10% of salary

**Metro Cities:** Mumbai, Delhi, Chennai, Kolkata
**Documents Needed:** 
• Rent receipts
• Rent agreement
• Landlord's PAN (if rent > ₹1L/year)

💡 **Smart tip:** You can claim both HRA and home loan benefits for different properties!`,
      category: 'tax_sections',
      confidence: 0.91,
      suggestions: ['Calculate my HRA exemption', 'HRA vs home loan benefits', 'HRA documents needed'],
      timestamp: new Date().toISOString()
    };
  }
  
  if (message.includes('thanks') || message.includes('thank you')) {
    return {
      text: `You're welcome! 😊

I'm always here to help with your tax and financial queries. Remember:

🎆 Smart financial planning today = Secure future tomorrow
📚 Stay updated with tax law changes
💰 Regular investment review is key to wealth building

Is there anything else you'd like to know about taxes or investments?`,
      category: 'courtesy',
      confidence: 0.95,
      suggestions: ['Tell me about latest tax changes', 'Review my investment portfolio', 'Plan for next financial year'],
      timestamp: new Date().toISOString()
    };
  }
  
  // Income-specific advice
  if (message.includes('income') && (message.includes('lakh') || message.includes('salary'))) {
    const incomeMatch = message.match(/(\d+)\s*(lakh|l)/);
    const income = incomeMatch ? parseInt(incomeMatch[1]) * 100000 : null;
    
    if (income) {
      return {
        text: `Based on your income of ₹${income.toLocaleString()}, here's my advice! 💡

${income <= 300000 ? 
  `🎉 Great news! Under the new tax regime, you don't need to pay any tax!

Still, consider investing for your future:
• Start a SIP in ELSS mutual funds
• Open a PPF account
• Get health insurance` :
  
income <= 700000 ?
  `📊 You're in the 5% tax bracket. Here's what you can do:

**Tax Saving Options:**
• Invest ₹1.5L in 80C (ELSS recommended)
• Health insurance ₹25K (80D)
• This can potentially save ₹52,500 in taxes!

**Recommendation:** Choose old tax regime with deductions.` :
  
  `💰 You're in a higher tax bracket! Tax planning is crucial:

**Must-do investments:**
• ₹1.5L in 80C options
• ₹25K health insurance
• ₹50K additional NPS investment
• Consider home loan for additional benefits

**Potential tax savings:** ₹75,000+ per year!`}`,
        category: 'personalized_advice',
        confidence: 0.93,
        suggestions: ['Tell me more about ELSS', 'How to invest in PPF?', 'Compare tax regimes'],
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Default fallback
  const category = detectCategory(message);
  const fallbackResponses = TAX_KNOWLEDGE_BASE.fallbacks[category] || TAX_KNOWLEDGE_BASE.fallbacks.general;
  const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  
  return {
    text: `${randomFallback}

Meanwhile, here are some popular topics I can help with:
• Section 80C tax-saving investments 📈
• Health insurance benefits under 80D 🏥  
• Old vs New tax regime comparison ⚖️
• ITR filing process and deadlines 📅`,
    category: category,
    confidence: 0.60,
    suggestions: getSuggestions(category),
    timestamp: new Date().toISOString()
  };
};

// Function to detect query category
const detectCategory = (message) => {
  const keywords = {
    tax_planning: ['save', 'tax', 'planning', 'deduction', 'benefit'],
    investment: ['invest', 'mutual fund', 'sip', 'ppf', 'elss', 'nps'],
    compliance: ['file', 'itr', 'return', 'deadline', 'penalty'],
    tax_sections: ['section', '80c', '80d', '24', '80g'],
    tax_regimes: ['regime', 'old', 'new', 'compare']
  };
  
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => message.toLowerCase().includes(word))) {
      return category;
    }
  }
  
  return 'general';
};

// Function to get contextual suggestions
const getSuggestions = (category) => {
  const suggestions = {
    tax_planning: [
      'How much can I save under Section 80C?',
      'Best tax-saving investments for this year',
      'Calculate my tax savings'
    ],
    investment: [
      'ELSS vs PPF comparison',
      'How to start SIP in ELSS?',
      'NPS benefits and returns'
    ],
    compliance: [
      'ITR filing checklist',
      'Documents needed for ITR',
      'How to file ITR online?'
    ],
    tax_sections: [
      'All deductions under Section 80C',
      'Section 80D health insurance benefits',
      'Home loan tax benefits'
    ],
    tax_regimes: [
      'Calculate tax in both regimes',
      'Which regime is better for me?',
      'New tax regime benefits'
    ],
    general: [
      'How can I save tax?',
      'Explain Section 80C',
      'Best investment options'
    ]
  };
  
  return suggestions[category] || suggestions.general;
};

// Function to generate chat session summary
export const generateChatSummary = (messages) => {
  const categories = {};
  const topics = [];
  
  messages.forEach(msg => {
    if (msg.category) {
      categories[msg.category] = (categories[msg.category] || 0) + 1;
    }
  });
  
  const primaryCategory = Object.keys(categories).reduce((a, b) => 
    categories[a] > categories[b] ? a : b
  );
  
  return {
    messageCount: messages.length,
    primaryCategory,
    topicsDiscussed: topics,
    recommendations: [
      'Consider consulting a CA for complex tax situations',
      'Keep all investment receipts for ITR filing',
      'Review your tax-saving investments annually'
    ],
    followUpSuggestions: getSuggestions(primaryCategory)
  };
};

// Sample chat sessions for testing
export const SAMPLE_CHAT_SESSIONS = [
  {
    id: 'session_1',
    title: 'Tax Saving Discussion',
    messages: [
      {
        id: 'msg_1',
        type: 'user',
        text: 'How can I save tax this year?',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'msg_2',
        type: 'bot',
        ...generateChatResponse('How can I save tax this year?')
      },
      {
        id: 'msg_3',
        type: 'user',
        text: 'Tell me about Section 80C',
        timestamp: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'msg_4',
        type: 'bot',
        ...generateChatResponse('Tell me about Section 80C')
      }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'session_2', 
    title: 'Investment Planning',
    messages: [
      {
        id: 'msg_5',
        type: 'user',
        text: 'What are the best investment options?',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'msg_6',
        type: 'bot',
        ...generateChatResponse('What are the best investment options?')
      }
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  }
];

// Export sample responses for testing
export const SAMPLE_RESPONSES = {
  greetingResponse: generateChatResponse('Hello'),
  taxSavingResponse: generateChatResponse('How to save tax'),
  section80cResponse: generateChatResponse('What is section 80c'),
  investmentResponse: generateChatResponse('Best investment options'),
  regimeComparisonResponse: generateChatResponse('Old vs new tax regime'),
  chatSessions: SAMPLE_CHAT_SESSIONS,
  quickTips: QUICK_TIPS,
  conversationStarters: CONVERSATION_STARTERS
};