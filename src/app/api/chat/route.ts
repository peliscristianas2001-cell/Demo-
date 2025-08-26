import {NextRequest, NextResponse} from 'next/server';
import {chat, chatInputSchema} from './flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedBody = chatInputSchema.parse(body);

    const response = await chat(validatedBody);

    return NextResponse.json({message: {role: 'model', content: response}});
  } catch (e: any) {
    console.error('Error in chat route', e);
    return NextResponse.json(
      {error: e.message || 'An unexpected error occurred.'},
      {status: 500}
    );
  }
}
