import jsPDF from 'jspdf'

export const usePdfService = () => {
    const generatePdf = async (files: File[]): Promise<Blob> => {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        })

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (!file) continue
            if (i > 0) doc.addPage()

            const imgData = await fileToDataUrl(file)
            const imgProps = doc.getImageProperties(imgData)

            const pdfWidth = doc.internal.pageSize.getWidth()
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
        }

        return doc.output('blob')
    }

    const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    return { generatePdf }
}