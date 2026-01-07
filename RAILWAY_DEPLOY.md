# Guía de Despliegue en Railway

## 📋 Pasos para Desplegar

### 1. Preparar el Repositorio

Asegúrate de que los modelos estén en la carpeta `models/`:
- `model_rentabilidad.pkl`
- `model_clusters.pkl`
- `model_clusters_clientes.pkl`
- `label_encoders.pkl`
- `scaler.pkl`
- `scaler_clientes.pkl`
- `product_clusters.csv`
- `client_clusters.csv`

### 2. Subir Modelos al Repositorio

Si los modelos están en `.gitignore`, necesitas forzar su inclusión:

```bash
# Forzar la adición de modelos
git add -f models/*.pkl models/*.csv

# O si están en la raíz
git add -f *.pkl
```

### 3. Verificar Archivos Necesarios

Asegúrate de tener estos archivos en el repositorio:
- ✅ `Procfile` - Comando de inicio
- ✅ `runtime.txt` - Versión de Python
- ✅ `requirements.txt` - Dependencias
- ✅ `app.py` - Aplicación Flask
- ✅ `SUPERMERCADO_500_000_ESPAÑOL.csv` - Dataset
- ✅ `models/` - Carpeta con modelos entrenados
- ✅ `templates/index.html` - Interfaz web
- ✅ `static/` - CSS y JS

### 4. Hacer Commit y Push

```bash
git add .
git commit -m "Preparado para Railway deployment"
git push origin main
```

### 5. Configurar en Railway

1. Conecta tu repositorio de GitHub a Railway
2. Railway detectará automáticamente el `Procfile`
3. La aplicación se desplegará automáticamente

### 6. Variables de Entorno (Opcional)

En Railway, puedes configurar:
- `PORT` - Railway lo asigna automáticamente
- `FLASK_DEBUG` - `False` para producción

## ⚠️ Notas Importantes

- **Tamaño del CSV**: El archivo CSV es grande (~500K registros). Railway puede tardar en cargarlo.
- **Modelos**: Asegúrate de que los modelos estén entrenados antes de desplegar.
- **Memoria**: Railway puede necesitar un plan que soporte el tamaño de los modelos.

## 🔧 Solución de Problemas

### Si los modelos no se cargan:
1. Verifica que estén en el repositorio: `git ls-files models/`
2. Si no están, usa: `git add -f models/*.pkl`

### Si la aplicación no inicia:
1. Revisa los logs en Railway
2. Verifica que `Procfile` esté correcto
3. Asegúrate de que `requirements.txt` tenga todas las dependencias

### Si hay errores de memoria:
1. Considera usar un plan de Railway con más recursos
2. O entrena modelos más pequeños

## ✅ Checklist Final

- [ ] Modelos entrenados y en `models/`
- [ ] Modelos agregados al repositorio (`git add -f models/*`)
- [ ] `Procfile` creado
- [ ] `runtime.txt` creado
- [ ] `requirements.txt` completo
- [ ] `app.py` configurado para puerto dinámico
- [ ] CSV disponible en el repositorio
- [ ] Commit y push realizados
- [ ] Railway conectado al repositorio

