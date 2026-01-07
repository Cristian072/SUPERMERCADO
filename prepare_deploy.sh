#!/bin/bash

# Script para preparar el despliegue en Railway

echo "🚀 Preparando proyecto para Railway..."

# Verificar que los modelos existan
echo "📦 Verificando modelos..."
if [ -d "models" ]; then
    echo "✅ Carpeta models/ encontrada"
    ls -lh models/
else
    echo "❌ Carpeta models/ no encontrada"
    exit 1
fi

# Forzar la adición de modelos al git
echo "📝 Agregando modelos al repositorio..."
git add -f models/*.pkl models/*.csv 2>/dev/null || echo "⚠️  Algunos modelos pueden no existir"

# Verificar archivos necesarios
echo "🔍 Verificando archivos necesarios..."
files=("Procfile" "runtime.txt" "requirements.txt" "app.py" "SUPERMERCADO_500_000_ESPAÑOL.csv")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file encontrado"
    else
        echo "❌ $file NO encontrado"
    fi
done

echo ""
echo "✅ Preparación completada!"
echo "📤 Ahora puedes hacer:"
echo "   git add ."
echo "   git commit -m 'Preparado para Railway'"
echo "   git push origin main"

