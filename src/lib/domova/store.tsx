import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MOCK_PROPERTIES, buildEmptyPhotos, buildEmptyTasks } from "./mock-data";
import { LanguageProvider } from "./i18n";
import type {
  CategoryId,
  PhotoItem,
  PhotoStatus,
  Property,
  Severity,
  Task,
  TaskStatus,
} from "./types";

type EditableDetails = Pick<
  Property,
  "name" | "city" | "propertyType" | "bedrooms" | "beds" | "maxGuests" | "checkInMethod"
>;

interface DomovaContextValue {
  properties: Property[];
  getProperty: (id: string) => Property | undefined;
  setTaskStatus: (propertyId: string, taskId: string, status: TaskStatus) => void;
  setPhotoStatus: (propertyId: string, photoId: string, status: PhotoStatus) => void;
  updatePropertyDetails: (propertyId: string, partial: Partial<EditableDetails>) => void;
  createDraft: () => string;
  deleteProperty: (propertyId: string) => void;
  duplicateProperty: (propertyId: string) => string | null;
  addCustomTask: (
    propertyId: string,
    categoryId: CategoryId,
    input: { title: string; hint?: string; severity: Severity },
  ) => string | null;
  updateTask: (
    propertyId: string,
    taskId: string,
    partial: { title?: string; hint?: string; severity?: Severity },
  ) => void;
  deleteTask: (propertyId: string, taskId: string) => void;
  addCustomPhoto: (
    propertyId: string,
    input: { label: string; required: boolean; note?: string },
  ) => string | null;
  updatePhotoItem: (
    propertyId: string,
    photoId: string,
    partial: { label?: string; required?: boolean; note?: string },
  ) => void;
  deletePhotoItem: (propertyId: string, photoId: string) => void;
  resetDemoData: () => void;
  hydrated: boolean;
}

const DomovaContext = createContext<DomovaContextValue | null>(null);

const STORAGE_KEY = "domova:onboarding:v1";

function isValidPropertyShape(p: unknown): p is Property {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    Array.isArray(o.tasks) &&
    Array.isArray(o.photos)
  );
}

function loadFromStorage(): Property[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    if (!parsed.every(isValidPropertyShape)) return null;
    return parsed as Property[];
  } catch {
    return null;
  }
}

function saveToStorage(properties: Property[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
  } catch {
    // quota / privacy mode — ignore, prototype only.
  }
}

export function DomovaProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [hydrated, setHydrated] = useState(false);
  const skipNextSave = useRef(true);

  // Client-only hydration from localStorage. Falls back to MOCK on missing/corrupt.
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      skipNextSave.current = true;
      setProperties(stored);
    }
    setHydrated(true);
  }, []);

  // Persist after every change, but skip the initial hydration write.
  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveToStorage(properties);
  }, [properties, hydrated]);

  const getProperty = useCallback(
    (id: string) => properties.find((p) => p.id === id),
    [properties],
  );

  const setTaskStatus = useCallback((propertyId: string, taskId: string, status: TaskStatus) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id !== propertyId
          ? p
          : { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)) },
      ),
    );
  }, []);

  const setPhotoStatus = useCallback((propertyId: string, photoId: string, status: PhotoStatus) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id !== propertyId
          ? p
          : { ...p, photos: p.photos.map((ph) => (ph.id === photoId ? { ...ph, status } : ph)) },
      ),
    );
  }, []);

  const updatePropertyDetails = useCallback(
    (propertyId: string, partial: Partial<EditableDetails>) => {
      setProperties((prev) =>
        prev.map((p) => (p.id !== propertyId ? p : { ...p, ...partial })),
      );
    },
    [],
  );

  const createDraft = useCallback(() => {
    const id = `draft-${Date.now().toString(36)}`;
    const draft: Property = {
      id,
      name: "Untitled draft",
      city: "City placeholder",
      addressPlaceholder: "Address placeholder",
      ownerPlaceholder: "Owner placeholder",
      cover: "🏷️",
      propertyType: "apartment",
      bedrooms: 1,
      beds: 1,
      maxGuests: 2,
      checkInMethod: "lockbox",
      tasks: buildEmptyTasks(id),
      photos: buildEmptyPhotos(id),
    };
    // Caller is responsible for a two-step flow: call createDraft(), then
    // navigate only after the new id appears in `properties` (via useEffect).
    setProperties((prev) => [draft, ...prev]);
    return id;
  }, []);

  const deleteProperty = useCallback((propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
  }, []);

  const addCustomTask = useCallback(
    (
      propertyId: string,
      categoryId: CategoryId,
      input: { title: string; hint?: string; severity: Severity },
    ): string | null => {
      const title = input.title.trim();
      if (!title) return null;
      const hint = input.hint?.trim() || undefined;
      let newId: string | null = null;
      setProperties((prev) => {
        if (!prev.some((p) => p.id === propertyId)) return prev;
        const id = `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        newId = id;
        const task: Task = {
          id,
          categoryId,
          title,
          hint,
          severity: input.severity,
          status: "todo",
          isCustom: true,
        };
        return prev.map((p) =>
          p.id !== propertyId ? p : { ...p, tasks: [...p.tasks, task] },
        );
      });
      return newId;
    },
    [],
  );

  const updateTask = useCallback(
    (
      propertyId: string,
      taskId: string,
      partial: { title?: string; hint?: string; severity?: Severity },
    ) => {
      // Whitelist editable fields. Never touch id, categoryId, status, key, isCustom.
      const patch: { title?: string; hint?: string; severity?: Severity } = {};
      if (partial.title !== undefined) {
        const t = partial.title.trim();
        if (t) patch.title = t;
      }
      if (partial.hint !== undefined) {
        const h = partial.hint.trim();
        patch.hint = h ? h : undefined;
      }
      if (partial.severity !== undefined) patch.severity = partial.severity;
      if (Object.keys(patch).length === 0) return;
      setProperties((prev) =>
        prev.map((p) =>
          p.id !== propertyId
            ? p
            : { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) },
        ),
      );
    },
    [],
  );

  const deleteTask = useCallback((propertyId: string, taskId: string) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== propertyId) return p;
        const target = p.tasks.find((t) => t.id === taskId);
        // Store-level guard: only custom tasks can be deleted.
        if (!target || !target.isCustom) return p;
        return { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) };
      }),
    );
  }, []);

  const addCustomPhoto = useCallback(
    (
      propertyId: string,
      input: { label: string; required: boolean; note?: string },
    ): string | null => {
      const label = input.label.trim();
      if (!label) return null;
      const note = input.note?.trim() || undefined;
      let newId: string | null = null;
      setProperties((prev) => {
        if (!prev.some((p) => p.id === propertyId)) return prev;
        const id = `photo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        newId = id;
        const photo: PhotoItem = {
          id,
          label,
          required: !!input.required,
          status: "missing",
          note,
          isCustom: true,
        };
        return prev.map((p) =>
          p.id !== propertyId ? p : { ...p, photos: [...p.photos, photo] },
        );
      });
      return newId;
    },
    [],
  );

  const updatePhotoItem = useCallback(
    (
      propertyId: string,
      photoId: string,
      partial: { label?: string; required?: boolean; note?: string },
    ) => {
      // Whitelist editable fields. Never touch id, status, isCustom.
      const patch: { label?: string; required?: boolean; note?: string } = {};
      if (partial.label !== undefined) {
        const l = partial.label.trim();
        if (l) patch.label = l;
      }
      if (partial.required !== undefined) patch.required = !!partial.required;
      if (partial.note !== undefined) {
        const n = partial.note.trim();
        patch.note = n ? n : undefined;
      }
      if (Object.keys(patch).length === 0) return;
      setProperties((prev) =>
        prev.map((p) =>
          p.id !== propertyId
            ? p
            : { ...p, photos: p.photos.map((ph) => (ph.id === photoId ? { ...ph, ...patch } : ph)) },
        ),
      );
    },
    [],
  );

  const deletePhotoItem = useCallback((propertyId: string, photoId: string) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== propertyId) return p;
        const target = p.photos.find((ph) => ph.id === photoId);
        // Store-level guard: only custom photo items can be deleted.
        if (!target || !target.isCustom) return p;
        return { ...p, photos: p.photos.filter((ph) => ph.id !== photoId) };
      }),
    );
  }, []);

  const duplicateProperty = useCallback((propertyId: string): string | null => {
    let newId: string | null = null;
    setProperties((prev) => {
      const src = prev.find((p) => p.id === propertyId);
      if (!src) return prev;
      const id = `dup-${Date.now().toString(36)}`;
      newId = id;
      const copy: Property = {
        ...src,
        id,
        name: `${src.name} (copy)`,
        tasks: src.tasks.map((t, i) => ({ ...t, id: `${id}-t${i + 1}` })),
        photos: src.photos.map((ph, i) => ({ ...ph, id: `${id}-p${i}` })),
      };
      const idx = prev.findIndex((p) => p.id === propertyId);
      const next = prev.slice();
      next.splice(idx + 1, 0, copy);
      return next;
    });
    return newId;
  }, []);

  const resetDemoData = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    skipNextSave.current = true;
    setProperties(MOCK_PROPERTIES);
  }, []);

  const value = useMemo<DomovaContextValue>(
    () => ({
      properties,
      getProperty,
      setTaskStatus,
      setPhotoStatus,
      updatePropertyDetails,
      createDraft,
      deleteProperty,
      duplicateProperty,
      addCustomTask,
      updateTask,
      deleteTask,
      addCustomPhoto,
      updatePhotoItem,
      deletePhotoItem,
      resetDemoData,
      hydrated,
    }),
    [
      properties,
      getProperty,
      setTaskStatus,
      setPhotoStatus,
      updatePropertyDetails,
      createDraft,
      deleteProperty,
      duplicateProperty,
      addCustomTask,
      updateTask,
      deleteTask,
      addCustomPhoto,
      updatePhotoItem,
      deletePhotoItem,
      resetDemoData,
      hydrated,
    ],
  );

  return (
    <DomovaContext.Provider value={value}>
      <LanguageProvider>{children}</LanguageProvider>
    </DomovaContext.Provider>
  );
}

export function useDomova(): DomovaContextValue {
  const ctx = useContext(DomovaContext);
  if (!ctx) throw new Error("useDomova must be used inside <DomovaProvider>");
  return ctx;
}