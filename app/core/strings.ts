import type { Locale } from "./locale";

/**
 * The fixed words of the interface.
 *
 * Only chrome lives here — navigation, buttons, labels. Anything a practice
 * says about itself comes from its registry row via `contentByLocale`,
 * because that is the half that is actually theirs and the half that would
 * otherwise render as English words in a right-to-left page.
 *
 * Typed against the English table rather than a loose record, so adding a
 * string without an Arabic translation is a compile error rather than a
 * sentence that silently stays English on an Arabic page.
 */

const en = {
    services: "Services",
    appointments: "Appointments",
    contact: "Contact",
    prices: "Our prices",
    urgentCare: "Urgent care",

    book: "Book",
    bookAppointment: "Request an appointment",
    callUs: "Call us",
    menu: "Menu",
    close: "Close",

    bookingKicker: "Book",
    bookingLede:
        "It takes about a minute. You will get a confirmation with a time, not a promise to call you back at some point.",
    ratherTalk: "Rather talk to someone?",

    leadTitle: "See this week's openings",
    leadLede:
        "Two details and we will call you back with the next three slots. No account, no waiting on hold.",
    yourName: "Your name",
    mobileNumber: "Mobile number",
    callMeBack: "Call me back",
    sending: "Sending…",
    leadPrivacy: "Used once, to arrange this appointment. Never passed on.",
    heroSeeNamed: "See a named",
    heroThisWeek: "this week",
    heroNotInThree: "not in three",
    heroPricesLine: "Every price published on this page, and a real time confirmed within the hour.",
    chooseClinician: "Choose your clinician",
    minutes: "minutes",

    skipToContent: "Skip to main content",
    backToHome: "Back to the home page",
    language: "Language",
    english: "English",
    arabic: "العربية",
} as const;

export type UiKey = keyof typeof en;

/* Arabic. Written for the Gulf reader rather than transliterated: "احجز
   موعداً" is what a clinic in Sharjah puts on its own booking button, and
   "الرعاية العاجلة" is the phrase used for urgent rather than emergency care —
   the distinction matters on a site that must not imply it runs an A&E. */
const ar: Record<UiKey, string> = {
    services: "الخدمات",
    appointments: "المواعيد",
    contact: "اتصل بنا",
    prices: "أسعارنا",
    urgentCare: "الرعاية العاجلة",

    book: "احجز",
    bookAppointment: "اطلب موعداً",
    callUs: "اتصل بنا",
    menu: "القائمة",
    close: "إغلاق",

    bookingKicker: "الحجز",
    bookingLede:
        "يستغرق الأمر دقيقة تقريباً. ستصلك رسالة تأكيد بموعد محدد، لا مجرد وعد بالاتصال بك لاحقاً.",
    ratherTalk: "تفضل التحدث مع أحد موظفينا؟",

    leadTitle: "مواعيد هذا الأسبوع",
    leadLede:
        "تفصيلان فقط وسنعاود الاتصال بك بأقرب ثلاثة مواعيد. دون حساب ودون انتظار على الهاتف.",
    yourName: "الاسم",
    mobileNumber: "رقم الهاتف",
    callMeBack: "عاودوا الاتصال بي",
    sending: "جارٍ الإرسال…",
    leadPrivacy: "يُستخدم مرة واحدة لترتيب هذا الموعد، ولا يُشارك مع أي جهة أخرى.",
    heroSeeNamed: "قابل",
    heroThisWeek: "هذا الأسبوع",
    heroNotInThree: "لا بعد ثلاثة أسابيع",
    heroPricesLine: "كل الأسعار منشورة على هذه الصفحة، وموعد مؤكد خلال ساعة.",
    chooseClinician: "اختر طبيبك",
    minutes: "دقيقة",

    skipToContent: "تخطَّ إلى المحتوى الرئيسي",
    backToHome: "العودة إلى الصفحة الرئيسية",
    language: "اللغة",
    english: "English",
    arabic: "العربية",
};

const TABLES: Record<Locale, Record<UiKey, string>> = { en, ar };

/** The interface strings for one language. */
export function stringsFor(locale: Locale): Record<UiKey, string> {
    return TABLES[locale];
}
