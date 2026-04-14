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

        return {
            generateContent: async (prompt: string) => {

                const result = await this.ai.models.generateContent({
                    model: modelName,
                    contents: prompt,
                    config: config
                })

                return {
                    response: {
                        text: () => result.text || ""
                    }
                }
            }
        }
    }
}