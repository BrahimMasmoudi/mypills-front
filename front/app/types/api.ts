
export interface MedicamentResponse {
    cis: number;
    elementPharmaceutique: string;
    formePharmaceutique: string;
    voiesAdministration: string[];
    statusAutorisation: string;
    typeProcedure: string;
    etatComercialisation: string;
    dateAMM: string;
    titulaire: string;
    surveillanceRenforce: string;
    composition: object[];
    generiques: object[];
    presentation: object[];
    conditions: string[];
}

export interface GetMedicationDetailsResponse {
    name: string;
    cis: string | number;
    details: MedicamentResponse;
}
