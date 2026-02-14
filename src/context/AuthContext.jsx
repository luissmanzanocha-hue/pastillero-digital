import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [nurseSession, setNurseSession] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'admin' | 'nurse' | null

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        // Check active sessions and sets the user
        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                if (session?.user) {
                    setUser(session.user);
                    setUserRole('admin');
                } else {
                    setUser(null);
                    setUserRole(null);
                }
            } catch (error) {
                console.error("Error getting session:", error);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                setUserRole('admin');
            } else {
                setUser(null);
                // Only clear role if not a nurse session
                if (!nurseSession) {
                    setUserRole(null);
                }
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = (email, password) => {
        if (!supabase) return Promise.reject(new Error("Conexión a base de datos no disponible"));
        return supabase.auth.signUp({ email, password });
    };

    const signIn = async (email, password) => {
        if (!supabase) return Promise.reject(new Error("Conexión a base de datos no disponible"));
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (!result.error) {
            setUserRole('admin');
            setNurseSession(null);
        }
        return result;
    };

    const signInAsNurse = async (username, password) => {
        if (!supabase) throw new Error("Conexión a base de datos no disponible");

        const { data, error } = await supabase
            .from('nurses')
            .select('*')
            .eq('username', username.trim().toLowerCase())
            .eq('password', password)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            throw new Error('Credenciales de enfermera incorrectas');
        }

        setNurseSession(data);
        setUserRole('nurse');
        return data;
    };

    const signOut = async () => {
        if (nurseSession) {
            // Nurse sign out - just clear local state
            setNurseSession(null);
            setUserRole(null);
            return;
        }
        if (!supabase) return;
        await supabase.auth.signOut();
        setUser(null);
        setUserRole(null);
        setNurseSession(null);
    };

    const isAuthenticated = !!user || !!nurseSession;

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            nurseSession,
            userRole,
            isAuthenticated,
            signUp,
            signIn,
            signInAsNurse,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
