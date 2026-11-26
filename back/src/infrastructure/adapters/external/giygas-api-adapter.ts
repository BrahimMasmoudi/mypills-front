import { logger } from 'firebase-functions/v2'
import { fetch } from 'undici'
import { MedicamentApiGateway } from '../../../domain/gateway/medicament-api-gateway'
import { Cis } from '../../../types/cis'
import { MedicamentResponse } from '../../../types/medicationApi'
import { ExternalApiError } from './external-api-error'

export class GiygasApiAdapter implements MedicamentApiGateway {
    constructor(private readonly timeoutMs = 5000) {}

    async fetchDetailsByCis(cis: Cis): Promise<MedicamentResponse> {
        const cisValue = cis.getValue()
        const startMs = Date.now()

        try {
            const response = await fetch(
                `https://medicaments-api.giygas.dev/medicament/id/${cisValue}`,
                { signal: AbortSignal.timeout(this.timeoutMs) }
            )

            if (response.status === 404) {
                throw new Error('NOT_FOUND_IN_DB')
            }

            if (!response.ok) {
                throw new ExternalApiError(
                    'HTTP_ERROR',
                    `External medication API returned HTTP ${response.status}`,
                    {
                        httpStatus: response.status,
                        cis: cisValue,
                        durationMs: Date.now() - startMs,
                    }
                )
            }

            let parsed: unknown
            try {
                parsed = await response.json()
            } catch (parseErr) {
                throw new ExternalApiError(
                    'SCHEMA_ERROR',
                    'External medication API returned invalid JSON',
                    {
                        cis: cisValue,
                        durationMs: Date.now() - startMs,
                        issues: [parseErr instanceof Error ? parseErr.message : 'Invalid JSON payload'],
                    }
                )
            }

            const record = (parsed && typeof parsed === 'object') ?
                (parsed as Record<string, unknown>) :
                null

            if (!record || typeof record.elementPharmaceutique !== 'string' || record.elementPharmaceutique.trim().length === 0) {
                throw new ExternalApiError(
                    'SCHEMA_ERROR',
                    'External medication API response missing elementPharmaceutique',
                    {
                        cis: cisValue,
                        durationMs: Date.now() - startMs,
                        issues: ['elementPharmaceutique must be a non-empty string'],
                    }
                )
            }

            const driftedFields: string[] = []
            if (record.composition != null && !Array.isArray(record.composition)) {
                driftedFields.push('composition')
            }
            if (record.presentation != null && !Array.isArray(record.presentation)) {
                driftedFields.push('presentation')
            }
            if (driftedFields.length > 0) {
                logger.warn('External medication API secondary field schema drift detected', {
                    cis: cisValue,
                    driftedFields,
                })
            }

            return parsed as MedicamentResponse
        } catch (err: unknown) {
            const errName = typeof err === 'object' && err !== null && 'name' in err ?
                String((err as { name: unknown }).name) :
                ''
            const errMessage = typeof err === 'object' && err !== null && 'message' in err ?
                String((err as { message: unknown }).message) :
                ''

            if (errMessage === 'NOT_FOUND_IN_DB') {
                throw err
            }

            const durationMs = Date.now() - startMs
            let normalized: ExternalApiError
            if (err instanceof ExternalApiError) {
                normalized = err
            } else if (errName === 'TimeoutError' || errName === 'AbortError') {
                normalized = new ExternalApiError(
                    'TIMEOUT',
                    `External medication API request timed out after ${this.timeoutMs}ms`,
                    { cis: cisValue, durationMs }
                )
            } else {
                normalized = new ExternalApiError(
                    'NETWORK_ERROR',
                    errMessage || 'External medication API network error',
                    { cis: cisValue, durationMs }
                )
            }

            logger.error('External medication API lookup failed', {
                cis: normalized.meta.cis ?? cisValue,
                errorKind: normalized.errorKind,
                httpStatus: normalized.meta.httpStatus,
                durationMs: normalized.meta.durationMs ?? durationMs,
                issues: normalized.meta.issues,
            })

            throw normalized
        }
    }
}
