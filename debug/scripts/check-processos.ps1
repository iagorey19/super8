# Diagnostico de processos node (MCPs duplicados = delay 40s no opencode).
$nodes = Get-Process node -ErrorAction SilentlyContinue
if (-not $nodes) { Write-Host "[OK] nenhum processo node rodando" -ForegroundColor Green; exit 0 }

$totalMB = [math]::Round(($nodes | Measure-Object WorkingSet64 -Sum).Sum / 1MB, 1)
Write-Host ("node.exe: {0} processos, {1} MB total" -f $nodes.Count, $totalMB) -ForegroundColor Cyan
$nodes | Format-Table Id, ProcessName, @{L="MB";E={[math]::Round($_.WorkingSet64/1MB,1)}}, StartTime -AutoSize

if ($nodes.Count -ge 25 -or $totalMB -ge 1000) {
  Write-Host "[WARN] Muitos processos — rode .\scripts\LIMPAR_MCPs.bat" -ForegroundColor Yellow
} else {
  Write-Host "[OK] processos dentro do normal" -ForegroundColor Green
}
