# Gemini AI Integration for Referly

This document explains how the Google Gemini AI model is integrated into the Referly platform to power the AI assistant feature.

## Overview

The AI assistant in Referly uses Google's Gemini model to provide intelligent responses to user queries about referral management, campaign optimization, and other related topics. The integration is done through the Google Generative AI JavaScript SDK.

## Implementation Details

### 1. API Setup

The Gemini integration is implemented through a dedicated API route:

- **API Route**: `/api/gemini/route.ts`
- **Model Used**: `gemini-1.5-flash` (can be updated to newer models as they become available)
- **System Prompt**: A custom system prompt guides the AI to provide relevant responses in the context of a referral management platform.

### 2. Frontend Component

The AI assistant UI is implemented in:

- **Component**: `app/components/dashboard/AIAssistant.tsx`
- **Features**:
  - Real-time chat interface
  - Message history
  - Suggested prompts
  - Loading states
  - Error handling

### 3. Chat History Handling

The integration handles chat history with special consideration for Gemini's requirements:

- Gemini expects the first message in history to have a role of 'user'
- Our implementation handles the initial assistant greeting properly
- If history format is invalid, it falls back to direct generation
- Role mapping: 'user' → 'user' and 'assistant' → 'model'

## Configuration

### API Key Setup

1. Obtain a Gemini API key from the [Google AI Studio](https://ai.google.dev/)
2. Add the API key to your `.env.local` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

### Customization Options

You can customize the AI assistant behavior by modifying:

1. **System Prompt**: Edit the system prompt in `app/api/gemini/route.ts` to change how the AI responds.
2. **Model Parameters**: Adjust temperature, topP, and other parameters to control response creativity and focus.
3. **Suggested Prompts**: Update the suggested prompts in `AIAssistant.tsx` to guide users toward specific queries.

## Example Usage

The AI assistant can help with various tasks:

- **Campaign Optimization**: "How can I improve my referral conversion rate?"
- **Follow-up Strategies**: "What are the best practices for follow-ups?"
- **Performance Analysis**: "Show me my campaign performance"
- **Campaign Creation**: "How do I create a new referral campaign?"
- **Content Suggestions**: "Suggest email templates for referral requests"
- **Strategy Advice**: "What incentives work best for referral programs?"

## Extending the Integration

To extend the Gemini integration:

1. **Add Context**: Pass additional business data to the API for more personalized responses.
2. **Implement Functions**: Use Gemini's function calling capabilities to perform actions based on user requests.
3. **Multi-modal Support**: Integrate image analysis for more advanced use cases.

## Error Handling

The integration includes robust error handling:

1. **API Errors**: Detailed error logging with fallback responses
2. **Chat History Errors**: Automatic fallback to direct generation if history format is invalid
3. **User Feedback**: Toast notifications inform users of issues
4. **Fallback Responses**: Graceful degradation with helpful error messages

## Troubleshooting

Common issues and solutions:

1. **API Key Issues**: Ensure your API key is correctly set in the `.env.local` file.
2. **Rate Limiting**: If you encounter rate limiting, implement a retry mechanism or queue system.
3. **Response Quality**: If responses aren't relevant enough, adjust the system prompt or model parameters.
4. **Chat History Errors**: If you see errors about message roles, check the conversation flow in the AIAssistant component.

## Resources

- [Google Generative AI SDK Documentation](https://ai.google.dev/docs/gemini_api_overview)
- [Gemini API Reference](https://ai.google.dev/api/rest/v1beta/models)
- [Google AI Studio](https://ai.google.dev/) 