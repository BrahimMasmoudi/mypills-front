import { MedicamentResponse } from '../types/medicationApi'
import { MedicationDetailDto } from '../types/medicationDto'

const asString = (value: unknown): string => (typeof value === 'string' ? value : '')

const asObjectArray = (value: unknown): Record<string, unknown>[] => {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
}

export const toMedicationDto = (data: MedicamentResponse): MedicationDetailDto => {
    const presentations = asObjectArray(data.presentation).map((p) => ({
        label: asString(p.libelle),
        barcode13: typeof p.cip13 === 'number' && Number.isFinite(p.cip13) ? p.cip13 : 0,
        refundRate: asString(p.tauxRemboursement),
        price: typeof p.prix === 'number' && Number.isFinite(p.prix) ? p.prix : 0,
    }))

    return {
        form: asString(data.formePharmaceutique),
        administrationRoutes: Array.isArray(data.voiesAdministration) ?
            data.voiesAdministration.filter((route): route is string => typeof route === 'string') :
            [],
        authStatus: asString(data.statusAutorisation),
        procedureType: asString(data.typeProcedure),
        marketingStatus: asString(data.etatComercialisation),
        approvalDate: asString(data.dateAMM),
        company: asString(data.titulaire),
        enhancedSurveillance:
            typeof data.surveillanceRenforcee === 'string' &&
            data.surveillanceRenforcee.toLowerCase() === 'oui',
        ingredients: asObjectArray(data.composition).map((c) => ({
            substance: asString(c.denominationSubstance),
            dosage: asString(c.dosage),
            reference: asString(c.referenceDosage),
        })),
        presentations,
        quantity: parseMedicationUnit(presentations[0]?.label),
    }
}

const parseMedicationUnit = (label?: unknown): number => {
    if (typeof label !== 'string' || !label) return 1

    // Try to extract the number of units from the label (e.g., "Boîte de 30 comprimés", "B/24 sachets")
    // Use optional space and 's' for plural
    const match = label.match(/(\d+)\s*(?:comprimé|gélule|sachet|dose|pastille|pilule|tablette|tablet|capsule|pill|ampoule|unidose)s?/i)

    if (match && match[1]) {
        return parseInt(match[1])
    }

    return 1
}
