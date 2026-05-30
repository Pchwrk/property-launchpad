import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
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

  const value = useMemo<DomovaContextValue>(
    () => ({ properties, getProperty, setTaskStatus, setPhotoStatus, updatePropertyDetails, createDraft }),
    [properties, getProperty, setTaskStatus, setPhotoStatus, updatePropertyDetails, createDraft],
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