"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { SponsorForm } from '@/components/sponsor/SponsorForm';
import { createSponsor } from '@/lib/api';
import { SponsorFormData } from '@/lib/types/sponsor';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export default function NewSponsorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: SponsorFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
        // Directly await the API call. If it throws, the error propagates.
        await createSponsor(data);
        // No return needed here, success is implied if no error thrown
    } finally {
        // Always stop submitting, even if createSponsor throws
        setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'SPONSOR') {
        console.log("Redirecting: Not a sponsor or not logged in.");
        router.replace('/');
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.role !== 'SPONSOR') {
    return <div className="container mx-auto px-4 py-8">載入中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Alert className="mb-6">
        <Terminal className="h-4 w-4" />
        <AlertTitle>您好，贊助商！</AlertTitle>
        <AlertDescription>
          請填寫以下資訊來建立您的贊助商資料。建立後，您可以在此管理您的合作夥伴資訊。
        </AlertDescription>
      </Alert>
      <SponsorForm onSubmit={handleSubmit} isLoading={isSubmitting} isEditMode={false} />
    </div>
  );
}