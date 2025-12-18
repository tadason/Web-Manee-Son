import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AppDescription {
  description: string;
  tags?: string[];
  category?: string;
}

export async function describeApp(req: Request, res: Response): Promise<void> {
  try {
    const { url } = req.body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (err) {
      res.status(400).json({ error: 'Invalid URL format' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
      return;
    }

    const client = new GoogleGenerativeAI({ apiKey });
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a web app analyzer. Visit ${url} and provide a brief description of what this web application does.

Return your response as a JSON object with this exact structure:
{
  "description": "A concise 1-2 sentence description of what the app does",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "One of: Productivity, Social, Entertainment, Education, Business, Utility, Other"
}

Only respond with valid JSON, no additional text.`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Could not extract JSON from Gemini response:', text);
      res.status(500).json({ error: 'Failed to parse AI response' });
      return;
    }

    const appData: AppDescription = JSON.parse(jsonMatch[0]);

    res.status(200).json(appData);
  } catch (error) {
    console.error('❌ Error in describeApp:', error);
    res.status(500).json({
      error: 'Failed to describe app',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
