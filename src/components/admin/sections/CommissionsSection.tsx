"use client";

import { useState, useEffect } from "react";
import { Card } from "../Card";
import { Field, Input, Textarea } from "../Field";
import { Button } from "../Button";
import { Plus, Trash2, Search, Eye, Edit3, Save, X, Upload, FileText, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/admin/Toast";

export interface Commission {
  id?: string;
  client_name: string;
  client_discord: string;
  client_email: string;
  description: string;
  budget: string;
  deadline: string;
  reference_links: string;
  status: string;
  priority: string;
  progress: number;
  internal_notes: string;
  due_date: string;
  payment_status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CommissionRevision {
  id?: string;
  commission_id?: string;
  request_text: string;
  response_text: string;
  status: string;
  created_at?: string;
}

export interface CommissionFile {
  id?: string;
  commission_id?: string;
  name: string;
  url: string;
  path: string;
  type: string;
  created_at?: string;
}

export interface CommissionSubmission {
  id?: string;
  name: string;
  discord: string;
  email: string;
  description: string;
  budget: string;
  deadline: string;
  reference_links: string;
  notes: string;
  status: string;
  hidden: boolean;
  rejected_reason: string;
  moderated_by: string;
  moderated_at?: string;
  created_at?: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  open: { color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Open" },
  accepted: { color: "text-blue-400", bg: "bg-blue-400/10", label: "Accepted" },
  waiting_assets: { color: "text-amber-400", bg: "bg-amber-400/10", label: "Waiting Assets" },
  waiting_payment: { color: "text-orange-400", bg: "bg-orange-400/10", label: "Waiting Payment" },
  in_progress: { color: "text-cyan-400", bg: "bg-cyan-400/10", label: "In Progress" },
  client_review: { color: "text-violet-400", bg: "bg-violet-400/10", label: "Client Review" },
  revision_requested: { color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Revision Requested" },
  completed: { color: "text-green-400", bg: "bg-green-400/10", label: "Completed" },
  cancelled: { color: "text-red-400", bg: "bg-red-400/10", label: "Cancelled" },
};

const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  low: { color: "text-gray-400", label: "Low" },
  normal: { color: "text-blue-400", label: "Normal" },
  high: { color: "text-orange-400", label: "High" },
  urgent: { color: "text-red-400", label: "Urgent" },
};

const PAYMENT_CONFIG: Record<string, { color: string; label: string }> = {
  unpaid: { color: "text-red-400", label: "Unpaid" },
  partial: { color: "text-yellow-400", label: "Partial" },
  paid: { color: "text-green-400", label: "Paid" },
  refunded: { color: "text-gray-400", label: "Refunded" },
};

const REVISION_STATUS: Record<string, { color: string; label: string }> = {
  pending: { color: "text-yellow-400", label: "Pending" },
  in_progress: { color: "text-blue-400", label: "In Progress" },
  completed: { color: "text-green-400", label: "Completed" },
  rejected: { color: "text-red-400", label: "Rejected" },
};

export function CommissionsSection() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [submissions, setSubmissions] = useState<CommissionSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"commissions" | "submissions">("commissions");
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [revisions, setRevisions] = useState<CommissionRevision[]>([]);
  const [files, setFiles] = useState<CommissionFile[]>([]);
  const toast = useToast();

  const [formData, setFormData] = useState<Commission>({
    client_name: "",
    client_discord: "",
    client_email: "",
    description: "",
    budget: "",
    deadline: "",
    reference_links: "",
    status: "open",
    priority: "normal",
    progress: 0,
    internal_notes: "",
    due_date: "",
    payment_status: "unpaid",
  });

  const [revisionForm, setRevisionForm] = useState({ request_text: "", response_text: "", status: "pending" });

  async function loadData() {
    setLoading(true);
    try {
      const [commRes, subRes] = await Promise.all([
        fetch("/api/commissions"),
        fetch("/api/commissions/submissions").catch(() => ({ ok: false, json: () => Promise.resolve([]) })),
      ]);
      if (commRes.ok) {
        const data = await commRes.json();
        setCommissions(Array.isArray(data) ? data : []);
      }
      if (subRes.ok) {
        const data = await subRes.json();
        setSubmissions(Array.isArray(data) ? data : []);
      }
    } catch {
      console.error("Failed to load commissions:");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadCommissionDetails(commission: Commission) {
    setSelectedCommission(commission);
    setEditingCommission(null);
    setIsCreating(false);
    try {
      const [revRes, filesRes] = await Promise.all([
        fetch(`/api/commissions/${commission.id}/revisions`).catch(() => ({ ok: false, json: () => Promise.resolve([]) })),
        fetch(`/api/commissions/${commission.id}/files`).catch(() => ({ ok: false, json: () => Promise.resolve([]) })),
      ]);
      if (revRes.ok) setRevisions(await revRes.json());
      if (filesRes.ok) setFiles(await filesRes.json());
    } catch (e) {
      console.error("Failed to load commission details:", e);
    }
  }

  async function handleSaveCommission(e: React.FormEvent) {
    e.preventDefault();
    try {
      const method = editingCommission?.id ? "PUT" : "POST";
      const url = editingCommission?.id ? `/api/commissions/${editingCommission.id}` : "/api/commissions";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "blueyadmin",
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success(editingCommission?.id ? "Commission updated" : "Commission created");
        setEditingCommission(null);
        setIsCreating(false);
        loadData();
      } else {
        toast.error("Failed to save commission");
      }
    } catch {
      toast.error("Failed to save commission");
    }
  }

  async function handleDeleteCommission(id: string) {
    if (!confirm("Are you sure you want to delete this commission?")) return;
    try {
      const res = await fetch(`/api/commissions/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": "blueyadmin" },
      });
      if (res.ok) {
        toast.success("Commission deleted");
        setSelectedCommission(null);
        loadData();
      } else {
        toast.error("Failed to delete commission");
      }
    } catch {
      toast.error("Failed to delete commission");
    }
  }

  async function handleAddRevision(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCommission?.id) return;
    try {
      const res = await fetch(`/api/commissions/${selectedCommission.id}/revisions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "blueyadmin",
        },
        body: JSON.stringify(revisionForm),
      });
      if (res.ok) {
        toast.success("Revision added");
        setRevisionForm({ request_text: "", response_text: "", status: "pending" });
        loadCommissionDetails(selectedCommission);
      } else {
        toast.error("Failed to add revision");
      }
    } catch {
      toast.error("Failed to add revision");
    }
  }

  async function handleApproveSubmission(id: string) {
    try {
      const res = await fetch("/api/moderation/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "blueyadmin",
        },
        body: JSON.stringify({ action: "approve", entity_type: "submission", entity_id: id }),
      });
      if (res.ok) {
        toast.success("Submission approved");
        loadData();
      } else {
        toast.error("Failed to approve submission");
      }
    } catch {
      toast.error("Failed to approve submission");
    }
  }

  async function handleRejectSubmission(id: string) {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    try {
      const res = await fetch("/api/moderation/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "blueyadmin",
        },
        body: JSON.stringify({ action: "reject", entity_type: "submission", entity_id: id, reason }),
      });
      if (res.ok) {
        toast.success("Submission rejected");
        loadData();
      } else {
        toast.error("Failed to reject submission");
      }
    } catch {
      toast.error("Failed to reject submission");
    }
  }

  const filteredCommissions = commissions.filter((c) => {
    const matchesSearch = !searchQuery || 
      c.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client_discord?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: commissions.length,
    active: commissions.filter((c) => ["open", "accepted", "in_progress", "client_review"].includes(c.status)).length,
    completed: commissions.filter((c) => c.status === "completed").length,
    pending: submissions.filter((s) => s.status === "pending").length,
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="ad-skeleton h-8 w-48 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ad-skeleton h-16 w-full rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="ad-panel rounded-xl p-4">
          <div className="text-xs text-[var(--text-dim)]">Total Commissions</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="ad-panel rounded-xl p-4">
          <div className="text-xs text-[var(--text-dim)]">Active</div>
          <div className="text-2xl font-bold text-blue-400">{stats.active}</div>
        </div>
        <div className="ad-panel rounded-xl p-4">
          <div className="text-xs text-[var(--text-dim)]">Completed</div>
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
        </div>
        <div className="ad-panel rounded-xl p-4">
          <div className="text-xs text-[var(--text-dim)]">Pending Submissions</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab("commissions")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "commissions"
              ? "border-b-2 border-[var(--accent)] text-white"
              : "text-[var(--text-dim)] hover:text-white"
          }`}
        >
          Commissions ({commissions.length})
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "submissions"
              ? "border-b-2 border-[var(--accent)] text-white"
              : "text-[var(--text-dim)] hover:text-white"
          }`}
        >
          Submissions ({submissions.length})
        </button>
      </div>

      {activeTab === "commissions" && (
        <Card className="p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search commissions..."
                  className="field pl-10 pr-4"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="field appearance-none"
              >
                <option value="all">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                  <option key={key} value={key}>{conf.label}</option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="field appearance-none"
              >
                <option value="all">All Priorities</option>
                {Object.entries(PRIORITY_CONFIG).map(([key, conf]) => (
                  <option key={key} value={key}>{conf.label}</option>
                ))}
              </select>
            </div>
            <Button size="sm" variant="primary" onClick={() => { setIsCreating(true); setEditingCommission(null); setFormData({ client_name: "", client_discord: "", client_email: "", description: "", budget: "", deadline: "", reference_links: "", status: "open", priority: "normal", progress: 0, internal_notes: "", due_date: "", payment_status: "unpaid" }); }}>
              <Plus className="h-4 w-4" /> New Commission
            </Button>
          </div>

          {filteredCommissions.length === 0 ? (
            <div className="ad-empty">
              <FileText className="h-12 w-12 text-[var(--text-dim)]" />
              <p>No commissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="pb-3 font-medium text-[var(--text-dim)]">Client</th>
                    <th className="pb-3 font-medium text-[var(--text-dim)]">Status</th>
                    <th className="pb-3 font-medium text-[var(--text-dim)]">Priority</th>
                    <th className="pb-3 font-medium text-[var(--text-dim)]">Progress</th>
                    <th className="pb-3 font-medium text-[var(--text-dim)]">Due Date</th>
                    <th className="pb-3 font-medium text-[var(--text-dim)]">Payment</th>
                    <th className="pb-3 font-medium text-[var(--text-dim)]">Created</th>
                    <th className="pb-3 font-medium text-[var(--text-dim)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredCommissions.map((comm) => {
                    const statusConf = STATUS_CONFIG[comm.status] || STATUS_CONFIG.open;
                    const priorityConf = PRIORITY_CONFIG[comm.priority] || PRIORITY_CONFIG.normal;
                    const paymentConf = PAYMENT_CONFIG[comm.payment_status] || PAYMENT_CONFIG.unpaid;
                    return (
                      <tr key={comm.id} className="group hover:bg-white/[0.02]">
                        <td className="py-3">
                          <div className="font-medium text-white">{comm.client_name || "Unknown"}</div>
                          <div className="text-xs text-[var(--text-dim)]">{comm.client_discord}</div>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusConf.bg} ${statusConf.color}`}>
                            {statusConf.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs font-medium ${priorityConf.color}`}>{priorityConf.label}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-[var(--bg)]">
                              <div className="h-1.5 rounded-full bg-[var(--accent)]" style={{ width: `${comm.progress}%` }} />
                            </div>
                            <span className="text-xs text-[var(--text-dim)]">{comm.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-xs text-[var(--text-secondary)]">{comm.due_date || "—"}</td>
                        <td className="py-3">
                          <span className={`text-xs font-medium ${paymentConf.color}`}>{paymentConf.label}</span>
                        </td>
                        <td className="py-3 text-xs text-[var(--text-dim)]">
                          {comm.created_at ? new Date(comm.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => loadCommissionDetails(comm)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setEditingCommission(comm); setFormData(comm); setIsCreating(false); }}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteCommission(comm.id!)} className="!text-[var(--danger)] hover:!bg-[var(--danger-soft)]">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === "submissions" && (
        <Card className="p-6">
          {submissions.length === 0 ? (
            <div className="ad-empty">
              <FileText className="h-12 w-12 text-[var(--text-dim)]" />
              <p>No pending submissions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="ad-panel ad-panel-hover rounded-xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-white">{sub.name || "Anonymous"}</h3>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          sub.status === "pending" ? "bg-yellow-400/10 text-yellow-400" :
                          sub.status === "approved" ? "bg-green-400/10 text-green-400" :
                          "bg-red-400/10 text-red-400"
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">{sub.description}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--text-dim)]">
                        <span>Discord: {sub.discord}</span>
                        <span>Budget: {sub.budget || "N/A"}</span>
                        <span>Deadline: {sub.deadline || "N/A"}</span>
                      </div>
                    </div>
                    {sub.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary" onClick={() => handleApproveSubmission(sub.id!)}>
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleRejectSubmission(sub.id!)}>
                          <XCircle className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || editingCommission) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => { setIsCreating(false); setEditingCommission(null); }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingCommission ? "Edit Commission" : "New Commission"}</h2>
              <Button variant="ghost" onClick={() => { setIsCreating(false); setEditingCommission(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSaveCommission} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Client Name">
                  <Input value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} required />
                </Field>
                <Field label="Discord">
                  <Input value={formData.client_discord} onChange={(e) => setFormData({ ...formData, client_discord: e.target.value })} />
                </Field>
                <Field label="Email">
                  <Input type="email" value={formData.client_email} onChange={(e) => setFormData({ ...formData, client_email: e.target.value })} />
                </Field>
                <Field label="Budget">
                  <Input value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} />
                </Field>
                <Field label="Deadline">
                  <Input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
                </Field>
                <Field label="Due Date">
                  <Input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />
                </Field>
                <Field label="Status">
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="field appearance-none">
                    {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                      <option key={key} value={key}>{conf.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Priority">
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="field appearance-none">
                    {Object.entries(PRIORITY_CONFIG).map(([key, conf]) => (
                      <option key={key} value={key}>{conf.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Payment Status">
                  <select value={formData.payment_status} onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })} className="field appearance-none">
                    {Object.entries(PAYMENT_CONFIG).map(([key, conf]) => (
                      <option key={key} value={key}>{conf.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label={`Progress: ${formData.progress}%`}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                    className="w-full"
                  />
                </Field>
              </div>
              <Field label="Description">
                <Textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </Field>
              <Field label="Reference Links">
                <Textarea rows={2} value={formData.reference_links} onChange={(e) => setFormData({ ...formData, reference_links: e.target.value })} />
              </Field>
              <Field label="Internal Notes">
                <Textarea rows={3} value={formData.internal_notes} onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })} />
              </Field>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => { setIsCreating(false); setEditingCommission(null); }}>Cancel</Button>
                <Button type="submit" variant="primary" leftIcon={<Save className="h-4 w-4" />}>Save Commission</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Commission Detail Modal */}
      {selectedCommission && !editingCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedCommission(null)}>
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedCommission.client_name}</h2>
                <p className="text-sm text-[var(--text-dim)]">{selectedCommission.description?.slice(0, 100)}...</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedCommission(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="ad-panel rounded-lg p-3">
                <div className="text-xs text-[var(--text-dim)]">Status</div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${(STATUS_CONFIG[selectedCommission.status] || STATUS_CONFIG.open).bg} ${(STATUS_CONFIG[selectedCommission.status] || STATUS_CONFIG.open).color}`}>
                  {(STATUS_CONFIG[selectedCommission.status] || STATUS_CONFIG.open).label}
                </span>
              </div>
              <div className="ad-panel rounded-lg p-3">
                <div className="text-xs text-[var(--text-dim)]">Priority</div>
                <span className={`text-xs font-medium ${(PRIORITY_CONFIG[selectedCommission.priority] || PRIORITY_CONFIG.normal).color}`}>
                  {(PRIORITY_CONFIG[selectedCommission.priority] || PRIORITY_CONFIG.normal).label}
                </span>
              </div>
              <div className="ad-panel rounded-lg p-3">
                <div className="text-xs text-[var(--text-dim)]">Payment</div>
                <span className={`text-xs font-medium ${(PAYMENT_CONFIG[selectedCommission.payment_status] || PAYMENT_CONFIG.unpaid).color}`}>
                  {(PAYMENT_CONFIG[selectedCommission.payment_status] || PAYMENT_CONFIG.unpaid).label}
                </span>
              </div>
              <div className="ad-panel rounded-lg p-3">
                <div className="text-xs text-[var(--text-dim)]">Progress</div>
                <div className="text-sm font-bold text-white">{selectedCommission.progress}%</div>
              </div>
            </div>

            <div className="mb-6 flex gap-3">
              <Button size="sm" variant="secondary" onClick={() => { setEditingCommission(selectedCommission); setFormData(selectedCommission); }}>
                <Edit3 className="h-4 w-4" /> Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDeleteCommission(selectedCommission.id!)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>

            {/* Revisions */}
            <div className="mb-6">
              <h3 className="mb-4 font-semibold text-white">Revisions</h3>
              {revisions.length > 0 && (
                <div className="mb-4 space-y-2">
                  {revisions.map((rev) => (
                    <div key={rev.id} className="ad-panel rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${(REVISION_STATUS[rev.status] || { color: "text-gray-400" }).color}`}>
                          {rev.request_text?.slice(0, 50)}...
                        </span>
                        <span className={`text-xs ${(REVISION_STATUS[rev.status] || { color: "text-gray-400" }).color}`}>
                          {REVISION_STATUS[rev.status]?.label || rev.status}
                        </span>
                      </div>
                      {rev.response_text && <p className="mt-1 text-xs text-[var(--text-secondary)]">{rev.response_text}</p>}
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddRevision} className="flex gap-2">
                <Input
                  placeholder="Revision request..."
                  value={revisionForm.request_text}
                  onChange={(e) => setRevisionForm({ ...revisionForm, request_text: e.target.value })}
                  className="flex-1"
                />
                <select
                  value={revisionForm.status}
                  onChange={(e) => setRevisionForm({ ...revisionForm, status: e.target.value })}
                  className="field appearance-none"
                >
                  {Object.entries(REVISION_STATUS).map(([key, conf]) => (
                    <option key={key} value={key}>{conf.label}</option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="primary">Add</Button>
              </form>
            </div>

            {/* Files */}
            <div>
              <h3 className="mb-4 font-semibold text-white">Files</h3>
              {files.length > 0 && (
                <div className="mb-4 space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-[var(--accent)]" />
                        <div>
                          <div className="text-sm text-white">{file.name}</div>
                          <div className="text-xs text-[var(--text-dim)]">{file.type}</div>
                        </div>
                      </div>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent)] hover:underline">
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
              <div className="ad-upload rounded-xl">
                <Upload className="h-8 w-8 text-[var(--text-dim)]" />
                <p className="text-sm text-[var(--text-dim)]">File upload coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
