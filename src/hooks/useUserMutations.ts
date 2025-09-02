import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { User } from '../types'
import { USER_ROLES, type UserRole } from '../constants/userRoles'

interface MutationCallbacks<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { 
      id: string; 
      name?: string; 
      role?: UserRole;
      status?: 'active' | 'inactive';
    }) => {
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      console.error('Error updating user:', error)
    }
  })
}

export function useToggleUserRole(callbacks?: MutationCallbacks<User>) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (user: User) => {
      const newRole = user.role === USER_ROLES.ADMIN ? USER_ROLES.EMPLOYEE : USER_ROLES.ADMIN
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', data.id] })
      callbacks?.onSuccess?.(data)
    },
    onError: (error) => {
      console.error('Error toggling user role:', error)
      callbacks?.onError?.(error)
    }
  })
}

export function useToggleUserStatus(callbacks?: MutationCallbacks<User>) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (user: User) => {
      const newStatus = user.status === 'active' ? 'inactive' : 'active'
      const { data, error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', data.id] })
      callbacks?.onSuccess?.(data)
    },
    onError: (error) => {
      console.error('Error toggling user status:', error)
      callbacks?.onError?.(error)
    }
  })
}

export function useDeleteUser(callbacks?: MutationCallbacks<{id: string}>) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // First get the auth_user_id from the public.users table
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('auth_user_id')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError
      if (!userData) throw new Error('User not found')

      // Delete from auth.users - this will cascade delete from public.users
      const { error: authError } = await supabase.auth.admin.deleteUser(userData.auth_user_id)
      
      if (authError) throw authError

      return { id: userId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      callbacks?.onSuccess?.(data)
    },
    onError: (error) => {
      console.error('Error deleting user:', error)
      callbacks?.onError?.(error)
    }
  })
}