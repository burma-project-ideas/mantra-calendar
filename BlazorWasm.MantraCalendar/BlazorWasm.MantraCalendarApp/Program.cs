using Blazored.LocalStorage;
using BlazorWasm.MantraCalendarApp;
using BlazorWasm.MantraCalendarApp.Services;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Radzen;
using static BlazorWasm.MantraCalendarApp.Pages.Home;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

builder.Services.AddSingleton<MantraScheduleService>();

builder.Services.AddBlazoredLocalStorage();

builder.Services.AddRadzenComponents();

await builder.Build().RunAsync();
