# Saude do Supabase: link + migrations aplicadas.
# Projeto: ylltshboiejlcbhksrci (THE SUPER 8, PRODUCTION)
$ErrorActionPreference = "Continue"

Write-Host "== supabase projects list ==" -ForegroundColor Cyan
supabase projects list 2>&1 | Select-Object -First 10

Write-Host "== migration list --linked ==" -ForegroundColor Cyan
supabase migration list --linked 2>&1 | Select-Object -Last 15
