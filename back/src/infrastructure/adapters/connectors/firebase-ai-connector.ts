import { AI, getGenerativeModel, GenerativeModel, ModelParams } from 'firebase/ai'

export class FirebaseAiConnector {
    constructor(public readonly ai: AI) {}

    public getModel(modelName: string, jsonMimeType: boolean = false): GenerativeModel {
        const params: ModelParams = {
            model: modelName,
            generationConfig: {
                temperature: 0.1,
            }
        }
        
        if (jsonMimeType && params.generationConfig) {
            params.generationConfig.responseMimeType = "application/json"
        }

        return getGenerativeModel(this.ai, params)
    }
}
