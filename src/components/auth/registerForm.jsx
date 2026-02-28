"use client";

import { useState } from "react";
import Link from "next/link";
import { register } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

export function RegisterForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData) {
    setLoading(true);
    setError("");

    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const result = await register(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 rounded-2xl">
      <CardContent className="p-8 space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Create an account
          </h1>
          <p className="text-sm text-gray-400">
            Start building your voice agents
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="bg-white/5 border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder:text-gray-500"
            />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="bg-white/5 border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder:text-gray-500"
            />

            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
              className="bg-white/5 border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder:text-gray-500"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Sign in
          </Link>
        </p>

      </CardContent>
    </Card>
  )
}
