# Fix para Railway - Error de pip

## Problema
Railway no encuentra `pip` al intentar instalar dependencias.

## Solución Aplicada

1. **Cambiado Python 3.13 → Python 3.11** (más estable en Railway)
2. **Actualizado `nixpacks.toml`** para usar `python3 -m pip` en lugar de `pip`
3. **Actualizado `Procfile`** para usar `python3` en lugar de `python`
4. **Actualizado `runtime.txt`** a Python 3.11

## Archivos Modificados

- `nixpacks.toml` - Usa `python3 -m pip` y Python 3.11
- `Procfile` - Usa `python3 app.py`
- `runtime.txt` - Cambiado a `python-3.11.0`
- `railway.json` - Actualizado comando de inicio

## Próximos Pasos

1. Hacer commit de los cambios:
```bash
git add .
git commit -m "Fix: Configuración para Railway con Python 3.11"
git push origin main
```

2. Railway debería detectar los cambios y reconstruir automáticamente.

## Si el problema persiste

Railway puede usar Dockerfile en lugar de Nixpacks. En ese caso, podemos crear un Dockerfile personalizado.

