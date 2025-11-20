import { GoogleGenAI } from "@google/genai";
import { EventItem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Utility to extract Lat/Lng from Google Maps URLs found in chunks
// URLs typically look like: https://www.google.com/maps/place/Something/@39.92077,32.85411,15z/...
const extractCoordinates = (uri: string | undefined): { lat: number, lng: number } | undefined => {
  if (!uri) return undefined;
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match = uri.match(regex);
  if (match && match.length >= 3) {
    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2])
    };
  }
  return undefined;
};

export const fetchEventsInProvince = async (provinceName: string): Promise<{ text: string, events: EventItem[] }> => {
  try {
    const prompt = `
      I need to find the most popular and active festivals, fairs, public events, concerts, and major cultural centers in ${provinceName}, Turkey.
      
      Focus on:
      1. Upcoming or currently recurring festivals (e.g., food, music, art).
      2. Major cultural centers or event venues (e.g., convention centers, open-air theaters).
      3. Famous local fairs or traditional gatherings.
      
      Use the Google Maps tool to verify the existence and location of these places. 
      Return a list of 5-10 distinctive items.
      For each item, provide a short description.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      }
    });

    const text = response.text || "No details found.";
    const candidates = response.candidates;
    
    const events: EventItem[] = [];

    // Parse Grounding Chunks to create structured event data
    if (candidates && candidates[0]?.groundingMetadata?.groundingChunks) {
      candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        // Check for 'web' or 'maps' type chunks
        // Maps grounding often returns: { web: { uri, title } } or { maps: { ... } } depending on exact tool output version
        const item = chunk.web || chunk.maps;
        
        if (item && item.uri && item.title) {
          const coords = extractCoordinates(item.uri);
          
          // Avoid duplicates
          if (!events.find(e => e.title === item.title)) {
            events.push({
              title: item.title,
              uri: item.uri,
              coordinates: coords,
              description: "View on map for more details." // Fallback description
            });
          }
        }
      });
    }

    return { text, events };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
