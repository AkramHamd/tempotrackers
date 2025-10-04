import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, contextData } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log('Processing message:', message.substring(0, 50) + '...');
    
    // System instruction para el modelo
    const systemInstruction = `Eres un asistente especializado en calidad del aire y salud pública del sistema TempoTrackers de la NASA.

MISIÓN: Asesorar sobre calidad del aire usando datos TEMPO de la NASA, con enfoque especial en grupos vulnerables (niños, ancianos, embarazadas, personas con asma/EPOC, enfermedades cardíacas).

CONOCIMIENTOS:
- AQI: 0-50 Buena, 51-100 Moderada, 101-150 Insalubre para sensibles, 151-200 Insalubre, 201-300 Muy insalubre, 300+ Peligrosa
- Contaminantes: PM2.5, PM10, O3, NO2, SO2, CO
- Factores: viento, humedad, temperatura, presión

ESTILO: Respuestas directas, empáticas, orientadas a la acción. NO te presentes en cada respuesta. Da recomendaciones específicas y explica el porqué.

DATOS ACTUALES:${contextData ? `
- AQI Promedio: ${contextData.averageAQI} (${contextData.averageAQI <= 50 ? 'Buena' : contextData.averageAQI <= 100 ? 'Moderada' : contextData.averageAQI <= 150 ? 'Insalubre para sensibles' : contextData.averageAQI <= 200 ? 'Insalubre' : 'Muy insalubre'})
- Estaciones: ${contextData.dataPoints}
- Clima: ${contextData.weather ? `${contextData.weather.temperature}°C, ${contextData.weather.humidity}% humedad, viento ${contextData.weather.windSpeed} m/s` : 'No disponible'}
- Actualizado: ${contextData.timestamp}` : 'Datos no disponibles'}`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction
    });
    
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