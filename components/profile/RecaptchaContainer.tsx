

import React from "react";

/**
 * 這個元件專門負責 reCAPTCHA 的 DOM 容器，每次 key 改變就會刷新容器，避免重複渲染錯誤。
 * 用法範例：
 * <RecaptchaContainer recaptchaKey={someKey} />
 */
export function RecaptchaContainer({ recaptchaKey }: { recaptchaKey: number }) {
  return <div key={recaptchaKey} id="recaptcha-container" />;
}