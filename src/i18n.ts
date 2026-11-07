import original from "./data/myanmar.json";
export type Language = "en" | "mm";
const messages: Record<string, string> = {
  ...original,
  "Practice journal": "ရွတ်ဖတ်မှုမှတ်တမ်း",
  "Continue practice": "ရွတ်ဖတ်မှု ဆက်ရန်",
  "Open navigation": "သွားလိုသော နေရာကို ရွေးရန်",
  "Your journey, one day at a time.":
    "နေ့ရက်တိုင်းမှာ မိမိ၏ ရွတ်ဖတ်မှုခရီးစဉ်။",
  "A quiet space to show up, reflect, and keep going.":
    "စိတ်အေးချမ်းစွာ နေ့စဉ်ရွတ်ဖတ်ပြီး မှတ်တမ်းတင်နိုင်ရာ နေရာလေး။",
  Calendar: "ပြက္ခဒိန်",
  "Journal tools": "မှတ်တမ်း စီမံရန်",
  "Your progress": "မိမိ၏ တိုးတက်မှု",
  "90-day journey": "ရက် ၉၀ ခရီးစဉ်",
  "Days practiced": "ရွတ်ဖတ်ခဲ့သော ရက်များ",
  "of 90 days": "ရက် ၉၀ အနက်",
  "Keep showing up. Every practice counts.":
    "နေ့စဉ် ဆက်လက်ရွတ်ဖတ်ပါ။ ရွတ်ဖတ်မှုတိုင်း အရေးပါပါသည်။",
  "Selected day": "ရွေးထားသော နေ့ရက်",
  "Record practice": "ရွတ်ဖတ်မှု မှတ်သားရန်",
  Day: "ရက်",
  "Your schedule": "မိမိ၏ အစီအစဉ်",
  "Start a new journey": "အစီအစဉ်သစ် စတင်ရန်",
  "New schedule": "အစီအစဉ်သစ်",
  "All schedules": "အစီအစဉ်အားလုံး",
  "Recovery history": "ပြန်ယူနိုင်သော မိတ္တူများ",
  "No recovery copies yet.": "ပြန်ယူနိုင်သော မိတ္တူ မရှိသေးပါ။",
  "Deleted schedules appear here.":
    "ဖျက်ထားသော အစီအစဉ်များကို ဤနေရာတွင် ပြပါမည်။",
  "Choose JSON file": "JSON ဖိုင် ရွေးရန်",
  "Saved locally": "ဘရောက်ဇာတွင် သိမ်းထားသည်",
  "No account needed. Your practice stays yours.":
    "အကောင့် မလိုအပ်ပါ။ မိမိမှတ်တမ်းကို မိမိသာ သိမ်းထားပါသည်။",
  Close: "ပိတ်ရန်",
  "Try again": "ထပ်ကြိုးစားရန်",
  "Choose a saved schedule": "သိမ်းထားသော အစီအစဉ်ကို ရွေးပါ",
  "Keep a copy of your journey.": "မိမိခရီးစဉ်အတွက် အရန်ဖိုင် သိမ်းထားပါ။",
  "Practice saved.": "ရွတ်ဖတ်မှုကို သိမ်းပြီးပါပြီ။",
  "Back to schedule": "အစီအစဉ်သို့ ပြန်သွားရန်",
  "Could not complete this action. Your saved data was not changed. Try again.":
    "ယခုလုပ်ဆောင်ချက် မအောင်မြင်ပါ။ သိမ်းထားသော မှတ်တမ်း မပြောင်းလဲပါ။ ထပ်ကြိုးစားပါ။",
  "Could not complete this action. Check browser storage access and reload to see the latest saved data.":
    "ယခုလုပ်ဆောင်ချက် မအောင်မြင်ပါ။ ဘရောက်ဇာသိမ်းဆည်းခွင့်ကို စစ်ပြီး နောက်ဆုံးသိမ်းထားသော မှတ်တမ်းကို ကြည့်ရန် စာမျက်နှာ ပြန်ဖွင့်ပါ။",
};
export const translator = (language: Language) => (text: string) =>
  language === "mm" ? (messages[text] ?? text) : text;
export const localeFor = (language: Language) =>
  language === "mm" ? "my-MM" : "en-GB";
export function dateLabel(
  iso: string,
  language: Language,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) {
  if (language === "mm") {
    const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
    const months = [
      "ဇန်နဝါရီ",
      "ဖေဖော်ဝါရီ",
      "မတ်",
      "ဧပြီ",
      "မေ",
      "ဇွန်",
      "ဇူလိုင်",
      "ဩဂုတ်",
      "စက်တင်ဘာ",
      "အောက်တိုဘာ",
      "နိုဝင်ဘာ",
      "ဒီဇင်ဘာ",
    ];
    const weekdays = [
      "တနင်္ဂနွေ",
      "တနင်္လာ",
      "အင်္ဂါ",
      "ဗုဒ္ဓဟူး",
      "ကြာသပတေး",
      "သောကြာ",
      "စနေ",
    ];
    return [
      options.weekday ? weekdays[date.getUTCDay()] : null,
      options.day ? date.getUTCDate() : null,
      options.month ? months[date.getUTCMonth()] : null,
      options.year ? date.getUTCFullYear() : null,
    ]
      .filter((value) => value !== null)
      .join(" ");
  }
  return new Intl.DateTimeFormat(localeFor(language), {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
}
export const weekdayLabel = (day: string, language: Language) =>
  language === "mm"
    ? ({
        Sun: "နွေ",
        Mon: "လာ",
        Tue: "ဂါ",
        Wed: "ဟူး",
        Thu: "တေး",
        Fri: "ကြာ",
        Sat: "နေ",
      }[day] ?? day)
    : day;
export const format = (
  t: (text: string) => string,
  text: string,
  ...values: (string | number)[]
) =>
  t(text).replace(/\{(\d+)\}/g, (_, index) =>
    String(values[Number(index)] ?? ""),
  );
