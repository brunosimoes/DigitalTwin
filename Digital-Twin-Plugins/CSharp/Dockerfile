FROM mcr.microsoft.com/dotnet/sdk:7.0-alpine AS build
WORKDIR /src
COPY . .
WORKDIR /src/DigitalTwinService
RUN dotnet build "DigitalTwinService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DigitalTwinService.csproj" -c Release -o /app/publish -r linux-musl-x64 --self-contained true /p:PublishTrimmed=false

FROM mcr.microsoft.com/dotnet/runtime-deps:7.0-alpine AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 80
EXPOSE 443
ENTRYPOINT ["./DigitalTwinService"]