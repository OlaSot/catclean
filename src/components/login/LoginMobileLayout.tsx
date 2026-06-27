"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Lock, Mail, Phone } from "lucide-react";
import { LoginFooter } from "@/components/login/LoginFooter";
import { LoginSegmentedControl } from "@/components/login/LoginSegmentedControl";
import {
  LOGIN_COPY,
  LOGIN_INPUT_CLASS,
  LOGIN_INPUT_MOBILE_CLASS,
  LOGIN_MOBILE_STAFF_COPY,
  LOGIN_PRIMARY_BUTTON_CLASS,
  LOGIN_PRIMARY_BUTTON_MOBILE_CLASS,
} from "@/components/login/login-styles";
import { PHONE_FORM_EXAMPLE } from "@/lib/phone/profile-phone";

type LoginTab = "staff" | "phone";

type Props = {
  activeTab: LoginTab;
  onTabChange: (tab: LoginTab) => void;
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  errorText: string | null;
  configError: boolean;
  supabaseConfigured: boolean;
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

export function LoginMobileLayout({
  activeTab,
  onTabChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  phone,
  onPhoneChange,
  onSubmit,
  loading,
  errorText,
  configError,
  supabaseConfigured,
}: Props) {
  const title =
    activeTab === "staff" ? LOGIN_MOBILE_STAFF_COPY.title : LOGIN_COPY.phone.title;
  const subtitle =
    activeTab === "staff" ? LOGIN_MOBILE_STAFF_COPY.subtitle : LOGIN_COPY.phone.subtitle;

  return (
    <motion.main
      {...fadeIn}
      className="flex min-h-dvh flex-col bg-white text-slate-800 md:hidden"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <Link href="/" className="inline-flex w-fit">
          <Image
            src="/logo_main.svg"
            alt="CatClean"
            width={128}
            height={36}
            className="h-6 w-auto"
            priority
          />
        </Link>

        <div className="mt-10">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 max-w-[20rem] text-[0.9375rem] leading-relaxed text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className="mt-7">
          <LoginSegmentedControl
            activeTab={activeTab}
            onTabChange={onTabChange}
            variant="subtle"
          />
        </div>

        <div className="mt-7 flex flex-1 flex-col">
          <AnimatePresence mode="wait">
            {activeTab === "staff" ? (
              <motion.form
                key="staff-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={onSubmit}
                className="flex flex-1 flex-col"
              >
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="login-email-mobile"
                      className="mb-2 block text-sm font-medium text-slate-600"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                        aria-hidden
                      />
                      <input
                        id="login-email-mobile"
                        className={`${LOGIN_INPUT_CLASS} ${LOGIN_INPUT_MOBILE_CLASS}`}
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        autoComplete="email"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="login-password-mobile"
                      className="mb-2 block text-sm font-medium text-slate-600"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                        aria-hidden
                      />
                      <input
                        id="login-password-mobile"
                        type="password"
                        className={`${LOGIN_INPUT_CLASS} ${LOGIN_INPUT_MOBILE_CLASS}`}
                        value={password}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {configError || !supabaseConfigured ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-sm text-rose-600"
                    >
                      Login is unavailable on this server. Add NEXT_PUBLIC_SUPABASE_URL and
                      NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.
                    </motion.p>
                  ) : null}
                  {errorText ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-sm text-rose-600"
                    >
                      {errorText}
                    </motion.p>
                  ) : null}
                </AnimatePresence>

                <div className="mt-6">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={loading ? undefined : { scale: 0.98 }}
                    className={`${LOGIN_PRIMARY_BUTTON_CLASS} ${LOGIN_PRIMARY_BUTTON_MOBILE_CLASS} shadow-[0_12px_28px_rgba(52,89,126,0.28)]`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        Signing in…
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </motion.button>
                </div>

                <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
                  Secure sign-in · Trusted CatClean professionals
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="phone-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-1 flex-col"
              >
                <p className="text-sm text-slate-500">{LOGIN_COPY.phone.helper}</p>

                <div className="mt-4">
                  <label
                    htmlFor="login-phone-mobile"
                    className="mb-2 block text-sm font-medium text-slate-600"
                  >
                    Phone
                  </label>
                  <div className="relative">
                    <Phone
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                      aria-hidden
                    />
                    <input
                      id="login-phone-mobile"
                      className={`${LOGIN_INPUT_CLASS} ${LOGIN_INPUT_MOBILE_CLASS} text-slate-500`}
                      value={phone}
                      onChange={(e) => onPhoneChange(e.target.value)}
                      placeholder={PHONE_FORM_EXAMPLE}
                      autoComplete="tel"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Use German phone format — {PHONE_FORM_EXAMPLE}
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-14 w-full cursor-not-allowed items-center justify-center rounded-full bg-slate-100 px-6 text-base font-semibold text-slate-400"
                  >
                    Send code
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <LoginFooter variant="mobile" />
      </div>
    </motion.main>
  );
}
