import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';
import Modal from '../components/common/Modal';
import ResidentForm from '../components/residents/ResidentForm';
import ResidentList from '../components/residents/ResidentList';

const ResidentsPage = () => {
    const { residents, addResident, updateResident, deleteResident } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResident, setEditingResident] = useState(null);

    const handleSubmit = (formData) => {
        if (editingResident) {
            updateResident(editingResident.id, formData);
        } else {
            addResident(formData);
        }
        setIsModalOpen(false);
        setEditingResident(null);
    };

    const handleEdit = (resident) => {
        setEditingResident(resident);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este residente?')) {
            deleteResident(id);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingResident(null);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            <div className="glass-card p-4 md:p-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Residentes</h1>
                    <p className="text-text-muted mt-1">
                        {residents.length} {residents.length === 1 ? 'residente registrado' : 'residentes registrados'}
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Nuevo Residente</span>
                </button>
            </div>

            {/* Residents List */}
            <ResidentList
                residents={residents}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCancel}
                title={editingResident ? 'Editar Residente' : 'Nuevo Residente'}
                size="md"
            >
                <ResidentForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    initialData={editingResident}
                />
            </Modal>
        </div>
    );
};

export default ResidentsPage;
