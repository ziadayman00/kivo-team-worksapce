import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { AccountDto, LoginInput, RegisterInput } from '@kivo/api-client';

export interface AuthContextType {
  user: AccountDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<AccountDto | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await apiClient.auth.me();
        return res.data?.account ?? null;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      const res = await apiClient.auth.login(input);
      return res.data?.account ?? null;
    },
    onSuccess: (account) => {
      queryClient.setQueryData(['auth', 'me'], account);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (input: RegisterInput) => {
      await apiClient.auth.register(input);
      // Automatically log in after registration
      const loginRes = await apiClient.auth.login({
        email: input.email,
        password: input.password,
      });
      return loginRes.data?.account ?? null;
    },
    onSuccess: (account) => {
      queryClient.setQueryData(['auth', 'me'], account);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.auth.logout();
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
    },
  });

  const handleLogin = async (input: LoginInput) => {
    await loginMutation.mutateAsync(input);
  };

  const handleRegister = async (input: RegisterInput) => {
    await registerMutation.mutateAsync(input);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const handleRefetchUser = async () => {
    await refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refetchUser: handleRefetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
