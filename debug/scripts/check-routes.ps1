# Verifica rotas criticas. Uso: .\check-routes.ps1 [-BaseUrl "https://super8-three.vercel.app"]
param([string]$BaseUrl = "http://localhost:3000")

$routes = @("/", "/auth/login", "/eventos", "/api/debug/all")
$fail = 0
foreach ($r in $routes) {
  try {
    $res = Invoke-WebRequest -Uri ($BaseUrl + $r) -Method Get -TimeoutSec 15 -UseBasicParsing
    $color = "Green"; $status = $res.StatusCode
    if ($res.StatusCode -ge 400) { $color = "Red"; $fail++ }
    Write-Host ("[{0}] {1}" -f $res.StatusCode, $r) -ForegroundColor $color
  } catch {
    Write-Host ("[FAIL] {0} -> {1}" -f $r, $_.Exception.Message) -ForegroundColor Red
    $fail++
  }
}
if ($fail -gt 0) { exit 1 }
Write-Host "[OK] todas as rotas responderam" -ForegroundColor Green
