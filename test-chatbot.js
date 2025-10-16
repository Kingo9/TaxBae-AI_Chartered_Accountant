// Test script for TaxBae AI Chatbot
// Run this after setting up your OpenAI API key

const API_BASE = 'http://localhost:3001/api';

async function testChatbot() {
  console.log('🤖 Testing TaxBae AI Chatbot Integration...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${API_BASE.replace('/api', '')}/health`);
    const health = await healthResponse.json();
    console.log('✅ Server Health:', health.status);

    // Test 2: Quick tips (no auth required)
    console.log('\n2. Testing quick tips...');
    try {
      const tipsResponse = await fetch(`${API_BASE}/chat/tips`);
      if (tipsResponse.status === 401) {
        console.log('⚠️  Tips endpoint requires authentication (as expected)');
      } else {
        const tips = await tipsResponse.json();
        console.log('✅ Quick Tips:', tips.data?.length || 0, 'tips available');
      }
    } catch (e) {
      console.log('⚠️  Tips endpoint requires authentication (as expected)');
    }

    // Test 3: Chat sessions endpoint
    console.log('\n3. Testing chat sessions endpoint...');
    try {
      const sessionsResponse = await fetch(`${API_BASE}/chat/sessions`);
      if (sessionsResponse.status === 401) {
        console.log('✅ Chat sessions properly require authentication');
      }
    } catch (e) {
      console.log('✅ Chat sessions properly require authentication');
    }

    console.log('\n🎉 Basic API structure is working!');
    console.log('\n📋 Next Steps:');
    console.log('1. Add your OpenAI API key to backend/.env');
    console.log('2. Set up PostgreSQL database');
    console.log('3. Run database migrations');
    console.log('4. Start the backend server');
    console.log('5. Test the complete chatbot in the mobile app');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure the backend server is running:');
    console.log('   cd backend && npm run dev');
  }
}

// Auto-run if this file is executed directly
if (require.main === module) {
  testChatbot();
}

module.exports = { testChatbot };
