import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuth();

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);

    // Load data from Supabase when user is authenticated
    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setResidents([]);
            setLoading(false);
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch residents with their nested medications
            const { data, error } = await supabase
                .from('residents')
                .select(`
                    *,
                    medications (*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setResidents(data || []);
        } catch (error) {
            console.error('Error fetching data from Supabase:', error);
        } finally {
            setLoading(false);
        }
    };

    // Resident CRUD operations
    const addResident = async (residentData) => {
        try {
            const { data, error } = await supabase
                .from('residents')
                .insert([{
                    name: residentData.name,
                    room: residentData.room,
                    photo_url: residentData.photo_url,
                    user_id: user.id
                }])
                .select()
                .single();

            if (error) throw error;

            const newResident = { ...data, medications: [] };
            setResidents(prev => [newResident, ...prev]);
            return newResident;
        } catch (error) {
            console.error('Error adding resident:', error);
            return null;
        }
    };

    const updateResident = async (id, residentData) => {
        try {
            const { error } = await supabase
                .from('residents')
                .update({
                    name: residentData.name,
                    room: residentData.room,
                    photo_url: residentData.photo_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            setResidents(prev => prev.map(r =>
                r.id === id ? { ...r, ...residentData, updated_at: new Date().toISOString() } : r
            ));
        } catch (error) {
            console.error('Error updating resident:', error);
        }
    };

    const deleteResident = async (id) => {
        try {
            const { error } = await supabase
                .from('residents')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setResidents(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting resident:', error);
        }
    };

    const getResident = (id) => {
        return residents.find(r => r.id === id);
    };

    // Medication CRUD operations
    const addMedication = async (residentId, medicationData) => {
        try {
            const { data: medData, error: medError } = await supabase
                .from('medications')
                .insert([{
                    resident_id: residentId,
                    name: medicationData.name,
                    presentation: medicationData.presentation || null,
                    via: medicationData.via || 'VO',
                    "doseType": medicationData.doseType || 'fraction',
                    "pillFraction": medicationData.pillFraction || '1',
                    "doseAmount": medicationData.doseAmount || null,
                    "dosagePattern": medicationData.dosagePattern || '1-0-0-0',
                    schedules: medicationData.schedules || [],
                    "treatmentDays": medicationData.treatmentDays || '30',
                    "startDate": medicationData.startDate || new Date().toISOString().split('T')[0],
                    doctor: medicationData.doctor || null,
                    status: medicationData.status || 'active',
                    current_stock: parseFloat(medicationData.initialStock) || 0,
                    specific_days: medicationData.specificDays || null,
                    user_id: user.id
                }])
                .select()
                .single();

            if (medError) throw medError;

            // Create initial stock transaction if needed
            if (medicationData.initialStock) {
                await supabase.from('transactions').insert([{
                    medication_id: medData.id,
                    resident_id: residentId,
                    user_id: user.id,
                    type: 'initial',
                    amount: parseFloat(medicationData.initialStock),
                    note: 'Stock inicial'
                }]);
            }

            setResidents(prev => prev.map(r => {
                if (r.id === residentId) {
                    return {
                        ...r,
                        medications: [...(r.medications || []), medData]
                    };
                }
                return r;
            }));

            return medData;
        } catch (error) {
            console.error('Error adding medication:', error);
            return null;
        }
    };

    const updateMedication = async (residentId, medicationId, medicationData) => {
        try {
            const updatePayload = {
                name: medicationData.name,
                presentation: medicationData.presentation || null,
                via: medicationData.via || 'VO',
                "doseType": medicationData.doseType || 'fraction',
                "pillFraction": medicationData.pillFraction || '1',
                "doseAmount": medicationData.doseAmount || null,
                "dosagePattern": medicationData.dosagePattern || '1-0-0-0',
                schedules: medicationData.schedules || [],
                "treatmentDays": medicationData.treatmentDays || '30',
                "startDate": medicationData.startDate || null,
                "specific_days": medicationData.specificDays || null,
                doctor: medicationData.doctor || null,
                status: medicationData.status || 'active',
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('medications')
                .update(updatePayload)
                .eq('id', medicationId);

            if (error) throw error;

            setResidents(prev => prev.map(r => {
                if (r.id === residentId) {
                    return {
                        ...r,
                        medications: r.medications.map(m =>
                            m.id === medicationId
                                ? { ...m, ...updatePayload }
                                : m
                        )
                    };
                }
                return r;
            }));
        } catch (error) {
            console.error('Error updating medication:', error);
        }
    };

    const deleteMedication = async (residentId, medicationId) => {
        try {
            const { error } = await supabase
                .from('medications')
                .delete()
                .eq('id', medicationId);

            if (error) throw error;

            setResidents(prev => prev.map(r => {
                if (r.id === residentId) {
                    return {
                        ...r,
                        medications: r.medications.filter(m => m.id !== medicationId)
                    };
                }
                return r;
            }));
        } catch (error) {
            console.error('Error deleting medication:', error);
        }
    };

    const getMedication = (residentId, medicationId) => {
        const resident = residents.find(r => r.id === residentId);
        if (!resident) return null;
        return resident.medications?.find(m => m.id === medicationId);
    };

    // Inventory operations
    const updateInventory = async (residentId, medicationId, stockChange, note = '') => {
        try {
            const medication = getMedication(residentId, medicationId);
            if (!medication) return;

            const newStock = Math.max(0, (parseFloat(medication.current_stock) || 0) + stockChange);

            // Add transaction
            const { error: transError } = await supabase
                .from('transactions')
                .insert([{
                    medication_id: medicationId,
                    resident_id: residentId,
                    user_id: user.id,
                    type: stockChange > 0 ? 'add' : 'remove',
                    amount: Math.abs(stockChange),
                    note: note || (stockChange > 0 ? 'Entrada de stock' : 'Salida de stock')
                }]);

            if (transError) throw transError;

            // Update stock in medication table
            const { error: medError } = await supabase
                .from('medications')
                .update({ current_stock: newStock })
                .eq('id', medicationId);

            if (medError) throw medError;

            // Update local state
            setResidents(prev => prev.map(r => {
                if (r.id === residentId) {
                    return {
                        ...r,
                        medications: r.medications.map(m => {
                            if (m.id === medicationId) {
                                return { ...m, current_stock: newStock };
                            }
                            return m;
                        })
                    };
                }
                return r;
            }));
        } catch (error) {
            console.error('Error updating inventory:', error);
        }
    };

    const administerMedication = async (residentId, medicationId, amount, medicationName, units = 'unidades', nurseName = null) => {
        try {
            const medication = getMedication(residentId, medicationId);
            if (!medication) return;

            const newStock = Math.max(0, (parseFloat(medication.current_stock) || 0) - amount);

            const noteText = nurseName
                ? `Administración por Enf. ${nurseName}: ${medicationName} (${amount} ${units})`
                : `Administración: ${medicationName} (${amount} ${units})`;

            // 1. Register the administration transaction
            const { error: adminError } = await supabase
                .from('transactions')
                .insert([{
                    medication_id: medicationId,
                    resident_id: residentId,
                    user_id: user?.id || null,
                    type: 'administer',
                    amount: amount,
                    note: noteText,
                    nurse_name: nurseName || null
                }]);

            if (adminError) throw adminError;

            // 2. Update current stock
            const { error: medError } = await supabase
                .from('medications')
                .update({ current_stock: newStock })
                .eq('id', medicationId);

            if (medError) throw medError;

            // 3. Update local state
            setResidents(prev => prev.map(r => {
                if (r.id === residentId) {
                    return {
                        ...r,
                        medications: r.medications.map(m => {
                            if (m.id === medicationId) {
                                return { ...m, current_stock: newStock };
                            }
                            return m;
                        })
                    };
                }
                return r;
            }));
        } catch (error) {
            console.error('Error registering administration:', error);
        }
    };

    const getTransactions = async (medicationId) => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('medication_id', medicationId)
                .order('date', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }
    };

    const migrateLocalData = async () => {
        try {
            const savedData = localStorage.getItem('pastillero-digital-data');
            if (!savedData) {
                alert('No se encontraron datos locales para migrar.');
                return false;
            }

            const parsed = JSON.parse(savedData);
            const localResidents = parsed.residents || [];

            if (localResidents.length === 0) {
                alert('No hay residentes registrados en los datos locales.');
                return false;
            }

            let migratedCount = 0;

            for (const localRes of localResidents) {
                // 1. Add Resident
                const newRes = await addResident({
                    name: localRes.name,
                    room: localRes.room,
                    photo_url: localRes.photo_url || localRes.photo
                });

                if (newRes && localRes.medications) {
                    for (const localMed of localRes.medications) {
                        // 2. Add Medication
                        await addMedication(newRes.id, {
                            name: localMed.name,
                            dose: localMed.dose,
                            dose_type: localMed.dose_type || localMed.units || 'unidades',
                            frequency: localMed.frequency,
                            initialStock: localMed.inventory?.currentStock || 0
                        });
                    }
                }
                migratedCount++;
            }

            await fetchData();
            alert(`¡Éxito! Se migraron ${migratedCount} residentes y sus medicamentos a la nube.`);
            // Optional: clean up
            // localStorage.removeItem('pastillero-digital-data');
            return true;
        } catch (error) {
            console.error('Error durante la migración:', error);
            alert('Ocurrió un error durante la migración. Revisa la consola.');
            return false;
        }
    };

    const value = {
        residents,
        loading,
        addResident,
        updateResident,
        deleteResident,
        getResident,
        addMedication,
        updateMedication,
        deleteMedication,
        getMedication,
        updateInventory,
        administerMedication,
        getTransactions,
        refreshData: fetchData,
        migrateLocalData,
        isSidebarOpen,
        toggleSidebar,
        closeSidebar
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

