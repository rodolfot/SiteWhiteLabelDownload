@echo off
echo Iniciando DownDoor...
echo.
echo O site vai abrir em: http://localhost:3002
echo NAO FECHE esta janela!
echo.

:: Verificar se node_modules existe
if not exist "node_modules" (
    echo Primeira vez? Instalando dependencias...
    call npm install --legacy-peer-deps
    echo.
)

call npm run dev -- -p 3002
