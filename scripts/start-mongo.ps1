$ErrorActionPreference = "Stop"
$dbPath = Join-Path $PSScriptRoot "..\data\db"
New-Item -ItemType Directory -Force -Path $dbPath | Out-Null

$candidates = @(
  "$env:USERPROFILE\.cache\mongodb-binaries\mongod-x64-win32-7.0.24.exe",
  "$env:USERPROFILE\.cache\mongodb-binaries\mongod-x64-win32-8.2.6.exe",
  "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe",
  "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
)

$mongod = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $mongod) {
  Write-Error "mongod.exe not found. Install MongoDB or start the API and let the in-memory fallback download a binary."
}

Write-Host "Starting MongoDB with $mongod"
& $mongod --dbpath $dbPath --port 27017 --bind_ip 127.0.0.1
