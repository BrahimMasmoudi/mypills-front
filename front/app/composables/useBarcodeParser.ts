
export const useBarcodeParser = () => {
    /**
     * Parses a raw barcode string (EAN-13 or GS1 DataMatrix) and returns
     * extracted data (CIP13, Expiry Date).
     */
    const parseBarcode = (code: string) => {
        let cip13: string | null = null;
        let expiryDate: Date | null = null;

        // Clean input
        let queryCode = code;

        // Handle GS1 DataMatrix (e.g., 010340094153396917280731...)
        if (code.startsWith('01') && code.length >= 16) {
            // Extract GTIN (01 + 14 digits)
            // Indices: 01 2.............15
            const gtin = code.substring(2, 16);

            // Convert GTIN-14 to CIP13
            if (gtin.length === 14 && gtin.startsWith('0')) {
                cip13 = gtin.substring(1);
            } else {
                cip13 = gtin;
            }
            console.log('GS1 DataMatrix detected. Extracted CIP13:', cip13);

            // Extract Expiry Date (AI 17)
            const remainder = code.substring(16);
            if (remainder.startsWith('17') && remainder.length >= 8) {
                // Structure: 17 YYMMDD
                const rawDate = remainder.substring(2, 8);
                const yy = parseInt(rawDate.substring(0, 2), 10);
                const mm = parseInt(rawDate.substring(2, 4), 10);
                const dd = parseInt(rawDate.substring(4, 6), 10);

                const fullYear = 2000 + yy;
                // Month is 0-indexed in Date constructor
                expiryDate = new Date(fullYear, mm - 1, dd);
                console.log('GS1 Expiry extracted:', expiryDate);
            }

        } else {
            // Standard EAN-13 / CIP13
            // Remove leading zero if present and length is 13
            if (code.length === 13 && code.startsWith('0')) {
                cip13 = code.substring(1);
            } else {
                cip13 = code;
            }
        }

        return {
            cip13,
            expiryDate
        };
    }

    return {
        parseBarcode
    }
}
