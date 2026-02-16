"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Toast } from "@/components/ui/Toast";
import { PENDING_API_KEY_STORAGE } from "@/lib/constants";

export default function ProtectedPage() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "danger" } | null>(null);
  const [validated, setValidated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pendingKey = sessionStorage.getItem(PENDING_API_KEY_STORAGE);
    if (!pendingKey) {
      router.replace("/playground");
      return;
    }

    let cancelled = false;

    async function validate() {
      try {
        const res = await fetch("/api/validate-api-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: pendingKey }),
        });
        const data = await res.json();

        if (cancelled) return;

        sessionStorage.removeItem(PENDING_API_KEY_STORAGE);
        setValidated(true);

        if (data.valid) {
          setToast({
            message: "Valid apikey, /protected can be accessed",
            type: "success",
          });
        } else {
          setToast({
            message: "Invalid API Key",
            type: "danger",
          });
        }
      } catch {
        if (cancelled) return;
        sessionStorage.removeItem(PENDING_API_KEY_STORAGE);
        setValidated(true);
        setToast({
          message: "Invalid API Key",
          type: "danger",
        });
      }
    }

    validate();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const header = (
    <div>
      <p className="text-xs text-zinc-500">Pages / Protected</p>
      <h1 className="text-xl font-semibold text-zinc-900">Protected</h1>
    </div>
  );

  return (
    <DashboardLayout
      overviewHref="/dashboards"
      activeHref="/protected"
      header={header}
    >
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-md">
          {!validated ? (
            <p className="text-sm text-zinc-600">Validating API key...</p>
          ) : (
            <p className="text-sm text-zinc-600">
              This is the protected area. Access is granted after a valid API key is verified.
            </p>
          )}
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
}
