# Azure Demo — React + .NET on Azure

A minimal full-stack demo for an "Azure deployment" tech talk:

- **client/** — React (Vite, JavaScript) dashboard
- **server/** — .NET 10 minimal API (no database, in-memory data + a live OpenWeatherMap call)

## Local development

### 1. Server (.NET Web API)

```bash
cd server
dotnet user-secrets init
dotnet user-secrets set "OpenWeather:ApiKey" "<your-openweathermap-api-key>"
dotnet run
```

The API starts on `http://localhost:5158` (see `Properties/launchSettings.json`).

Endpoints:
- `GET /api/health`
- `GET /api/info`
- `GET /api/stats`
- `GET /api/weather`

If `OpenWeather:ApiKey` is not configured, `/api/weather` returns a graceful
fallback message instead of failing.

### 2. Client (Vite + React)

```bash
cd client
npm install
npm run dev
```

The dashboard starts on `http://localhost:5173` and talks to the API at the
URL in `client/.env` (`VITE_API_URL`, defaults to `http://localhost:5158`).

## Deploying to Azure

### Server → Azure App Service

```bash
# Create a resource group and App Service plan (Linux, .NET 10)
az group create --name rg-azure-demo --location southeastasia

az appservice plan create \
  --name plan-azure-demo \
  --resource-group rg-azure-demo \
  --sku B1 \
  --is-linux

az webapp create \
  --name <your-unique-app-name> \
  --resource-group rg-azure-demo \
  --plan plan-azure-demo \
  --runtime "DOTNETCORE:10.0"

# Publish and deploy
cd server
dotnet publish -c Release -o ./publish
cd publish
zip -r ../publish.zip .
cd ..
az webapp deploy \
  --name <your-unique-app-name> \
  --resource-group rg-azure-demo \
  --src-path publish.zip \
  --type zip

# Set environment variables (App Service > Environment variables)
az webapp config appsettings set \
  --name <your-unique-app-name> \
  --resource-group rg-azure-demo \
  --settings \
    AllowedOrigins="https://<your-static-web-app-url>" \
    OpenWeather__ApiKey="<your-openweathermap-api-key>"
```

> Tip: for the talk, swap `OpenWeather__ApiKey` for a Key Vault reference
> (`@Microsoft.KeyVault(SecretUri=...)`) to demo secret-less App Service config.

### Client → Azure Static Web Apps

```bash
az staticwebapp create \
  --name swa-azure-demo \
  --resource-group rg-azure-demo \
  --location eastasia \
  --source https://github.com/<you>/<repo> \
  --branch main \
  --app-location "client" \
  --output-location "dist" \
  --login-with-github
```

Set the API URL for the deployed frontend as a Static Web App application
setting (Configuration > Application settings), or bake it in at build time:

```bash
az staticwebapp appsettings set \
  --name swa-azure-demo \
  --setting-names VITE_API_URL="https://<your-app-service-name>.azurewebsites.net"
```

## Environment variables summary

| Variable              | Set where                        | Purpose                                          |
|------------------------|-----------------------------------|---------------------------------------------------|
| `AllowedOrigins`       | App Service > Environment variables | Comma-separated CORS origins allowed to call the API |
| `OpenWeather__ApiKey`  | App Service > Environment variables (or Key Vault reference) | OpenWeatherMap API key (double underscore = `OpenWeather:ApiKey`) |
| `VITE_API_URL`         | `client/.env` locally, Static Web App settings in Azure | Base URL the frontend uses to call the API |

Never commit real values for these — `.env` and user-secrets are excluded via
`.gitignore`.
