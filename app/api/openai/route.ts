import { NextResponse } from "next/server";
import OpenAI from "openai";

/** Exponential backoff that honors Retry-After if present. */
async function withRetry<T>(fn: () => Promise<T>, max = 3): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      const retryAfterHeader =
        err?.response?.headers?.get?.("retry-after") ??
        err?.headers?.get?.("retry-after");
      const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 0;

      if ((status === 429 || status >= 500) && attempt < max) {
        const backoff = Math.min(30000, 1000 * 2 ** attempt);
        await new Promise(r => setTimeout(r, Math.max(backoff, retryAfterMs)));
        attempt++;
        continue;
      }
      throw err;
    }
  }
}

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
      const completion = await withRetry(() => 
        openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: body.test,
            },
          ],
          max_tokens: 100,
          temperature: 0.7,
        })
      );

      const result = completion.choices[0]?.message?.content || "No response generated";
      return NextResponse.json({ result });
    }

    // Handle collect action for data processing
    if (body.action === 'collect' && body.data) {
      const { fileContent, urlContent, pastedText } = body.data;
      
      // Combine all available content
      const combinedContent = [
        fileContent && `File Content:\n${fileContent}`,
        urlContent && `URL Content:\n${urlContent}`,
        pastedText && `Pasted Text:\n${pastedText}`
      ].filter(Boolean).join('\n\n---\n\n');

      if (!combinedContent) {
        return NextResponse.json({ collectedText: "" });
      }

      // Use OpenAI to process and clean up the combined text
      const completion = await withRetry(() =>
        openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a text processing assistant. Extract, clean, and organize the provided text content. Remove any formatting artifacts, normalize spacing, and present the content in a clear, readable format. Maintain the important information while improving readability."
            },
            {
              role: "user",
              content: `Please process and clean up the following content:\n\n${combinedContent}`
            },
          ],
          max_tokens: 2000,
          temperature: 0.3,
        })
      );

      const collectedText = completion.choices[0]?.message?.content || combinedContent;
      return NextResponse.json({ collectedText });
    }

    // Handle data-handling action for processing data with custom prompt
    if (body.action === 'data-handling' && body.prompt) {
      const completion = await withRetry(() =>
        openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: body.prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        })
      );

      const response = completion.choices[0]?.message?.content || "No response generated";
      return NextResponse.json({ response });
    }

    // Handle structured JSON requests
    if (body.action === 'structured-json') {
      const { data, prompt, reference, outputFormat } = body;
      
      // Create an enhanced prompt for reliable JSON output
      const structuredPrompt = `${prompt}

CRITICAL INSTRUCTIONS:
1. You MUST respond with valid JSON only - no additional text, explanations, or markdown formatting
2. Use the exact structure provided in the reference format
3. If information is not available for any field, use "not available" as the value
4. Ensure all JSON keys are properly quoted
5. Do not include any text before or after the JSON

Reference structure:
${reference || 'No reference structure provided'}

Data to process:
${data}

OUTPUT FORMAT REQUIREMENTS:
- Start your response with { and end with }
- Use proper JSON syntax with quoted keys and values
- For missing information, use the exact text "not available"
- Do not add any explanatory text outside the JSON structure`;

      const completion = await withRetry(() =>
        openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a data structuring assistant. You MUST respond with valid JSON only. No explanations, no markdown, no additional text - just properly formatted JSON that exactly matches the requested structure."
            },
            {
              role: "user",
              content: structuredPrompt
            }
          ],
          max_tokens: 3000,
          temperature: 0.1, // Lower temperature for more consistent formatting
        })
      );

      const response = completion.choices[0]?.message?.content || "{}";
      
      // Try to validate the JSON response
      try {
        const parsedJson = JSON.parse(response);
        return NextResponse.json({ 
          result: response,
          parsedData: parsedJson,
          isValidJson: true 
        });
      } catch (parseError) {
        // If JSON is invalid, try to clean it up
        const cleanedResponse = response
          .replace(/^```json\s*/, '') // Remove markdown code blocks
          .replace(/\s*```$/, '')
          .replace(/^[^{]*({.*})[^}]*$/, '$1') // Extract JSON from surrounding text
          .trim();
        
        try {
          const parsedJson = JSON.parse(cleanedResponse);
          return NextResponse.json({ 
            result: cleanedResponse,
            parsedData: parsedJson,
            isValidJson: true,
            wasCleanedUp: true
          });
        } catch (secondParseError) {
          return NextResponse.json({ 
            result: response,
            rawResponse: response,
            isValidJson: false,
            parseError: parseError instanceof Error ? parseError.message : String(parseError),
            cleanupAttempted: true
          });
        }
      }
    }
    
    // Extract the sections from the payload
    const sections = Object.entries(body).map(([key, value]) => `${key}: ${value}`).join('\n\n');
    
    // Create a prompt that combines all sections
    const prompt = `Please analyze the following information and provide a comprehensive response:

${sections}

Please provide a detailed analysis and response based on the above information.`;

    const completion = await withRetry(() =>
      openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })
    );

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
      console.error("Rate limit details:", {
        error: err,
        headers: err?.headers,
        type: err?.type,
        code: err?.code
      });
      return new NextResponse(
        `Rate limit exceeded. Error details: ${err?.message || 'Unknown rate limit error'}`,
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
