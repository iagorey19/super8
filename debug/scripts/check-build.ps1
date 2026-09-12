# BLOCKER pre-commit: tsc zero erros + build zero erros.
$ErrorActionPreference = "Stop"

Write-Host "== tsc --noEmit ==" -ForegroundColor Cyan
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { Write-Host "[FAIL] tsc" -ForegroundColor Red; exit 1 }

Write-Host "== npm run build ==" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "[FAIL] build" -ForegroundColor Red; exit 1 }

Write-Host "[OK] tsc + build passando" -ForegroundColor Green
