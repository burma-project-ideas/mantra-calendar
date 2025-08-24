using System.ComponentModel;

namespace BlazorWasm.MantraCalendarApp.Services;

public class MantraScheduleService
{
    public List<MantraScheduleModel> GetMantras()
    {
        return new List<MantraScheduleModel>
    {
        new MantraScheduleModel("အရဟံ", "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", new DateTime(2025, 7, 9), new DateTime(2025, 10, 6)),
        new MantraScheduleModel("သမ္မာသမ္ဗုဒ္ဓါ", "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", new DateTime(2025, 7, 9), new DateTime(2025, 10, 6)),
        new MantraScheduleModel("ဝိဇ္ဇာစရဏသမ္ပန္နော", "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", new DateTime(2025, 7, 9), new DateTime(2025, 10, 6)),
        new MantraScheduleModel("သုဂတော", "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", new DateTime(2025, 7, 9), new DateTime(2025, 10, 6)),
        new MantraScheduleModel("လောကဝိဒူ", "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", new DateTime(2025, 7, 9), new DateTime(2025, 10, 6)),
        new MantraScheduleModel("အနုတ္တရောပုရိသဓမ္မသာရထိ", "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", new DateTime(2025, 7, 9), new DateTime(2025, 10, 6)),
        new MantraScheduleModel("သထ္ထာဒေဝမနုဿာနံ", "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", new DateTime(2025, 7, 9), new DateTime(2025, 10, 6)),
        new MantraScheduleModel("ဗုဒ္ဓေါ", "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", new DateTime(2025, 7, 9), new DateTime(2025, 10, 6)),
        new MantraScheduleModel("ဘဂဝါ", "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", new DateTime(2025, 7, 9), new DateTime(2025, 10, 6)),
        new MantraScheduleModel("အရဟံ သိဒ္ဓိ", "သိဒ္ဓိ (၉) ပတ်", new DateTime(2025, 7, 18), new DateTime(2025, 7, 26)),
        new MantraScheduleModel("သမ္မာသမ္ဗုဒ္ဓါ သိဒ္ဓိ", "သိဒ္ဓိ (၉) ပတ်", new DateTime(2025, 7, 27), new DateTime(2025, 8, 4)),
        new MantraScheduleModel("ဝိဇ္ဇာစရဏသမ္ပန္နော သိဒ္ဓိ", "သိဒ္ဓိ (၉) ပတ်", new DateTime(2025, 8, 5), new DateTime(2025, 8, 13)),
        new MantraScheduleModel("သုဂတော သိဒ္ဓိ", "သိဒ္ဓိ (၉) ပတ်", new DateTime(2025, 8, 14), new DateTime(2025, 8, 22)),
        new MantraScheduleModel("လောကဝိဒူ သိဒ္ဓိ", "သိဒ္ဓိ (၉) ပတ်", new DateTime(2025, 8, 23), new DateTime(2025, 8, 31)),
        new MantraScheduleModel("အနုတ္တရောပုရိသဓမ္မသာရထိ သိဒ္ဓိ", "သိဒ္ဓိ (၉) ပတ်", new DateTime(2025, 9, 1), new DateTime(2025, 9, 9)),
        new MantraScheduleModel("သထ္ထာဒေဝမနုဿာနံ သိဒ္ဓိ", "သိဒ္ဓိ (၉) ပတ်", new DateTime(2025, 9, 10), new DateTime(2025, 9, 18)),
        new MantraScheduleModel("ဗုဒ္ဓေါ သိဒ္ဓိ", "သိဒ္ဓိ (၉) ပတ်", new DateTime(2025, 9, 19), new DateTime(2025, 9, 27)),
        new MantraScheduleModel("ဘဂဝါ သိဒ္ဓိ", "သိဒ္ဓိ (၉) ပတ်", new DateTime(2025, 9, 28), new DateTime(2025, 10, 6))
    };
    }

    public List<MantraModel> GetMantraTypes()
    {
        return new List<MantraModel>
        {
            new MantraModel
            {
                StartDate = new DateTime(2025, 7, 9),
                EndDate = new DateTime(2025, 7, 17),
                MantraTypes = new List<MantraTypeModel>
                {
                    new MantraTypeModel { Type = MantraType.One, Name = "အရဟံ", Description = "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", Count = 1 },
                    new MantraTypeModel { Type = MantraType.Two, Name = "သမ္မာသမ္ဗုဒ္ဓါ", Description = "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", Count = 1 },
                    new MantraTypeModel { Type = MantraType.Three, Name = "ဝိဇ္ဇာစရဏသမ္ပန္နော", Description = "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", Count = 1 },
                    new MantraTypeModel { Type = MantraType.Four, Name = "သုဂတော", Description = "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", Count = 1 },
                    new MantraTypeModel { Type = MantraType.Five, Name = "လောကဝိဒူ", Description = "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", Count = 1 },
                    new MantraTypeModel { Type = MantraType.Six, Name = "အနုတ္တရောပုရိသဓမ္မသာရထိ", Description = "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", Count = 1 },
                    new MantraTypeModel { Type = MantraType.Seven, Name = "သထ္ထာဒေဝမနုဿာနံ", Description = "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", Count = 1 },
                    new MantraTypeModel { Type = MantraType.Eight, Name = "ဗုဒ္ဓေါ", Description = "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", Count = 1 },
                    new MantraTypeModel { Type = MantraType.Nine, Name = "ဘဂဝါ", Description = "ဂုဏ်တော် (၃) လ၊ ဂုဏ်တော် (၉) ပါး", Count = 1 }
                }
            },
            new MantraModel
            {
                StartDate = new DateTime(2025, 7, 18),
                EndDate = new DateTime(2025, 7, 26),
                MantraTypes = new List<MantraTypeModel>
                {
                    new MantraTypeModel { Type = MantraType.One, Name = "အရဟံ သိဒ္ဓိ", Description = "သိဒ္ဓိ (၉) ပတ်", Count = 1 }
                }
            },
            new MantraModel
            {
                StartDate = new DateTime(2025, 7, 27),
                EndDate = new DateTime(2025, 8, 4),
                MantraTypes = new List<MantraTypeModel>
                {
                    new MantraTypeModel { Type = MantraType.Two, Name = "သမ္မာသမ္ဗုဒ္ဓါ သိဒ္ဓိ", Description = "သိဒ္ဓိ (၉) ပတ်", Count = 1 }
                }
            },
            new MantraModel
            {
                StartDate = new DateTime(2025, 8, 5),
                EndDate = new DateTime(2025, 8, 13),
                MantraTypes = new List<MantraTypeModel>
                {
                    new MantraTypeModel { Type = MantraType.Three, Name = "ဝိဇ္ဇာစရဏသမ္ပန္နော သိဒ္ဓိ", Description = "သိဒ္ဓိ (၉) ပတ်", Count = 1 }
                }
            },
            new MantraModel
            {
                StartDate = new DateTime(2025, 8, 14),
                EndDate = new DateTime(2025, 8, 22),
                MantraTypes = new List<MantraTypeModel>
                {
                    new MantraTypeModel { Type = MantraType.Four, Name = "သုဂတော သိဒ္ဓိ", Description = "သိဒ္ဓိ (၉) ပတ်", Count = 1 }
                }
            },
            new MantraModel
            {
                StartDate = new DateTime(2025, 8, 23),
                EndDate = new DateTime(2025, 8, 31),
                MantraTypes = new List<MantraTypeModel>
                {
                    new MantraTypeModel { Type = MantraType.Five, Name = "လောကဝိဒူ သိဒ္ဓိ", Description = "သိဒ္ဓိ (၉) ပတ်", Count = 1 }
                }
            },
            new MantraModel
            {
                StartDate = new DateTime(2025, 9, 1),
                EndDate = new DateTime(2025, 9, 9),
                MantraTypes = new List<MantraTypeModel>
                {
                    new MantraTypeModel { Type = MantraType.Six, Name = "အနုတ္တရောပုရိသဓမ္မသာရထိ သိဒ္ဓိ", Description = "သိဒ္ဓိ (၉) ပတ်", Count = 1 }
                }
            },
            new MantraModel
            {
                StartDate = new DateTime(2025, 9, 10),
                EndDate = new DateTime(2025, 9, 18),
                MantraTypes = new List<MantraTypeModel>
                {
                    new MantraTypeModel { Type = MantraType.Seven, Name = "သထ္ထာဒေဝမနုဿာနံ သိဒ္ဓိ", Description = "သိဒ္ဓိ (၉) ပတ်", Count = 1 }
                }
            },
            new MantraModel
            {
                StartDate = new DateTime(2025, 9, 19),
                EndDate = new DateTime(2025, 9, 27),
                MantraTypes = new List<MantraTypeModel>
                {
                    new MantraTypeModel { Type = MantraType.Eight, Name = "ဗုဒ္ဓေါ သိဒ္ဓိ", Description = "သိဒ္ဓိ (၉) ပတ်", Count = 1 }
                }
            },
            new MantraModel
            {
                StartDate = new DateTime(2025, 9, 28),
                EndDate = new DateTime(2025, 10, 6),
                MantraTypes = new List<MantraTypeModel>
                {
                    new MantraTypeModel { Type = MantraType.Nine, Name = "ဘဂဝါ သိဒ္ဓိ", Description = "သိဒ္ဓိ (၉) ပတ်", Count = 1 }
                }
            }
        };
    }
}

public class MantraScheduleModel
{
    public string MantraName { get; set; }
    public string Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<DateTime> PracticeDates { get; set; } = new List<DateTime>();

    public MantraScheduleModel(string mantraName, string description, DateTime startDate, DateTime endDate)
    {
        MantraName = mantraName;
        Description = description;
        StartDate = startDate;
        EndDate = endDate;
        PracticeDates = GeneratePracticeDates(startDate, endDate);
    }

    private List<DateTime> GeneratePracticeDates(DateTime startDate, DateTime endDate)
    {
        var practiceDates = new List<DateTime>();
        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            practiceDates.Add(date);
        }
        return practiceDates;
    }
}

public class MantraModel
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<MantraTypeModel> MantraTypes { get; set; }
}

public class MantraTypeModel
{
    public MantraType Type { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public int Count { get; set; }
    public bool IsPracticed { get; set; }
}

public enum MantraType
{
    None,
    One,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
}

public class Appointment
{
    public DateTime Start { get; set; }
    public DateTime End { get; set; }

    public string Text { get; set; }
    public string Description { get; set; }
    public bool IsPracticed { get; set; }
    public List<MantraTypeModel> Mantras { get; set; }
}
