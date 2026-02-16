"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Modal } from "@/components/ui/Modal";
import { IconButton } from "@/components/ui/IconButton";
import { Toast } from "@/components/ui/Toast";
interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

const STORAGE_KEY = "dandi-api-keys";

function generateId() {
  return Math.random().toString(36).slice(2);
}

function maskKey(key: string) {
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

export default function DashboardsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formKey, setFormKey] = useState("");
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "danger" } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setApiKeys(JSON.parse(stored));
      } catch {
        setApiKeys([]);
      }
    }
  }, []);

  useEffect(() => {
    if (apiKeys.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apiKeys));
    }
  }, [apiKeys]);

  const handleCreate = () => {
    if (!formName.trim() || !formKey.trim()) return;
    const newKey: ApiKey = {
      id: generateId(),
      name: formName.trim(),
      key: formKey.trim(),
      createdAt: new Date().toISOString(),
    };
    setApiKeys((prev) => [...prev, newKey]);
    setFormName("");
    setFormKey("");
    setIsCreating(false);
    setToast({ message: "API key created successfully" });
  };

  const handleUpdate = (id: string) => {
    const item = apiKeys.find((k) => k.id === id);
    if (!item) return;
    const newName = formName.trim() || item.name;
    const newKey = formKey.trim() || item.key;
    setApiKeys((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, name: newName, key: newKey } : k
      )
    );
    setFormName("");
    setFormKey("");
    setEditingId(null);
    setToast({ message: "API key updated successfully" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this API key?")) {
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      setEditingId(null);
      setToast({ message: "API key deleted", type: "danger" });
    }
  };

  const startEdit = (item: ApiKey) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormKey(item.key);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormName("");
    setFormKey("");
  };

  const toggleShowKey = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalUsage = 24;
  const apiLimit = 1000;

  const header = (
    <div>
      <p className="text-xs text-zinc-500">Pages / Overview</p>
      <h1 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
        Overview
        <button className="p-1 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </h1>
    </div>
  );

  const headerRight = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 text-sm text-zinc-600">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Operational
      </div>
      <div className="flex items-center gap-1">
        <a href="#" className="p-2 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <a href="#" className="p-2 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="#" className="p-2 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </a>
        <button className="p-2 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        </button>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      overviewHref="/dashboards"
      activeHref="/dashboards"
      header={header}
      headerRight={headerRight}
    >
      <main className="flex-1 p-8 overflow-auto">
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

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-zinc-900">API Keys</h2>
            <IconButton
              onClick={() => {
                cancelForm();
                setIsCreating(true);
              }}
              disabled={isCreating || editingId !== null}
              title="Create API key"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </IconButton>
          </div>
          <p className="text-sm text-zinc-600 mb-6">
            The key is used to authenticate your requests to the Research API. To learn more, see the documentation page.
          </p>

          <Modal
            isOpen={isCreating}
            onClose={cancelForm}
            className="border-2 border-emerald-200"
          >
            <h3 className="text-lg font-semibold text-emerald-800 mb-1">Create a new API key</h3>
            <p className="text-sm text-zinc-600 mb-6">Enter a name and your API key.</p>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">Key Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Production API"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">API Key</label>
                <input
                  type="text"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-mono text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                disabled={!formName.trim() || !formKey.trim()}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={cancelForm}
                className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </Modal>

          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            {apiKeys.length === 0 ? (
              <div className="px-6 py-16 text-center text-zinc-500">
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
                          <td className="py-4 px-6 text-zinc-600">0</td>
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
                                onClick={() => startEdit(item)}
                                disabled={isCreating || editingId !== null}
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </IconButton>
                              <IconButton
                                onClick={() => handleDelete(item.id)}
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
