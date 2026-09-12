# cleanup-opencode.ps1
# Limpa dados antigos do opencode E processos MCP duplicados para melhorar performance
# Uso: .\cleanup-opencode.ps1 [-KillAll] [-DryRun]

param(
    [switch]$KillAll,   # Matar TODOS os processos node MCP
    [switch]$DryRun     # Apenas mostrar, sem matar
)

$ErrorActionPreference = "SilentlyContinue"
$opencodeDir = "$env:USERPROFILE\.local\share\opencode"

Write-Host "`n=== OPENCODE FULL CLEANUP ===" -ForegroundColor Cyan

# ============================================
# PARTE 1: Limpar arquivos antigos
# ============================================
Write-Host "`n--- Limpeza de arquivos ---" -ForegroundColor Yellow

# Session diffs antigos (mais de 3 dias)
$sessionDir = "$opencodeDir\storage\session_diff"
if (Test-Path $sessionDir) {
    $files = Get-ChildItem $sessionDir -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-3) }
    $size = ($files | Measure-Object Length -Sum).Sum
    $files | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "Session diffs: removidos $($files.Count) arquivos ($([math]::Round($size / 1MB, 2)) MB)" -ForegroundColor Gray
}

# Tool outputs antigos (mais de 2 dias)
$toolDir = "$opencodeDir\tool-output"
if (Test-Path $toolDir) {
    $before = (Get-ChildItem $toolDir -File | Measure-Object Length -Sum).Sum
    $files = Get-ChildItem $toolDir -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-2) }
    $files | Remove-Item -Force -ErrorAction SilentlyContinue
    $after = (Get-ChildItem $toolDir -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
    Write-Host "Tool outputs: removidos $($files.Count) arquivos ($([math]::Round(($before - $after) / 1MB, 2)) MB)" -ForegroundColor Gray
}

# Logs antigos
$logDir = "$opencodeDir\log"
if (Test-Path $logDir) {
    $files = Get-ChildItem $logDir -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-3) }
    $size = ($files | Measure-Object Length -Sum).Sum
    $files | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "Logs: removidos $($files.Count) arquivos ($([math]::Round($size / 1MB, 2)) MB)" -ForegroundColor Gray
}

# ============================================
# PARTE 2: Matar processos MCP duplicados
# ============================================
Write-Host "`n--- Limpeza de processos MCP ---" -ForegroundColor Yellow

$mcpPatterns = @{
    "context7"         = "context7"
    "chrome-devtools"  = "chrome-devtools"
    "server-github"    = "github"
    "playwright"       = "playwright"
    "codebase-memory"  = "codebase-memory"
}

$allNode = Get-Process node -ErrorAction SilentlyContinue
if (-not $allNode) {
    Write-Host "Nenhum processo node encontrado." -ForegroundColor Gray
} else {
    $mcpGroups = @{}
    
    foreach ($proc in $allNode) {
        $wmi = Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue
        $cmd = if ($wmi) { $wmi.CommandLine } else { "" }
        
        $mcpName = $null
        foreach ($pattern in $mcpPatterns.Keys) {
            if ($cmd -match $pattern) {
                $mcpName = $mcpPatterns[$pattern]
                break
            }
        }
        
        if ($mcpName) {
            if (-not $mcpGroups.ContainsKey($mcpName)) {
                $mcpGroups[$mcpName] = @()
            }
            $mcpGroups[$mcpName] += [PSCustomObject]@{
                Id = $proc.Id
                MB = [math]::Round($proc.WorkingSet64 / 1MB)
                Started = $proc.StartTime
            }
        }
    }
    
    $totalKilled = 0
    $totalFreedMB = 0
    
    foreach ($mcp in $mcpGroups.Keys | Sort-Object) {
        $procs = $mcpGroups[$mcp] | Sort-Object Started
        $count = $procs.Count
        $totalMB = ($procs | Measure-Object MB -Sum).Sum
        
        if ($count -gt 1) {
            Write-Host "  $mcp : DUPLICADO ($count instâncias, ${totalMB}MB)" -ForegroundColor Yellow
            
            $toKill = if ($KillAll) { $procs } else { $procs | Select-Object -Skip 1 }
            
            foreach ($kill in $toKill) {
                $action = if ($DryRun) { "MATARIA" } else { "MATEI" }
                Write-Host "    $action PID $($kill.Id) ($($kill.MB)MB)" -ForegroundColor $(if($DryRun){"Gray"}else{"Red"})
                
                if (-not $DryRun) {
                    Stop-Process -Id $kill.Id -Force -ErrorAction SilentlyContinue
                    $totalKilled++
                    $totalFreedMB += $kill.MB
                }
            }
        } else {
            Write-Host "  $mcp : OK (1 instância, $($procs[0].MB)MB)" -ForegroundColor Green
        }
    }
    
    if (-not $DryRun -and $totalKilled -gt 0) {
        Write-Host "`nMCPs mortos: $totalKilled | RAM liberada: ~${totalFreedMB}MB" -ForegroundColor Green
    }
}

# ============================================
# PARTE 3: Status final
# ============================================
Write-Host "`n--- Status ---" -ForegroundColor Yellow

# Banco de dados
$dbPath = "$opencodeDir\opencode.db"
if (Test-Path $dbPath) {
    $dbSize = (Get-Item $dbPath).Length
    Write-Host "Banco: $([math]::Round($dbSize / 1MB, 2)) MB" -ForegroundColor $(if($dbSize -gt 50MB){"Yellow"}else{"Green"})
}

# Processos restantes
$remaining = Get-Process node -ErrorAction SilentlyContinue
if ($remaining) {
    $remainingMB = [math]::Round(($remaining | Measure-Object -Property WorkingSet64 -Sum).Sum / 1MB)
    Write-Host "Processos node: $($remaining.Count) ($($remainingMB)MB)" -ForegroundColor $(if($remaining.Count -gt 10){"Yellow"}else{"Green"})
} else {
    Write-Host "Processos node: 0" -ForegroundColor Green
}

Write-Host "`nConcluido!" -ForegroundColor Green
