@echo off
title LIMPAR MCPs
echo ============================================================
echo  LIMPANDO PROCESSOS MCP...
echo ============================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0cleanup-mcps.ps1"

echo.
echo  Limpeza concluida.
echo.
timeout /t 2 /nobreak >nul
