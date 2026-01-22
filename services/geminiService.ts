
import { GoogleGenAI } from "@google/genai";
import { StudioSettings } from "../types";

// Note: process.env.API_KEY is pre-configured in this environment
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a detailed image prompt by strictly analyzing the style reference as the "Target Scene".
 */
export const generateDetailedPrompt = async (
  settings: StudioSettings,
  productImageBase64: string,
  styleImageBase64?: string
): Promise<string> => {
  const ai = getAIClient();
  
  const promptParts = [
    { text: `You are an expert commercial photography director.
    TASK: Analyze the PRODUCT in the first image and the ENVIRONMENT/STYLE in the second image (if provided).
    
    SETTINGS:
    - Aspect Ratio: ${settings.aspectRatio}
    - Lighting: ${settings.lighting}
    - Perspective: ${settings.perspective}
    
    INSTRUCTIONS:
    1. If a style reference is provided, describe its background, surfaces, props, and lighting in extreme detail. 
    2. Explicitly describe how the product from the first image should be placed into the scene of the second image.
    3. Ensure the prompt mandates that the result looks EXACTLY like the style reference's context, with the product swapped in.
    4. Focus on shadows, reflections, and material interactions to ensure the product looks physically present in that specific environment.
    
    Output ONLY the descriptive scene prompt.` },
    {
      inlineData: {
        mimeType: "image/png",
        data: productImageBase64.split(',')[1] || productImageBase64,
      }
    }
  ];

  if (styleImageBase64) {
    promptParts.push({
      inlineData: {
        mimeType: "image/png",
        data: styleImageBase64.split(',')[1] || styleImageBase64,
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: promptParts },
  });

  return response.text || "A professional product photo in a high-end studio.";
};

/**
 * Uses Gemini 2.5 Flash Image with a 'Source-to-Target' instruction.
 */
export const generateImage = async (
  prompt: string,
  productImageBase64: string,
  aspectRatio: string,
  styleImageBase64?: string
): Promise<string> => {
  const ai = getAIClient();
  
  const parts: any[] = [
    {
      inlineData: {
        mimeType: 'image/png',
        data: productImageBase64.split(',')[1] || productImageBase64,
      },
    }
  ];

  if (styleImageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: styleImageBase64.split(',')[1] || styleImageBase64,
      },
    });
  }

  // The final instruction is key for "exact" replication.
  // We tell the model that image 1 is the subject and image 2 is the exact environment/style to clone.
  const finalInstruction = styleImageBase64 
    ? `IMAGE 1 is the product. IMAGE 2 is the EXACT style and environment. 
       ACTION: Place the product from Image 1 into the exact scene, lighting, and background of Image 2. 
       The final image must be a perfect aesthetic clone of Image 2 but featuring the product from Image 1.
       SCENE DESCRIPTION: ${prompt}`
    : `Render this product in a professional studio setting. SCENE DESCRIPTION: ${prompt}`;

  parts.push({ text: finalInstruction });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: parts,
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from model.");
};
