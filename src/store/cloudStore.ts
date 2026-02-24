// src/store/cloudStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CloudState {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string } | null;
  currentProjectId: string | null;
  lastSaved: Date | null;
  isSaving: boolean;
  
  // Actions
  setUser: (user: { id: string; email: string; name: string } | null) => void;
  setProjectId: (id: string | null) => void;
  setSaving: (saving: boolean) => void;
  markSaved: () => void;
  logout: () => void;
}

export const useCloudStore = create<CloudState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      currentProjectId: null,
      lastSaved: null,
      isSaving: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProjectId: (id) => set({ currentProjectId: id }),
      setSaving: (saving) => set({ isSaving: saving }),
      markSaved: () => set({ lastSaved: new Date(), isSaving: false }),
      logout: () => set({ user: null, isAuthenticated: false, currentProjectId: null }),
    }),
    {
      name: 'casapro-cloud',
    }
  )
);
