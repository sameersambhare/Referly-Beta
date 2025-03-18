import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Google Generative AI with your API key
// In production, use environment variables for the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

export async function POST(request: Request) {
  try {
    const { messages, userName } = await request.json();
    
    // Format the conversation history for Gemini
    // Gemini expects 'user' and 'model' roles, while our app uses 'user' and 'assistant'
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
    
    // Add system prompt to guide the assistant's behavior
    const systemPrompt = `You are an AI assistant for a referral management platform called Referly. 
    Your name is Referly Assistant and you're helping ${userName || "a business user"}. 
    Your goal is to assist with referral program management, suggest follow-ups, 
    provide insights on campaigns, and help optimize referral strategies. 
    
    When formatting your responses:
    - Use markdown formatting for better readability
    - Use bullet points (- ) for lists
    - Use bold (**text**) for important information
    - Use headings (## Heading) for sections when appropriate
    - Keep paragraphs concise and well-structured
    - Provide actionable advice when possible
    
    Be helpful, concise, and business-focused.`;
    
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });
    
    // Extract the last user message for direct generation
    const lastUserMessage = messages[messages.length - 1];
    
    // If we have a conversation history
    if (messages.length > 1) {
      // Ensure the first message in history has role 'user'
      // If the first message is from assistant, we'll need to start with the second message
      let historyStartIndex = 0;
      if (formattedMessages[0].role === "model") {
        historyStartIndex = 1;
        // If there's no user message after the initial assistant greeting, we can't use history
        if (messages.length < 2 || formattedMessages[1].role !== "user") {
          historyStartIndex = -1; // Skip using history
        }
      }
      
      if (historyStartIndex >= 0) {
        try {
          // Start a chat session with valid history
          const chat = model.startChat({
            history: formattedMessages.slice(historyStartIndex, messages.length - 1),
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 1024,
            },
          });
          
          // Send the last user message
          const result = await chat.sendMessage(lastUserMessage.content);
          const response = result.response.text();
          
          return NextResponse.json({ 
            response,
            timestamp: new Date().toISOString()
          });
        } catch (historyError) {
          console.error("Error with chat history, falling back to direct generation:", historyError);
          // Fall through to direct generation if history fails
        }
      }
    }
    
    // Direct generation without history (fallback or first message)
    const prompt = `${systemPrompt}\n\nUser: ${lastUserMessage.content}\n\nPlease format your response with clear structure and use markdown formatting where appropriate.`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    return NextResponse.json({ 
      response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error("Error in Gemini API:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate response", 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 