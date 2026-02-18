import React, { useState } from 'react';
import { validateMedicationForm } from '../../utils/validators';
import { decimalToFraction } from '../../utils/calculations';
import { decimalToFraction } from '../../utils/calculations';
import Alert from '../common/Alert';
import MultiDatePicker from '../common/MultiDatePicker';
import { Calendar, List } from 'lucide-react';

const MedicationForm = ({ residentName, onSubmit, onCancel, initialData = null }) => {
    const formatTimeForInput = (timeString) => {
        if (!timeString) return '';
        // Ensure we always have HH:MM format
        return timeString.length >= 5 ? timeString.slice(0, 5) : timeString;
    };

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        presentation: initialData?.presentation || '',
        doseType: initialData?.doseType || 'fraction',
        doseAmount: initialData?.doseAmount || '',
        pillFraction: initialData?.pillFraction || '1',
        via: initialData?.via || 'VO',
        dosagePattern: initialData?.dosagePattern || '1-0-0-0',
        schedules: initialData?.schedules
            ? initialData.schedules.map(formatTimeForInput)
            : [''],
        treatmentDays: initialData?.treatmentDays || '30',
        startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
        doctor: initialData?.doctor || '',
        status: initialData?.status || 'active',
        status: initialData?.status || 'active',
        initialStock: initialData?.initialStock || '',
        specificDays: initialData?.specific_days || []
    });

    const [durationMode, setDurationMode] = useState(initialData?.specific_days?.length > 0 ? 'calendar' : 'manual');

    const handleDateSelection = (dates) => {
        let updates = { specificDays: dates };

        if (dates.length > 0) {
            const sortedDates = [...dates].sort();
            const firstDate = sortedDates[0];
            const lastDate = sortedDates[sortedDates.length - 1];

            // Calculate span
            const start = new Date(firstDate);
            const end = new Date(lastDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            updates.startDate = firstDate;
            updates.treatmentDays = diffDays.toString();
        } else {
            updates.treatmentDays = '0';
        }

        setFormData(prev => ({ ...prev, ...updates }));
    };

    // ... (rest of code)



    const [errors, setErrors] = useState([]);

    const viaOptions = [
        { value: 'VO', label: 'VO - Vía Oral' },
        { value: 'VT', label: 'VT - Vía Tópica' },
        { value: 'INH', label: 'INH - Inhalado' },
        { value: 'SC', label: 'SC - Subcutánea' },
        { value: 'IM', label: 'IM - Intramuscular' },
        { value: 'IV', label: 'IV - Intravenosa' },
        { value: 'SL', label: 'SL - Sublingual' },
        { value: 'OFT', label: 'OFT - Oftálmica' },
        { value: 'OT', label: 'OT - Ótica' }
    ];

    const fractionOptions = [
        { value: '0.25', label: '1/4 pastilla' },
        { value: '0.5', label: '1/2 pastilla' },
        { value: '0.75', label: '3/4 pastilla' },
        { value: '1', label: '1 pastilla completa' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDoseTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            doseType: type,
            doseAmount: '',
            pillFraction: '1'
        }));
    };

    const handleScheduleChange = (index, value) => {
        const newSchedules = [...formData.schedules];
        // Ensure strictly HH:MM format
        newSchedules[index] = value ? value.slice(0, 5) : value;
        setFormData(prev => ({ ...prev, schedules: newSchedules }));
    };

    const addSchedule = () => {
        setFormData(prev => ({
            ...prev,
            schedules: [...prev.schedules, '']
        }));
    };

    const removeSchedule = (index) => {
        if (formData.schedules.length > 1) {
            setFormData(prev => ({
                ...prev,
                schedules: prev.schedules.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validation = validateMedicationForm(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setErrors([]);

        const dataToSubmit = {
            ...formData,
            doseAmount: formData.doseType === 'fraction' ? '0' : formData.doseAmount,
            pillFraction: formData.doseType === 'dosage' ? '1' : formData.pillFraction
        };

        onSubmit(dataToSubmit);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errors.length > 0 && (
                <Alert
                    type="danger"
                    title="Errores en el formulario"
                    message={errors.join(', ')}
                />
            )}

            <div className="glass-card p-3 bg-primary/5 border-primary/20">
                <p className="text-sm">
                    <span className="font-bold">Residente:</span> {residentName}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label htmlFor="name" className="text-white font-semibold">Nombre del Medicamento *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej: Levotiroxina, Liotronina"
                        className="w-full px-4 py-3 bg-white/5 border-2 border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white"
                        required
                    />
                </div>

                <div className="col-span-2">
                    <label htmlFor="presentation" className="text-white font-semibold">Presentación/Concentración</label>
                    <input
                        type="text"
                        id="presentation"
                        name="presentation"
                        value={formData.presentation}
                        onChange={handleChange}
                        placeholder="Ej: 100 mcg/20 mg"
                        className="w-full px-4 py-3 bg-white/5 border-2 border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white"
                    />
                </div>

                <div className="col-span-2">
                    <label htmlFor="via" className="text-white font-semibold">Vía de Administración *</label>
                    <select
                        id="via"
                        name="via"
                        value={formData.via}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border-2 border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white"
                        required
                    >
                        {viaOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Dual Dosage System */}
            <div className="space-y-4">
                <label className="block font-bold text-white text-lg">Tipo de Dosificación *</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => handleDoseTypeChange('fraction')}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.doseType === 'fraction'
                            ? 'border-primary bg-primary text-white shadow-lg'
                            : 'border-glass-border bg-white/5 text-text-muted hover:border-primary/50 hover:bg-white/10'
                            }`}
                    >
                        <div className="text-center">
                            <p className="font-bold text-lg mb-1">Fracción de Pastilla</p>
                            <p className={`text-xs ${formData.doseType === 'fraction' ? 'text-indigo-100' : 'text-gray-500'}`}>
                                Seleccionar 1/4, 1/2, 3/4 o 1 pastilla
                            </p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleDoseTypeChange('dosage')}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.doseType === 'dosage'
                            ? 'border-primary bg-primary text-white shadow-lg'
                            : 'border-glass-border bg-white/5 text-text-muted hover:border-primary/50 hover:bg-white/10'
                            }`}
                    >
                        <div className="text-center">
                            <p className="font-bold text-lg mb-1">Dosis en mg</p>
                            <p className={`text-xs ${formData.doseType === 'dosage' ? 'text-indigo-100' : 'text-gray-500'}`}>
                                Ingresar cantidad en miligramos
                            </p>
                        </div>
                    </button>
                </div>

                {formData.doseType === 'fraction' && (
                    <div className="animate-in fade-in duration-300">
                        <label htmlFor="pillFraction" className="text-white font-semibold">Fracción de Pastilla *</label>
                        <select
                            id="pillFraction"
                            name="pillFraction"
                            value={formData.pillFraction}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white/5 border-2 border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white text-lg font-bold"
                        >
                            {fractionOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-text-muted mt-1">
                            Cantidad de pastilla por cada toma
                        </p>
                    </div>
                )}

                {formData.doseType === 'dosage' && (
                    <div className="animate-in fade-in duration-300">
                        <label htmlFor="doseAmount" className="text-white font-semibold">Dosis en Miligramos (mg) *</label>
                        <input
                            type="number"
                            id="doseAmount"
                            name="doseAmount"
                            value={formData.doseAmount}
                            onChange={handleChange}
                            placeholder="Ej: 100"
                            step="0.01"
                            required
                            className="w-full px-4 py-3 bg-white/5 border-2 border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white text-lg font-bold"
                        />
                        <p className="text-xs text-text-muted mt-1">
                            Cantidad de mg por toma (se asume 1 pastilla = esta dosis)
                        </p>
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="dosagePattern" className="text-white font-semibold">Patrón de Dosis *</label>
                <input
                    type="text"
                    id="dosagePattern"
                    name="dosagePattern"
                    value={formData.dosagePattern}
                    onChange={handleChange}
                    placeholder="Ej: 1-0-0-0, 0-1-1-0"
                    className="w-full px-4 py-3 bg-white/5 border-2 border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white"
                    required
                />
                <p className="text-xs text-text-muted mt-1">
                    Formato: mañana-mediodía-tarde-noche (Ej: 1-0-0-0 = una vez en la mañana)
                </p>
            </div>

            <div>
                <label className="text-white font-semibold">Horarios de Administración</label>
                <div className="space-y-2">
                    {formData.schedules.map((schedule, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="time"
                                step="60"
                                value={formatTimeForInput(schedule)}
                                onChange={(e) => handleScheduleChange(index, e.target.value)}
                                className="flex-1 px-4 py-3 bg-white/5 border-2 border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white"
                            />
                            {formData.schedules.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSchedule(index)}
                                    className="btn btn-ghost px-3"
                                >
                                    Eliminar
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={addSchedule}
                    className="btn btn-ghost mt-2 text-sm"
                >
                    + Agregar Horario
                </button>
            </div>



            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-white font-semibold">Duración del Tratamiento</label>
                    <div className="flex bg-white/5 rounded-lg p-1 border border-glass-border">
                        <button
                            type="button"
                            onClick={() => setDurationMode('manual')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${durationMode === 'manual' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            <div className="flex items-center gap-2">
                                <List size={14} />
                                Manual
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setDurationMode('calendar')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${durationMode === 'calendar' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                Calendario
                            </div>
                        </button>
                    </div>
                </div>

                {durationMode === 'manual' ? (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                        <div>
                            <label htmlFor="treatmentDays" className="text-white font-semibold text-sm">Días de Tratamiento *</label>
                            <input
                                type="number"
                                id="treatmentDays"
                                name="treatmentDays"
                                value={formData.treatmentDays}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border-2 border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white"
                                min="1"
                                max="365"
                                required={durationMode === 'manual'}
                            />
                            <p className="text-xs text-text-muted mt-1">Típicamente 30 días</p>
                        </div>

                        <div>
                            <label htmlFor="startDate" className="text-white font-semibold text-sm">Fecha de Inicio *</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/5 border-2 border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white"
                                required
                            />
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300 space-y-4">
                        <p className="text-sm text-gray-400">
                            Selecciona los días específicos en el calendario. La fecha de inicio y duración se calcularán automáticamente.
                        </p>
                        <MultiDatePicker
                            selectedDates={formData.specificDays || []}
                            onChange={handleDateSelection}
                        />
                        <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-glass-border">
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Inicio</span>
                                <p className="text-white font-mono text-lg">{formData.startDate || '-'}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Duración</span>
                                <p className="text-white font-mono text-lg">{formData.treatmentDays || '0'} días</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="doctor" className="text-white font-semibold">Doctor que Prescribe</label>
                    <input
                        type="text"
                        id="doctor"
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleChange}
                        placeholder="Ej: Dr. Diego"
                        className="w-full px-4 py-3 bg-white/5 border-2 border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white"
                    />
                </div>

                <div>
                    <label htmlFor="status" className="text-white font-semibold">Estado del Medicamento</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border-2 border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white"
                    >
                        <option value="active">Activo</option>
                        <option value="suspended">Suspendido</option>
                    </select>
                </div>
            </div>

            {!initialData && (
                <div>
                    <label htmlFor="initialStock" className="text-white font-semibold">Stock Inicial (opcional)</label>
                    <input
                        type="number"
                        id="initialStock"
                        name="initialStock"
                        value={formData.initialStock}
                        onChange={handleChange}
                        placeholder="Número de pastillas disponibles"
                        className="w-full px-4 py-3 bg-white/5 border-2 border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white"
                        min="0"
                    />
                    <p className="text-xs text-text-muted mt-1">
                        Puedes agregar el stock inicial o hacerlo después desde el inventario
                    </p>
                </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-glass-border">
                <button type="button" onClick={onCancel} className="btn btn-ghost px-6 py-3 text-base">
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary px-6 py-3 text-base">
                    {initialData ? 'Actualizar' : 'Agregar'} Medicamento
                </button>
            </div>
        </form>
    );
};

export default MedicationForm;
