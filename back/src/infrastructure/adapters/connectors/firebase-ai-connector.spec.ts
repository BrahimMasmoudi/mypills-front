import { FirebaseAiConnector } from './firebase-ai-connector'
import { AI, getGenerativeModel } from 'firebase/ai'

jest.mock('firebase/ai', () => ({
    getGenerativeModel: jest.fn()
}))

describe('FirebaseAiConnector', () => {
    let aiMock: jest.Mocked<any>
    let connector: FirebaseAiConnector

    beforeEach(() => {
        aiMock = {} as any
        connector = new FirebaseAiConnector(aiMock as AI)
        jest.clearAllMocks()
    })

    it('should initialize and return a default GenerativeModel', () => {
        connector.getModel('gemini-1.5-flash')
        expect(getGenerativeModel).toHaveBeenCalledWith(aiMock, {
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.1
            }
        })
    })

    it('should attach json mime type when jsonMimeType flag is true', () => {
        connector.getModel('gemini-1.5-pro', true)
        expect(getGenerativeModel).toHaveBeenCalledWith(aiMock, {
            model: 'gemini-1.5-pro',
            generationConfig: {
                temperature: 0.1,
                responseMimeType: 'application/json'
            }
        })
    })
})
