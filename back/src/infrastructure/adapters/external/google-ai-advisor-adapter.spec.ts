import { GoogleAIAdvisorAdapter } from './google-ai-advisor-adapter'
import { GoogleAiConnector } from '../connectors/google-ai-connector'
import { Medication } from '../../../domain/entities/medication'

describe('GoogleAIAdvisorAdapter', () => {
    let mockConnector: jest.Mocked<GoogleAiConnector>
    let adapter: GoogleAIAdvisorAdapter
    let mockModel: any

    beforeEach(() => {
        mockModel = {
            generateContent: jest.fn()
        }

        mockConnector = {
            getModel: jest.fn().mockReturnValue(mockModel)
        } as unknown as jest.Mocked<GoogleAiConnector>

        adapter = new GoogleAIAdvisorAdapter(mockConnector)
    })

    const createCabinet = (): Medication[] => [
        { medicationId: 'med-1', name: 'Doliprane', expiryDate: new Date('2025-12-31'), expired: false } as Medication,
        { medicationId: 'med-2', name: 'Smecta', expiryDate: new Date('2025-10-31'), expired: false } as Medication
    ]

    it('should return empty guidance if cabinet is empty', async () => {
        const result = await adapter.getAdvice('headache', [], 'en')
        expect(result.usableMedications).toEqual([])
        expect(result.explanation).toContain("You don't have any medications")
        expect(mockModel.generateContent).not.toHaveBeenCalled()
    })

    it('should return french empty guidance if cabinet is empty and language is fr', async () => {
        const result = await adapter.getAdvice('headache', [], 'fr')
        expect(result.explanation).toContain("Vous n'avez pas de médicaments")
    })

    it('should call gemini model with JSON flag and parse string to structured format', async () => {
        const fakeAIResponse = JSON.stringify({
            explanation: "Take Doliprane for your headache.",
            usableMedicationIds: ["med-1"]
        })

        mockModel.generateContent.mockResolvedValueOnce({
            response: { text: () => fakeAIResponse }
        })

        const cabinet = createCabinet()
        const result = await adapter.getAdvice('headache', cabinet, 'en')

        expect(mockConnector.getModel).toHaveBeenCalledWith("gemini-2.5-flash", true)
        expect(mockModel.generateContent).toHaveBeenCalled()

        expect(result.explanation).toBe("Take Doliprane for your headache.")
        expect(result.usableMedications).toHaveLength(1)
        expect(result.usableMedications[0].medicationId).toBe('med-1')
        expect(result.usableMedications[0].name).toBe('Doliprane')
    })

    it('should throw Error if json parsing fails', async () => {
        mockModel.generateContent.mockResolvedValueOnce({
            response: { text: () => "invalid json" }
        })

        const cabinet = createCabinet()
        await expect(adapter.getAdvice('headache', cabinet, 'en')).rejects.toThrow('Failed to parse AI advice: invalid json')
    })
})
