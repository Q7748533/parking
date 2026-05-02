"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "./actions";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    const result = await login(password);
    if (result.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(result.error || "Invalid password");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#12121a] border border-[#27273a] rounded-lg p-6 space-y-4">
      <div>
        <Input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-[#1e1e2e] border-[#27273a] text-white placeholder:text-gray-500"
          autoFocus
        />
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white"
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
