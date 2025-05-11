"use client";

import { useEffect, useState } from "react";
import { getAllSponsors } from "@/lib/api";
import { Sponsor } from "@/lib/types/sponsor";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const placeholderLogo = "/placeholder-logo.svg";

export default function SponsorsPage() {
  /**
   * state 管理
   * - sponsors: 贊助商列表
   * - status: 資料請求狀態 (idle | loading | error | success)
   * - error: 錯誤訊息 (若有)
   */
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  // 取得贊助商
  useEffect(() => {
    let ignore = false;

    async function fetchSponsors() {
      try {
        setStatus("loading");
        const data = await getAllSponsors();
        if (!ignore) {
          setSponsors(data);
          setStatus("success");
        }
      } catch (err) {
        console.error("Failed to fetch sponsors:", err);
        if (!ignore) {
          setError("無法載入贊助商列表，請稍後再試。");
          setStatus("error");
        }
      }
    }

    fetchSponsors();
    return () => {
      ignore = true; // 避免組件卸載後呼叫 setState()
    };
  }, []);

  const isSponsorUser = user?.role === "SPONSOR";
  const mySponsorId = isSponsorUser ? sponsors.find((s) => s.userId === user?.id)?.id ?? null : null;
  const activeSponsors = sponsors.filter((s) => s.isActive !== false);

  /**
   * 渲染單一贊助商卡片
   */
  const renderSponsorCard = (sponsor: Sponsor) => {
    const hasValidLogo = sponsor.logoUrl?.match(/\.(jpg|jpeg|png|svg|webp)$/i);
    return (
      <Link
        key={sponsor.id}
        href={`/sponsors/${sponsor.id}`}
        className="block w-full max-w-[320px] aspect-[4/3] rounded-lg overflow-hidden border bg-background hover:shadow-lg transition-all duration-300 relative group"
        aria-label={`查看 ${sponsor.name} 的詳細資訊`}
      >
        <Image
          src={hasValidLogo ? sponsor.logoUrl : placeholderLogo}
          alt={`${sponsor.name} Logo`}
          fill
          className="object-cover p-0 group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
    );
  };

  /**
   * 加入贊助商按鈕
   */
  const handleJoinSponsorClick = () => {
    if (!isSponsorUser) {
      toast.error("您不是合作夥伴，如需申請請聯絡管理員(LineId:Nisakevo)");
      return;
    }
    router.push(mySponsorId ? `/sponsors/${mySponsorId}` : "/sponsors/new");
  };

  return (
    <div>
      {/* Logo Section */}
      <section className="bg-muted/30 dark:bg-muted/20 py-12 md:py-16 border-b">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">我們的合作夥伴</h2>

          {status === "loading" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          )}

          {status === "error" && error && (
            <Alert variant="destructive" className="max-w-md mx-auto">
              <Terminal className="h-4 w-4" />
              <AlertTitle>載入錯誤</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <>
              {activeSponsors.length === 0 ? (
                <p className="text-muted-foreground text-center">目前尚無合作夥伴。</p>
              ) : activeSponsors.length === 1 ? (
                <div className="flex justify-center">{renderSponsorCard(activeSponsors[0])}</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 items-center">
                  {activeSponsors.map(renderSponsorCard)}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background via-background to-primary/5 dark:to-muted/10 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
            支持排球社群
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            我們的合作夥伴在推廣排球運動與連結愛好者之間扮演關鍵角色。<br />
            他們的慷慨支持幫助我們提供更好的平台與服務。
          </p>

          <Button onClick={handleJoinSponsorClick} className="mt-8">
            加入我們的合作夥伴
          </Button>
        </div>
      </section>
    </div>
  );
}
