$envFile = ".env"

if (!(Test-Path $envFile)) {
    Write-Host "ERROR: No existe el archivo .env" -ForegroundColor Red
    exit 1
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

Write-Host "Variables de entorno cargadas correctamente." -ForegroundColor Green
Write-Host "Iniciando NovaLearn Backend..." -ForegroundColor Cyan

mvn spring-boot:run