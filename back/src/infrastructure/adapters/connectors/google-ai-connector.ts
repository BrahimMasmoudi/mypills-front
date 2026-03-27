import { GoogleGenAI, GenerateContentConfig } from '@google/genai'

export class GoogleAiConnector {
    constructor(public readonly ai: GoogleGenAI) { }

    public getModel(modelName: string, jsonMimeType: boolean = false) {

        const config: GenerateContentConfig = {
            temperature: 0.1,
        }

        if (jsonMimeType) {
            config.responseMimeType = "application/json"
        }

        // Return a proxy object that mimics the old Firebase AI logic interface
        return {
            generateContent: async (prompt: string) => {

                const result = await this.ai.models.generateContent({
                    model: modelName,
                    contents: prompt,
                    config: config
                })

                // Mimic the old result.response.text() method structure
                return {
                    response: {
                        text: () => result.text || ""
                    }
                }
            }
        }
    }
}