import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing. Please ensure it is set in the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

const extractImageFromResponse = (response: any): string => {
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated in response.");
};

// Step 1: Floorplan -> 3D Isometric Clay Render
export const generateBase3D = async (floorplanBase64: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { 
            text: "Generate a clean, white clay render style, 3D isometric cutaway floorplan view based on this 2D floorplan. Raise the walls, define the windows and doors clearly. Do not add a roof yet. High contrast, minimal style." 
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64(floorplanBase64)
            }
          }
        ]
      }
    });
    return extractImageFromResponse(response);
  } catch (error) {
    console.error("Step 1 failed:", error);
    throw error;
  }
};

// Step 2: 3D Base -> Add Transparent Roof
export const generateRoofLayer = async (base3dImage: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { 
            text: "Using the provided 3D isometric house model, add a semi-transparent roof structure. The roof should use a textured tiling pattern but have 50% opacity (phantom glass style) so the interior rooms are still clearly visible through the roof. Keep the isometric perspective exactly the same." 
          },
          {
            inlineData: {
              mimeType: 'image/png', // Assuming previous output is png
              data: cleanBase64(base3dImage)
            }
          }
        ]
      }
    });
    return extractImageFromResponse(response);
  } catch (error) {
    console.error("Step 2 failed:", error);
    throw error;
  }
};

// Step 3: Roof Model + Front Photo -> Textured Final
export const applyTextures = async (roofImage: string, frontPhotoBase64: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { 
            text: "Texture the provided 3D isometric house model using the architectural style, materials, and colors from the provided Front Photo reference. Apply the brick, wood, paint, and roof colors from the photo to the isometric model to make it look like a photorealistic miniature of that specific house. Maintain the isometric view and the transparent roof effect." 
          },
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64(roofImage)
            }
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64(frontPhotoBase64)
            }
          }
        ]
      }
    });
    return extractImageFromResponse(response);
  } catch (error) {
    console.error("Step 3 failed:", error);
    throw error;
  }
};
