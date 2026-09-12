# Consulta o acervo local de licoes ANTES de corrigir (fluxo obrigatorio guia 20).
# Uso:
#   .\consultar-licoes.ps1 -List
#   .\consultar-licoes.ps1 -Termo "seed"
#   .\consultar-licoes.ps1 -Bug "001"
param(
  [switch]$List,
  [string]$Termo = "",
  [string]$Bug = ""
)

$base = Join-Path $PSScriptRoot "..\..\20-licoes-aprendidas"
if (-not (Test-Path -LiteralPath $base)) {
  Write-Host "[FAIL] 20-licoes-aprendidas/ nao encontrado" -ForegroundColor Red
  exit 1
}

if ($List) {
  Get-ChildItem -LiteralPath $base -Directory | ForEach-Object { Write-Host ("- " + $_.Name) }
  exit 0
}

if ($Bug -ne "") {
  $dir = Get-ChildItem -LiteralPath $base -Directory | Where-Object { $_.Name -like ("*bug-" + $Bug + "*") } | Select-Object -First 1
  if ($dir) { Get-Content -LiteralPath (Join-Path $dir.FullName "README.md") }
  else { Write-Host ("[FAIL] bug-{0} nao encontrado" -f $Bug) -ForegroundColor Red; exit 1 }
  exit 0
}

if ($Termo -ne "") {
  $hits = Select-String -Path (Join-Path $base "*\README.md") -Pattern $Termo -SimpleMatch | Select-Object -First 20
  if (-not $hits) { Write-Host ("[INFO] nenhum resultado para '{0}'" -f $Termo) -ForegroundColor Yellow; exit 0 }
  $hits | ForEach-Object { Write-Host ("{0}:{1}: {2}" -f $_.Filename, $_.LineNumber, $_.Line.Trim()) }
  exit 0
}

Write-Host "Uso: -List | -Termo <texto> | -Bug <numero>"
