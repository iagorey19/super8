# Verifica .env.local — mostra SÓ nomes das chaves, NUNCA valores.
$required = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "AUTH_TOKEN_SECRET",
  "EXEC_SQL_SECRET"
)
$optional = @("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "NEXT_PUBLIC_SITE_URL")

if (-not (Test-Path -LiteralPath ".env.local")) {
  Write-Host "[FAIL] .env.local nao encontrado" -ForegroundColor Red
  exit 1
}

$lines = Get-Content -LiteralPath ".env.local"
$missing = @()
foreach ($key in $required) {
  $found = $lines | Where-Object { $_ -match "^$key=.+" }
  if (-not $found) { $missing += $key }
}

if ($missing.Count -gt 0) {
  Write-Host ("[FAIL] Faltando: " + ($missing -join ", ")) -ForegroundColor Red
  exit 1
}
foreach ($key in $optional) {
  if (-not ($lines | Where-Object { $_ -match "^$key=.+" })) {
    Write-Host ("[WARN] Opcional ausente: " + $key) -ForegroundColor Yellow
  }
}
Write-Host "[OK] .env.local com todas as chaves obrigatorias" -ForegroundColor Green
