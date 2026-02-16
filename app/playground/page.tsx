"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PENDING_API_KEY_STORAGE } from "@/lib/constants";

export default function PlaygroundPage() {
  const [apiKey, setApiKey] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(PENDING_API_KEY_STORAGE, apiKey.trim());
    }
    router.push("/protected");
  };

  const header = (
    <div>
      <p className="text-xs text-zinc-500">Pages / API Playground</p>
      <h1 className="text-xl font-semibold text-zinc-900">API Playground</h1>
    </div>
  );

  return (
    <DashboardLayout
      overviewHref="/dashboards"
      activeHref="/playground"
      header={header}
    >
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-md">
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Validate API Key</h2>
          <p className="text-sm text-zinc-600 mb-6">
            Enter your API key to validate and access the protected area.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="mb-1.5 block text-sm font-medium text-zinc-700">
                API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-mono text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                required
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </main>
    </DashboardLayout>
  );
}
