import { MedicamentResponse } from '../types/medicationApi'
import { MedicationDetailDto } from '../types/medicationDto'

export const toMedicationDto = (data: MedicamentResponse): MedicationDetailDto => {
    return {
        form: data.formePharmaceutique,
        administrationRoutes: data.voiesAdministration,
        authStatus: data.statusAutorisation,
        procedureType: data.typeProcedure,
        marketingStatus: data.etatComercialisation,
        approvalDate: data.dateAMM,
        company: data.titulaire,
        enhancedSurveillance: data.surveillanceRenforcee?.toLowerCase() === 'oui',

        ingredients: (data.composition || []).map((c) => ({
            substance: c.denominationSubstance,
            dosage: c.dosage,
            reference: c.referenceDosage,
        })),

        presentations: (data.presentation || []).map((p) => ({
            label: p.libelle,
            barcode13: p.cip13,
            refundRate: p.tauxRemboursement,
            price: p.prix,
        })),
        quantity: parseMedicationUnit(data.presentation?.[0]?.libelle)
    }
}

const parseMedicationUnit = (label?: string): number => {
    if (!label) return 1

    // Try to extract the number of units from the label (e.g., "Boîte de 30 comprimés", "B/24 sachets")
    // Use optional space and 's' for plural
    const match = label.match(/(\d+)\s*(?:comprimé|gélule|sachet|dose|pastille|pilule|tablette|tablet|capsule|pill|ampoule|unidose)s?/i)

    if (match && match[1]) {
        return parseInt(match[1])
    }

    return 1
}
