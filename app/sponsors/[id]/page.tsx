"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSponsor } from "@/lib/api";
import { Sponsor } from "@/lib/types/sponsor";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Terminal,
  Edit,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SponsorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sponsorId = typeof params.id === "string" ? params.id : null;
  const { user, loading: authLoading } = useAuth();

  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const placeholderLogo = "/images/placeholder-logo.svg";

  useEffect(() => {
    if (!sponsorId) {
      setError("無效的贊助商 ID");
      setLoading(false);
      return;
    }

    const fetchSponsor = async () => {
      try {
        const data = await getSponsor(sponsorId);
        setSponsor(data);
      } catch (err: any) {
        console.error("Failed to fetch sponsor:", err);
        const status = err?.response?.status;
        setError(status === 404 ? "找不到贊助商資料。" : "載入資料時發生錯誤，請稍後再試。");
      } finally {
        setLoading(false);
      }
    };

    fetchSponsor();
  }, [sponsorId]);

  const canEdit =
    !authLoading &&
    user?.role === "SPONSOR" &&
    sponsor?.userId === user?.id;

  const isValidImageUrl = (url?: string | null) =>
    !!url && /\.(jpg|jpeg|png|svg|webp)$/i.test(url);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-10 w-1/3 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="aspect-square w-full rounded-lg md:col-span-1" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-[150px] w-full rounded-lg" />
            <Skeleton className="h-[100px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>無法載入</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!sponsor) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-muted/30 border-b p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{sponsor.name}</h1>
              <CardDescription className="mt-1">合作夥伴資訊</CardDescription>
            </div>
            {canEdit && (
              <Button asChild size="sm">
                <Link href={`/sponsors/edit/${sponsor.id}`}>
                  <Edit className="mr-2 h-4 w-4" /> 編輯資料
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 圖片 */}
          <div className="md:col-span-1 flex justify-center">
            <div className="relative w-full max-w-[280px] h-[280px] rounded-lg overflow-hidden border bg-background">
              <Image
                src={isValidImageUrl(sponsor.logoUrl) ? sponsor.logoUrl : placeholderLogo}
                alt={`${sponsor.name} Logo`}
                fill
                className="object-contain p-4"
                priority
                sizes="(max-width: 768px) 80vw, 280px"
              />
            </div>
          </div>

          {/* 詳細資訊 */}
          <div className="md:col-span-2 space-y-6">
            {sponsor.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold">關於 {sponsor.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {sponsor.description}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">聯絡資訊</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 text-sm">
                {sponsor.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-muted-foreground shrink-0" />
                    <span>{sponsor.phone}</span>
                  </div>
                )}
                {sponsor.contactEmail && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-muted-foreground shrink-0" />
                    <a href={`mailto:${sponsor.contactEmail}`} className="hover:underline truncate min-w-0">
                      {sponsor.contactEmail}
                    </a>
                  </div>
                )}
                {sponsor.websiteUrl && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-3 text-muted-foreground shrink-0" />
                    <a
                      href={sponsor.websiteUrl.startsWith("http") ? sponsor.websiteUrl : `https://${sponsor.websiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate min-w-0 text-primary"
                    >
                      {sponsor.websiteUrl}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}