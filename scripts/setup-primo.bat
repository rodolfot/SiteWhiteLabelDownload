@echo off
echo ============================================
echo   Configuracao automatica - DownDoor
echo ============================================
echo.

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao esta instalado!
    echo Baixe em: https://nodejs.org
    echo Escolha a versao LTS e instale.
    echo Depois rode este script novamente.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
echo.

:: Verificar se .env.local existe
if not exist ".env.local" (
    if exist ".env.local.example" (
        echo [AVISO] Arquivo .env.local nao encontrado.
        echo Copiando .env.local.example para .env.local...
        copy .env.local.example .env.local
        echo.
        echo IMPORTANTE: Edite o arquivo .env.local com as chaves do Supabase.
        echo Abra o arquivo com: notepad .env.local
        echo.
    ) else (
        echo [ERRO] Arquivo .env.local.example nao encontrado!
        pause
        exit /b 1
    )
) else (
    echo [OK] .env.local encontrado
)

echo.
echo Instalando dependencias (pode demorar 1-2 minutos)...
echo.
call npm install --legacy-peer-deps

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Tudo pronto! Iniciando o site...
echo ============================================
echo.
echo O site vai abrir em: http://localhost:3002
echo.
echo NAO FECHE esta janela enquanto estiver usando o site.
echo Para parar, aperte Ctrl+C
echo.

call npm run dev -- -p 3002
