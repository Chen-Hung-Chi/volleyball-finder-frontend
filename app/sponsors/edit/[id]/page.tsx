"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { SponsorForm } from '@/components/sponsor/SponsorForm';
import { getSponsor, updateSponsor } from '@/lib/api';
import { Sponsor, SponsorFormData } from '@/lib/types/sponsor';
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export default function EditSponsorPage() {
  const router = useRouter();
  const params = useParams();
  const sponsorId = typeof params.id === 'string' ? params.id : null;
  const { user, loading: authLoading } = useAuth();

  const [sponsorData, setSponsorData] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== 'SPONSOR') {
      router.replace('/');
      return;
    }

    if (!sponsorId) {
      setError("無效的贊助商 ID。");
      setLoading(false);
      return;
    }

    const fetchSponsorData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSponsor(sponsorId as string);

        if (!data) {
          setError("找不到贊助商資料。");
          return;
        }

        if (String(data.userId) !== String(user?.id)) {
          setError("您無權編輯此贊助商資料。");
          return;
        }

        setSponsorData(data);
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 404) {
          setError("找不到指定的贊助商資料。");
        } else if (status === 403) {
          setError("您無權檢視此贊助商資料。");
        } else {
          setError("載入贊助商資料時發生錯誤。");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSponsorData();
  }, [sponsorId, user, authLoading, router]);

  const handleSubmit = async (data: SponsorFormData): Promise<boolean> => {
    if (!sponsorId) return false;
    setIsSubmitting(true);
    try {
      // 移除 linePayChannelId/Secret 的送出
      const { linePayChannelId, linePayChannelSecret, ...filteredData } = data;
      const success = await updateSponsor(sponsorId, filteredData);
      if (success) {
        router.push('/sponsors');
        router.refresh();
      }
      return success;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-2/3 mb-6" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>錯誤</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!sponsorData) {
    return <div className="container mx-auto px-4 py-8 max-w-3xl">找不到贊助商資料。</div>;
  }

  const defaultValues: Partial<SponsorFormData> = {
    name: sponsorData.name,
    contactEmail: sponsorData.contactEmail ?? '',
    phone: sponsorData.phone,
    description: sponsorData.description ?? '',
    logoUrl: sponsorData.logoUrl,
    websiteUrl: sponsorData.websiteUrl ?? '',
    isActive: sponsorData.isActive ?? true,
    useLinePay: sponsorData.useLinePay ?? false,
    linePayMode: sponsorData.linePayMode,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <SponsorForm
        onSubmit={handleSubmit}
        defaultValues={defaultValues}
        isLoading={isSubmitting}
        isEditMode={true}
      />
    </div>
  );
}