"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { devLog } from "@/lib/dev-log";
import { PHONE_FORM_EXAMPLE } from "@/lib/phone/profile-phone";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [activeTab, setActiveTab] = useState<"staff" | "phone">("staff");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    setLoading(false);

    devLog("[login] redirect", {
      target: "/app",
      userId: data.user?.id ?? null,
    });
    router.push("/app");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-5 text-2xl font-semibold text-slate-900">CatClean CRM</h1>

        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("staff")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeTab === "staff"
                ? "bg-white text-[#34597E] shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Staff login
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("phone");
              setErrorText(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeTab === "phone"
                ? "bg-white text-[#34597E] shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Phone login
          </button>
        </div>

        {activeTab === "staff" ? (
          <form onSubmit={onSubmit}>
            <p className="mb-4 text-sm text-slate-600">
              Use your admin/operator account.
            </p>

            <label className="text-sm text-slate-700">Email</label>
            <input
              className="mb-3 mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-[#34597E]/20 transition focus:border-[#34597E] focus:ring-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <label className="text-sm text-slate-700">Password</label>
            <input
              type="password"
              className="mb-4 mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-[#34597E]/20 transition focus:border-[#34597E] focus:ring-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {errorText && <p className="mb-3 text-sm text-rose-600">{errorText}</p>}

            <button
              disabled={loading}
              className="w-full rounded-lg bg-[#34597E] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2d4b6b] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        ) : (
          <div>
            <p className="mb-4 text-sm text-slate-600">
              For clients and cleaners. Coming soon.
            </p>

            <label className="text-sm text-slate-700">Phone</label>
            <input
              className="mb-2 mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-500 outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={PHONE_FORM_EXAMPLE}
              autoComplete="tel"
            />
            <p className="mb-1 text-xs text-slate-500">Use German phone format</p>
            <p className="mb-4 text-xs text-slate-400">{PHONE_FORM_EXAMPLE}</p>
            <p className="mb-3 text-sm text-slate-500">
              Phone login for clients and cleaners is coming soon.
            </p>

            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-500"
            >
              Send code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
