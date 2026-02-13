import React, { useState } from 'react';
import ResidentCard from './ResidentCard';
import { Search } from 'lucide-react';

const ResidentList = ({ residents, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredResidents = residents.filter(resident =>
        resident.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Search */}
            {residents.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12"
                    />
                </div>
            )}

            {/* Residents Grid */}
            {filteredResidents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResidents.map(resident => (
                        <ResidentCard
                            key={`${resident.id}-${JSON.stringify(resident.medications)}`}
                            resident={resident}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <p className="text-text-muted">
                        {searchTerm ? 'No se encontraron residentes' : 'No hay residentes registrados'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ResidentList;
