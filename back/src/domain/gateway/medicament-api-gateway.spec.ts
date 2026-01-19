import { GiygasApiAdapter } from '../../infrastructure/adapters/external/giygas-api-adapter'
import { Cis } from '../../types/cis'
// 1. Import these tools from undici
import { setGlobalDispatcher, Agent } from 'undici'

describe('GiygasApiAdapter Integration Test', () => {
    let adapter: GiygasApiAdapter

    beforeAll(() => {
        const agent = new Agent({
            connect: {
                rejectUnauthorized: false,
            },
        })
        setGlobalDispatcher(agent)

        adapter = new GiygasApiAdapter()
    })

    it('should fetch real medication details from Giygas API', async () => {
        const validCis = Cis.create('60234100')

        // Act
        const response = await adapter.fetchDetailsByCis(validCis)

        // Assert
        expect(response).toBeDefined()
        expect(response).toEqual(
            {
                'cis': 60234100,
                'composition': [{
                    'cis': 60234100,
                    'codeSubstance': 2202,
                    'denominationSubstance': 'PARACÉTAMOL',
                    'dosage': '1000 mg',
                    'elementPharmaceutique': 'comprimé',
                    'natureComposant': 'SA',
                    'referenceDosage': 'un comprimé',
                }],
                'conditions': null,
                'dateAMM': '09/07/2002',
                'elementPharmaceutique': 'DOLIPRANE 1000 mg, comprimé',
                'etatComercialisation': 'Commercialisée',
                'formePharmaceutique': 'comprimé',
                'generiques': null,
                'presentation': [{
                    'agreement': 'oui',
                    'cip13': 3400935955838,
                    'cip7': 3595583,
                    'cis': 60234100,
                    'dateDeclaration': '02/01/2003',
                    'etatComercialisation': 'DÃ©claration de commercialisation',
                    'libelle': 'plaquette(s) thermoformÃ©e(s) PVC-aluminium de 8  comprimÃ©(s)',
                    'prix': 1.07,
                    'statusAdministratif': 'PrÃ©sentation active',
                    'tauxRemboursement': '65%',
                }, {
                    'agreement': 'oui',
                    'cip13': 3400956369553,
                    'cip7': 5636955,
                    'cis': 60234100,
                    'dateDeclaration': '17/03/2003',
                    'etatComercialisation': 'DÃ©claration de commercialisation',
                    'libelle': 'plaquette(s) thermoformÃ©e(s) PVC-aluminium de 100  comprimÃ©(s)',
                    'prix': 0,
                    'statusAdministratif': 'PrÃ©sentation active',
                    'tauxRemboursement': '',
                }],
                'statusAutorisation': 'Autorisation active',
                'surveillanceRenforce': 'Non',
                'titulaire': 'OPELLA HEALTHCARE FRANCE',
                'typeProcedure': 'Procédure nationale',
                'voiesAdministration': ['orale'],
            }
        )
    })
})
