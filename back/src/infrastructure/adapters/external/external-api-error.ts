export type ExternalApiErrorKind = 'TIMEOUT' | 'HTTP_ERROR' | 'NETWORK_ERROR' | 'SCHEMA_ERROR'

export interface ExternalApiErrorMeta {
    httpStatus?: number
    cis?: string
    durationMs?: number
    issues?: string[]
}

export class ExternalApiError extends Error {
    constructor(
        public readonly errorKind: ExternalApiErrorKind,
        message: string,
        public readonly meta: ExternalApiErrorMeta = {}
    ) {
        super(message)
        this.name = 'ExternalApiError'
    }
}
