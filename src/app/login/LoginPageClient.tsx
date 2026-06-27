"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Lock, Mail, Phone } from "lucide-react";
import { LoginBackground } from "@/components/login/LoginBackground";
import { LoginFooter } from "@/components/login/LoginFooter";
import { LoginHeroPanel } from "@/components/login/LoginHeroPanel";
import { LoginMobileLayout } from "@/components/login/LoginMobileLayout";
import { LoginSegmentedControl } from "@/components/login/LoginSegmentedControl";
import {
  LOGIN_CARD_CLASS,
  LOGIN_COPY,
  LOGIN_INPUT_CLASS,
  LOGIN_LAYOUT_MAX_WIDTH_CLASS,
  LOGIN_PRIMARY_BUTTON_CLASS,
} from "@/components/login/login-styles";
import { devLog } from "@/lib/dev-log";
import { PHONE_FORM_EXAMPLE } from "@/lib/phone/profile-phone";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";

const fieldMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
};

type Props = {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
};

export function LoginPageClient({ supabaseUrl, supabaseAnonKey }: Props) {
  const searchParams = useSearchParams();
  const configError = searchParams.get("error") === "config";
  const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
  const supabase = useMemo(
    () =>
      supabaseConfigured
        ? createSupabaseBrowserClient({ url: supabaseUrl!, anonKey: supabaseAnonKey! })
        : null,
    [supabaseAnonKey, supabaseConfigured, supabaseUrl],
  );
  const [activeTab, setActiveTab] = useState<"staff" | "phone">("staff");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setErrorText("Login is unavailable: Supabase is not configured on this deployment.");
      return;
    }

    setLoading(true);
    setErrorText(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    devLog("[login] signInWithPassword", {
      error: error?.message ?? null,
      hasSession: Boolean(data.session),
      userId: data.user?.id ?? null,
    });

    if (error) {
      setLoading(false);
      setErrorText(error.message);
      return;
    }

    const { data: sessionCheck, error: sessionError } =
      await supabase.auth.getSession();

    devLog("[login] getSession after signIn", {
      error: sessionError?.message ?? null,
      hasSession: Boolean(sessionCheck.session),
      userId: sessionCheck.session?.user.id ?? data.user?.id ?? null,
    });

    if (!sessionCheck.session) {
      setLoading(false);
      setErrorText("Sign-in succeeded but the session was not saved. Try again.");
      return;
    }

    devLog("[login] redirect", {
      target: "/app",
      userId: data.user?.id ?? null,
    });

    // Full navigation so auth cookies reach the server on Vercel/production.
    window.location.assign("/app");
  };

  const handleTabChange = (tab: "staff" | "phone") => {
    setActiveTab(tab);
    setErrorText(null);
  };

  const copy = LOGIN_COPY[activeTab];

  return (
    <>
      <LoginMobileLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        phone={phone}
        onPhoneChange={setPhone}
        onSubmit={onSubmit}
        loading={loading}
        errorText={errorText}
        configError={configError}
        supabaseConfigured={supabaseConfigured}
      />

      <LoginBackground>
        <div
          className={`mx-auto hidden min-h-dvh w-full ${LOGIN_LAYOUT_MAX_WIDTH_CLASS} flex-col justify-center px-8 py-10 md:flex`}
        >
          <div className="grid w-full grid-cols-[46fr_54fr] items-stretch gap-10 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full"
            >
              <div className={`w-full ${LOGIN_CARD_CLASS}`}>
                <Link href="/" className="mb-8 inline-flex">
                  <Image
                    src="/logo_main.svg"
                    alt="CatClean"
                    width={160}
                    height={48}
                    className="h-9 w-auto"
                    priority
                  />
                </Link>

                <div className="mb-8">
                  <LoginSegmentedControl
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    className="mb-8 space-y-2"
                  >
                    <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-800">
                      {copy.title}
                    </h1>
                    <p className="text-lg leading-relaxed text-slate-600">{copy.subtitle}</p>
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {activeTab === "staff" ? (
                    <motion.form
                      key="staff-form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={onSubmit}
                      className="space-y-5"
                    >
                      <motion.p {...fieldMotion} className="text-sm text-slate-500">
                        {LOGIN_COPY.staff.helper}
                      </motion.p>

                      <motion.div {...fieldMotion} transition={{ ...fieldMotion.transition, delay: 0.05 }}>
                        <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-600">
                          Email
                        </label>
                        <div className="relative">
                          <Mail
                            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                            aria-hidden
                          />
                          <input
                            id="login-email"
                            className={LOGIN_INPUT_CLASS}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            placeholder="you@example.com"
                          />
                        </div>
                      </motion.div>

                      <motion.div {...fieldMotion} transition={{ ...fieldMotion.transition, delay: 0.1 }}>
                        <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-600">
                          Password
                        </label>
                        <div className="relative">
                          <Lock
                            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                            aria-hidden
                          />
                          <input
                            id="login-password"
                            type="password"
                            className={LOGIN_INPUT_CLASS}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                          />
                        </div>
                      </motion.div>

                      <AnimatePresence>
                        {configError || !supabaseConfigured ? (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-rose-600"
                          >
                            Login is unavailable on this server. In Vercel → Settings → Environment
                            Variables, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
                            for Production, then redeploy.
                          </motion.p>
                        ) : null}
                        {errorText ? (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-rose-600"
                          >
                            {errorText}
                          </motion.p>
                        ) : null}
                      </AnimatePresence>

                      <motion.div {...fieldMotion} transition={{ ...fieldMotion.transition, delay: 0.15 }}>
                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileHover={loading ? undefined : { scale: 1.01 }}
                          whileTap={loading ? undefined : { scale: 0.99 }}
                          className={LOGIN_PRIMARY_BUTTON_CLASS}
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
                      </motion.div>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="phone-form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-5"
                    >
                      <motion.p {...fieldMotion} className="text-sm text-slate-500">
                        {LOGIN_COPY.phone.helper}
                      </motion.p>

                      <motion.div {...fieldMotion} transition={{ ...fieldMotion.transition, delay: 0.05 }}>
                        <label htmlFor="login-phone" className="mb-2 block text-sm font-medium text-slate-600">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone
                            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                            aria-hidden
                          />
                          <input
                            id="login-phone"
                            className={`${LOGIN_INPUT_CLASS} text-slate-500`}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={PHONE_FORM_EXAMPLE}
                            autoComplete="tel"
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                          Use German phone format — {PHONE_FORM_EXAMPLE}
                        </p>
                      </motion.div>

                      <motion.div {...fieldMotion} transition={{ ...fieldMotion.transition, delay: 0.1 }}>
                        <button
                          type="button"
                          disabled
                          className="inline-flex h-14 w-full cursor-not-allowed items-center justify-center rounded-full bg-slate-100 px-6 text-base font-semibold text-slate-400"
                        >
                          Send code
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <div className="w-full">
              <LoginHeroPanel />
            </div>
          </div>

          <LoginFooter />
        </div>
      </LoginBackground>
    </>
  );
}
