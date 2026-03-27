import { GoogleAiConnector } from './google-ai-connector'
import { GoogleGenAI } from '@google/genai'

describe('GoogleAiConnector', () => {
    let aiMock: jest.Mocked<any>
    let connector: GoogleAiConnector
    let generateContentMock: jest.Mock

    beforeEach(() => {
        // 1. Create a mock for the specific method the SDK uses under the hood
        generateContentMock = jest.fn()

        // 2. Mock the structure of the GoogleGenAI instance
        aiMock = {
            models: {
                generateContent: generateContentMock
            }
        }

        // 3. Inject the mock into our connector
        connector = new GoogleAiConnector(aiMock as unknown as GoogleGenAI)
        jest.clearAllMocks()
    })

    it('should pass default config and mimic the old response structure', async () => {
        // Arrange: Tell our mock what to return when called
        generateContentMock.mockResolvedValue({ text: 'Standard AI response' })
        const prompt = 'Hello Gemini'

        // Act: Get our proxy model and call generateContent
        const model = connector.getModel('gemini-2.5-flash')
        const result = await model.generateContent(prompt)

        // Assert 1: Did we call the real Google SDK with the right config?
        expect(generateContentMock).toHaveBeenCalledWith({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1
            }
        })

        // Assert 2: Did our proxy object correctly wrap the result so the old code doesn't break?
        expect(typeof result.response.text).toBe('function')
        expect(result.response.text()).toBe('Standard AI response')
    })

    it('should attach json mime type when jsonMimeType flag is true', async () => {
        // Arrange
        generateContentMock.mockResolvedValue({ text: '{"success": true}' })
        const prompt = 'Give me JSON'

        // Act
        const model = connector.getModel('gemini-2.5-flash', true)
        await model.generateContent(prompt)

        // Assert: Verify the config includes the JSON mime type
        expect(generateContentMock).toHaveBeenCalledWith({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1,
                responseMimeType: 'application/json'
            }
        })
    })

    it('should handle undefined text in the AI response gracefully', async () => {
        // Arrange: Simulate the AI returning an empty/weird payload
        generateContentMock.mockResolvedValue({})

        // Act
        const model = connector.getModel('gemini-2.5-flash')
        const result = await model.generateContent('test prompt')

        // Assert: Our proxy should safely fall back to an empty string, not crash
        expect(result.response.text()).toBe('')
    })
})