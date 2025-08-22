namespace BlazorWasm.MantraCalendar.Services
{
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
    }

    public class MantraScheduleModel
    {
        public string MantraName { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<DateTime> PracticeDates { get; set; }

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
}
