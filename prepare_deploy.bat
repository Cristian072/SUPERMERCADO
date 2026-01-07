@echo off
REM Script para preparar el despliegue en Railway (Windows)

echo 🚀 Preparando proyecto para Railway...

REM Verificar que los modelos existan
echo 📦 Verificando modelos...
if exist "models" (
    echo ✅ Carpeta models/ encontrada
    dir models\
) else (
    echo ❌ Carpeta models/ no encontrada
    exit /b 1
)

REM Forzar la adición de modelos al git
echo 📝 Agregando modelos al repositorio...
git add -f models/*.pkl models/*.csv 2>nul || echo ⚠️  Algunos modelos pueden no existir

REM Verificar archivos necesarios
echo 🔍 Verificando archivos necesarios...
if exist "Procfile" (echo ✅ Procfile encontrado) else (echo ❌ Procfile NO encontrado)
if exist "runtime.txt" (echo ✅ runtime.txt encontrado) else (echo ❌ runtime.txt NO encontrado)
if exist "requirements.txt" (echo ✅ requirements.txt encontrado) else (echo ❌ requirements.txt NO encontrado)
if exist "app.py" (echo ✅ app.py encontrado) else (echo ❌ app.py NO encontrado)
if exist "SUPERMERCADO_500_000_ESPAÑOL.csv" (echo ✅ CSV encontrado) else (echo ❌ CSV NO encontrado)

echo.
echo ✅ Preparación completada!
echo 📤 Ahora puedes hacer:
echo    git add .
echo    git commit -m "Preparado para Railway"
echo    git push origin main

pause

