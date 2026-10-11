import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export async function signUp({
  email,
  password,
  name,
  role = 'student',
  school = 'Model Higher Secondary School',
  studentClass = 'Class 11-A',
  studentHouse = 'Terra House',
}) {
  const cleanEmail = email.toLowerCase().trim();
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        name,
        role,
        school,
        studentClass,
        studentHouse,
      },
    },
  });

  if (authError) throw authError;

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      name,
      email: cleanEmail,
      role,
      school,
    });
    if (profileError) console.error('Profile creation error:', profileError);
  }

  return authData;
}

export async function signIn(email, password) {
  const cleanEmail = email.toLowerCase().trim();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserProfile(session.user.id, session.user.user_metadata);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id, session.user.user_metadata);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId, metadata = {}) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data);
      } else {
        setProfile({
          id: userId,
          name: metadata?.name || 'Verified User',
          email: metadata?.email || user?.email,
          role: metadata?.role || 'student',
          school: metadata?.school || 'Model Higher Secondary School',
        });
      }
    } catch {
      setProfile({
        id: userId,
        name: metadata?.name || 'Verified User',
        email: metadata?.email || user?.email,
        role: metadata?.role || 'student',
        school: metadata?.school || 'Model Higher Secondary School',
      });
    } finally {
      setLoading(false);
    }
  };

  const activeUser = user
    ? {
        ...user,
        name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0],
        role: profile?.role || user.user_metadata?.role || 'student',
        school: profile?.school || user.user_metadata?.school || 'Model Higher Secondary School',
        studentClass: profile?.student_class || user.user_metadata?.studentClass || 'Class 11-A',
        studentHouse: profile?.student_house || user.user_metadata?.studentHouse || 'Terra House',
      }
    : null;

  return {
    user: activeUser,
    profile,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };
}
