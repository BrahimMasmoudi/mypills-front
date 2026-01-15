import { MedicationDetailDto } from './medicationDto'

export interface APIComposition {
    cis: number
    elementPharmaceutique: string
    codeSubstance: number
    denominationSubstance: string
    dosage: string
    referenceDosage: string
    natureComposant: string
}

export interface APIPresentation {
    cis: number
    cip7: number
    libelle: string
    statusAdministratif: string
    etatComercialisation: string
    dateDeclaration: string
    cip13: number
    agreement: string
    tauxRemboursement: string
    prix: number
}

export interface MedicamentResponse {
    cis: number
    elementPharmaceutique: string
    formePharmaceutique: string
    voiesAdministration: string[]
    statusAutorisation: string
    typeProcedure: string
    etatComercialisation: string
    dateAMM: string
    titulaire: string
    surveillanceRenforce: string
    composition: APIComposition[]
    generiques: any[] | null
    presentation: APIPresentation[]
    conditions: string[] | null
}

export interface GetMedicationDetailsResponse {
    name: string
    cis: string | number
    details: MedicationDetailDto
}
