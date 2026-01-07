# Fix para Railway - Error de Python en Railpack

## Problema
Railpack no encuentra Python 3.11.0 precompilado:
```
mise ERROR Failed to install core:python@3.11.0: no precompiled python found
```

## Solución Aplicada

1. **Cambiado `runtime.txt`** de `python-3.11.0` a `python-3.11` (versión genérica)
2. **Eliminado `nixpacks.toml`** (ya no se necesita con Railpack)
3. **Actualizado `Procfile`** para usar `python` en lugar de `python3`
4. **Actualizado `railway.json`** para usar `python` en el comando de inicio

## Cambios Realizados

- `runtime.txt`: `python-3.11.0` → `python-3.11`
- `Procfile`: `python3 app.py` → `python app.py`
- `railway.json`: `python3 app.py` → `python app.py`
- Eliminado: `nixpacks.toml` (no necesario con Railpack)

## Próximos Pasos

```bash
git add .
git commit -m "Fix: Usar Python 3.11 genérico para Railpack"
git push origin main
```

Railway debería detectar Python 3.11 automáticamente y funcionar correctamente.

## Alternativa

Si el problema persiste, puedes eliminar `runtime.txt` completamente y dejar que Railpack detecte la versión de Python automáticamente desde `requirements.txt`.

