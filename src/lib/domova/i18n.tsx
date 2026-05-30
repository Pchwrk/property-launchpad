import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "bg";

// Bulgarian overrides only. Missing keys fall back to the English source string.
const BG: Record<string, string> = {
  // App chrome
  "Properties": "Имоти",
  "Back": "Назад",
  "New draft property": "Нов чернови имот",
  "Quick test path": "Бърз тестов маршрут",
  "Open Sunlit Studio → resolve Booking.com draft listing → approve remaining photo → check Launch review.":
    "Отвори Sunlit Studio → разреши черновата в Booking.com → одобри останалата снимка → провери Launch review.",
  "Prototype · no real owner, address, or credentials are stored.":
    "Прототип · не се съхраняват реални собственици, адреси или идентификационни данни.",

  // Property overview
  "Photos": "Снимки",
  "Launch review": "Преглед за стартиране",
  "Owner:": "Собственик:",
  "Next task": "Следваща задача",
  "Tap to resolve": "Натисни за разрешаване",
  "All tasks complete 🎉": "Всички задачи са завършени 🎉",
  "All blocking tasks, required tasks, and required photos are complete.":
    "Всички блокиращи задачи, задължителни задачи и задължителни снимки са готови.",
  "Blockers": "Блокери",
  "Photos to approve": "Снимки за одобрение",
  "Checklist": "Чеклист",
  "done": "готови",
  "blocker": "блокер",
  "blockers": "блокери",
  "required": "задължителни",
  "Safe details help confirm basics, but readiness is still controlled by checklist status.":
    "Безопасните детайли помагат за основите, но готовността се определя от чеклиста.",
  "ready": "готово",
  "not ready": "не е готово",

  // Readiness badge
  "Ready": "Готово",
  "Draft": "Чернова",
  "Not ready": "Не е готово",
  "blocker_one": "блокер",
  "blocker_many": "блокера",

  // Checklist
  "Show open only": "Покажи само отворени",
  "Hides tasks marked done or n/a": "Скрива задачи, маркирани като готови или n/a",
  "hidden": "скрити",
  "✓ No open tasks in this category.": "✓ Няма отворени задачи в тази категория.",
  "Confirmation only": "Само потвърждение",
  "Confirmation tasks never store sensitive data — codes, passwords, and contact details stay with the owner.":
    "Потвържденията не съхраняват чувствителни данни — кодове, пароли и контакти остават при собственика.",
  "To do": "За изпълнение",
  "Done": "Готово",
  "n/a": "n/a",

  // Launch
  "Launch readiness": "Готовност за стартиране",
  "Ready to publish": "Готов за публикуване",
  "Overall": "Общо",
  "Computed from task & photo status — never set manually.":
    "Изчислено от статуса на задачите и снимките — никога не се задава ръчно.",
  "Resolve the listed items, then return here.": "Разреши изброените точки и се върни тук.",
  "Publishing is disabled in this prototype. Buttons only unlock when computed readiness passes.":
    "Публикуването е изключено в този прототип. Бутоните се отключват само когато готовността е изпълнена.",
  "Publish to Airbnb": "Публикувай в Airbnb",
  "Publish to Booking": "Публикувай в Booking",
  "Blocking tasks": "Блокиращи задачи",
  "No blockers remaining.": "Няма останали блокери.",
  "Required tasks open": "Отворени задължителни задачи",
  "All required tasks complete.": "Всички задължителни задачи са готови.",
  "Required photos": "Задължителни снимки",
  "All required photos approved.": "Всички задължителни снимки са одобрени.",
  "Airbnb checks": "Проверки за Airbnb",
  "Booking.com checks": "Проверки за Booking.com",

  // Photos
  "Photo readiness": "Готовност на снимките",
  "required approved": "задължителни одобрени",
  "Tap each tile to cycle: missing → uploaded → approved → retake. No files are uploaded in this prototype.":
    "Натисни всяка плочка, за да я превключиш: липсва → качена → одобрена → преснемане. В прототипа не се качват файлове.",
  "Required": "Задължителна",
  "Optional": "Незадължителна",
  "Missing": "Липсва",
  "Uploaded": "Качена",
  "Approved": "Одобрена",
  "Retake": "Преснимане",

  // Severity
  "Blocking": "Блокираща",

  // Safe details
  "Safe property details": "Безопасни данни за имота",
  "Session only": "Само за сесията",
  "Property name": "Име на имота",
  "City": "Град",
  "Property type": "Тип имот",
  "Bedrooms": "Спални",
  "Beds": "Легла",
  "Max guests": "Макс. гости",
  "Check-in method": "Метод за настаняване",
  "No address, contacts, codes, passwords, or payout fields are stored. Edits live only in this browser session.":
    "Не се съхраняват адреси, контакти, кодове, пароли или плащания. Промените остават само в тази сесия.",

  // Property types
  "Apartment": "Апартамент",
  "House": "Къща",
  "Studio": "Студио",
  "Villa": "Вила",
  "Private room": "Самостоятелна стая",

  // Check-in methods
  "Host greeting": "Посрещане от домакин",
  "Lockbox": "Сейф с ключ",
  "Smart lock": "Умна ключалка",
  "Key handover": "Лично предаване на ключ",
  "Other (confirmed)": "Друго (потвърдено)",

  // Categories
  "Property basics": "Основни данни",
  "Name, type, capacity.": "Име, тип, капацитет.",
  "Owner / contact": "Собственик / контакт",
  "Confirm contact on file.": "Потвърди контакта.",
  "Documents": "Документи",
  "Licenses and paperwork.": "Лицензи и документи.",
  "Access / keys": "Достъп / ключове",
  "Confirm key handover plan.": "Потвърди план за предаване на ключ.",
  "Wi-Fi / utilities": "Wi-Fi / комунални",
  "Confirm services live.": "Потвърди, че услугите работят.",
  "Cleaning / supplies": "Почистване / консумативи",
  "Turnover ready.": "Готов за смяна на гости.",
  "Photos / staging": "Снимки / подготовка",
  "Visual readiness.": "Визуална готовност.",
  "Guest rules": "Правила за гостите",
  "House rules drafted.": "Изготвени правила.",
  "Platform readiness": "Готовност за платформите",
  "Airbnb & Booking checks.": "Проверки за Airbnb и Booking.",
  "Final launch review": "Финален преглед",
  "One last pass.": "Последна проверка.",
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // English default. Session-only memory; no persistence.
  const [lang, setLang] = useState<Lang>("en");
  const t = useCallback(
    (key: string) => (lang === "en" ? key : BG[key] ?? key),
    [lang],
  );
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useT(): (key: string) => string {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useT must be used inside <LanguageProvider>");
  return ctx.t;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}