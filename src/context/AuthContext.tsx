import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (phone: string, password: string) => Promise<{ error: Error | null }>
  signUp: (phone: string, password: string, name: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user)
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setSupabaseUser(session.user)
        await fetchUserProfile(session.user.id)
      } else {
        setSupabaseUser(null)
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
      } else {
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (phone: string, password: string) => {
    try {
      // Convert phone to email format for Supabase auth
      const email = `${phone}@mol-coffee`
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { error }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error') }
    }
  }

  const signUp = async (phone: string, password: string, name: string) => {
    try {
      // Convert phone to email format for Supabase auth
      const email = `${phone}@mol-coffee`
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name, // Pass name to trigger via user metadata
          },
          emailRedirectTo: undefined, // No email confirmation needed
        }
      })

      if (error) return { error }

      // User profile will be created automatically by the handle_new_user trigger
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error') }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}