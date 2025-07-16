'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
  error?: string;
}

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
  error?: string;
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return { 
        status: 'failed',
        error: error.message 
      };
    }

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        status: 'invalid_data',
        error: 'Invalid email or password format'
      };
    }

    return { 
      status: 'failed',
      error: 'An unexpected error occurred'
    };
  }
};

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const supabase = await createClient();

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      // Handle specific Supabase Auth errors
      if (error.message.includes('already registered')) {
        return { 
          status: 'user_exists',
          error: 'A user with this email already exists'
        };
      }
      
      return { 
        status: 'failed',
        error: error.message 
      };
    }

    // If user is created successfully, create profile entry
    if (data.user) {
      try {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: data.user.email?.split('@')[0] || 'User',
          // Add other default values as needed
        });
      } catch (dbError) {
        console.error('Failed to create user profile:', dbError);
        // Continue anyway as the user is created in Auth
      }
    }

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        status: 'invalid_data',
        error: 'Invalid email or password format'
      };
    }

    return { 
      status: 'failed',
      error: 'An unexpected error occurred'
    };
  }
};

export const signOut = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
};

// Helper function to get current user from Supabase
export const getCurrentUser = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to get current session
export const getCurrentSession = async () => {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Helper function to get current user profile
export const getCurrentUserProfile = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return profile;
};

// Helper function to ensure user has a profile
export const ensureUserProfile = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (!existingProfile) {
    // Create profile if it doesn't exist
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url,
        // Add other default values as needed
      })
      .select()
      .single();
      
    return newProfile;
  }
  
  return existingProfile;
};
