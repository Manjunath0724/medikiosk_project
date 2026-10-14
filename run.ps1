# MediKiosk One-Click Launcher for PowerShell
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          MediKiosk - Smart Ayush OPD Case-Taking Platform" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (Test-Path "$scriptDir\medikiosk\backend") {
    $projectDir = "$scriptDir\medikiosk"
} elseif (Test-Path "$scriptDir\backend") {
    $projectDir = $scriptDir
} else {
    Write-Host "[ERROR] Could not locate medikiosk project directory!" -ForegroundColor Red
    exit 1
}

# Python executable
$pythonExe = "$projectDir\backend\.venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

# Free up ports 8000 & 5173 if lingering
Get-NetTCPConnection -LocalPort 8000, 5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 800

Write-Host "[1/3] Launching FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -WorkingDirectory "$projectDir\backend" -ArgumentList "/k title MediKiosk Backend (Port 8000) && `"$pythonExe`" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload" -WindowStyle Normal

Write-Host "[2/3] Launching Vite Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -WorkingDirectory "$projectDir\frontend" -ArgumentList "/k title MediKiosk Frontend (Port 5173) && npm run dev" -WindowStyle Normal

Write-Host "[3/3] Waiting for servers to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 4

Write-Host "Launching MediKiosk in your default browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          MediKiosk is LIVE and Running Successfully!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  * Main Web Application:    http://localhost:5173" -ForegroundColor White
Write-Host "  * Doctor OPD Workstation:  http://localhost:5173/doctor" -ForegroundColor White
Write-Host "  * Slide 3 Defense Guide:   http://localhost:5173/presentation_tech_approach_defense.html" -ForegroundColor White
Write-Host "  * Backend Swagger API:     http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
