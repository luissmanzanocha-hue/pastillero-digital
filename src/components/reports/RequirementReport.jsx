import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { calculateDailyUsage } from '../../utils/calculations';

const RequirementReport = (props) => {
    const { resident, activeMedications, notes } = props;
    // Helper to get current month name in Spanish
    const date = new Date();
    const currentMonth = date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    const currentYear = date.getFullYear();

    // Logic to calculate requirements
    const daysToCover = 30; // Standard coverage requirement

    // Separate meds into Missing vs Reserve
    const missingMeds = [];
    const reserveMeds = [];

    activeMedications.forEach(med => {
        // Calculate daily usage
        const dailyDoses = med.dosagePattern ? med.dosagePattern.split('-').reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0) : 0;
        const pillFraction = parseFloat(med.pillFraction) || 1;
        const dailyUsage = dailyDoses * pillFraction;

        const currentStock = med.inventory?.currentStock || 0;
        const neededForPeriod = Math.ceil(dailyUsage * daysToCover);
        const deficit = neededForPeriod - currentStock;

        if (deficit > 0) {
            missingMeds.push({
                ...med,
                deficit: Math.ceil(deficit) // Round up to whole pills
            });
        } else {
            reserveMeds.push({
                ...med,
                currentStock
            });
        }
    });

    const ReportContent = (
        <div id="printable-report" className="hidden print:block fixed inset-0 bg-white z-[9999] p-12 text-black font-sans w-full h-full overflow-visible">
            {/* Header with Logo */}
            <div className="flex flex-col items-center mb-8">
                {/* Logo Placeholder - User should place 'logo.png' in public folder or replace src */}
                <img
                    src="/logo.png"
                    alt="Le Monde Logo"
                    className="h-24 mb-4 object-contain"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                    }}
                />

                {/* Fallback Text Header if Logo is missing */}
                <div className="hidden text-center" style={{ display: 'none' }}>
                    <h1 className="text-3xl font-serif text-[#1a237e] tracking-widest mb-1 font-bold">LE MONDE</h1>
                    <p className="text-[#BE9F57] text-[0.65rem] tracking-[0.3em] uppercase font-bold">RESIDENCIAS PARA ADULTOS MAYORES</p>
                    <p className="text-[0.65rem] text-gray-400 tracking-widest uppercase mt-1">PEDREGAL</p>
                </div>
            </div>

            <h2 className="text-center font-bold text-lg mb-8 text-[#1a237e] uppercase border-b-2 border-[#BE9F57] inline-block px-4 pb-1">
                REQUERIMIENTO DE MEDICAMENTOS E INSUMOS
            </h2>

            {/* Resident Table */}
            <div className="border-2 border-[#BE9F57] mb-8">
                <div className="grid grid-cols-[150px_1fr] border-b border-[#BE9F57]">
                    <div className="border-r border-[#BE9F57] p-2 font-bold bg-[#f5f5f5] text-[#1a237e] text-sm flex items-center">RESIDENTE:</div>
                    <div className="p-2 uppercase font-bold text-sm flex items-center">{resident.name}</div>
                </div>
                <div className="grid grid-cols-[150px_1fr]">
                    <div className="border-r border-[#BE9F57] p-2 font-bold bg-[#f5f5f5] text-[#1a237e] text-sm flex items-center">MES:</div>
                    <div className="p-2 uppercase font-bold text-sm flex items-center">{currentMonth} {currentYear}</div>
                </div>
            </div>

            {/* Missing Medications List */}
            <div className="mb-8 pl-4">
                <h3 className="font-bold text-[#1a237e] mb-2 text-sm underline">Medicamentos:</h3>
                {missingMeds.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                        {missingMeds.map(med => (
                            <li key={med.id}>
                                <span className="font-bold">{med.name}</span>
                                {med.presentation && <span className="italic"> ({med.presentation})</span>}:
                                <span> Faltan </span>
                                <span className="font-bold">{med.deficit} tabletas.</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="italic text-gray-500 text-sm">No hay faltantes para este periodo.</p>
                )}
            </div>

            {/* In Reserve List */}
            <div className="mb-10 pl-4">
                <h3 className="font-bold text-[#1a237e] mb-2 text-sm underline">En reserva:</h3>
                {reserveMeds.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                        {reserveMeds.map(med => (
                            <li key={med.id}>
                                <span className="font-bold">{med.name}</span>
                                {med.presentation && <span className="italic"> ({med.presentation})</span>}:
                                <span> {med.currentStock} tabletas.</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="italic text-gray-500 text-sm">No hay medicamentos en reserva extra.</p>
                )}
            </div>

            {/* Footer Notes */}
            <div className="text-xs mt-auto pt-4 border-t border-gray-200">
                <div className="mb-8 w-full">
                    <span className="font-bold text-[#1a237e] block mb-2">Nota:</span>
                    {/* Render custom notes preserving line breaks */}
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-medium pl-4">
                        {props.notes || `Recuerden que es importante contar con los medicamentos antes de que termine el mes, tomar en cuenta que el pastillero cubre hasta el día 30 o 31 del mes en curso.\nHorario de recepción: lunes a viernes 10:00 am a 17:30 recibe Jefe de enfermería, sábado y domingo 10:00 a 17:30 recibe enfermeras en turno.`}
                    </div>
                </div>

                <div className="text-center mt-12">
                    <p className="text-[0.7rem] text-justify px-8 mb-8 text-gray-600 leading-relaxed italic border-l-4 border-[#BE9F57] pl-4">
                        En caso de no contar con el requerimiento a tiempo, se solicitará el y/o los insumos faltantes, directamente de la residencia algún proveedor. Generando un 12% de comisión por servicio más el costo total del producto.
                    </p>

                    <div className="mt-16 border-t border-black w-64 mx-auto pt-2">
                        <p className="font-bold text-[#1a237e]">FIRMA DE ENTERADO</p>
                    </div>
                    <p className="font-bold text-[#1a237e] tracking-widest mt-8">GRACIAS</p>
                </div>
            </div>
        </div>
    );

    // Use Portal to render directly to body, bypassing App structure constraints
    return ReactDOM.createPortal(ReportContent, document.body);
};

export default RequirementReport;
