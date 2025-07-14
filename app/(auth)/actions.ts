'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createUser, getUser, createGuestUser } from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';

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

export interface GuestActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed';
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

    // Check if user already exists in our database
    const existingUsers = await getUser(validatedData.email);
    if (existingUsers.length > 0) {
      return { 
        status: 'user_exists',
        error: 'A user with this email already exists'
      };
    }

    // Create user in Supabase
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return { 
        status: 'failed',
        error: error.message 
      };
    }

    // If user creation was successful, create user in our database
    if (data.user) {
      try {
        await createUser(validatedData.email, validatedData.password);
      } catch (dbError) {
        // If database creation fails, we should handle this gracefully
        console.error('Failed to create user in database:', dbError);
        // The user is still created in Supabase, so we can continue
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

export const createGuest = async (
  _: GuestActionState,
): Promise<GuestActionState> => {
  try {
    const supabase = await createClient();

    // Sign in anonymously with Supabase
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      return { 
        status: 'failed',
        error: error.message 
      };
    }

    // Create guest user in our database
    if (data.user) {
      try {
        await createGuestUser();
      } catch (dbError) {
        console.error('Failed to create guest user in database:', dbError);
        // Continue anyway as the anonymous session is created
      }
    }

    return { status: 'success' };
  } catch (error) {
    return { 
      status: 'failed',
      error: 'Failed to create guest session'
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

// Helper function to determine user type
export const getUserType = async (): Promise<'guest' | 'regular' | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  // Anonymous users are guests
  if (user.is_anonymous) return 'guest';
  
  // Users with email are regular users
  if (user.email) return 'regular';
  
  return null;
}; 