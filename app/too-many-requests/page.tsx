"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { Timer } from "lucide-react";

const RATE_LIMIT_SECONDS = 60;

export default function TooManyRequestsPage() {
  const router = useRouter();
  const { secondsLeft, isFinished } = useCountdown(RATE_LIMIT_SECONDS);

  const handleBack = () => {
    if (window.history.length > 1) {
        router.back();
    } else {
        router.push('/');
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-10rem)] py-6">
      <Card className="max-w-md w-full">
        <CardHeader className="items-center">
          <Timer className="h-12 w-12 text-destructive mb-3" />
          <CardTitle className="text-2xl text-center">請求過於頻繁</CardTitle>
          <CardDescription className="text-center">
            您在短時間內發送了太多請求。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {!isFinished ? (
            <>
              <p className="text-muted-foreground mb-4">
                為了保護系統，請等待倒數結束後再試：
              </p>
              <div className="text-4xl font-bold text-primary mb-6">
                {secondsLeft} 秒
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                您可以返回上一頁或重試操作。
              </p>
              <Button 
                variant="default" 
                onClick={handleBack}
                className="w-full"
              >
                返回上一頁
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 