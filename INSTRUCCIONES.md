# Instrucciones Rápidas

## 🚀 Inicio Rápido

### Paso 1: Entrenar el Modelo

Ejecuta el script de entrenamiento con tus preferencias:

```bash
# Opción 1: Entrenamiento básico (5 clusters por rentabilidad)
python train_model.py

# Opción 2: Personalizar número de clusters
python train_model.py --n-clusters 8

# Opción 3: Elegir tipo de clustering
python train_model.py --n-clusters 5 --cluster-type productos
python train_model.py --n-clusters 5 --cluster-type rentabilidad
python train_model.py --n-clusters 5 --cluster-type cantidad
```

**Parámetros disponibles:**
- `--n-clusters`: Número de clusters de productos (default: 5)
- `--n-clusters-clientes`: Número de clusters de clientes (default: mismo que productos)
- `--cluster-type`: Tipo de clustering para productos
  - `productos`: Agrupa productos similares
  - `rentabilidad`: Agrupa por nivel de rentabilidad
  - `cantidad`: Agrupa por volumen de ventas
- `--skip-prediction`: Saltar entrenamiento del modelo de predicción
- `--skip-clustering`: Saltar entrenamiento del clustering (ambos tipos)
- `--skip-clustering-productos`: Saltar solo clustering de productos
- `--skip-clustering-clientes`: Saltar solo clustering de clientes

### Paso 2: Ejecutar la Aplicación

```bash
python app.py
```

Abre tu navegador en: `http://localhost:5000`

## 📊 Ejemplos de Uso

### Ejemplo 1: Análisis de Rentabilidad con Clusters Separados
```bash
python train_model.py --n-clusters 20 --n-clusters-clientes 25 --cluster-type rentabilidad
```
Esto creará 20 clusters de productos por rentabilidad y 25 clusters de clientes por comportamiento.

### Ejemplo 2: Productos Similares
```bash
python train_model.py --n-clusters 8 --cluster-type productos
```
Esto agrupará productos con características similares (precio, cantidad vendida, etc.) y también creará clusters de clientes.

### Ejemplo 3: Análisis de Volumen
```bash
python train_model.py --n-clusters 5 --cluster-type cantidad
```
Esto agrupará productos por su volumen de ventas y también creará clusters de clientes.

### Ejemplo 4: Solo Clusters de Clientes
```bash
python train_model.py --n-clusters-clientes 15 --skip-clustering-productos
```
Esto creará solo clusters de clientes sin crear clusters de productos.

## ⚠️ Notas Importantes

1. **Primero entrena, luego ejecuta**: Siempre ejecuta `train_model.py` antes de `app.py`
2. **Tiempo de entrenamiento**: Con 500,000 registros, el entrenamiento puede tardar 5-15 minutos
3. **Memoria**: Asegúrate de tener suficiente RAM (recomendado: 8GB+)
4. **Modelos guardados**: Los modelos se guardan en `models/` y se reutilizan en ejecuciones futuras

## 🔄 Re-entrenar Modelos

Si quieres re-entrenar con diferentes parámetros:

```bash
# Eliminar modelos anteriores (opcional)
rm -rf models/*.pkl models/*.csv

# Entrenar con nuevos parámetros
python train_model.py --n-clusters 10 --cluster-type rentabilidad
```

## 🐛 Solución de Problemas

**Error: "Modelo no encontrado"**
- Solución: Ejecuta `python train_model.py` primero

**Error: "No hay datos de clusters"**
- Solución: Asegúrate de haber ejecutado el entrenamiento con clustering (no uses `--skip-clustering`)

**Error de memoria**
- Solución: Reduce el tamaño del dataset o aumenta la RAM disponible

