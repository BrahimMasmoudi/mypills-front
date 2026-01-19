import {FirestoreConnector} from "../connectors/firestore-connector";
import {CisLookupRepository} from "../../../domain/gateway/cis-lookup-repository";
import {Cis} from "../../../types/cis";
import {Cip13} from "../../../types/cip13";

export class FirestoreCisLookupAdapter implements CisLookupRepository {
    constructor(private readonly connector: FirestoreConnector) {
    }

    async getCisByCip13(cip13: Cip13): Promise<Cis | null> {
        const doc = await this.connector.collection('cip_to_cis').doc(cip13.getValue()).get();
        return doc.exists ? Cis.create(doc.data()?.cis) : null;
    }
}