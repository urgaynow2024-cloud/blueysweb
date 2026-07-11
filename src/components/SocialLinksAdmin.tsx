"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { getSocialLinks, addSocialLink, updateSocialLink, deleteSocialLink } from "@/lib/db";

export default function SocialLinksAdmin() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newLink, setNewLink] = useState({ name: "", url: "", description: "" });

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    setLoading(true);
    try {
      const data = await getSocialLinks();
      setLinks(data);
    } catch (e) {
      console.error("Failed to load social links:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newLink.name || !newLink.url) return;
    setAdding(true);
    try {
      const created = await addSocialLink(newLink);
      if (created) {
        setLinks([...links, created]);
        setNewLink({ name: "", url: "", description: "" });
      }
    } catch (e) {
      console.error("Failed to add link:", e);
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdate(id: string, field: string, value: string) {
    await updateSocialLink(id, { [field]: value });
    setLinks(links.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this link?")) return;
    await deleteSocialLink(id);
    setLinks(links.filter((l) => l.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Social Links</h2>
      </div>

      {/* Add new */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-white mb-4">Add New Link</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Name</label>
            <input
              value={newLink.name}
              onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
              placeholder="Discord"
              className="field"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">URL</label>
            <input
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://..."
              className="field"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Description</label>
            <input
              value={newLink.description}
              onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
              placeholder="Optional"
              className="field"
            />
          </div>
        </div>
        <button onClick={handleAdd} disabled={adding} className="btn-primary !text-sm !py-2 !px-4 inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> {adding ? "Adding..." : "Add Link"}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-sm text-[var(--text-dim)]">Loading...</div>
      ) : links.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-2xl p-8 text-center border border-[var(--border)]">
          <p className="text-sm text-[var(--text-dim)]">No links yet. Add your first link above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link, i) => (
            <div key={link.id || i} className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-white">Link {i + 1}</h3>
                <button onClick={() => handleDelete(link.id)} className="text-xs text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-all inline-flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Name</label>
                  <input value={link.name} onChange={(e) => handleUpdate(link.id, "name", e.target.value)} className="field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">URL</label>
                  <input value={link.url} onChange={(e) => handleUpdate(link.id, "url", e.target.value)} className="field" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Description</label>
                  <input value={link.description || ""} onChange={(e) => handleUpdate(link.id, "description", e.target.value)} className="field" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
