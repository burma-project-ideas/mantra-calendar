using System.Globalization;
using Microsoft.JSInterop;

namespace BlazorWasm.MantraCalendarApp.Services;

public sealed class UiLanguage(IJSRuntime js)
{
    public string Language { get; private set; } = "mm";
    public string Locale => Language == "en" ? "en-GB" : "my-MM";
    public CultureInfo Culture => Language == "en" ? CultureInfo.GetCultureInfo("en-GB") : MyanmarCulture;
    public bool Saving { get; private set; }
    public string? Error { get; private set; }
    public event Action? Changed;
    public string this[string text] => Language == "mm" && Myanmar.TryGetValue(text, out var translated) ? translated : text;
    public string Format(string text, params object[] values) => string.Format(Culture, this[text], values);
    public string Date(DateTime date, string format = "d MMM yyyy") => date.ToString(format, Culture);

    public async Task InitializeAsync()
    {
        try
        {
            await using var database = await js.InvokeAsync<IJSObjectReference>("import", "./js/practice-db.js");
            Language = await database.InvokeAsync<string>("getLanguage");
            await database.InvokeVoidAsync("setDocumentLanguage", Language);
        }
        catch (JSException) { Error = "Language preference could not be loaded. Myanmar is being used."; }
    }

    public async Task SetAsync(string language)
    {
        if (Saving || (language != "en" && language != "mm")) return;
        Saving = true;
        Error = null;
        Changed?.Invoke();
        try
        {
            await using var database = await js.InvokeAsync<IJSObjectReference>("import", "./js/practice-db.js");
            await database.InvokeVoidAsync("setLanguage", language);
            Language = language;
        }
        catch (JSException) { Error = "Language preference could not be saved. Try again."; }
        finally { Saving = false; Changed?.Invoke(); }
    }

    private static readonly CultureInfo MyanmarCulture = CreateMyanmarCulture();

    private static CultureInfo CreateMyanmarCulture()
    {
        // Explicit names keep calendar labels in Myanmar when browser ICU data falls back to English.
        var culture = new CultureInfo("my-MM");
        var months = new[] { "ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်", "ဇူလိုင်", "ဩဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ", "" };
        var days = new[] { "တနင်္ဂနွေ", "တနင်္လာ", "အင်္ဂါ", "ဗုဒ္ဓဟူး", "ကြာသပတေး", "သောကြာ", "စနေ" };
        culture.DateTimeFormat.MonthNames = months;
        culture.DateTimeFormat.MonthGenitiveNames = months;
        culture.DateTimeFormat.AbbreviatedMonthNames = months;
        culture.DateTimeFormat.AbbreviatedMonthGenitiveNames = months;
        culture.DateTimeFormat.DayNames = days;
        culture.DateTimeFormat.AbbreviatedDayNames = new[] { "နွေ", "လာ", "ဂါ", "ဟူး", "တေး", "ကြာ", "နေ" };
        return CultureInfo.ReadOnly(culture);
    }

    private static readonly Dictionary<string, string> Myanmar = new()
    {
        ["Mantra Practice Calendar"] = "နေ့စဉ် ဂုဏ်တော်ရွတ်ဖတ်မှု ပြက္ခဒိန်",
        ["MANTRA PRACTICE CALENDAR"] = "ဂုဏ်တော်ရွတ်ဖတ်မှု ပြက္ခဒိန်",
        ["Your"] = "နေ့စဉ်",
        ["daily practice."] = "ရွတ်ဖတ်မှု",
        ["A little space for your practice. One day at a time."] = "နေ့ရက်တိုင်းမှာ ဂုဏ်တော်ရွတ်ဖတ်ဖို့ အချိန်လေးတစ်ခု။",
        ["Manage schedules"] = "အစီအစဉ်များ စီမံရန်",
        ["Overall practice progress"] = "ရွတ်ဖတ်မှု စုစုပေါင်း တိုးတက်မှု",
        ["YOUR PRACTICE"] = "မိမိ၏ ရွတ်ဖတ်မှု",
        ["complete"] = "ပြီးစီး",
        ["mantras completed"] = "ရွတ်ဖတ်ပြီး ဂုဏ်တော်များ",
        ["Mantras completed"] = "ရွတ်ဖတ်ပြီး ဂုဏ်တော်များ",
        ["Working with your practice journal…"] = "ရွတ်ဖတ်မှုမှတ်တမ်းကို ပြင်ဆင်နေသည်…",
        ["Your practice calendar"] = "ရွတ်ဖတ်မှု ပြက္ခဒိန်",
        ["Select a day to record your mantras."] = "ရွတ်ဖတ်မှုမှတ်သားရန် နေ့ရက်တစ်ခုကို ရွေးပါ။",
        ["Completed"] = "ပြီးစီး",
        ["Pending"] = "မပြီးသေး",
        ["Save your practice after each session."] = "ရွတ်ဖတ်ပြီးတိုင်း မှတ်တမ်းကို သိမ်းပါ။",
        ["No saved schedules. Restore a schedule from Recently deleted above, or create a new one."] = "သိမ်းထားသော အစီအစဉ် မရှိပါ။ မကြာသေးမီက ဖျက်ထားသည့်စာရင်းမှ ပြန်ယူပါ၊ သို့မဟုတ် အစီအစဉ်သစ် ဖန်တီးပါ။",
        ["No saved schedules. Choose a practice start date above to create one, or import a backup."] = "သိမ်းထားသော အစီအစဉ် မရှိပါ။ စတင်ရက်ကို ရွေးပြီး အစီအစဉ်သစ် ဖန်တီးပါ၊ သို့မဟုတ် အရန်ဖိုင်မှ ပြန်ယူပါ။",
        ["Schedule and backup tools"] = "အစီအစဉ်နှင့် အရန်ဖိုင် စီမံခန့်ခွဲမှု",
        ["YOUR JOURNAL"] = "မိမိ၏ မှတ်တမ်း",
        ["Make it a practice."] = "နေ့စဉ် အလေ့အကျင့်လေး။",
        ["Choose your rhythm. Keep your progress."] = "မိမိအစီအစဉ်ကို ရွေးပြီး တိုးတက်မှုကို မှတ်သားပါ။",
        ["Saved schedules"] = "သိမ်းထားသော အစီအစဉ်များ",
        ["Switch periods without losing your progress."] = "မှတ်တမ်းမပျောက်ဘဲ အစီအစဉ် ပြောင်းရွေးနိုင်ပါသည်။",
        ["Loading saved schedules…"] = "အစီအစဉ်များ ရယူနေသည်…",
        ["No saved schedules available"] = "သိမ်းထားသော အစီအစဉ် မရှိပါ",
        ["Delete selected schedule"] = "ရွေးထားသော အစီအစဉ်ကို ဖျက်ရန်",
        ["Recently deleted schedules"] = "မကြာသေးမီက ဖျက်ထားသော အစီအစဉ်များ",
        ["Newest deletions first. Choose a copy to restore its schedule and progress. Other deleted schedules will be kept."] = "နောက်ဆုံးဖျက်ထားသည်ကို အရင်ပြထားပါသည်။ အစီအစဉ်နှင့် မှတ်တမ်း ပြန်ယူရန် မိတ္တူတစ်ခုကို ရွေးပါ။ အခြားမိတ္တူများကို ဆက်သိမ်းထားပါမည်။",
        ["Deleted schedule"] = "ဖျက်ထားသော အစီအစဉ်",
        ["completed"] = "ပြီးစီး",
        ["Restore selected schedule"] = "ရွေးထားသော အစီအစဉ်ကို ပြန်ယူရန်",
        ["Permanently delete selected copy"] = "ရွေးထားသော မိတ္တူကို အပြီးဖျက်ရန်",
        ["Empty recently deleted"] = "ဖျက်ထားသော စာရင်းအားလုံးကို ရှင်းရန်",
        ["Practice start date"] = "ရွတ်ဖတ်မှု စတင်ရက်",
        ["Start a new 90-day practice, or reopen a saved period."] = "ရက် ၉၀ အစီအစဉ်သစ် စတင်ပါ၊ သို့မဟုတ် သိမ်းထားသော အစီအစဉ်ကို ပြန်ဖွင့်ပါ။",
        ["Use schedule"] = "အစီအစဉ်ကို အသုံးပြုရန်",
        ["Backups"] = "အရန်သိမ်းဆည်းမှု",
        ["Save your schedules, progress and recovery history to a JSON file."] = "အစီအစဉ်၊ မှတ်တမ်းနှင့် ပြန်ယူနိုင်သော မိတ္တူများကို JSON ဖိုင်အဖြစ် သိမ်းပါ။",
        ["Export backup"] = "အရန်ဖိုင် ထုတ်သိမ်းရန်",
        ["Import a backup"] = "အရန်ဖိုင်မှ ပြန်ယူရန်",
        ["JSON · up to 5 MiB"] = "JSON · အများဆုံး 5 MiB",
        ["Review backup restore"] = "အရန်ဖိုင်မှ ပြန်ယူမည့်အချက်များ",
        ["{0} schedule(s) ready to restore."] = "အစီအစဉ် {0} ခု ပြန်ယူနိုင်ပါသည်။",
        ["Progress for {0} matching schedule(s) will be replaced. Other schedules will be kept."] = "ရက်တူသော အစီအစဉ် {0} ခု၏ မှတ်တမ်းများကို အစားထိုးပါမည်။ အခြားအစီအစဉ်များကို ဆက်သိမ်းထားပါမည်။",
        ["{0} recently deleted recovery copy/copies included. {1} already present will be kept unchanged. Other recovery history will also be kept."] = "ဖျက်ထားသော မိတ္တူ {0} ခု ပါဝင်ပါသည်။ ရှိပြီးသား မိတ္တူ {1} ခုနှင့် အခြားမိတ္တူများကို မပြောင်းလဲဘဲ ဆက်သိမ်းထားပါမည်။",
        ["Cancel"] = "မလုပ်တော့ပါ",
        ["Restore backup"] = "အရန်ဖိုင်မှ ပြန်ယူရန်",
        ["Delete saved schedule?"] = "သိမ်းထားသော အစီအစဉ်ကို ဖျက်မည်လား။",
        ["Permanently delete recovery copy?"] = "ပြန်ယူနိုင်သော မိတ္တူကို အပြီးဖျက်မည်လား။",
        ["Empty recently deleted?"] = "ဖျက်ထားသော မိတ္တူအားလုံးကို အပြီးရှင်းမည်လား။",
        ["Schedule starting {0} deleted."] = "{0} တွင် စတင်သော အစီအစဉ်ကို ဖျက်ပြီးပါပြီ။",
        ["Recovery copy for the schedule starting {0} permanently deleted."] = "{0} တွင် စတင်သော အစီအစဉ်၏ မိတ္တူကို အပြီးဖျက်ပြီးပါပြီ။",
        ["Confirmed recovery copies permanently deleted. Saved schedules were kept."] = "အတည်ပြုထားသော မိတ္တူများကို အပြီးဖျက်ပြီးပါပြီ။ သိမ်းထားသော အစီအစဉ်များ ကျန်ရှိပါသည်။",
        ["The selected schedule and its progress have been restored. Other deleted schedules were kept."] = "ရွေးထားသော အစီအစဉ်နှင့် မှတ်တမ်းကို ပြန်ယူပြီးပါပြီ။ အခြားမိတ္တူများ ကျန်ရှိပါသည်။",
        ["Backup download started. Keep the JSON file somewhere you can find it later."] = "အရန်ဖိုင် ဒေါင်းလုဒ် စတင်ပါပြီ။ JSON ဖိုင်ကို နောက်မှ ပြန်ရှာနိုင်မည့်နေရာတွင် သိမ်းထားပါ။",
        ["Backup checked. Review the restore details below before continuing."] = "အရန်ဖိုင် စစ်ဆေးပြီးပါပြီ။ မဆက်လုပ်မီ ပြန်ယူမည့်အချက်များကို စစ်ကြည့်ပါ။",
        ["Restore cancelled. Your journal is unchanged."] = "ပြန်ယူခြင်းကို မလုပ်တော့ပါ။ မှတ်တမ်း မပြောင်းလဲပါ။",
        ["Backup restored. Your schedules, progress and recovery history are saved in this browser."] = "အရန်ဖိုင်မှ ပြန်ယူပြီးပါပြီ။ အစီအစဉ်၊ မှတ်တမ်းနှင့် မိတ္တူများကို ဤဘရောက်ဇာတွင် သိမ်းထားပါသည်။",
        ["Your IndexedDB journal could not be opened. Existing data was left untouched. Check browser storage access, close other calendar tabs and reload before editing."] = "IndexedDB မှတ်တမ်းကို ဖွင့်မရပါ။ ရှိပြီးသား အချက်အလက် မပြောင်းလဲပါ။ ဘရောက်ဇာသိမ်းဆည်းခွင့်ကို စစ်ပါ၊ အခြားပြက္ခဒိန်တက်ဘ်များကို ပိတ်ပြီး စာမျက်နှာ ပြန်ဖွင့်ပါ။",
        ["The schedule could not be opened in IndexedDB. Your current progress is unchanged. Check browser storage access and reload."] = "အစီအစဉ်ကို ဖွင့်မရပါ။ လက်ရှိမှတ်တမ်း မပြောင်းလဲပါ။ ဘရောက်ဇာသိမ်းဆည်းခွင့်ကို စစ်ပြီး ပြန်ဖွင့်ပါ။",
        ["Saved schedules could not be listed. Your progress is unchanged. Reload to try again."] = "အစီအစဉ်စာရင်းကို ရယူမရပါ။ မှတ်တမ်း မပြောင်းလဲပါ။ စာမျက်နှာ ပြန်ဖွင့်ပြီး ထပ်ကြိုးစားပါ။",
        ["The schedule could not be deleted. Your saved progress was left unchanged. Check browser storage access and try again."] = "အစီအစဉ်ကို ဖျက်မရပါ။ သိမ်းထားသော မှတ်တမ်း မပြောင်းလဲပါ။ ဘရောက်ဇာသိမ်းဆည်းခွင့်ကို စစ်ပြီး ထပ်ကြိုးစားပါ။",
        ["The recovery copy could not be permanently deleted. Your saved schedules and recovery history are unchanged. Check browser storage access and try again."] = "မိတ္တူကို အပြီးဖျက်မရပါ။ အစီအစဉ်နှင့် မိတ္တူများ မပြောင်းလဲပါ။ ဘရောက်ဇာသိမ်းဆည်းခွင့်ကို စစ်ပြီး ထပ်ကြိုးစားပါ။",
        ["Recovery history could not be emptied. Your saved schedules and recovery copies are unchanged. Check browser storage access and try again."] = "မိတ္တူစာရင်းကို ရှင်းမရပါ။ အစီအစဉ်နှင့် မိတ္တူများ မပြောင်းလဲပါ။ ဘရောက်ဇာသိမ်းဆည်းခွင့်ကို စစ်ပြီး ထပ်ကြိုးစားပါ။",
        ["The deleted schedule could not be restored. If a saved schedule with this start date already exists, it will not be overwritten. Your journal and recovery data are unchanged."] = "ဖျက်ထားသော အစီအစဉ်ကို ပြန်ယူမရပါ။ စတင်ရက်တူသော အစီအစဉ် ရှိပြီးသားဖြစ်ပါက အစားမထိုးပါ။ မှတ်တမ်းနှင့် မိတ္တူများ မပြောင်းလဲပါ။",
        ["The backup could not be exported. Check browser storage and download access, then try again."] = "အရန်ဖိုင် ထုတ်သိမ်းမရပါ။ ဘရောက်ဇာသိမ်းဆည်းခွင့်နှင့် ဒေါင်းလုဒ်ခွင့်ကို စစ်ပြီး ထပ်ကြိုးစားပါ။",
        ["This file could not be read as a valid Mantra Practice Calendar backup. Choose an exported version 1 or 2 JSON file no larger than 5 MiB. Your journal is unchanged."] = "ဤဖိုင်သည် အသုံးပြုနိုင်သော အရန်ဖိုင် မဟုတ်ပါ။ 5 MiB ထက်မကြီးသော ဗားရှင်း 1 သို့မဟုတ် 2 JSON အရန်ဖိုင်ကို ရွေးပါ။ မှတ်တမ်း မပြောင်းလဲပါ။",
        ["The backup could not be restored. Your journal was left unchanged. Check browser storage access and try again."] = "အရန်ဖိုင်မှ ပြန်ယူမရပါ။ မှတ်တမ်း မပြောင်းလဲပါ။ ဘရောက်ဇာသိမ်းဆည်းခွင့်ကို စစ်ပြီး ထပ်ကြိုးစားပါ။",
        ["Progress could not be saved to IndexedDB. This edit was not applied. Check browser storage access and reload before trying again."] = "မှတ်တမ်းကို သိမ်းမရပါ။ ယခု ပြင်ဆင်မှုကို မသိမ်းထားပါ။ ဘရောက်ဇာသိမ်းဆည်းခွင့်ကို စစ်ပြီး စာမျက်နှာ ပြန်ဖွင့်ပါ။",
        ["{0}: {1} of {2} completed"] = "{0} — {2} ခုအနက် {1} ခု ပြီးစီး",
        ["Month"] = "လစဉ်",
        ["Planner"] = "အစီအစဉ်",
        ["Timeline"] = "အချိန်လိုင်း",
        ["Year"] = "နှစ်စဉ်",
        ["Today"] = "ယနေ့",
        ["Next"] = "နောက်သို့",
        ["Previous"] = "ရှေ့သို့",
        ["More"] = "နောက်ထပ်",
        ["No events"] = "မှတ်တမ်း မရှိပါ",
        ["Take a moment to reflect. Mark the mantras you practiced today."] = "ယနေ့ ရွတ်ဖတ်ပြီးသော ဂုဏ်တော်များကို အမှန်ခြစ်ပါ။",
        ["Save practice"] = "ရွတ်ဖတ်မှုကို သိမ်းရန်",
        ["Skip to calendar"] = "ပြက္ခဒိန်သို့ သွားရန်",
        ["Mantra Practice Calendar home"] = "ဂုဏ်တော်ပြက္ခဒိန် ပင်မစာမျက်နှာ",
        ["A DAILY PRACTICE"] = "နေ့စဉ် ရွတ်ဖတ်မှု",
        ["Stored in this browser"] = "ဤဘရောက်ဇာတွင် သိမ်းထားသည်",
        ["A practice you can return to."] = "နေ့ရက်တိုင်း ပြန်လည်ရွတ်ဖတ်နိုင်ရန်။",
        ["Stored in this browser. Export a backup to keep a copy."] = "ဤဘရောက်ဇာတွင် သိမ်းထားပါသည်။ မိတ္တူရရှိရန် အရန်ဖိုင် ထုတ်သိမ်းပါ။",
        ["Permanently remove {0} recovery copies from Recently deleted?"] = "ဖျက်ထားသောစာရင်းမှ မိတ္တူ {0} ခုကို အပြီးဖျက်မည်လား။",
        ["The listed recovery history will be permanently removed from this browser and cannot be restored from Recently deleted afterward. Saved schedules and exported backup files will be kept. Recovery would require a backup that already contains these copies. Copies added elsewhere while this confirmation is open will be kept."] = "ဤမိတ္တူများကို ဘရောက်ဇာမှ အပြီးဖျက်ပါမည်။ ဖျက်ထားသောစာရင်းမှ ပြန်ယူနိုင်တော့မည် မဟုတ်ပါ။ သိမ်းထားသော အစီအစဉ်နှင့် ထုတ်ထားပြီးသော အရန်ဖိုင်များ ကျန်ရှိပါမည်။ ပြန်ယူရန် ဤမိတ္တူများပါသော အရန်ဖိုင် လိုအပ်ပါသည်။ ယခု အတည်ပြုချက်ဖွင့်ထားစဉ် အခြားတက်ဘ်မှ ထပ်ထည့်သော မိတ္တူများကို မဖျက်ပါ။",
        ["Permanently delete the recovery copy for"] = "ဤကာလအတွက် မိတ္တူကို အပြီးဖျက်မည်လား —",
        ["Delete the schedule from"] = "ဤကာလ၏ အစီအစဉ်ကို ဖျက်မည်လား —",
        ["to"] = "မှ",
        ["This copy contains {0} completed mantras. Its recovery history will be permanently removed from this browser. It cannot be restored from Recently deleted afterward. Saved schedules, other deleted copies and exported backup files will be kept. Recovery would require a backup that already contains this copy."] = "ဤမိတ္တူတွင် ရွတ်ဖတ်ပြီးသော ဂုဏ်တော် {0} ခု ပါဝင်ပါသည်။ မိတ္တူကို ဘရောက်ဇာမှ အပြီးဖျက်မည်ဖြစ်ပြီး ဖျက်ထားသောစာရင်းမှ ပြန်ယူနိုင်တော့မည် မဟုတ်ပါ။ သိမ်းထားသော အစီအစဉ်၊ အခြားမိတ္တူနှင့် ထုတ်ထားပြီးသော အရန်ဖိုင်များ ကျန်ရှိပါမည်။ ပြန်ယူရန် ဤမိတ္တူပါသော အရန်ဖိုင် လိုအပ်ပါသည်။",
        ["This schedule and its progress will move to Recently deleted schedules, where you can restore them later, even after reloading. Other saved schedules, deleted schedules and exported backup files will be kept."] = "ဤအစီအစဉ်နှင့် မှတ်တမ်းကို ဖျက်ထားသောစာရင်းသို့ ရွှေ့ပါမည်။ စာမျက်နှာ ပြန်ဖွင့်ပြီးလည်း ထိုစာရင်းမှ ပြန်ယူနိုင်ပါသည်။ အခြားအစီအစဉ်၊ မိတ္တူနှင့် ထုတ်ထားပြီးသော အရန်ဖိုင်များ ကျန်ရှိပါမည်။",
        ["Checking backup status…"] = "အရန်သိမ်းဆည်းမှုကို စစ်ဆေးနေသည်…",
        ["Export time records when a download started in this browser; it does not confirm the file was saved or includes later changes."] = "ထုတ်သိမ်းချိန်သည် ဤဘရောက်ဇာမှ ဒေါင်းလုဒ်စတင်ချိန် ဖြစ်ပါသည်။ ဖိုင်ကို သိမ်းပြီးကြောင်း သို့မဟုတ် နောက်ပိုင်းပြောင်းလဲမှုများ ပါဝင်ကြောင်း အတည်မပြုပါ။",
        ["Exporting backup…"] = "အရန်ဖိုင် ထုတ်သိမ်းနေသည်…",
        ["Includes all saved schedules, progress and recently deleted copies. Exporting does not delete anything."] = "သိမ်းထားသော အစီအစဉ်၊ မှတ်တမ်းနှင့် ဖျက်ထားသော မိတ္တူအားလုံး ပါဝင်ပါသည်။ ထုတ်သိမ်းခြင်းက မည်သည့်အချက်အလက်ကိုမျှ မဖျက်ပါ။",
        ["Keep recovery history"] = "မိတ္တူများကို ဆက်သိမ်းထားရန်",
        ["Keep recovery copy"] = "မိတ္တူကို ဆက်သိမ်းထားရန်",
        ["Keep schedule"] = "အစီအစဉ်ကို ဆက်သိမ်းထားရန်",
        ["Permanently delete"] = "အပြီးဖျက်ရန်",
        ["Delete schedule"] = "အစီအစဉ်ကို ဖျက်ရန်",
        ["Checking last backup export…"] = "နောက်ဆုံး အရန်ထုတ်သိမ်းချိန်ကို စစ်ဆေးနေသည်…",
        ["Last backup exported: {0} (local time)."] = "နောက်ဆုံး အရန်ထုတ်သိမ်းချိန် — {0} (စက်၏ ဒေသစံတော်ချိန်)။",
        ["Backup download started. Save the JSON file before confirming deletion."] = "အရန်ဖိုင် ဒေါင်းလုဒ် စတင်ပါပြီ။ ဖျက်ခြင်းကို အတည်မပြုမီ JSON ဖိုင်ကို သိမ်းထားပါ။",
        ["The backup could not be exported. Nothing was deleted. Check browser storage and download access, and the 5 MiB backup limit, then try again."] = "အရန်ဖိုင် ထုတ်သိမ်းမရပါ။ မည်သည့်အချက်အလက်မျှ မဖျက်ထားပါ။ ဘရောက်ဇာသိမ်းဆည်းခွင့်၊ ဒေါင်းလုဒ်ခွင့်နှင့် 5 MiB ဖိုင်အရွယ်အစားကို စစ်ပြီး ထပ်ကြိုးစားပါ။",
        ["No backup export recorded in this browser."] = "ဤဘရောက်ဇာတွင် အရန်ထုတ်သိမ်းမှု မရှိသေးပါ။",
        ["Last backup export time is unavailable."] = "နောက်ဆုံး အရန်ထုတ်သိမ်းချိန်ကို ရယူမရပါ။",
        ["Backup coverage could not be checked. Export a new backup before permanently deleting recovery history."] = "အရန်ဖိုင်တွင် ပါဝင်မှုကို စစ်ဆေးမရပါ။ မိတ္တူများကို အပြီးမဖျက်မီ အရန်ဖိုင်သစ် ထုတ်သိမ်းပါ။",
        ["Backup coverage is unknown. Export a new backup before permanently deleting recovery history."] = "အရန်ဖိုင်တွင် ပါဝင်မှုကို မသိရပါ။ မိတ္တူများကို အပြီးမဖျက်မီ အရန်ဖိုင်သစ် ထုတ်သိမ်းပါ။",
        ["Schedules, progress or recovery history have changed since the last backup was exported. Export a new backup before permanently deleting recovery history."] = "နောက်ဆုံး အရန်ထုတ်သိမ်းပြီးနောက် အစီအစဉ်၊ မှတ်တမ်း သို့မဟုတ် မိတ္တူများ ပြောင်းလဲထားပါသည်။ မိတ္တူများကို အပြီးမဖျက်မီ အရန်ဖိုင်သစ် ထုတ်သိမ်းပါ။",
        ["Language"] = "ဘာသာစကား",
        ["Saving language…"] = "ဘာသာစကား ရွေးချယ်မှု သိမ်းနေသည်…",
        ["Language preference could not be saved. Try again."] = "ဘာသာစကား ရွေးချယ်မှုကို သိမ်းမရပါ။ ထပ်ကြိုးစားပါ။",
        ["Language preference could not be loaded. Myanmar is being used."] = "ဘာသာစကား ရွေးချယ်မှုကို ရယူမရပါ။ မြန်မာဘာသာကို အသုံးပြုထားပါသည်။",
        ["Not found"] = "စာမျက်နှာ မရှိပါ",
        ["Sorry, there is nothing at this address."] = "ဤလိပ်စာတွင် စာမျက်နှာ မရှိပါ။",
    };
}
