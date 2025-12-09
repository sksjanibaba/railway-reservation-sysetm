import { GoogleGenAI, Type } from "@google/genai";
import { Train, ClassType } from "../types";

// Fallback data in case of API failure or missing key
const MOCK_TRAINS: Train[] = [
  {
    trainNumber: "12951",
    trainName: "Rajdhani Express",
    source: "Mumbai",
    destination: "Delhi",
    departureTime: "17:00",
    arrivalTime: "08:30",
    duration: "15h 30m",
    availability: [
      { type: ClassType.AC1, available: 12, price: 4500, status: 'AVAILABLE' },
      { type: ClassType.AC2, available: 45, price: 2800, status: 'AVAILABLE' },
      { type: ClassType.AC3, available: 120, price: 1900, status: 'AVAILABLE' }
    ]
  },
  {
    trainNumber: "12903",
    trainName: "Golden Temple Mail",
    source: "Mumbai",
    destination: "Amritsar",
    departureTime: "18:45",
    arrivalTime: "07:20",
    duration: "12h 35m",
    availability: [
      { type: ClassType.AC2, available: 8, price: 2400, status: 'RAC' },
      { type: ClassType.AC3, available: 0, price: 1600, status: 'WAITLIST' },
      { type: ClassType.SL, available: 200, price: 650, status: 'AVAILABLE' }
    ]
  },
   {
    trainNumber: "22221",
    trainName: "Vande Bharat Exp",
    source: "Mumbai",
    destination: "Gandhinagar",
    departureTime: "06:10",
    arrivalTime: "12:25",
    duration: "6h 15m",
    availability: [
      { type: ClassType.AC1, available: 50, price: 1500, status: 'AVAILABLE' },
      { type: ClassType.AC2, available: 145, price: 900, status: 'AVAILABLE' },
    ]
  }
];

export const searchTrainsWithGemini = async (
  source: string, 
  destination: string, 
  date: string
): Promise<Train[]> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found, using mock data.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return MOCK_TRAINS;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of 5 realistic trains traveling from ${source} to ${destination} on ${date}. 
      Include a mix of express and local trains. 
      For each train, provide realistic availability for different classes (Sleeper, AC 3 Tier, AC 2 Tier, AC 1 Tier).
      Ensure prices are in INR.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              trainNumber: { type: Type.STRING },
              trainName: { type: Type.STRING },
              source: { type: Type.STRING },
              destination: { type: Type.STRING },
              departureTime: { type: Type.STRING, description: "24hr format HH:MM" },
              arrivalTime: { type: Type.STRING, description: "24hr format HH:MM" },
              duration: { type: Type.STRING, description: "e.g., 12h 30m" },
              availability: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: Object.values(ClassType) },
                    available: { type: Type.INTEGER },
                    price: { type: Type.INTEGER },
                    status: { type: Type.STRING, enum: ['AVAILABLE', 'WAITLIST', 'RAC'] }
                  },
                  required: ['type', 'available', 'price', 'status']
                }
              }
            },
            required: ['trainNumber', 'trainName', 'source', 'destination', 'departureTime', 'arrivalTime', 'duration', 'availability']
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as Train[];
      return data;
    }
    return MOCK_TRAINS;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return MOCK_TRAINS;
  }
};
