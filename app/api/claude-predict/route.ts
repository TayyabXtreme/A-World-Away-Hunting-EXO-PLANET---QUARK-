import { NextRequest, NextResponse } from 'next/server';
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

// Configure the AWS Bedrock client
const client = new BedrockRuntimeClient({
  region: process.env.NEXT_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
  },
});

// Use Claude model
const modelId = "us.anthropic.claude-3-5-sonnet-20241022-v2:0";

export async function POST(request: NextRequest) {
  console.log("start")
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Sending request to Claude for exoplanet prediction...');

    const command = new ConverseCommand({
      modelId: modelId,
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: {
        maxTokens: 1000,
        temperature: 0.3,
      },
    });

    const response = await client.send(command);
    const responseText = response.output?.message?.content?.[0]?.text;
    console.log(response.output?.message?.content?.[0])
    if (!responseText) {
      throw new Error('No response from Claude');
    }

    console.log('Claude Response:', responseText);

    return NextResponse.json({
      prediction: responseText,
      success: true,
    });

  } catch (error) {
    console.error('Error invoking Claude:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get prediction from Claude',
        success: false 
      },
      { status: 500 }
    );
  }
}