"use client";

import { type ReactNode } from "react";
import { Tag, HelpCircle, Workflow, Star, Image as ImageIcon, Link as LinkIcon, Info, BarChart3, ShieldAlert, LogOut, Lock } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
  danger?: boolean;
}

export const ADMIN_NAV: NavGroup[] = [
  {
    label: "General",
    items: [
      { id: "portfolio", label: "Portfolio", icon: <ImageIcon className="ad-nav-icon h-[18px] w-[18px]" /> },
      { id: "pricing", label: "Pricing", icon: <Tag className="ad-nav-icon h-[18px] w-[18px]" /> },
      { id: "faq", label: "FAQ", icon: <HelpCircle className="ad-nav-icon h-[18px] w-[18px]" /> },
      { id: "workflow", label: "Process", icon: <Workflow className="ad-nav-icon h-[18px] w-[18px]" /> },
      { id: "reviews", label: "Reviews", icon: <Star className="ad-nav-icon h-[18px] w-[18px]" /> },
    ],
  },
  {
    label: "Website",
    items: [
      { id: "site-images", label: "Images", icon: <ImageIcon className="ad-nav-icon h-[18px] w-[18px]" /> },
      { id: "nsfw", label: "NSFW Content", icon: <Lock className="ad-nav-icon h-[18px] w-[18px]" /> },
      { id: "social-links", label: "Links", icon: <LinkIcon className="ad-nav-icon h-[18px] w-[18px]" /> },
      { id: "site", label: "Site Info", icon: <Info className="ad-nav-icon h-[18px] w-[18px]" /> },
      { id: "queue", label: "Queue", icon: <BarChart3 className="ad-nav-icon h-[18px] w-[18px]" /> },
    ],
  },
  {
    label: "Danger Zone",
    danger: true,
    items: [{ id: "__reset", label: "Reset Defaults", icon: <ShieldAlert className="ad-nav-icon h-[18px] w-[18px]" /> }],
  },
];

interface SidebarProps {
  active: string;
  onSelect: (id: string) => void;
  onLogout: () => void;
  onReset: () => void;
}

export function AdminSidebar({ active, onSelect, onLogout, onReset }: SidebarProps) {
  return (
    <nav aria-label="Admin navigation" className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV.map((group, gi) => (
          <div key={group.label || gi}>
            {group.label && <p className="ad-nav-section">{group.label}</p>}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = active === item.id;
                const isDanger = group.danger;
                if (isDanger) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={onReset}
                      className="ad-nav-item hover:!border-[var(--danger-border)] hover:!bg-[var(--danger-soft)] hover:!text-[var(--danger)]"
                    >
                      <span className="ad-nav-icon text-[var(--text-dim)]">{item.icon}</span>
                      {item.label}
                    </button>
                  );
                }
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`ad-nav-item ${isActive ? "ad-nav-item-active" : ""}`}
                  >
                    {isActive && <span className="ad-nav-bar" aria-hidden />}
                    <span className="ad-nav-icon text-[var(--text-secondary)]">{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)] p-3">
        <button
          type="button"
          onClick={onLogout}
          className="ad-nav-item hover:!border-[var(--danger-border)] hover:!bg-[var(--danger-soft)] hover:!text-[var(--danger)]"
        >
          <LogOut className="ad-nav-icon h-[18px] w-[18px] text-[var(--text-secondary)]" />
          Logout
        </button>
      </div>
    </nav>
  );
}
