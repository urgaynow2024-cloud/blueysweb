"use client";

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";
import { useToast } from "./Toast";

type Saver = () => Promise<void> | void;

interface SaveApi {
  dirty: boolean;
  saving: boolean;
  markDirty: () => void;
  /** Register a section's persistence routine. Returns an unregister fn. */
  register: (name: string, saver: Saver) => () => void;
  /** Run every registered saver and clear the dirty flag. */
  saveAll: () => Promise<void>;
}

const SaveContext = createContext<SaveApi | null>(null);

export function useSave(): SaveApi {
  const ctx = useContext(SaveContext);
  if (!ctx) throw new Error("useSave must be used within SaveProvider");
  return ctx;
}

export function SaveProvider({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const savers = useRef<Map<string, Saver>>(new Map());
  const toast = useToast();

  const markDirty = useCallback(() => setDirty(true), []);

  const register = useCallback((name: string, saver: Saver) => {
    savers.current.set(name, saver);
    return () => {
      savers.current.delete(name);
    };
  }, []);

  const saveAll = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const entries = Array.from(savers.current.entries());
      if (entries.length === 0) {
        setDirty(false);
        toast.success("Saved successfully");
        return;
      }
      for (const [, saver] of entries) {
        await saver();
      }
      setDirty(false);
      toast.success("Saved successfully");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }, [saving, toast]);

  return (
    <SaveContext.Provider value={{ dirty, saving, markDirty, register, saveAll }}>
      {children}
    </SaveContext.Provider>
  );
}
