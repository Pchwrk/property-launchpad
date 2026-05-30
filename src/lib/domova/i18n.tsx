import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "bg";

// Bulgarian overrides only. Missing keys fall back to the English source string.
const BG: Record<string, string> = {
  // App chrome
  "Properties": "Имоти",
  "Back": "Назад",
  "New draft property": "Нов имот",
  "Opening draft…": "Отваряне на чернова…",
  "Property not found. This can happen if a session-only draft was lost after refresh.":
    "Имотът не е намерен. Това може да се случи, ако сесийна чернова е загубена след презареждане.",
  "Quick test path": "Бърз тест",
  "Open Sunlit Studio → resolve Booking.com draft listing → approve remaining photo → check Launch review.":
    "Отвори Sunlit Studio → разреши черновата в Booking.com → одобри останалата снимка → провери Финален преглед.",
  "Prototype · no real owner, address, or credentials are stored.":
    "Прототип · не се съхраняват реални собственици, адреси или идентификационни данни.",
  "Demo data is saved only in this browser. Do not enter real addresses, contacts, codes, passwords, payout details, or documents.":
    "Демо данните се пазят само в този браузър. Не въвеждай реални адреси, контакти, кодове, пароли, данни за плащане или документи.",
  "Reset demo data": "Нулирай демо данните",
  "Reset demo data? This clears saved drafts and progress in this browser only.":
    "Да нулирам ли демо данните? Това изчиства запазените чернови и прогрес само в този браузър.",
  "Delete": "Изтрий",
  "Duplicate": "Дублирай",
  "Delete this property? This cannot be undone.":
    "Да изтрия ли този имот? Действието е необратимо.",
  "No properties yet. Tap “New draft property” to start, or reset demo data.":
    "Все още няма имоти. Натисни „Нов имот“, за да започнеш, или нулирай демо данните.",
  "Opening duplicate…": "Отваряне на копие…",
  " (copy)": " (копие)",

  // Property overview
  "Photos": "Снимки",
  "Launch review": "Финален преглед",
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
  "Show open only": "Само отворени задачи",
  "Hides tasks marked done or n/a": "Скрива задачите, маркирани като готови или неприложими",
  "hidden": "скрити",
  "✓ No open tasks in this category.": "✓ Няма отворени задачи в тази категория.",
  "Confirmation only": "Само потвърждение",
  "Confirmation tasks never store sensitive data — codes, passwords, and contact details stay with the owner.":
    "Потвържденията не съхраняват чувствителни данни — кодове, пароли и контакти остават при собственика.",
  "To do": "За изпълнение",
  "Done": "Готово",
  "n/a": "Неприложимо",

  // Launch
  "Launch readiness": "Готовност за стартиране",
  "Ready to publish": "Готово за публикуване",
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
  "Session only": "Само за текущата сесия",
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

  // Task titles — basics
  "Property name set": "Името на имота е въведено",
  "Property type selected": "Избран е тип имот",
  "Bedrooms, beds, and max guests confirmed": "Спални, легла и макс. гости са потвърдени",
  "Sleeping arrangements checked": "Проверена е подредбата за спане",
  "Listing description draft prepared": "Подготвен е чернови текст за обявата",

  // Task titles — owner
  "Owner contact confirmed": "Контактът на собственика е потвърден",
  "Backup contact confirmed": "Резервният контакт е потвърден",
  "Owner communication preference confirmed": "Предпочитаният канал за комуникация е потвърден",
  "Payout details confirmed as checked": "Данните за плащане са маркирани като проверени",
  "Confirm only — no phone numbers or emails stored.":
    "Само потвърждение — не се съхраняват телефони или имейли.",
  "Confirm only — no contact data stored.":
    "Само потвърждение — не се съхраняват контактни данни.",
  "Confirm only — do not store real details.":
    "Само потвърждение — не въвеждай реални данни.",
  "Confirm only — no payout or bank data stored.":
    "Само потвърждение — не се съхраняват банкови данни.",

  // Task titles — documents
  "Management agreement confirmed": "Договорът за управление е потвърден",
  "Ownership / permission document checked": "Документът за собственост / разрешение е проверен",
  "ID or company document checked": "Личен или фирмен документ е проверен",
  "Rental license / local registration checked": "Лиценз за наем / местна регистрация е проверена",
  "Tourist tax or local tax requirement checked": "Туристически или местен данък е проверен",
  "Confirm only — no documents uploaded.":
    "Само потвърждение — не се качват документи.",

  // Task titles — access
  "Check-in method selected": "Избран е метод за настаняване",
  "Access / lockbox details confirmed": "Данните за достъп / сейф с ключ са потвърдени",
  "Backup key plan confirmed": "Резервният план за ключове е потвърден",
  "Key handover process confirmed": "Процесът по предаване на ключ е потвърден",
  "Emergency access process confirmed": "Процесът за аварийен достъп е потвърден",
  "Confirm only — codes and key locations are never stored.":
    "Само потвърждение — кодове и места за ключове никога не се съхраняват.",
  "Confirm only — no key locations stored.":
    "Само потвърждение — не се съхраняват места за ключове.",
  "Confirm only — no codes or locations stored.":
    "Само потвърждение — не се съхраняват кодове или места.",

  // Task titles — wifi
  "Wi-Fi available": "Има налично Wi-Fi",
  "Wi-Fi details confirmed": "Данните за Wi-Fi са потвърдени",
  "Electricity and water checked": "Ток и вода са проверени",
  "Heating / AC checked": "Отопление / климатик са проверени",
  "Appliance basics checked": "Основни уреди са проверени",
  "Confirm only — passwords are never stored.":
    "Само потвърждение — пароли никога не се съхраняват.",

  // Task titles — cleaning
  "Cleaner assigned": "Назначен е чистач",
  "First cleaning scheduled": "Първото почистване е насрочено",
  "Linens and towels ready": "Спално бельо и кърпи са готови",
  "Consumables stocked": "Консумативите са заредени",
  "Trash instructions ready": "Инструкциите за боклука са готови",
  "Damage / maintenance reporting process confirmed":
    "Процесът за докладване на щети / поддръжка е потвърден",

  // Task titles — photos
  "Photographer or photo plan confirmed": "Фотограф или план за снимки е потвърден",
  "Staging complete": "Подготовката за снимки е завършена",
  "Hero photo selected": "Избрана е основна снимка",
  "Required room photos checked": "Задължителните снимки на стаите са проверени",
  "Entrance / building photo checked": "Снимката на входа / сградата е проверена",
  "Retake review complete": "Прегледът за повторно снимане е завършен",

  // Task titles — rules
  "House rules drafted": "Изготвени са правила за дома",
  "Check-in instructions drafted": "Изготвени са инструкции за настаняване",
  "Check-out instructions drafted": "Изготвени са инструкции за напускане",
  "Emergency contact placeholder confirmed": "Резервираното поле за авариен контакт е потвърдено",
  "Quiet hours / smoking / pets policy confirmed":
    "Тихи часове / пушене / политика за домашни любимци са потвърдени",
  "Confirm only — no real emergency phone stored.":
    "Само потвърждение — не се съхранява реален авариен телефон.",

  // Task titles — platform
  "Shared listing content ready": "Общото съдържание за обявите е готово",
  "Airbnb draft listing created": "Създадена е чернова на обява в Airbnb",
  "Booking.com draft listing created": "Създадена е чернова на обява в Booking.com",
  "Pricing rules drafted": "Изготвени са правила за цените",
  "Calendar availability reviewed": "Календарът за наличност е прегледан",
  "Channel-specific cancellation / policy checks confirmed":
    "Политиките за отказ по канали са потвърдени",

  // Task titles — review
  "Blocking issues reviewed": "Блокиращите проблеми са прегледани",
  "Photo readiness approved": "Готовността на снимките е одобрена",
  "Final inspection done": "Финалната инспекция е извършена",
  "Manager sign-off": "Одобрение от мениджър",
  "Ready-to-publish confirmation checked": "Потвърждението за публикуване е маркирано",
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