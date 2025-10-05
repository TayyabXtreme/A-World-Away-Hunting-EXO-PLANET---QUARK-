import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const apiKey = "AIzaSyAhwQ3w00c32wcEJQ5j6M3Ey1ZwKnFthUw";

if (!apiKey) {
  console.error('NEXT_GEMINI_AI_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

// System prompt for ExoQuark context
const SYSTEM_PROMPT = `You are ExoQuark AI, an expert assistant for an exoplanet discovery platform. 

IMPORTANT RULES:
1. Keep ALL responses to 3-4 lines maximum (2-3 sentences)
2. Be direct and concise - no lengthy explanations
3. DO NOT use emojis
4. Provide accurate, helpful information about exoplanets, space missions, and platform features
5. If asked about platform features, briefly mention Kepler, K2, TESS analysis pages or Dataset Explorer

Focus areas:
- Exoplanet characteristics and classifications
- NASA missions (Kepler, K2, TESS) and their detection methods
- Platform's 3D visualization and dataset explorer
- Machine learning models (XGBoost, LGBM) for predictions
- Basic planetary science concepts

Respond professionally and concisely.`;

export async function POST(req: NextRequest) {
  try {
    // Check if API key is available
    if (!apiKey) {
      console.error('API Key not configured');
      return NextResponse.json(
        { error: 'API Key not configured. Please set NEXT_GEMINI_AI_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('Processing chat request for message:', message.substring(0, 50));

    // Initialize the model with system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: {
        role: 'system',
        parts: [{ text: SYSTEM_PROMPT }],
      },
    });

    // Start chat with history
    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    console.log('Sending message to Gemini...');

    // Get streaming response
    const result = await chat.sendMessageStream(message);

    console.log('Streaming response started');

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          console.log('Streaming completed successfully');
        } catch (error) {
          console.error('Streaming error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        details: error?.message || 'Unknown error',
        type: error?.name || 'Error'
      },
      { status: 500 }
    );
  }
}
