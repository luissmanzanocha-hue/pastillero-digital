import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { logoBase64 } from './logoBase64';

// Helper to calculate stock needs (reused logic)
const calculateReportData = (activeMedications) => {
    const daysToCover = 30;
    const reportData = activeMedications.map(med => {
        const dailyDoses = med.dosagePattern ? med.dosagePattern.split('-').reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0) : 0;
        const pillFraction = parseFloat(med.pillFraction) || 1;
        const dailyUsage = dailyDoses * pillFraction;
        const currentStock = med.inventory?.currentStock || 0;

        const neededForPeriod = Math.ceil(dailyUsage * daysToCover);
        const deficit = neededForPeriod - currentStock;

        return {
            ...med,
            currentStock,
            deficit: deficit > 0 ? Math.ceil(deficit) : 0,
            status: deficit > 0 ? 'MISSING' : 'RESERVE'
        };
    });
    return {
        missing: reportData.filter(m => m.status === 'MISSING'),
        reserve: reportData.filter(m => m.status === 'RESERVE')
    };
};

export const generateWordReport = async (resident, activeMedications, customNotes) => {
    const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    const currentYear = new Date().getFullYear();
    const { missing, reserve } = calculateReportData(activeMedications);


    // Use embedded Base64 Logo
    const logoImage = null; // User requested to remove image

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1000,
                        right: 1500,
                        bottom: 1000,
                        left: 1500,
                    },
                },
            },
            children: [
                // 1. Header (Logo or Text)
                new Paragraph({
                    children: [
                        logoImage ? new ImageRun({
                            data: logoImage,
                            transformation: { width: 200, height: 60 },
                        }) : new TextRun({
                            text: "LE MONDE - RESIDENCIAS PARA ADULTOS MAYORES",
                            bold: true,
                            size: 28,
                            color: "1A237E",
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),

                // 2. Title
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "REQUERIMIENTO DE MEDICAMENTOS E INSUMOS",
                            bold: true,
                            size: 24,
                            color: "1A237E",
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    border: {
                        bottom: { style: BorderStyle.SINGLE, size: 6, color: "BE9F57" },
                    },
                    spacing: { after: 400 },
                }),

                // 3. Info Table (Resident & Month)
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ text: "RESIDENTE:", bold: true })],
                                    width: { size: 30, type: WidthType.PERCENTAGE },
                                    shading: { fill: "F5F5F5" },
                                }),
                                new TableCell({
                                    children: [new Paragraph({ text: resident.name.toUpperCase() })],
                                    width: { size: 70, type: WidthType.PERCENTAGE },
                                }),
                            ],
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ text: "MES:", bold: true })],
                                    width: { size: 30, type: WidthType.PERCENTAGE },
                                    shading: { fill: "F5F5F5" },
                                }),
                                new TableCell({
                                    children: [new Paragraph({ text: `${currentMonth} ${currentYear}` })],
                                    width: { size: 70, type: WidthType.PERCENTAGE },
                                }),
                            ],
                        }),
                    ],
                }),

                new Paragraph({ text: "", spacing: { after: 400 } }), // Spacer

                // 4. Missing Medications List
                new Paragraph({
                    text: "Medicamentos:",
                    bold: true,
                    size: 22,
                    color: "1A237E",
                    spacing: { after: 200 },
                }),
                ...missingMedsToParagraphs(missing),

                new Paragraph({ text: "", spacing: { after: 400 } }), // Spacer

                // 5. Reserve List
                new Paragraph({
                    text: "En reserva:",
                    bold: true,
                    size: 22,
                    color: "1A237E",
                    spacing: { after: 200 },
                }),
                ...reserveMedsToParagraphs(reserve),

                new Paragraph({ text: "", spacing: { after: 600 } }), // Spacer

                // 6. Notes
                new Paragraph({
                    children: [
                        new TextRun({ text: "Nota:", bold: true, color: "1A237E" }),
                    ],
                    spacing: { after: 100 },
                }),
                new Paragraph({
                    text: customNotes || "Recuerden que es importante contar con los medicamentos...",
                    spacing: { after: 600 },
                }),

                // 7. Footer Disclaimer
                new Paragraph({
                    text: "En caso de no contar con el requerimiento a tiempo, se solicitará el y/o los insumos faltantes, directamente de la residencia algún proveedor. Generando un 12% de comisión por servicio más el costo total del producto.",
                    alignment: AlignmentType.JUSTIFIED,
                    italics: true,
                    size: 18,
                    spacing: { after: 800 },
                }),

                // 8. Signature Line
                new Paragraph({
                    text: "FIRMA DE ENTERADO",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    border: {
                        top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                    },
                    spacing: { before: 800 },
                }),

                new Paragraph({
                    text: "GRACIAS",
                    bold: true,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200 },
                    color: "1A237E"
                }),
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Requerimiento_${resident.name}_${currentMonth}.docx`);
};

// Helpers for lists
const missingMedsToParagraphs = (meds) => {
    if (meds.length === 0) return [new Paragraph({ text: "No hay faltantes.", italics: true })];
    return meds.map(med => new Paragraph({
        children: [
            new TextRun({ text: `• ${med.name}`, bold: true }),
            new TextRun({ text: med.presentation ? ` (${med.presentation})` : "" }),
            new TextRun({ text: ": " }),
            new TextRun({ text: `Faltan ${med.deficit} tabletas.`, bold: true, color: "D32F2F" }),
        ],
        bullet: { level: 0 }
    }));
};

const reserveMedsToParagraphs = (meds) => {
    if (meds.length === 0) return [new Paragraph({ text: "No hay reserva.", italics: true })];
    return meds.map(med => new Paragraph({
        children: [
            new TextRun({ text: `• ${med.name}`, bold: true }),
            new TextRun({ text: `: ${med.currentStock} tabletas.` }),
        ],
        bullet: { level: 0 }
    }));
};
