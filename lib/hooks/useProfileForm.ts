import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { useAuth } from '@/lib/auth-context';
import { apiService } from '@/lib/api';
import { profileSchema, ProfileFormData } from '@/lib/schemas/profile';
import { User } from '@/lib/types';

export function useProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    // Default values are set in the useEffect after fetching user data
  });

  const { control, handleSubmit, reset, formState: { errors } } = form;

  const handleLogout = useCallback(() => {
    setUser(null);
    // No need to push to /login here, relying on protected route logic
  }, [setUser]);

  // Fetch user profile on mount and reset form
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const userData = await apiService.getCurrentUser();

        if (!userData) {
          // If no user data, likely not logged in, rely on page protection
          // toast.error('請先登入');
          // router.push('/login'); 
          setIsLoading(false); // Stop loading even if no user
          return;
        }

        reset({
          realName: userData.realName || '',
          nickname: userData.nickname || '',
          position: userData.position || 'NONE',
          level: userData.level || 'BEGINNER',
          volleyballAge: userData.volleyballAge ?? 0, // Use ?? for null/undefined
          gender: userData.gender || 'MALE',
          introduction: userData.introduction || '',
          avatar: userData.avatar || '',
        });
      } catch (err: any) {
        console.error('[Profile Fetch Error]:', err);
        // Error fetching profile, likely needs login
        // toast.error('無法載入個人資料，請重新登入');
        // router.push('/login'); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [reset]); // Removed router from deps as push is commented

  // Handle LINE callback codes - maybe move elsewhere?
  useEffect(() => {
    const code = searchParams?.get('code');
    const state = searchParams?.get('state');

    if (code && state) {
      // Clear params from URL without forcing a full page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      // Potentially trigger a user data refetch or redirect if needed after LINE login
      console.log('LINE callback parameters detected and cleared.');
    }
  }, [searchParams]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) {
      toast.error("用戶驗證失敗，請重新登入");
      handleLogout();
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await apiService.updateUser(user.id, data);
      setUser(updatedUser); // Update context
      toast.success('個人資料已更新');
      // Optional: redirect after successful update
      // setTimeout(() => router.push('/'), 1000);
    } catch (error) {
      console.error('[Profile Update Error]:', error);
      const axiosError = error as AxiosError<{ message?: string, error?: string }>;
      let errorMessage = "更新失敗，請稍後再試"; // Default error message
      
      if (axiosError.response) {
          const status = axiosError.response.status;
          const responseData = axiosError.response.data;
          errorMessage = responseData?.message || responseData?.error || axiosError.message;
          
          if (status === 401 || status === 403 || status === 404) {
              toast.error('驗證失敗或用戶不存在，請重新登入');
              handleLogout();
              return; // Stop further processing
          }
      } else if (axiosError.request) {
          errorMessage = "無法連接到伺服器，請檢查網路連線";
      } else {
          errorMessage = (error as Error).message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    user,
    isLoading,
    isSubmitting,
    form,
    control,
    handleSubmit,
    errors,
    onSubmit,
    handleLogout, // Expose if needed elsewhere
  };
} 