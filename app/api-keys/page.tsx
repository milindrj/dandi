"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconButton } from "@/components/ui/IconButton";
import { Toast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  usage: number;
  usageLimit?: number;
  createdAt: string;
}

const API_BASE = "/api/api-keys";

function maskKey(key: string) {
  if (key.length <= 8) return "••••••••";
  const prefix = key.slice(0, 4);
  return prefix + "-***********";
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formKey, setFormKey] = useState("");
  const [limitUsage, setLimitUsage] = useState(false);
  const [usageLimitValue, setUsageLimitValue] = useState(1000);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "danger" } | null>(null);

  const showToastMsg = useCallback((message: string, type: "success" | "error" | "danger" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(API_BASE);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error ?? data.supabaseError ?? data.cause ?? "Failed to fetch API keys";
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
      setApiKeys(data.map((k: ApiKey) => ({ ...k, usage: k.usage ?? 0 })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load API keys");
      setApiKeys([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleCreate = useCallback(async () => {
    if (!formName.trim()) return;
    try {
      setIsMutating(true);
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          usageLimit: limitUsage ? usageLimitValue : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.details ?? "Failed to create API key");
      setApiKeys((prev) => [...prev, { ...data, usage: data.usage ?? 0 }]);
      setFormName("");
      setLimitUsage(false);
      setUsageLimitValue(1000);
      setIsCreating(false);
      showToastMsg("API key created successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setIsMutating(false);
    }
  }, [formName, limitUsage, usageLimitValue, showToastMsg]);

  const handleUpdate = useCallback(
    async (id: string) => {
      const item = apiKeys.find((k) => k.id === id);
      if (!item) return;
      const newName = formName.trim() || item.name;
      const newKey = formKey.trim() || item.key;
      if (newName === item.name && newKey === item.key) {
        setEditingId(null);
        return;
      }
      try {
        setIsMutating(true);
        const res = await fetch(`${API_BASE}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName, key: newKey }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to update API key");
        setApiKeys((prev) =>
          prev.map((k) => (k.id === id ? { ...data, usage: data.usage ?? 0 } : k))
        );
        setFormName("");
        setFormKey("");
        setEditingId(null);
        showToastMsg("API key updated successfully");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update API key");
      } finally {
        setIsMutating(false);
      }
    },
    [apiKeys, formName, formKey, showToastMsg]
  );

  const handleDelete = useCallback(async (id: string) => {
    try {
      setIsMutating(true);
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete API key");
      }
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      setDeleteTarget(null);
      setEditingId(null);
      showToastMsg("API key deleted successfully", "danger");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete API key");
    } finally {
      setIsMutating(false);
    }
  }, [showToastMsg]);

  const startEdit = useCallback((item: ApiKey) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormKey(item.key);
  }, []);

  const cancelForm = useCallback(() => {
    setIsCreating(false);
    setEditingId(null);
    setFormName("");
    setFormKey("");
    setLimitUsage(false);
    setUsageLimitValue(1000);
  }, []);

  const openCreateModal = useCallback(() => {
    setFormName("");
    setLimitUsage(false);
    setUsageLimitValue(1000);
    setEditingId(null);
    setIsCreating(true);
  }, []);

  const toggleShowKey = useCallback((id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const copyToClipboard = useCallback(async (key: string, id: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = key;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const totalUsage = apiKeys.reduce((sum, k) => sum + (k.usage ?? 0), 0);
  const apiLimit = 1000;

  const header = (
    <div>
      <p className="text-xs text-zinc-500">Pages / Overview</p>
      <h1 className="text-xl font-semibold text-zinc-900">Overview</h1>
    </div>
  );

  const headerRight = (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-zinc-600">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Operational
      </div>
      <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
        {Math.round((totalUsage / apiLimit) * 100)}%
      </div>
    </div>
  );

  return (
    <DashboardLayout
      overviewHref="/api-keys"
      activeHref="/api-keys"
      header={header}
      headerRight={headerRight}
    >
      <div className="p-8">
        <div className="max-w-4xl space-y-8">
          {/* Current Plan card */}
          <div className="rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-4 left-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/90 bg-white/20 px-2 py-1 rounded">
                Current Plan
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Manage Plan
              </button>
            </div>
            <div className="pt-12">
              <h2 className="text-2xl font-bold text-white mb-4">Researcher</h2>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-white/90">API Limit</span>
                  <button className="text-white/70 hover:text-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${Math.min((totalUsage / apiLimit) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-white/90">
                  {totalUsage}/{apiLimit} Requests
                </p>
              </div>
            </div>
          </div>

          {/* API Keys section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-semibold text-zinc-900">API Keys</h2>
              <button
                onClick={openCreateModal}
                disabled={isCreating || editingId !== null}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Add API Key"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-zinc-600 mb-6">
              The key is used to authenticate your requests to the API. To learn more, see the{" "}
              <a href="#" className="underline hover:text-zinc-900">documentation page</a>.
            </p>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{error}</p>
                    <p className="mt-2 text-xs text-red-600">
                      <a href="/api/debug-supabase" target="_blank" rel="noopener noreferrer" className="underline">
                        Open debug endpoint
                      </a>
                      {" · "}
                      <button type="button" onClick={() => fetchApiKeys()} className="underline">
                        Retry
                      </button>
                    </p>
                  </div>
                  <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="px-6 py-16 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                  <p className="mt-3 text-zinc-500">Loading API keys...</p>
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                    <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <p className="text-zinc-500 mb-1">No API keys yet</p>
                  <p className="text-sm text-zinc-400">Click the + button to create your first key</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/50">
                      <th className="text-left py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Usage</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Key</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((item) => (
                      <tr key={item.id} className="border-b border-zinc-100 last:border-0">
                        {editingId === item.id ? (
                          <td colSpan={4} className="px-6 py-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Name</label>
                                  <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">API Key</label>
                                  <input
                                    type="text"
                                    value={formKey}
                                    onChange={(e) => setFormKey(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 font-mono text-sm"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdate(item.id)}
                                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelForm}
                                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="py-4 px-6 font-medium text-zinc-900">{item.name}</td>
                            <td className="py-4 px-6 text-zinc-600">{item.usage ?? 0}</td>
                            <td className="py-4 px-6 font-mono text-sm text-zinc-600">
                              {showKey[item.id] ? item.key : maskKey(item.key)}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1">
                                <IconButton
                                  onClick={() => toggleShowKey(item.id)}
                                  title={showKey[item.id] ? "Hide" : "Reveal"}
                                >
                                  {showKey[item.id] ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  )}
                                </IconButton>
                                <IconButton
                                  onClick={() => copyToClipboard(item.key, item.id)}
                                  title={copiedId === item.id ? "Copied!" : "Copy"}
                                >
                                  {copiedId === item.id ? (
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                </IconButton>
                                <IconButton
                                  onClick={() => startEdit(item)}
                                  title="Edit"
                                  disabled={editingId !== null || isCreating}
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </IconButton>
                                <IconButton
                                  onClick={() => setDeleteTarget(item)}
                                  title="Delete"
                                  className="hover:text-red-600 hover:bg-red-50"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </IconButton>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create API Key modal */}
      <Modal isOpen={isCreating} onClose={cancelForm} className="border-2 border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-800 mb-1">Create a new API key</h3>
        <p className="text-sm text-zinc-600 mb-6">Enter a name and limit for the new API key.</p>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Key Name — A unique name to identify this key</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Key Name"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={limitUsage}
                onChange={(e) => setLimitUsage(e.target.checked)}
                className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-zinc-700">Limit monthly usage*</span>
            </label>
            {limitUsage && (
              <input
                type="number"
                value={usageLimitValue}
                onChange={(e) => setUsageLimitValue(Number(e.target.value) || 0)}
                min={1}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            )}
            <p className="mt-2 text-xs text-zinc-500">
              *If the combined usage of all your keys exceeds your plan&apos;s limit, all requests will be rejected.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCreate}
            disabled={!formName.trim() || isMutating}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMutating ? "Creating..." : "Create"}
          </button>
          <button
            onClick={cancelForm}
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Delete modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} className="bg-red-50 border-2 border-red-200">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Delete API Key</h3>
        <p className="text-red-700 mb-6">
          Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteTarget(null)}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            disabled={isMutating}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isMutating ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
