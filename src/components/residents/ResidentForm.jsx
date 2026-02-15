import React, { useState } from 'react';
import { validateResidentForm } from '../../utils/validators';
import Alert from '../common/Alert';

const ResidentForm = ({ onSubmit, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        age: initialData?.age || '',
        notes: initialData?.notes || ''
    });

    const [errors, setErrors] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validation = validateResidentForm(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setErrors([]);
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {errors.length > 0 && (
                <Alert
                    type="danger"
                    title="Errores en el formulario"
                    message={errors.join(', ')}
                />
            )}

            <div>
                <label htmlFor="name" className="text-sm text-white font-semibold">Nombre Completo *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez García"
                    className="w-full px-3 py-2 bg-white/5 border border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="age" className="text-sm text-white font-semibold">Edad</label>
                <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Ej: 75"
                    className="w-full px-3 py-2 bg-white/5 border border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white text-sm"
                    min="0"
                    max="150"
                />
            </div>

            <div>
                <label htmlFor="notes" className="text-sm text-white font-semibold">Notas Médicas</label>
                <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Información adicional..."
                    className="w-full px-3 py-2 bg-white/5 border border-glass-border rounded-lg focus:border-primary focus:bg-white/10 transition-all text-white text-sm"
                    rows="2"
                />
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-glass-border">
                <button type="button" onClick={onCancel} className="btn btn-ghost px-4 py-2 text-sm">
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary px-4 py-2 text-sm">
                    {initialData ? 'Actualizar' : 'Crear'} Residente
                </button>
            </div>
        </form>
    );
};

export default ResidentForm;
