$ErrorActionPreference = "Stop"

$envFile = Join-Path $PSScriptRoot ".env"

if (-not [System.IO.File]::Exists($envFile)) {
    Write-Host "ERROR: No existe el archivo .env" -ForegroundColor Red
    exit 1
}

Get-Content -LiteralPath $envFile | ForEach-Object {
    $line = $_.Trim()

    if (
        [string]::IsNullOrWhiteSpace($line) -or
        $line.StartsWith("#")
    ) {
        return
    }

    $separatorIndex = $line.IndexOf("=")

    if ($separatorIndex -le 0) {
        return
    }

    $key = $line.Substring(0, $separatorIndex).Trim()
    $value = $line.Substring($separatorIndex + 1).Trim()

    if (
        ($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'"))
    ) {
        $value = $value.Substring(
            1,
            $value.Length - 2
        )
    }

    [System.Environment]::SetEnvironmentVariable(
        $key,
        $value,
        "Process"
    )
}

Write-Host ""
Write-Host "Variables de entorno cargadas correctamente." -ForegroundColor Green

$requiredVariables = @(
    "DB_URL",
    "DB_USERNAME",
    "DB_PASSWORD",
    "JWT_SECRET",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "ADMIN_FIRST_NAME",
    "ADMIN_LAST_NAME",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "CLOUDINARY_FOLDER"
)

Write-Host ""
Write-Host "Verificando configuración requerida..." -ForegroundColor Cyan

$missingVariables = @()

foreach ($variableName in $requiredVariables) {
    $value = [Environment]::GetEnvironmentVariable(
        $variableName,
        "Process"
    )

    if ([string]::IsNullOrWhiteSpace($value)) {
        $missingVariables += $variableName

        Write-Host "$variableName = NO CONFIGURADA" -ForegroundColor Red
    }
    else {
        Write-Host "$variableName = CONFIGURADA" -ForegroundColor Green
    }
}

if ($missingVariables.Count -gt 0) {
    Write-Host ""
    Write-Host "No se iniciará el backend porque faltan variables requeridas." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Iniciando NovaLearn Backend..." -ForegroundColor Cyan

& mvn spring-boot:run

exit $LASTEXITCODE
