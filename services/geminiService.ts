import { GoogleGenAI } from "@google/genai";
import { stripBase64Prefix, getMimeTypeFromBase64 } from '../utils/imageUtils';

// Helper to safely get API Key in various environments (Node/Vite/Browser)
const getApiKey = (): string => {
  try {
    // Check if process is defined (Node/Webpack)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }
  return '';
};

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: getApiKey() });

const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateClothingImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          text: `Generate a high-quality, flat-lay or mannequin style photo of a piece of clothing: ${prompt}. White background, clear details, photorealistic.`
        }
      ]
    });

    // Extract image from response
    // The response structure for generated images via generateContent (Nano Banana) often puts the image in inlineData
    // Iterate parts to find inlineData
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content generated");

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini Clothing Generation Error:", error);
    throw error;
  }
};

export const generateTryOnImage = async (
  personBase64: string,
  clothBase64: string
): Promise<string> => {
  try {
    const personMime = getMimeTypeFromBase64(personBase64);
    const clothMime = getMimeTypeFromBase64(clothBase64);

    const personData = stripBase64Prefix(personBase64);
    const clothData = stripBase64Prefix(clothBase64);

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: personMime,
              data: personData
            }
          },
          {
            inlineData: {
              mimeType: clothMime,
              data: clothData
            }
          },
          {
            text: `Given the first image of a person and the second image of a clothing item. Generate a photorealistic image of the person wearing the clothing.
            
            REQUIREMENTS:
            1. **IDENTITY**: Preserve the person's face and identity from the first image exactly.
            2. **CLOTHING**: Adapt the clothing to fit the person naturally.
            3. **QUALITY**: Maintain high resolution, realistic lighting, and photorealistic textures.
            4. **INTEGRATION**: Ensure the new clothing looks like it is actually being worn by the person in the original environment.`
          }
        ]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content generated");

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    
    // Fallback if text is returned instead of image (sometimes happens if safety blocks it)
    if (parts[0]?.text) {
       console.warn("Model returned text instead of image:", parts[0].text);
       throw new Error("Model refused to generate image (Safety or unclear prompt). Try different images.");
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Gemini Try-On Error:", error);
    throw error;
  }
};