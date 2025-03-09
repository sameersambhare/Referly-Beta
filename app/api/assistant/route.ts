import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import axios from 'axios';

// DeepSeek AI API integration
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse the request body
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    try {
      // Call DeepSeek AI API
      const response = await callDeepSeekAPI(message);
      
      // Return the AI response
      return NextResponse.json({ response });
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      
      // Fallback to local implementation if API call fails
      const fallbackResponse = generateFallbackResponse(message);
      return NextResponse.json({ 
        response: fallbackResponse,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error in AI assistant API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Function to call DeepSeek AI API
async function callDeepSeekAPI(userInput: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
  
  if (!apiKey) {
    throw new Error('DeepSeek API key not configured');
  }
  
  try {
    // Create context for the AI to understand it's a referral management assistant
    const systemPrompt = `You are an AI assistant for a referral management platform called Referly. 
    You help users manage their referral programs, suggest follow-ups, and provide insights on campaigns. 
    Keep responses concise, helpful, and focused on referral management.`;
    
    const response = await axios.post(
      `${apiUrl}/chat/completions`,
      {
        model: 'deepseek-chat',  // Using the standard DeepSeek chat model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    // Extract the response text
    const aiResponse = response.data.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from DeepSeek API');
    }
    
    return aiResponse;
  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw error;
  }
}

// Fallback response generator if API call fails
function generateFallbackResponse(userInput: string): string {
  const userInputLower = userInput.toLowerCase();
  
  if (userInputLower.includes('follow up') || userInputLower.includes('followup')) {
    return "Based on your recent referrals, I recommend following up with John Smith who was referred last week. Would you like me to draft a follow-up email?";
  } else if (userInputLower.includes('campaign') || userInputLower.includes('campaigns')) {
    return "Your 'Summer Referral' campaign is performing well with a 15% conversion rate. Consider extending it for another month to maximize results.";
  } else if (userInputLower.includes('referral') || userInputLower.includes('refer')) {
    return "You've received 5 new referrals this week! That's a 25% increase from last week. Would you like to see the details?";
  } else if (userInputLower.includes('customer') || userInputLower.includes('client')) {
    return "I notice you have 3 customers who haven't been contacted in over 30 days. Would you like me to suggest a re-engagement strategy?";
  } else if (userInputLower.includes('analytics') || userInputLower.includes('stats') || userInputLower.includes('performance')) {
    return "Your referral program is performing above average! Your conversion rate of 12% is higher than the industry average of 8%. Your most successful campaign is 'Friend Referral Discount'.";
  } else if (userInputLower.includes('help') || userInputLower.includes('assist')) {
    return "I can help you with managing referrals, creating campaigns, scheduling follow-ups, analyzing performance, and suggesting improvements to your referral program. What would you like assistance with?";
  } else {
    return "I'm here to help with your referral program. You can ask me about your campaigns, referrals, customers, or for suggestions on how to improve your conversion rates.";
  }
} 