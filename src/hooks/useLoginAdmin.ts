import { useMutation } from '@tanstack/react-query';
import { loginAdmin } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest } from '@/types/auth';

export function useLoginAdmin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => loginAdmin(credentials),
    onSuccess: (session) => {
      setSession(session);
    },
  });
}
