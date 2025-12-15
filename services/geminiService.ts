import { GoogleGenAI, Type } from "@google/genai";

// Ideally, this is handled via a proxy or build process, but per instructions we use process.env
const apiKey = process.env.API_KEY || 'dummy_key_for_demo_ui'; 

const ai = new GoogleGenAI({ apiKey: apiKey });

export const generatePatientMessage = async (
  patientName: string,
  condition: string,
  language: string,
  messageType: 'reminder' | 'refill' | 'motivation',
  context?: string
): Promise<string> => {
  
  // Guard clause for demo environment if no key is present
  if (apiKey === 'dummy_key_for_demo_ui') {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`[DEMO MODE] Hello ${patientName}, this is a simulated ${messageType} message in ${language}. Please configure a valid API KEY to generate real AI responses.`);
        }, 1000);
    });
  }

  const prompt = `
    Role: You are Jemine AI, a compassionate medical engagement assistant for hospitals and pharmacies in Africa.
    
    CRITICAL COMPLIANCE RULES:
    1. Do NOT provide medical diagnoses.
    2. Do NOT recommend changing dosage without doctor approval.
    3. If the context implies a medical emergency, direct the patient to a hospital immediately.
    
    Task: Write a short, clear, and culturally appropriate ${messageType} message for a patient.
    
    Patient Details:
    - Name: ${patientName}
    - Condition: ${condition}
    - TARGET LANGUAGE: ${language} (MUST OUTPUT IN THIS LANGUAGE)
    - Context: ${context || 'General check-in'}
    
    Tone: Professional, empathetic, motivating.
    Constraints:
    - Keep it under 160 characters (SMS friendly) if possible.
    - Output only the message text in the target language.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Error generating message.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Service temporarily unavailable. Please draft message manually.";
  }
};

export const analyzeAdherencePattern = async (patientDataSummary: string): Promise<string> => {
    if (apiKey === 'dummy_key_for_demo_ui') {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("Based on the recent blood pressure readings and adherence score, the patient is responding well. However, the diastolic reading suggests a minor spike. Recommend scheduling a brief check-in call to discuss stress management or dietary changes.");
            }, 1500);
        });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Role: Senior Medical Engagement Analyst. 
            
            Task: Analyze the provided patient data summary. Identify adherence gaps, vital sign trends, or behavioral patterns.
            
            Output: Suggest 1 specific, actionable, non-medical engagement strategy to improve outcomes (e.g., 'Suggest moving medication time to match breakfast', 'Recommend usage of loyalty points for a checkup').
            
            Constraints:
            - Keep it under 60 words.
            - Be analytical but easy to understand for a care provider.
            - Do not be generic. Use the data provided.
            
            Data: ${patientDataSummary}`,
        });
        return response.text || "Analysis unavailable.";
    } catch (error) {
        return "Analysis unavailable due to network error.";
    }
}

export const generateSurveyPreview = async (
  title: string,
  targetAudience: string
): Promise<{ subject: string; body: string }> => {
  if (apiKey === 'dummy_key_for_demo_ui') {
     return new Promise((resolve) => {
        setTimeout(() => {
           resolve({
              subject: `Feedback Request: ${title}`,
              body: `Dear [Name], as a valued member of our ${targetAudience} group, we'd love your thoughts on ${title}. Please take a moment to rate us.`
           });
        }, 1500);
     });
  }

  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Draft a short, professional, and empathetic email survey invitation for patients. Survey Title: ${title}. Target Audience: ${targetAudience}. Keep it under 40 words.`,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      subject: { type: Type.STRING },
                      body: { type: Type.STRING }
                  }
              }
          }
      });
      
      const text = response.text;
      if (!text) return { subject: "Error", body: "Could not generate preview." };
      return JSON.parse(text);
  } catch (error) {
      console.error("Gemini Survey Error:", error);
      return { subject: "Service Unavailable", body: "Please type your message manually." };
  }
};