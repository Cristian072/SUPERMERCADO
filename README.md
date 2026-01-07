# Analytics Pro - Sistema de Predicción de Rentabilidad

Sistema completo de análisis de datos y predicción de rentabilidad para empresas, desarrollado con Python (Flask) y tecnologías web modernas.

## 🚀 Características

- **Dashboard Interactivo**: Visualización completa de productos, categorías y métricas de rentabilidad
- **Modelo de ML**: Predicción de ingresos usando Random Forest Regressor
- **Análisis de Productos**: Identificación de productos más rentables y categorías prioritarias
- **Predicción en Tiempo Real**: Ingresa un producto y obtén predicciones de ingresos potenciales
- **Diseño Corporativo**: Interfaz moderna y profesional con tema oscuro

## 📋 Requisitos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

## 🔧 Instalación

1. Instala las dependencias:
```bash
pip install -r requirements.txt
```

2. Asegúrate de que el archivo `SUPERMERCADO_500_000_ESPAÑOL.csv` esté en el directorio raíz del proyecto.

## 🎯 Uso

### 1. Entrenar el Modelo

Primero, debes entrenar el modelo y crear los clusters:

```bash
# Entrenamiento básico (5 clusters por rentabilidad)
python train_model.py

# Personalizar número de clusters
python train_model.py --n-clusters 8

# Especificar diferentes números de clusters para productos y clientes
python train_model.py --n-clusters 20 --n-clusters-clientes 25 --cluster-type rentabilidad

# Elegir tipo de clustering para productos
python train_model.py --n-clusters 5 --cluster-type productos
python train_model.py --n-clusters 5 --cluster-type rentabilidad
python train_model.py --n-clusters 5 --cluster-type cantidad

# Solo crear clusters de productos (sin clientes)
python train_model.py --n-clusters 10 --skip-clustering-clientes

# Solo crear clusters de clientes (sin productos)
python train_model.py --n-clusters-clientes 15 --skip-clustering-productos

# Solo entrenar modelo de predicción (sin clustering)
python train_model.py --skip-clustering

# Solo crear clusters (sin entrenar modelo de predicción)
python train_model.py --skip-prediction
```

**Tipos de Clustering:**
- `productos`: Agrupa productos similares por características (ingresos, cantidad, precio, clientes)
- `rentabilidad`: Agrupa por nivel de rentabilidad (alto, medio, bajo)
- `cantidad`: Agrupa por volumen de ventas
- `clientes`: Agrupa clientes por comportamiento de compra (frecuencia, valor, productos únicos)

### 2. Ejecutar la Aplicación

```bash
python app.py
```

Abre tu navegador en: `http://localhost:5000`

**Nota:** El modelo debe estar entrenado antes de ejecutar la aplicación. Si no existe, verás un mensaje de advertencia.

## 📊 Funcionalidades

### Dashboard
- Estadísticas generales (ingresos totales, productos únicos, transacciones)
- Gráficos interactivos de ingresos por categoría
- Evolución temporal de ingresos
- Tabla de top 20 productos más rentables

### Predicción
- Selecciona un producto de la lista (en inglés)
- Ingresa cantidad y precio unitario (opcional)
- Obtén predicción de ingresos y score de rentabilidad

### Análisis de Productos
- Lista completa de productos
- Búsqueda y filtrado por categoría
- Acceso rápido a predicción desde la lista

### Clusters
- Visualización de productos agrupados por similitud
- Análisis por rentabilidad, cantidad o características de productos
- Gráficos de distribución de clusters
- Filtrado y exploración de productos por cluster

## 🏗️ Estructura del Proyecto

```
PROYECTO FINAL/
├── app.py                      # Aplicación Flask principal
├── train_model.py              # Script de entrenamiento y clustering
├── requirements.txt            # Dependencias
├── models/                     # Carpeta de modelos (se crea automáticamente)
│   ├── model_rentabilidad.pkl # Modelo de predicción
│   ├── model_clusters.pkl     # Modelo de clustering
│   ├── label_encoders.pkl     # Encoders de categorías
│   ├── scaler.pkl             # Scaler para normalización
│   └── product_clusters.csv   # Datos de productos con clusters
├── templates/
│   └── index.html             # Interfaz web
├── static/
│   ├── css/
│   │   └── style.css          # Estilos corporativos
│   └── js/
│       └── main.js            # JavaScript interactivo
└── SUPERMERCADO_500_000_ESPAÑOL.csv  # Dataset
```

## 🤖 Modelo de Machine Learning

El modelo utiliza **Random Forest Regressor** con las siguientes características:
- Cantidad
- Precio Unitario
- Categoría (codificada)
- Mes
- Día de la semana
- Hora

El modelo predice los ingresos esperados basándose en patrones históricos del dataset.

## 🎨 Diseño

- Tema oscuro corporativo
- Gradientes modernos
- Gráficos interactivos con Plotly
- Diseño responsive
- Animaciones suaves

## 📈 API Endpoints

- `GET /` - Página principal
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/top-products` - Top productos
- `GET /api/dashboard/categories` - Estadísticas por categoría
- `GET /api/dashboard/temporal` - Datos temporales
- `GET /api/products/list` - Lista de productos
- `GET /api/categories/list` - Lista de categorías
- `GET /api/clusters` - Información de clusters
- `GET /api/clusters/products` - Productos por cluster
- `POST /api/predict` - Predicción de ingresos

## 🔮 Próximas Mejoras

- Exportación de reportes en PDF/Excel
- Filtros avanzados en el dashboard
- Comparación de productos
- Análisis de tendencias estacionales
- Recomendaciones automáticas de stock

## 📝 Notas

- **IMPORTANTE:** Debes entrenar el modelo primero con `train_model.py` antes de ejecutar la aplicación
- Los modelos se guardan en la carpeta `models/` para uso futuro
- El entrenamiento puede tardar varios minutos con datasets grandes (500,000+ registros)
- Puedes elegir el número de clusters según tus necesidades (recomendado: 5-10)
- El tipo de clustering afecta cómo se agrupan los productos:
  - **rentabilidad**: Útil para identificar productos de alto/medio/bajo rendimiento
  - **productos**: Útil para encontrar productos similares
  - **cantidad**: Útil para análisis de volumen de ventas

## 👨‍💻 Desarrollo

Desarrollado como proyecto final de análisis de datos con enfoque en predicción y visualización empresarial.

