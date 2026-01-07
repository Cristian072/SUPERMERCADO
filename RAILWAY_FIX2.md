# Fix para Railway - Error de ensurepip en Nix

## Problema
Railway/Nixpacks está usando un entorno de Python gestionado por Nix que no permite usar `ensurepip` porque intenta modificar el sistema inmutable.

Error:
```
error: externally-managed-environment
× This environment is externally managed
```

## Solución Aplicada

1. **Eliminado `ensurepip`** - No es necesario en Nix
2. **Agregado `python311Packages.pip`** directamente en nixPkgs
3. **Agregado `setuptools` y `wheel`** en nixPkgs
4. **Uso directo de `pip`** en lugar de `python3 -m pip`

## Archivos Modificados

- `nixpacks.toml` - Ahora incluye pip, setuptools y wheel directamente desde Nix

## Cambios en nixpacks.toml

**Antes:**
```toml
[phases.setup]
nixPkgs = ["python311"]

[phases.install]
cmds = [
  "python3 -m ensurepip --upgrade",  # ❌ No funciona en Nix
  "python3 -m pip install --upgrade pip setuptools wheel",
  "python3 -m pip install -r requirements.txt"
]
```

**Ahora:**
```toml
[phases.setup]
nixPkgs = ["python311", "python311Packages.pip", "python311Packages.setuptools", "python311Packages.wheel"]

[phases.install]
cmds = [
  "pip install --upgrade pip setuptools wheel",
  "pip install -r requirements.txt"
]
```

## Próximos Pasos

1. Hacer commit de los cambios:
```bash
git add nixpacks.toml
git commit -m "Fix: Usar pip de Nix directamente sin ensurepip"
git push origin main
```

2. Railway debería reconstruir automáticamente y ahora funcionar correctamente.

