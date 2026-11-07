using System.Text.Json;
using BlazorWasm.MantraCalendarApp.Services;

static void Check(bool condition, string message)
{
    if (!condition) throw new Exception(message);
}

var days = new MantraScheduleService().GetAppointments(new DateTime(2025, 7, 9));
Check(days.Count == 90, "Expected 90 inclusive practice dates.");
Check(days.First().Start == new DateTime(2025, 7, 9), "Wrong first date.");
Check(days.Last().Start == new DateTime(2025, 10, 6), "Wrong final date.");
Check(days.All(d => d.End == d.Start.AddDays(1)), "Appointments must span their practice day.");
Check(days[0].Mantras.Count == 9 && days[9].Mantras.Count == 1, "Schedule content changed.");
Check(days.Sum(d => d.Mantras.Count) == 162, "Wrong total mantra count.");
days[0].Mantras[0].IsPracticed = true;
Check(!days[1].Mantras[0].IsPracticed, "Completion leaked into an adjacent day.");
var draft = days[0].Copy();
draft.Mantras[0].IsPracticed = false;
Check(days[0].Mantras[0].IsPracticed, "Discarded draft changed the original.");
var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
var legacy = "[{\"date\":\"2025-07-09T00:00:00\",\"mantraName\":\"အရဟံ\",\"isPracticed\":true}]";
var progress = JsonSerializer.Deserialize<List<MantraProgress>>(legacy, options)!;
Check(progress[0].Date == days[0].Start && progress[0].MantraName == days[0].Mantras[0].Name
    && progress[0].IsPracticed, "Legacy JSON failed to load.");
var restored = JsonSerializer.Deserialize<List<MantraProgress>>(JsonSerializer.Serialize(progress, options), options)!;
Check(restored[0].IsPracticed, "Progress failed to round-trip.");
try
{
    JsonSerializer.Deserialize<MantraProgress>("{\"date\":\"2025-07-09\",\"mantraName\":\"x\"}", options);
    throw new Exception("Missing completion field was accepted.");
}
catch (JsonException) { }
Console.WriteLine("PASS: dates, schedule totals, daily isolation, draft cancellation, legacy JSON and required fields.");

var shifted = new MantraScheduleService().GetAppointments(new DateTime(2026, 11, 4));
Check(shifted.Count == 90 && shifted[0].Start == new DateTime(2026, 11, 4)
    && shifted[^1].Start == new DateTime(2027, 2, 1), "Selected start date did not shift the full sequence.");
for (var i = 0; i < days.Count; i++)
    Check(days[i].Mantras.Select(m => m.Name).SequenceEqual(shifted[i].Mantras.Select(m => m.Name)), "Mantra sequence changed after shifting.");
var leap = new MantraScheduleService().GetAppointments(new DateTime(2028, 2, 28));
Check(leap[1].Start == new DateTime(2028, 2, 29) && leap.Count == 90, "Leap day was skipped.");
try
{
    new MantraScheduleService().GetAppointments(DateTime.MaxValue.Date);
    throw new Exception("Out-of-range schedule was accepted.");
}
catch (ArgumentOutOfRangeException) { }
Console.WriteLine("PASS: selectable start date, year boundary, leap day and date range validation.");

using var sequence = JsonDocument.Parse(File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "mantras.json")));
Check(sequence.RootElement.GetArrayLength() == days.Count, "React sequence has a different number of days.");
for (var day = 0; day < days.Count; day++)
{
    var entries = sequence.RootElement[day];
    Check(entries.GetArrayLength() == days[day].Mantras.Count, $"React mantra count differs on day {day + 1}.");
    for (var mantra = 0; mantra < days[day].Mantras.Count; mantra++)
    {
        var expected = days[day].Mantras[mantra];
        Check(entries[mantra].GetProperty("name").GetString() == expected.Name
            && entries[mantra].GetProperty("description").GetString() == expected.Description
            && entries[mantra].GetProperty("count").GetInt32() == expected.Count,
            $"React mantra entry differs on day {day + 1}, entry {mantra + 1}.");
    }
}
Console.WriteLine("PASS: React data matches every mantra name, description and count in the original C# sequence.");
