import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    
    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Test the API key with a simple request
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Make a simple test request
    const result = await model.generateContent('Hello');
    await result.response;
    
    return NextResponse.json({ 
      success: true, 
      message: 'API key is valid' 
    });
    
  } catch (error: any) {
    console.error('API key validation error:', error);
    
    let errorMessage = 'Invalid API key';
    
    if (error.message?.includes('API_KEY_INVALID')) {
      errorMessage = 'The provided API key is invalid or expired';
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      errorMessage = 'Permission denied. Please check your API key permissions';
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'API quota exceeded. Please check your usage limits';
    } else if (error.message?.includes('Failed to fetch')) {
      errorMessage = 'Network error. Please check your internet connection';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
} 