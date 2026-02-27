$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run --project `"$root\server`""

Set-Location "$root\client"
if (-not (Test-Path "node_modules")) {
  npm install
}

npm run dev
