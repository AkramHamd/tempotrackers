import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log('Processing message:', message.substring(0, 50) + '...');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(message);
    const reply = result.response.text();

    console.log('Response received from Gemini');
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Detailed error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(500).json({ error: "Invalid API key" });
      } else if (error.message.includes('quota')) {
        return res.status(429).json({ error: "API quota exceeded" });
      } else if (error.message.includes('network')) {
        return res.status(503).json({ error: "Network error" });
      }
    }
    
    return res.status(500).json({ 
      error: "Error al conectarse con Gemini", 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}