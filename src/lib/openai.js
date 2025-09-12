const TOKEN = process.env.OPENAI_API_KEY;

if (!TOKEN) {
  throw new Error('OPENAI_API_KEY is required in environment variables');
}

export async function callGPT4oMini(message, systemPrompt = null) {
  const messages = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: message });

  const requestBody = {
    model: 'gpt-4o-mini',
    messages: messages,
    max_tokens: 1000,
    temperature: 0.7
  };

  console.log('OpenAI API Request:', {
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN.substring(0, 10)}...`,
      'Content-Type': 'application/json'
    },
    body: requestBody
  });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'EmotiSense/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('OpenAI API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText.substring(0, 500)
    });

    if (!response.ok) {
      let errorMessage = `OpenAI API request failed: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorMessage += ` - ${errorData.error.message}`;
        }
      } catch {
        errorMessage += ` - ${responseText}`;
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI API response structure:', data);
      throw new Error('Unexpected API response structure');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error Details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.message.includes('401')) {
      throw new Error('Authentication failed: Invalid or expired API key');
    } else if (error.message.includes('403')) {
      throw new Error('Access forbidden: Check your API permissions');
    } else if (error.message.includes('429')) {
      throw new Error('Rate limit exceeded: Please wait before retrying');
    } else if (error.message.includes('500')) {
      throw new Error('OpenAI server error: The API service is temporarily unavailable');
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to OpenAI API');
    }

    throw new Error(`OpenAI API request failed: ${error.message}`);
  }
}

export async function detectEmotions(userText) {
  const prompt = `You are an emotion detection specialist trained to work with neurodivergent individuals, particularly those with alexithymia.

Analyze the following text and identify emotions considering:
- Neurodivergent communication patterns
- Indirect emotional expression
- Sensory descriptions that indicate emotions
- Cognitive rather than emotional language
- Alexithymia-specific challenges

Text: "${userText}"

Respond ONLY with valid JSON in this exact format:
{
  "primaryEmotions": [
    {
      "emotion": "string",
      "confidence": 0.8,
      "indicators": ["specific phrases that suggest this emotion"],
      "explanation": "brief explanation for neurodivergent context"
    }
  ],
  "intensity": 5,
  "complexity": "simple",
  "sensoryElements": ["any sensory descriptions found"],
  "cognitivePatterns": ["thinking patterns that might mask emotions"]
}`;

  try {
    const response = await callGPT4oMini(userText, prompt);

    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanResponse);
    } catch (jsonError) {
      console.error('Invalid JSON response from OpenAI:', {
        original: response,
        cleaned: cleanResponse,
        error: jsonError.message
      });

      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(`API returned invalid JSON: ${cleanResponse.substring(0, 200)}...`);
      }
    }

    if (!parsedResponse.primaryEmotions || !Array.isArray(parsedResponse.primaryEmotions)) {
      throw new Error('Invalid response structure: missing primaryEmotions array');
    }

    return parsedResponse;
  } catch (error) {
    console.error('Error detecting emotions with OpenAI API:', error);

    return {
      primaryEmotions: [{
        emotion: 'uncertain',
        confidence: 0.1,
        indicators: [],
        explanation: `Unable to analyze emotions: ${error.message}`
      }],
      intensity: 0,
      complexity: 'simple',
      sensoryElements: [],
      cognitivePatterns: [],
      error: error.message,
      fallback: true
    };
  }
}

export async function generateQuestions(logData, userPatterns = []) {
  const prompt = `Generate an introspective questionnaire for a neurodivergent user based on their emotional log entry.

Context:
- Original text: "${logData.userText}"
- Detected emotions: ${JSON.stringify(logData.emotions)}
- User's previous patterns: ${JSON.stringify(userPatterns)}

Create 6-8 questions using EXACTLY these question types:
- "open" for open-ended text responses
- "radio" for single-choice options
- "checkbox" for multiple-choice options  
- "scale" for 1-10 rating scales
- "dropdown" for dropdown selections
- "correlation" for pattern/connection questions
- "visual_metaphor" for color/weather/texture metaphor questions

Requirements:
1. One visual_metaphor question (color/weather/texture/sound)
2. One correlation question about internal experiences
3. 2-3 open questions for reflection
4. 2-3 structured questions (radio, checkbox, scale, dropdown)
5. All questions must be:
   - Non-judgmental and gentle
   - Sensory-aware
   - Respectful of neurodivergent communication styles
   - Focused on user's own understanding, not external interpretation

Respond ONLY with valid JSON in this EXACT format:
{
  "questions": [
    {
      "id": "unique_id",
      "type": "open|radio|checkbox|scale|dropdown|correlation|visual_metaphor",
      "text": "question text",
      "options": ["option1", "option2"],
      "scale": {"min": 1, "max": 10},
      "required": false
    }
  ]
}`;

  try {
    const response = await callGPT4oMini(JSON.stringify(logData), prompt);

    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error('Error generating questions with OpenAI API:', error);
    return {
      questions: [
        {
          id: 'fallback_1',
          type: 'open',
          text: 'How would you describe what you experienced today?',
          required: false
        }
      ],
      error: error.message,
      fallback: true
    };
  }
}

export async function getChatResponse(messages, context) {
  const systemPrompt = `You are NeuroApp Introspector AI, a compassionate assistant for neurodivergent individuals exploring their emotions.

Core principles:
- Never diagnose or interpret emotions for users
- Help users notice their own patterns
- Use gentle, validating language
- Reference previous entries when relevant
- Focus on user's own understanding and insights
- Respect sensory and communication differences

Current session context:
- User: ${context.userName || 'User'}
- Log entry: "${context.currentLog?.userText || ''}"
- Emotions detected: ${JSON.stringify(context.currentLog?.emotions || [])}
- Questionnaire responses: ${JSON.stringify(context.questionnaireData || {})}
- Relevant past entries: ${JSON.stringify(context.relevantLogs || [])}

Begin with validation and gentle reflection. Help the user explore connections and patterns they might notice themselves.`;

  try {
    const conversationText = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const response = await callGPT4oMini(conversationText, systemPrompt);
    return response;
  } catch (error) {
    console.error('Error getting chat response from OpenAI API:', error);
    return `I'm having trouble processing your message right now (${error.message}). Could you try rephrasing or sharing what's on your mind in a different way?`;
  }
}

export async function testOpenAIAPI() {
  try {
    console.log('Testing OpenAI API connection...');

    const testResponse = await callGPT4oMini(
      "Hello, please respond with exactly: 'OpenAI API connection successful'",
      "You are a helpful assistant. Respond exactly as requested."
    );

    console.log('OpenAI API Test Result:', testResponse);
    return {
      success: true,
      response: testResponse,
      model: 'gpt-4o-mini'
    };
  } catch (error) {
    console.error('OpenAI API Test Failed:', error);
    return {
      success: false,
      error: error.message,
      suggestion: 'Verify your OPENAI_API_KEY and network connection'
    };
  }
}