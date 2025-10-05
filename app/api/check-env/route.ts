import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if environment variables are available
    const hasEnvCredentials = Boolean(
      process.env.AWS_REGION && 
      process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_SECRET_ACCESS_KEY
    );

    return NextResponse.json({
      hasEnvironmentCredentials: hasEnvCredentials,
      success: true
    });

  } catch (error) {
    console.error('Error checking environment credentials:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check environment credentials',
        success: false,
        hasEnvironmentCredentials: false
      },
      { status: 500 }
    );
  }
}