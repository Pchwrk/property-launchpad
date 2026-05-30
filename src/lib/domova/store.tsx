import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { MOCK_PROPERTIES, buildEmptyPhotos, buildEmptyTasks } from "./mock-data";
import type { PhotoStatus, Property, TaskStatus } from "./types";

interface DomovaContextValue {
  properties: Property[];
  getProperty: (id: string) => Property | undefined;
  setTaskStatus: (propertyId: string, taskId: string, status: TaskStatus) => void;
  setPhotoStatus: (propertyId: string, photoId: string, status: PhotoStatus) => void;
  createDraft: () => string;
}

const DomovaContext = createContext<DomovaContextValue | null>(null);

export function DomovaProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);

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

  const createDraft = useCallback(() => {
    const id = `draft-${Date.now().toString(36)}`;
    const draft: Property = {
      id,
      name: "Untitled draft",
      city: "City placeholder",
      addressPlaceholder: "Address placeholder",
      ownerPlaceholder: "Owner placeholder",
      cover: "🏷️",
      tasks: buildEmptyTasks(id),
      photos: buildEmptyPhotos(id),
    };
    setProperties((prev) => [draft, ...prev]);
    return id;
  }, []);

  const value = useMemo<DomovaContextValue>(
    () => ({ properties, getProperty, setTaskStatus, setPhotoStatus, createDraft }),
    [properties, getProperty, setTaskStatus, setPhotoStatus, createDraft],
  );

  return <DomovaContext.Provider value={value}>{children}</DomovaContext.Provider>;
}

export function useDomova(): DomovaContextValue {
  const ctx = useContext(DomovaContext);
  if (!ctx) throw new Error("useDomova must be used inside <DomovaProvider>");
  return ctx;
}