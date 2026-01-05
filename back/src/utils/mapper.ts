import { MedicamentResponse } from '../types/medicationApi';
import {MedicationDetailDto} from "../types/medicationDto";

export const toMedicationDto = (data: MedicamentResponse): MedicationDetailDto => {
    return {
        form: data.formePharmaceutique,
        administrationRoutes: data.voiesAdministration,
        authStatus: data.statusAutorisation,
        procedureType: data.typeProcedure,
        marketingStatus: data.etatComercialisation,
        approvalDate: data.dateAMM,
        company: data.titulaire,
        enhancedSurveillance: data.surveillanceRenforce.toLowerCase() === 'oui',

        ingredients: (data.composition || []).map(c => ({
            substance: c.denominationSubstance,
            dosage: c.dosage,
            reference: c.referenceDosage
        })),

        presentations: (data.presentation || []).map(p => ({
            label: p.libelle,
            barcode13: p.cip13,
            refundRate: p.tauxRemboursement,
            price: p.prix
        }))
    };
};