import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse(
        "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.",
        { status: 500 }
      );
    }

    // Initialize OpenAI client with validated API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await req.json();
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return new NextResponse(
        "Invalid request body. Expected a JSON object.",
        { status: 400 }
      );
    }

    // Handle test payload differently
    if (body.test) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: body.test,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      const result = completion.choices[0]?.message?.content || "No response generated";
      return NextResponse.json({ result });
    }
    
    // Extract the sections from the payload
    const sections = Object.entries(body).map(([key, value]) => `${key}: ${value}`).join('\n\n');
    
    // Create a prompt that combines all sections
    const prompt = `Please analyze the following information and provide a comprehensive response:

${sections}

Please provide a detailed analysis and response based on the above information.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content || "No response generated";

    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("OpenAI API Error:", err);
    
    // Provide more specific error messages
    if (err?.status === 401) {
      return new NextResponse(
        "Authentication failed. Please check your OpenAI API key.",
        { status: 401 }
      );
    }
    
    if (err?.status === 429) {
      return new NextResponse(
        "Rate limit exceeded. Please try again later.",
        { status: 429 }
      );
    }
    
    if (err?.status === 500) {
      return new NextResponse(
        "OpenAI service error. Please try again later.",
        { status: 500 }
      );
    }
    
    return new NextResponse(
      err?.message || "Failed to call OpenAI API", 
      { status: 500 }
    );
  }
}
