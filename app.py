from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Rutas globales
MODELS_DIR = 'models'
MODEL_PATH = os.path.join(MODELS_DIR, 'model_rentabilidad.pkl')
CLUSTER_MODEL_PATH = os.path.join(MODELS_DIR, 'model_clusters.pkl')
CLUSTER_CLIENTS_MODEL_PATH = os.path.join(MODELS_DIR, 'model_clusters_clientes.pkl')
LABEL_ENCODER_PATH = os.path.join(MODELS_DIR, 'label_encoders.pkl')
SCALER_PATH = os.path.join(MODELS_DIR, 'scaler.pkl')
SCALER_CLIENTS_PATH = os.path.join(MODELS_DIR, 'scaler_clientes.pkl')
CLUSTER_DATA_PATH = os.path.join(MODELS_DIR, 'product_clusters.csv')
CLUSTER_CLIENTS_DATA_PATH = os.path.join(MODELS_DIR, 'client_clusters.csv')
DATA_PATH = 'SUPERMERCADO_500_000_ESPAÑOL.csv'

# Variables globales
model = None
kmeans_model = None
kmeans_clients_model = None
scaler = None
scaler_clients = None
label_encoders = {}
df_processed = None
cluster_data = None
cluster_clients_data = None

def load_and_preprocess_data():
    """Carga y preprocesa los datos"""
    global df_processed, label_encoders
    
    print("Cargando datos...")
    df = pd.read_csv(DATA_PATH, encoding='utf-8')
    
    # Calcular ingresos (rentabilidad)
    df['Ingresos'] = df['Cantidad'] * df['PrecioUnitario']
    
    # Convertir fecha
    df['Fecha'] = pd.to_datetime(df['Fecha'], format='%d/%m/%Y', errors='coerce')
    df['Mes'] = df['Fecha'].dt.month
    df['DiaSemana'] = df['Fecha'].dt.dayofweek
    
    # Codificar categorías (usar encoder cargado si existe, sino crear uno nuevo)
    if 'Categoria' not in label_encoders or not label_encoders:
        label_encoders['Categoria'] = LabelEncoder()
        df['Categoria_Encoded'] = label_encoders['Categoria'].fit_transform(df['Categoria'])
    else:
        # Usar transform en lugar de fit_transform para mantener consistencia
        df['Categoria_Encoded'] = label_encoders['Categoria'].transform(df['Categoria'])
    
    df_processed = df
    return df

def load_model():
    """Carga los modelos si existen"""
    global model, kmeans_model, kmeans_clients_model, scaler, scaler_clients, label_encoders, cluster_data, cluster_clients_data
    
    # Crear directorio si no existe
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # Cargar modelo de predicción
    if os.path.exists(MODEL_PATH):
        print("Cargando modelo de predicción existente...")
        model = joblib.load(MODEL_PATH)
    else:
        print("Modelo de predicción no encontrado. Ejecuta train_model.py primero.")
        model = None
    
    # Cargar modelo de clustering
    if os.path.exists(CLUSTER_MODEL_PATH):
        print("Cargando modelo de clustering existente...")
        cluster_info = joblib.load(CLUSTER_MODEL_PATH)
        kmeans_model = cluster_info['kmeans']
    else:
        print("Modelo de clustering no encontrado. Ejecuta train_model.py primero.")
        kmeans_model = None
    
    # Cargar scaler
    if os.path.exists(SCALER_PATH):
        scaler = joblib.load(SCALER_PATH)
    else:
        scaler = None
    
    # Cargar label encoders
    if os.path.exists(LABEL_ENCODER_PATH):
        label_encoders = joblib.load(LABEL_ENCODER_PATH)
    else:
        label_encoders = {}
    
    # Cargar datos de clusters de productos
    if os.path.exists(CLUSTER_DATA_PATH):
        cluster_data = pd.read_csv(CLUSTER_DATA_PATH, encoding='utf-8')
        print(f"Datos de clusters de productos cargados: {len(cluster_data)} productos")
    else:
        cluster_data = None
    
    # Cargar modelo de clustering de clientes
    if os.path.exists(CLUSTER_CLIENTS_MODEL_PATH):
        print("Cargando modelo de clustering de clientes existente...")
        cluster_clients_info = joblib.load(CLUSTER_CLIENTS_MODEL_PATH)
        kmeans_clients_model = cluster_clients_info['kmeans']
    else:
        print("Modelo de clustering de clientes no encontrado.")
        kmeans_clients_model = None
    
    # Cargar scaler de clientes
    if os.path.exists(SCALER_CLIENTS_PATH):
        scaler_clients = joblib.load(SCALER_CLIENTS_PATH)
    else:
        scaler_clients = None
    
    # Cargar datos de clusters de clientes
    if os.path.exists(CLUSTER_CLIENTS_DATA_PATH):
        cluster_clients_data = pd.read_csv(CLUSTER_CLIENTS_DATA_PATH, encoding='utf-8')
        print(f"Datos de clusters de clientes cargados: {len(cluster_clients_data)} clientes")
    else:
        cluster_clients_data = None
    
    return model

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')

@app.route('/api/dashboard/stats')
def get_dashboard_stats():
    """Obtiene estadísticas generales para el dashboard"""
    global df_processed
    
    if df_processed is None:
        load_and_preprocess_data()
    
    stats = {
        'total_ventas': int(df_processed['Ingresos'].sum()),
        'total_productos': int(df_processed['Cantidad'].sum()),
        'total_transacciones': len(df_processed),
        'productos_unicos': df_processed['CodigoStock'].nunique(),
        'categorias_unicas': df_processed['Categoria'].nunique(),
        'ingreso_promedio': float(df_processed['Ingresos'].mean()),
        'ingreso_mediano': float(df_processed['Ingresos'].median())
    }
    
    return jsonify(stats)

@app.route('/api/dashboard/top-products')
def get_top_products():
    """Obtiene los productos más rentables"""
    global df_processed
    
    if df_processed is None:
        load_and_preprocess_data()
    
    top_products = df_processed.groupby(['CodigoStock', 'Descripcion_Ingles', 'Descripcion_Español', 'Categoria']).agg({
        'Ingresos': 'sum',
        'Cantidad': 'sum',
        'PrecioUnitario': 'mean'
    }).reset_index()
    
    top_products = top_products.sort_values('Ingresos', ascending=False).head(20)
    
    return jsonify(top_products.to_dict('records'))

@app.route('/api/dashboard/categories')
def get_category_stats():
    """Obtiene estadísticas por categoría"""
    global df_processed
    
    if df_processed is None:
        load_and_preprocess_data()
    
    category_stats = df_processed.groupby('Categoria').agg({
        'Ingresos': 'sum',
        'Cantidad': 'sum',
        'CodigoStock': 'nunique'
    }).reset_index()
    
    category_stats.columns = ['Categoria', 'Ingresos', 'Cantidad_Vendida', 'Productos_Unicos']
    category_stats = category_stats.sort_values('Ingresos', ascending=False)
    
    return jsonify(category_stats.to_dict('records'))

@app.route('/api/dashboard/top-clients')
def get_top_clients():
    """Obtiene los clientes más comunes/frecuentes"""
    global df_processed
    
    if df_processed is None:
        load_and_preprocess_data()
    
    # Agrupar por cliente y calcular métricas
    clients = df_processed.groupby('IDCliente').agg({
        'Ingresos': 'sum',
        'Cantidad': 'sum',
        'NumeroFactura': 'nunique',
        'CodigoStock': 'nunique'
    }).reset_index()
    
    clients.columns = ['IDCliente', 'Ingresos_Total', 'Cantidad_Total', 'Num_Compras', 'Productos_Unicos']
    
    # Ordenar por número de compras (clientes más frecuentes)
    clients = clients.sort_values('Num_Compras', ascending=False).head(20)
    
    return jsonify(clients.to_dict('records'))

@app.route('/api/products/list')
def get_products_list():
    """Obtiene lista de productos únicos"""
    global df_processed
    
    if df_processed is None:
        load_and_preprocess_data()
    
    products = df_processed[['CodigoStock', 'Descripcion_Ingles', 'Descripcion_Español', 'Categoria']].drop_duplicates()
    products = products.sort_values('Descripcion_Ingles')
    
    return jsonify(products.to_dict('records'))

@app.route('/api/categories/list')
def get_categories_list():
    """Obtiene lista de categorías"""
    global df_processed
    
    if df_processed is None:
        load_and_preprocess_data()
    
    categories = sorted(df_processed['Categoria'].unique().tolist())
    return jsonify(categories)

@app.route('/api/clusters')
def get_clusters():
    """Obtiene información de los clusters"""
    global cluster_data
    
    if cluster_data is None:
        load_model()
    
    if cluster_data is None:
        return jsonify({'error': 'No hay datos de clusters disponibles. Ejecuta train_model.py primero.'}), 404
    
    # Agrupar por cluster
    cluster_summary = cluster_data.groupby('Cluster').agg({
        'Producto': 'count',
        'Ingresos_Total': 'sum' if 'Ingresos_Total' in cluster_data.columns else lambda x: 0,
        'Cantidad_Total': 'sum' if 'Cantidad_Total' in cluster_data.columns else lambda x: 0
    }).reset_index()
    
    cluster_summary.columns = ['Cluster', 'Num_Productos', 'Ingresos_Total', 'Cantidad_Total']
    
    # Obtener productos por cluster con todas las métricas disponibles
    clusters_detail = {}
    available_cols = ['CodigoStock', 'Descripcion_Ingles', 'Categoria', 'Cluster']
    
    # Agregar descripción en español si existe
    if 'Descripcion_Español' in cluster_data.columns:
        available_cols.insert(2, 'Descripcion_Español')
    
    # Agregar columnas de métricas si existen
    if 'Ingresos_Total' in cluster_data.columns:
        available_cols.append('Ingresos_Total')
    if 'Cantidad_Total' in cluster_data.columns:
        available_cols.append('Cantidad_Total')
    if 'Precio_Promedio' in cluster_data.columns:
        available_cols.append('Precio_Promedio')
    
    for cluster_id in cluster_data['Cluster'].unique():
        cluster_products = cluster_data[cluster_data['Cluster'] == cluster_id][
            available_cols
        ].to_dict('records')
        clusters_detail[int(cluster_id)] = cluster_products
    
    return jsonify({
        'summary': cluster_summary.to_dict('records'),
        'clusters': clusters_detail,
        'total_clusters': len(cluster_data['Cluster'].unique())
    })

@app.route('/api/clusters/products')
def get_cluster_products():
    """Obtiene productos agrupados por cluster"""
    global cluster_data
    
    if cluster_data is None:
        load_model()
    
    if cluster_data is None:
        return jsonify({'error': 'No hay datos de clusters disponibles.'}), 404
    
    cluster_id = request.args.get('cluster', type=int)
    
    if cluster_id is not None:
        products = cluster_data[cluster_data['Cluster'] == cluster_id]
    else:
        products = cluster_data
    
    return jsonify(products.to_dict('records'))

@app.route('/api/clusters/clients')
def get_clients_clusters():
    """Obtiene información de los clusters de clientes"""
    global cluster_clients_data
    
    if cluster_clients_data is None:
        load_model()
    
    if cluster_clients_data is None:
        return jsonify({'error': 'No hay datos de clusters de clientes disponibles. Ejecuta train_model.py primero.'}), 404
    
    # Agrupar por cluster
    # Usar IDCliente para contar si existe, sino usar cualquier columna
    count_col = 'IDCliente' if 'IDCliente' in cluster_clients_data.columns else cluster_clients_data.columns[0]
    
    cluster_summary = cluster_clients_data.groupby('Cluster').agg({
        count_col: 'count',
        'Ingresos_Total': 'sum' if 'Ingresos_Total' in cluster_clients_data.columns else lambda x: 0,
        'Num_Transacciones': 'sum' if 'Num_Transacciones' in cluster_clients_data.columns else lambda x: 0
    }).reset_index()
    
    cluster_summary.columns = ['Cluster', 'Num_Clientes', 'Ingresos_Total', 'Num_Transacciones']
    
    # Obtener clientes por cluster
    clusters_detail = {}
    available_cols = ['IDCliente', 'Cluster']
    
    # Agregar columnas de métricas si existen
    if 'Ingresos_Total' in cluster_clients_data.columns:
        available_cols.append('Ingresos_Total')
    if 'Num_Transacciones' in cluster_clients_data.columns:
        available_cols.append('Num_Transacciones')
    if 'Cantidad_Total' in cluster_clients_data.columns:
        available_cols.append('Cantidad_Total')
    if 'Productos_Unicos' in cluster_clients_data.columns:
        available_cols.append('Productos_Unicos')
    if 'Frecuencia_Compra' in cluster_clients_data.columns:
        available_cols.append('Frecuencia_Compra')
    if 'Valor_Promedio_Transaccion' in cluster_clients_data.columns:
        available_cols.append('Valor_Promedio_Transaccion')
    
    for cluster_id in cluster_clients_data['Cluster'].unique():
        cluster_clients = cluster_clients_data[cluster_clients_data['Cluster'] == cluster_id][
            available_cols
        ].to_dict('records')
        clusters_detail[int(cluster_id)] = cluster_clients
    
    return jsonify({
        'summary': cluster_summary.to_dict('records'),
        'clusters': clusters_detail,
        'total_clusters': len(cluster_clients_data['Cluster'].unique())
    })

@app.route('/api/clients/list')
def get_clients_list():
    """Obtiene lista de clientes únicos"""
    global df_processed
    
    if df_processed is None:
        load_and_preprocess_data()
    
    clients = df_processed.groupby('IDCliente').agg({
        'Ingresos': 'sum',
        'Cantidad': 'sum',
        'NumeroFactura': 'nunique'
    }).reset_index()
    
    clients.columns = ['IDCliente', 'Ingresos_Total', 'Cantidad_Total', 'Num_Compras']
    clients = clients.sort_values('Ingresos_Total', ascending=False)
    
    return jsonify(clients.to_dict('records'))

@app.route('/api/predict/client', methods=['POST'])
def predict_client():
    """Predice el comportamiento futuro de un cliente"""
    global model, df_processed
    
    if model is None:
        load_model()
    
    if model is None:
        return jsonify({'error': 'Modelo no disponible. Ejecuta train_model.py primero.'}), 500
    
    if df_processed is None:
        load_and_preprocess_data()
    
    data = request.json
    client_id = data.get('client_id', '')
    
    if not client_id:
        return jsonify({'error': 'ID de cliente requerido'}), 400
    
    # Obtener historial del cliente
    client_history = df_processed[df_processed['IDCliente'] == int(client_id)]
    
    if len(client_history) == 0:
        return jsonify({'error': 'Cliente no encontrado'}), 404
    
    # Calcular métricas del cliente
    client_metrics = {
        'total_compras': len(client_history),
        'ingresos_totales': float(client_history['Ingresos'].sum()),
        'cantidad_total': int(client_history['Cantidad'].sum()),
        'productos_unicos': client_history['CodigoStock'].nunique(),
        'categorias_unicas': client_history['Categoria'].nunique(),
        'precio_promedio': float(client_history['PrecioUnitario'].mean()),
        'ingreso_promedio': float(client_history['Ingresos'].mean())
    }
    
    # Predecir ingresos futuros (usando promedio histórico)
    # Obtener mes y día actual
    now = datetime.now()
    mes = now.month
    dia_semana = now.weekday()
    hora = now.hour
    
    # Usar promedio de cantidad y precio del cliente
    cantidad_promedio = float(client_history['Cantidad'].mean())
    precio_promedio = float(client_history['PrecioUnitario'].mean())
    
    # Obtener categoría más común del cliente
    categoria_mas_comun = client_history['Categoria'].mode()[0] if len(client_history['Categoria'].mode()) > 0 else client_history['Categoria'].iloc[0]
    
    if categoria_mas_comun in label_encoders.get('Categoria', {}).classes_:
        categoria_encoded = label_encoders['Categoria'].transform([categoria_mas_comun])[0]
    else:
        categoria_encoded = 0
    
    # Preparar características para predicción
    features = np.array([[cantidad_promedio, precio_promedio, categoria_encoded, mes, dia_semana, hora]])
    
    # Predecir
    prediccion_ingresos = model.predict(features)[0]
    
    # Calcular proyección mensual
    proyeccion_mensual = prediccion_ingresos * 30
    
    return jsonify({
        'client_id': int(client_id),
        'metricas': client_metrics,
        'prediccion_ingresos_diarios': float(prediccion_ingresos),
        'proyeccion_mensual': float(proyeccion_mensual),
        'categoria_preferida': categoria_mas_comun
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predice los ingresos para un producto"""
    global model, label_encoders, df_processed
    
    if model is None:
        load_model()
    
    if model is None:
        return jsonify({'error': 'Modelo no disponible. Ejecuta train_model.py primero.'}), 500
    
    if df_processed is None:
        load_and_preprocess_data()
    
    data = request.json
    
    # Obtener valores del request
    producto = data.get('producto', '')
    categoria = data.get('categoria', '')
    cantidad = float(data.get('cantidad', 1))
    precio_unitario = float(data.get('precio_unitario', 0))
    
    # Si no se proporciona precio, buscar el promedio del producto (por inglés o español)
    if precio_unitario == 0 and producto:
        producto_data = df_processed[
            (df_processed['Descripcion_Ingles'] == producto) | 
            (df_processed['Descripcion_Español'] == producto)
        ]
        if len(producto_data) > 0:
            precio_unitario = float(producto_data['PrecioUnitario'].mean())
        else:
            # Si no se encuentra el producto, usar precio promedio general
            precio_unitario = float(df_processed['PrecioUnitario'].mean())
    
    # Si no se proporciona categoría, buscar del producto (por inglés o español)
    if not categoria and producto:
        producto_data = df_processed[
            (df_processed['Descripcion_Ingles'] == producto) | 
            (df_processed['Descripcion_Español'] == producto)
        ]
        if len(producto_data) > 0:
            categoria = producto_data['Categoria'].iloc[0]
    
    # Codificar categoría
    if categoria in label_encoders['Categoria'].classes_:
        categoria_encoded = label_encoders['Categoria'].transform([categoria])[0]
    else:
        categoria_encoded = 0
    
    # Obtener mes y día actual
    now = datetime.now()
    mes = now.month
    dia_semana = now.weekday()
    hora = now.hour
    
    # Preparar características para predicción
    features = np.array([[cantidad, precio_unitario, categoria_encoded, mes, dia_semana, hora]])
    
    # Predecir
    prediccion = model.predict(features)[0]
    
    # Calcular ingresos esperados
    ingresos_esperados = cantidad * precio_unitario
    
    # Calcular margen de rentabilidad (basado en predicción vs esperado)
    if ingresos_esperados > 0:
        rentabilidad_score = (prediccion / ingresos_esperados) * 100
    else:
        rentabilidad_score = 0
    
    return jsonify({
        'prediccion_ingresos': float(prediccion),
        'ingresos_esperados': float(ingresos_esperados),
        'rentabilidad_score': float(rentabilidad_score),
        'cantidad': cantidad,
        'precio_unitario': precio_unitario,
        'categoria': categoria,
        'producto': producto
    })

if __name__ == '__main__':
    print("Inicializando aplicación...")
    load_and_preprocess_data()
    load_model()
    
    if model is None:
        print("\n⚠️  ADVERTENCIA: Modelo no encontrado.")
        print("   Ejecuta: python train_model.py --n-clusters 5 --cluster-type rentabilidad")
        print("   para entrenar el modelo primero.\n")
    
    print("Aplicación lista!")
    print("Accede a: http://localhost:5000")
    app.run(debug=True, port=5000)

