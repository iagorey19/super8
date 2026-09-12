# cleanup-mcps.ps1 - Kill all MCP node processes
$ErrorActionPreference = "SilentlyContinue"

$procs = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" | Where-Object {
    $_.CommandLine -like '*server-github*' -or
    $_.CommandLine -like '*context7*' -or
    $_.CommandLine -like '*chrome-devtools*' -or
    $_.CommandLine -like '*codebase-memory*' -or
    $_.CommandLine -like '*playwright*' -or
    $_.CommandLine -like '*shadcn*' -or
    $_.CommandLine -like '*prisma*' -or
    $_.CommandLine -like '*sequential*' -or
    $_.CommandLine -like '*google-developer*'
}

if ($procs) {
    $count = $procs.Count
    $procs | ForEach-Object {
        Write-Host "  [OK] PID $($_.ProcessId) encerrado"
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
    Write-Host ""
    Write-Host "  Total: $count processos MCP encerrados"
} else {
    Write-Host "  Nenhum processo MCP encontrado."
}

