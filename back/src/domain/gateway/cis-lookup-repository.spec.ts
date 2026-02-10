import { FirestoreCisLookupAdapter } from '../../infrastructure/adapters/persistence/firestore-cis-lookup-adapter'
import { Cip13 } from '../../types/cip13'
import { Cis } from '../../types/cis'

describe('FirestoreCisLookupAdapter', () => {
    let adapter: FirestoreCisLookupAdapter
    let mockConnector: any
    let mockCollection: any
    let mockDoc: any

    beforeEach(() => {
        mockDoc = {
            get: jest.fn(),
        }

        mockCollection = {
            doc: jest.fn().mockReturnValue(mockDoc),
        }

        mockConnector = {
            collection: jest.fn().mockReturnValue(mockCollection),
        }

        adapter = new FirestoreCisLookupAdapter(mockConnector)
    })

    it('should return a Cis object when a valid Cip13 is found', async () => {
        // Arrange
        const testCip = Cip13.create('3400934913154')
        const testCisString = '61234567'

        mockDoc.get.mockResolvedValue({
            exists: true,
            data: () => ({ cis: testCisString }),
        })

        // Act
        const result = await adapter.getCisByCip13(testCip)

        // Assert
        expect(mockConnector.collection).toHaveBeenCalledWith('cip_to_cis')
        expect(mockCollection.doc).toHaveBeenCalledWith(testCip.getValue())
        expect(result).not.toBeNull()
        expect(result?.getValue()).toBe(testCisString)
        expect(result).toBeInstanceOf(Cis)
    })

    it('should return null when the Cip13 does not exist', async () => {
        // Arrange
        const nonExistentCip = Cip13.create('3400930005742')

        mockDoc.get.mockResolvedValue({
            exists: false,
        })

        // Act
        const result = await adapter.getCisByCip13(nonExistentCip)

        // Assert
        expect(mockConnector.collection).toHaveBeenCalledWith('cip_to_cis')
        expect(mockCollection.doc).toHaveBeenCalledWith(nonExistentCip.getValue())
        expect(result).toBeNull()
    })
})
