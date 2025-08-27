import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const promptsData = await request.json();
    const url = new URL(request.url);
    const isPublic = url.searchParams.get('public') === 'true';

    // Determine the file path based on the public parameter
    let filePath: string;
    if (isPublic) {
      filePath = join(process.cwd(), 'public', 'data', 'prompts.json');
    } else {
      filePath = join(process.cwd(), 'data', 'prompts.json');
    }

    console.log(`💾 Saving prompts data to: ${filePath}`);

    // Write the updated data to the file
    await writeFile(filePath, JSON.stringify(promptsData, null, 2), 'utf8');

    console.log(`✅ Prompts data saved successfully to ${isPublic ? 'public' : 'main'} file`);

    return NextResponse.json({
      success: true,
      message: `Prompts data saved successfully to ${isPublic ? 'public' : 'main'} file`
    });
  } catch (error) {
    console.error('Error saving prompts data:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save prompts data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
