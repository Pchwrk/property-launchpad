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
import type { PhotoStatus, Property, TaskStatus } from "./types";

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