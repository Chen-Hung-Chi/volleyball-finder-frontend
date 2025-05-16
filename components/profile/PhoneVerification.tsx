"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecaptchaContainer } from "./RecaptchaContainer";
import { toast } from "react-toastify";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { handleApiError } from "@/lib/error";
import { Loader2 } from "lucide-react";

interface PhoneVerificationProps {
  initialPhone?: string;
  onVerified: (phone: string) => void;
}

const COUNTDOWN_SECONDS = 60; // 驗證碼有效 1 分鐘
const MAX_ATTEMPTS = 3; // 驗證碼最多可輸入 3 次

export function PhoneVerification({ initialPhone = "", onVerified }: PhoneVerificationProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sendAttempts, setSendAttempts] = useState(0);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const [recaptchaKey, setRecaptchaKey] = useState(0);

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const confirmResultRef = useRef<any>(null);

  // 冷卻倒數
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // 驗證碼倒數
  useEffect(() => {
    if (!codeSent || phoneVerified || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("驗證碼已過期，請重新發送");
          setCodeSent(false);
          setCode("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [codeSent, phoneVerified, timeLeft]);

  // 每次發送時 reset attempts
  useEffect(() => {
    if (codeSent) setVerifyAttempts(0);
  }, [codeSent]);

  const codeInputRef = useRef<HTMLInputElement>(null);

  const sendPhoneCode = async () => {
    if (cooldown > 0) {
      toast.error(`請稍候 ${cooldown} 秒後再嘗試發送`);
      return;
    }
    if (!/^09\d{8}$/.test(phone)) {
      toast.error("請輸入正確的台灣手機號碼");
      return;
    }
    if (sendAttempts >= MAX_ATTEMPTS) {
      toast.error("已達今日發送上限");
      return;
    }
    setIsSendingCode(true);
    setRecaptchaKey((prev) => prev + 1);
    setTimeout(async () => {
      try {
        if ((window as any).recaptchaVerifier) {
          (window as any).recaptchaVerifier.clear();
          (window as any).recaptchaVerifier = null;
          const grecaptcha = (window as any).grecaptcha;
          if (grecaptcha && typeof grecaptcha.reset === "function") {
            grecaptcha.reset();
          }
        }
        (window as any).recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );
        const fullNumber = "+886" + phone.slice(1);
        const result = await signInWithPhoneNumber(auth, fullNumber, (window as any).recaptchaVerifier);
        confirmResultRef.current = result;
        setSendAttempts((prev) => prev + 1);
        setCooldown(60);
        setCodeSent(true);
        setTimeLeft(COUNTDOWN_SECONDS);
        setCode("");
        toast.info("驗證碼已發送，請於 1 分鐘內輸入 6 位數字");
        setVerifyAttempts(0);
        setTimeout(() => {
          codeInputRef.current?.focus();
        }, 200);
      } catch (e) {
        handleApiError(e);
      } finally {
        setIsSendingCode(false);
      }
    }, 0);
  };

  const verifyPhoneCode = async () => {
    if (!codeSent || phoneVerified) return;
    if (verifyAttempts >= MAX_ATTEMPTS) {
      toast.error("已超過驗證次數限制，請稍後再試");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      toast.error("請輸入 6 位數字驗證碼");
      return;
    }
    setIsVerifyingCode(true);
    try {
      await confirmResultRef.current.confirm(code);
      setPhoneVerified(true);
      toast.info("手機已驗證");
      onVerified(phone);
    } catch (e: any) {
      setVerifyAttempts((prev) => prev + 1);
      if (e.code === "auth/invalid-verification-code") {
        toast.error("驗證碼錯誤，請確認您輸入的 6 位數字是否正確");
      } else {
        handleApiError(e);
      }
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const canSend = !phoneVerified && sendAttempts < MAX_ATTEMPTS && cooldown === 0 && !isSendingCode;

  return (
    <div className="space-y-2">
      <div className="flex flex-col md:flex-row md:items-end gap-2">
        <div className="flex-1">
          <Input
            type="tel"
            pattern="09\d{8}"
            inputMode="tel"
            maxLength={10}
            minLength={10}
            value={phone}
            disabled={phoneVerified || isSendingCode}
            onChange={e => setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
            placeholder="0912345678"
            className="w-full"
          />
        </div>
        <Button
          type="button"
          onClick={sendPhoneCode}
          disabled={!canSend || phone.length !== 10}
          className="whitespace-nowrap"
          variant={phoneVerified ? "secondary" : "default"}
        >
          {isSendingCode ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />發送中...</>
          ) : phoneVerified ? (
            "已驗證"
          ) : sendAttempts >= MAX_ATTEMPTS ? (
            "已達上限"
          ) : cooldown > 0 ? (
            `請稍候 ${cooldown}s`
          ) : (
            "發送驗證碼"
          )}
        </Button>
      </div>
      {codeSent && !phoneVerified && (
        <>
          <div className="flex items-center gap-2 mt-2">
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              minLength={6}
              ref={codeInputRef}
              value={code}
              onChange={e => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
              placeholder="請輸入 6 位驗證碼"
              className="w-1/2 min-w-[90px] max-w-[180px]"
              disabled={verifyAttempts >= MAX_ATTEMPTS || isVerifyingCode}
            />
            <Button
              type="button"
              onClick={verifyPhoneCode}
              disabled={ 
                !code ||
                phoneVerified ||
                verifyAttempts >= MAX_ATTEMPTS ||
                !/^\d{6}$/.test(code) ||
                isVerifyingCode
              }
            >
              {isVerifyingCode ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />驗證中...</>
              ) : (
                "驗證"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            驗證碼將於 {Math.floor(timeLeft / 60)} 分 {timeLeft % 60} 秒後過期
            （剩餘嘗試次數 {MAX_ATTEMPTS - verifyAttempts}）
          </p>
        </>
      )}
      <RecaptchaContainer recaptchaKey={recaptchaKey} />
    </div>
  );
}
