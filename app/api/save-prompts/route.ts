import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const promptsData = await request.json();
    
    // Path to the data file
    const filePath = join(process.cwd(), 'data', 'prompts.json');
    
    // Write the updated data to the file
    await writeFile(filePath, JSON.stringify(promptsData, null, 2), 'utf8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Prompts data saved successfully' 
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
