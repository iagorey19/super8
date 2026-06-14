@echo off
cd /d "C:\Users\PC\Projetos\SUPER.8\super8"
set NODE_OPTIONS=--max-old-space-size=2048

netstat -ano | findstr ":3000 " | findstr LISTEN >nul 2>&1
if not errorlevel 1 (
    echo ================================================
    echo  Servidor ja esta rodando em http://localhost:3000
    echo ================================================
    pause
    exit /b
)

echo Iniciando servidor Next.js...
echo Aguarde o "Ready" aparecer.
echo.
echo Depois abra: http://localhost:3000
echo.
npx next dev -p 3000
if errorlevel 1 (
    echo.
    echo ERRO: Servidor nao iniciou.
    echo Execute manualmente no terminal: npm run dev
    pause
    exit /b
)
pause
