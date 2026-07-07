using System.Net.Http.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient("OpenWeather", client =>
{
    client.BaseAddress = new Uri("https://api.openweathermap.org/");
    client.Timeout = TimeSpan.FromSeconds(10);
});

// AllowedOrigins env var (comma-separated) is set in App Service -> Environment variables during the demo.
// Falls back to the local Vite dev server origin when not set.
var allowedOriginsRaw = builder.Configuration["AllowedOrigins"] ?? "http://localhost:5173";
var allowedOrigins = allowedOriginsRaw
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("Frontend");

var startedAt = DateTimeOffset.UtcNow;
var random = new Random();

app.MapGet("/api/health", () =>
{
    return Results.Ok(new
    {
        status = "healthy",
        environment = app.Environment.EnvironmentName,
        timestamp = DateTimeOffset.UtcNow
    });
});

app.MapGet("/api/info", () =>
{
    var uptime = DateTimeOffset.UtcNow - startedAt;

    return Results.Ok(new
    {
        message = "This data is served live from the .NET API on Azure App Service",
        serverName = Environment.MachineName,
        dotnetVersion = Environment.Version.ToString(),
        uptime = uptime.ToString(@"hh\:mm\:ss")
    });
});

app.MapGet("/api/stats", () =>
{
    var regions = new[] { "Southeast Asia", "East US", "West Europe", "Australia East" };

    return Results.Ok(new
    {
        visitors = random.Next(1200, 9800),
        requestsServed = random.Next(50_000, 250_000),
        region = regions[random.Next(regions.Length)],
        activeConnections = random.Next(5, 120),
        avgResponseTimeMs = random.Next(20, 180),
        generatedAt = DateTimeOffset.UtcNow
    });
});

app.MapGet("/api/weather", async (IHttpClientFactory httpClientFactory, IConfiguration config) =>
{
    var apiKey = config["OpenWeather:ApiKey"];

    if (string.IsNullOrWhiteSpace(apiKey))
    {
        return Results.Ok(new
        {
            available = false,
            message = "Weather data unavailable: OpenWeather API key is not configured.",
            city = "Colombo"
        });
    }

    try
    {
        var client = httpClientFactory.CreateClient("OpenWeather");
        var response = await client.GetAsync(
            $"data/2.5/weather?q=Colombo,LK&units=metric&appid={apiKey}");

        if (!response.IsSuccessStatusCode)
        {
            return Results.Ok(new
            {
                available = false,
                message = $"Weather provider returned an error ({(int)response.StatusCode}).",
                city = "Colombo"
            });
        }

        var payload = await response.Content.ReadFromJsonAsync<OpenWeatherResponse>();

        if (payload is null)
        {
            return Results.Ok(new
            {
                available = false,
                message = "Weather provider returned an unexpected response.",
                city = "Colombo"
            });
        }

        return Results.Ok(new
        {
            available = true,
            city = "Colombo",
            temperature = payload.Main?.Temp,
            feelsLike = payload.Main?.FeelsLike,
            humidity = payload.Main?.Humidity,
            description = payload.Weather?.FirstOrDefault()?.Description,
            icon = payload.Weather?.FirstOrDefault()?.Icon
        });
    }
    catch (Exception)
    {
        return Results.Ok(new
        {
            available = false,
            message = "Could not reach the weather provider.",
            city = "Colombo"
        });
    }
});

app.Run();

// DTOs matching the subset of the OpenWeatherMap /weather response we use.
internal sealed class OpenWeatherResponse
{
    public OpenWeatherMain? Main { get; set; }
    public List<OpenWeatherCondition>? Weather { get; set; }
}

internal sealed class OpenWeatherMain
{
    public double Temp { get; set; }

    [JsonPropertyName("feels_like")]
    public double FeelsLike { get; set; }
    public int Humidity { get; set; }
}

internal sealed class OpenWeatherCondition
{
    public string? Description { get; set; }
    public string? Icon { get; set; }
}
