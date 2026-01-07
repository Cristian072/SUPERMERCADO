# Analytics Pro - Sistema de Predicción de Rentabilidad
## Presentación del Proyecto Final

---

## 📋 SECCIÓN 1: INTRODUCCIÓN Y CONTEXTO

---

### Diapositiva 1: Portada
# Analytics Pro
## Sistema de Análisis y Predicción de Rentabilidad

**Proyecto Final de Análisis de Datos**

- Dashboard interactivo para supermercados
- Machine Learning para predicción de ingresos
- Clustering inteligente de productos y clientes
- Análisis de rentabilidad en tiempo real

---

### Diapositiva 2: Problema a Resolver
## ¿Por qué este proyecto?

**Desafíos del negocio:**
- ❌ Dificultad para identificar productos más rentables
- ❌ Falta de predicción de ingresos potenciales
- ❌ Análisis limitado de comportamiento de clientes
- ❌ Decisiones de stock basadas en intuición

**Solución propuesta:**
- ✅ Dashboard con visualizaciones interactivas
- ✅ Modelo ML para predecir rentabilidad
- ✅ Clustering para agrupar productos y clientes
- ✅ Reportes exportables en PDF

---

### Diapositiva 3: Objetivos del Proyecto
## Objetivos Principales

**1. Predicción de Rentabilidad**
- Predecir ingresos potenciales por producto
- Evaluar rentabilidad antes de comprar stock
- Identificar oportunidades de negocio

**2. Análisis de Productos**
- Identificar top productos más rentables
- Analizar categorías prioritarias
- Agrupar productos similares (clustering)

**3. Análisis de Clientes**
- Identificar clientes más frecuentes
- Agrupar clientes por comportamiento
- Predecir ingresos por cliente

**4. Visualización y Reportes**
- Dashboard interactivo con gráficos
- Exportación de reportes en PDF
- Interfaz corporativa y profesional

---

### Diapositiva 4: Dataset Utilizado
## Datos del Proyecto

**Dataset: SUPERMERCADO_500_000_ESPAÑOL.csv**
- 📊 **816,000+ registros** de transacciones
- 🏷️ **Productos** con descripciones en inglés y español
- 📦 **Categorías** de productos
- 💰 **Precios y cantidades** vendidas
- 📅 **Fechas y horas** de transacciones
- 👥 **Clientes** identificados por ID

**Variables clave:**
- `Cantidad`, `PrecioUnitario`, `Categoria`
- `Fecha`, `Hora_24h`, `IDCliente`
- `Descripcion_Ingles`, `Descripcion_Español`

---

## 📊 SECCIÓN 2: METODOLOGÍA Y TECNOLOGÍAS

---

### Diapositiva 5: Stack Tecnológico
## Tecnologías Utilizadas

**Backend:**
- 🐍 **Python 3.13** - Lenguaje principal
- 🌐 **Flask** - Framework web
- 📊 **Pandas & NumPy** - Procesamiento de datos
- 🤖 **Scikit-learn** - Machine Learning

**Frontend:**
- 🎨 **HTML5, CSS3, JavaScript** - Interfaz web
- 📈 **Plotly** - Gráficos interactivos
- 📄 **jsPDF** - Exportación a PDF

**Machine Learning:**
- 🌲 **Random Forest Regressor** - Predicción
- 🔍 **K-Means Clustering** - Agrupación
- 📏 **StandardScaler** - Normalización

---

### Diapositiva 6: Arquitectura del Sistema
## Estructura del Proyecto

```
PROYECTO FINAL/
├── app.py              → Aplicación Flask (API)
├── train_model.py      → Entrenamiento y clustering
├── models/             → Modelos guardados
│   ├── model_rentabilidad.pkl
│   ├── model_clusters.pkl
│   └── product_clusters.csv
├── templates/
│   └── index.html      → Interfaz web
└── static/
    ├── css/style.css   → Estilos corporativos
    └── js/main.js      → Lógica frontend
```

**Flujo de trabajo:**
1. Entrenar modelos → `train_model.py`
2. Cargar modelos → `app.py`
3. Visualizar datos → Dashboard web
4. Exportar reportes → PDF

---

### Diapositiva 7: Modelo de Machine Learning
## Predicción de Rentabilidad

**Algoritmo: Random Forest Regressor**

**Características (Features):**
- `Cantidad` - Unidades vendidas
- `PrecioUnitario` - Precio por unidad
- `Categoria_Encoded` - Categoría codificada
- `Mes` - Mes de la transacción
- `DiaSemana` - Día de la semana
- `Hora_24h` - Hora de la transacción

**Variable objetivo:**
- `Ingresos` = Cantidad × PrecioUnitario

**Rendimiento:**
- ✅ R² Score (Train): ~0.97
- ✅ R² Score (Test): ~0.93
- ✅ Excelente capacidad predictiva

---

### Diapositiva 8: Clustering
## Agrupación Inteligente

**Tipos de Clustering:**

**1. Productos por Rentabilidad**
- Agrupa productos por nivel de rentabilidad
- Identifica productos de alto/medio/bajo rendimiento
- Útil para decisiones de stock

**2. Productos por Similitud**
- Agrupa productos similares por características
- Análisis de ingresos, cantidad, precio, clientes

**3. Productos por Cantidad**
- Agrupa por volumen de ventas
- Identifica productos más vendidos

**4. Clientes por Comportamiento**
- Agrupa clientes por frecuencia de compra
- Análisis de valor, productos únicos, transacciones
- Identifica segmentos de clientes

**Algoritmo: K-Means con StandardScaler**

---

## 🎯 SECCIÓN 3: FUNCIONALIDADES Y RESULTADOS

---

### Diapositiva 9: Dashboard Principal
## Visualización de Datos

**Estadísticas Generales:**
- 💰 Ingresos totales
- 📦 Productos únicos
- 🛒 Total de transacciones
- 📊 Ingreso promedio

**Gráficos Interactivos:**
- 📈 Ingresos por Categoría (gráfico de barras)
- 👥 Top 20 Clientes Más Frecuentes
- 📊 Distribución de datos

**Tablas:**
- 🏆 Top 20 productos más rentables
- 📋 Lista completa de productos
- 🔍 Búsqueda y filtrado

---

### Diapositiva 10: Predicción de Productos
## Predicción en Tiempo Real

**Funcionalidad:**
1. Seleccionar producto (inglés o español)
2. Ingresar cantidad y precio (opcionales)
3. Obtener predicción de ingresos

**Resultados mostrados:**
- 💵 **Ingresos Predichos** - Valor estimado
- 📊 **Score de Rentabilidad** - Nivel de confianza
- 📈 **Comparación** con datos históricos
- 💡 **Recomendaciones** de stock

**Casos de uso:**
- Evaluar productos antes de comprar
- Planificar compras de inventario
- Identificar oportunidades de negocio

---

### Diapositiva 11: Clusters de Productos
## Análisis de Agrupación

**Visualización de Clusters:**
- 📊 Gráfico de distribución por cluster
- 📋 Tabla con productos agrupados
- 🔍 Filtrado por cluster

**Información por Cluster:**
- Número de productos
- Ingresos totales
- Cantidad total vendida
- Productos únicos

**Funcionalidades:**
- Botón "Ver Productos" por cluster
- Ordenamiento: más vendidos, más ingresos
- Modal con detalles completos
- Exportación a PDF

---

### Diapositiva 12: Clusters de Clientes y Predicción
## Análisis de Clientes

**Clusters de Clientes:**
- 👥 Agrupación por comportamiento
- 📊 Métricas: ingresos, frecuencia, productos únicos
- 📈 Visualización de distribución
- 🔍 Exploración detallada por cluster

**Predicción de Clientes:**
- Seleccionar cliente de la lista
- Predecir ingresos diarios y mensuales
- Análisis de historial de compras
- Proyección de rentabilidad

**Beneficios:**
- Identificar clientes VIP
- Personalizar estrategias de marketing
- Predecir ingresos por segmento

---

## 📄 SECCIÓN 4: EXPORTACIÓN Y CONCLUSIONES

---

### Diapositiva 13: Exportación de Reportes
## Generación de PDFs

**Reportes Disponibles:**

**1. Dashboard General:**
- Portada corporativa
- Estadísticas generales
- Top productos
- Gráficas de categorías y clientes
- Datos detallados en tablas

**2. Clusters de Productos:**
- Resumen de clusters
- Productos por cluster
- Análisis completo

**3. Clusters de Clientes:**
- Resumen de clusters
- Clientes por cluster
- Métricas detalladas

**Características:**
- ✅ Diseño corporativo profesional
- ✅ Gráficas incluidas como imágenes
- ✅ Tablas formateadas
- ✅ Múltiples páginas automáticas

---

### Diapositiva 14: Interfaz y Diseño
## Experiencia de Usuario

**Diseño Corporativo:**
- 🎨 Tema claro con colores azules
- 🌊 Gradientes modernos
- ✨ Animaciones suaves
- 📱 Diseño responsive

**Navegación:**
- 📊 Dashboard
- 🔮 Predicción
- 📦 Productos
- 🔍 Clusters
- 👥 Clusters Clientes
- 🔮 Predicción Clientes

**Características:**
- Búsqueda en inglés y español
- Filtros interactivos
- Modales para detalles
- Exportación rápida

---

### Diapositiva 15: Resultados y Métricas
## Logros del Proyecto

**Modelo de ML:**
- ✅ R² Score: 0.93 (excelente precisión)
- ✅ Predicción de ingresos confiable
- ✅ Procesamiento de 816K+ registros

**Clustering:**
- ✅ Agrupación de productos por rentabilidad
- ✅ Clustering de clientes por comportamiento
- ✅ Configuración flexible de clusters

**Dashboard:**
- ✅ Visualizaciones interactivas
- ✅ Exportación completa a PDF
- ✅ Interfaz profesional y moderna

**Funcionalidades:**
- ✅ Predicción en tiempo real
- ✅ Análisis de productos y clientes
- ✅ Reportes exportables
- ✅ Búsqueda bilingüe (ES/EN)

---

### Diapositiva 16: Conclusiones y Futuro
## Conclusiones

**Logros:**
- ✅ Sistema completo de análisis y predicción
- ✅ Modelo ML con alta precisión
- ✅ Dashboard interactivo y profesional
- ✅ Exportación de reportes en PDF
- ✅ Análisis de productos y clientes

**Aplicaciones:**
- 🏪 Supermercados y retail
- 📊 Análisis de inventario
- 💼 Toma de decisiones estratégicas
- 📈 Planificación de compras

**Próximas Mejoras:**
- 🔮 Predicción de tendencias estacionales
- 📊 Comparación de productos
- 🤖 Recomendaciones automáticas de stock
- 📱 Aplicación móvil
- 🔄 Actualización en tiempo real

**Gracias por su atención**

---

## 📝 Notas para la Presentación

**Tiempo estimado:** 15-20 minutos
- Sección 1: 4-5 minutos
- Sección 2: 5-6 minutos
- Sección 3: 5-6 minutos
- Sección 4: 3-4 minutos

**Recomendaciones:**
- Demostrar el dashboard en vivo
- Mostrar ejemplo de predicción
- Explicar el proceso de clustering
- Destacar la exportación a PDF

