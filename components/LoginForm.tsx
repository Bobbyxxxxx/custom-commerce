"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendLoginCode } from "@/utils/actions/auth.action";
import { createClient } from "@/utils/supabase/client";
import { loginCodeValidationSchema } from "@/utils/zodvalidations/form-validations";

const LoginForm = () => {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const requestCode = (isResend: boolean) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await sendLoginCode(email);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStep("code");
      if (isResend) setNotice("We sent you a new code.");
    });
  };

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    requestCode(false);
  };

  const handleCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const parsed = loginCodeValidationSchema.safeParse({
        email: email.trim().toLowerCase(),
        token: code.trim(),
      });
      if (!parsed.success) {
        setError(parsed.error.issues[0].message);
        return;
      }

      // Verified in the browser so AuthProvider hears the sign in straight away
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        ...parsed.data,
        type: "email",
      });
      if (verifyError) {
        setError("That code is invalid or has expired.");
        return;
      }

      router.replace("/");
      router.refresh();
    });
  };

  const handleChangeEmail = () => {
    setStep("email");
    setCode("");
    setError(null);
    setNotice(null);
  };

  return (
    <section className="w-full max-w-sm mx-auto px-4 py-16">
      <h1 className="text-xl font-medium text-zinc-900">
        {step === "email" ? "Sign in" : "Check your email"}
      </h1>
      <p className="text-sm text-zinc-500 mt-2 mb-8 leading-relaxed">
        {step === "email" ? (
          "Enter your email and we'll send you a code. New here? We'll create your account automatically."
        ) : (
          <>
            We sent a code to{" "}
            <span className="text-zinc-900 font-medium">{email}</span>. Enter it
            below to continue.
          </>
        )}
      </p>

      {step === "email" ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-zinc-500 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 text-sm text-zinc-900 border border-zinc-200 rounded-md outline-none focus:border-zinc-900 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-6 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-black rounded-md transition-colors disabled:opacity-50"
          >
            {isPending ? "Sending code..." : "Sign in"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-xs font-medium text-zinc-500 mb-2"
            >
              Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="w-full px-3 py-2.5 text-sm text-zinc-900 tracking-widest border border-zinc-200 rounded-md outline-none focus:border-zinc-900 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-6 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-black rounded-md transition-colors disabled:opacity-50"
          >
            {isPending ? "Please wait..." : "Confirm"}
          </button>

          <div className="flex items-center justify-between text-xs text-zinc-500">
            <button
              type="button"
              onClick={handleChangeEmail}
              disabled={isPending}
              className="hover:text-black transition-colors disabled:opacity-50"
            >
              Use a different email
            </button>
            <button
              type="button"
              onClick={() => requestCode(true)}
              disabled={isPending}
              className="hover:text-black transition-colors disabled:opacity-50"
            >
              Resend code
            </button>
          </div>
        </form>
      )}

      <div aria-live="polite" className="mt-4 text-xs">
        {error && <p className="text-red-600">{error}</p>}
        {notice && <p className="text-zinc-500">{notice}</p>}
      </div>
    </section>
  );
};

export default LoginForm;
