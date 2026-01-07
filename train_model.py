"""
Script de entrenamiento del modelo de predicción y clustering
Permite entrenar el modelo de ML y crear clusters por productos, rentabilidad y cantidad
"""

import pandas as pd
import numpy as np
import joblib
import os
import argparse
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.cluster import KMeans
import warnings
warnings.filterwarnings('ignore')

# Rutas
DATA_PATH = 'SUPERMERCADO_500_000_ESPAÑOL.csv'
MODELS_DIR = 'models'
MODEL_PATH = os.path.join(MODELS_DIR, 'model_rentabilidad.pkl')
CLUSTER_MODEL_PATH = os.path.join(MODELS_DIR, 'model_clusters.pkl')
CLUSTER_CLIENTS_MODEL_PATH = os.path.join(MODELS_DIR, 'model_clusters_clientes.pkl')
LABEL_ENCODER_PATH = os.path.join(MODELS_DIR, 'label_encoders.pkl')
SCALER_PATH = os.path.join(MODELS_DIR, 'scaler.pkl')
SCALER_CLIENTS_PATH = os.path.join(MODELS_DIR, 'scaler_clientes.pkl')

def load_and_preprocess_data():
    """Carga y preprocesa los datos"""
    print("Cargando datos...")
    df = pd.read_csv(DATA_PATH, encoding='utf-8')
    
    # Calcular ingresos (rentabilidad)
    df['Ingresos'] = df['Cantidad'] * df['PrecioUnitario']
    
    # Convertir fecha
    df['Fecha'] = pd.to_datetime(df['Fecha'], format='%d/%m/%Y', errors='coerce')
    df['Mes'] = df['Fecha'].dt.month
    df['DiaSemana'] = df['Fecha'].dt.dayofweek
    
    # Codificar categorías
    label_encoders = {}
    label_encoders['Categoria'] = LabelEncoder()
    df['Categoria_Encoded'] = label_encoders['Categoria'].fit_transform(df['Categoria'])
    
    print(f"Datos cargados: {len(df)} registros")
    return df, label_encoders

def train_prediction_model(df, label_encoders):
    """Entrena el modelo de predicción de rentabilidad"""
    print("\n=== Entrenando Modelo de Predicción ===")
    
    # Preparar características
    features = ['Cantidad', 'PrecioUnitario', 'Categoria_Encoded', 'Mes', 'DiaSemana', 'Hora_24h']
    X = df[features].fillna(0)
    y = df['Ingresos']
    
    # Dividir datos
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Entrenar modelo
    print("Entrenando Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1, verbose=1)
    model.fit(X_train, y_train)
    
    # Evaluar
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    print(f"R² Score (Train): {train_score:.4f}")
    print(f"R² Score (Test): {test_score:.4f}")
    
    return model

def create_clusters(df, n_clusters=5, cluster_type='rentabilidad'):
    """
    Crea clusters según el tipo especificado
    
    Args:
        df: DataFrame con los datos
        n_clusters: Número de clusters a crear
        cluster_type: Tipo de clustering
            - 'productos': Agrupa productos similares
            - 'rentabilidad': Agrupa por nivel de rentabilidad
            - 'cantidad': Agrupa por cantidad vendida
            - 'clientes': Agrupa clientes por comportamiento de compra
    """
    print(f"\n=== Creando Clusters ({cluster_type}) ===")
    print(f"Número de clusters: {n_clusters}")
    
    # Preparar datos según el tipo de clustering
    if cluster_type == 'productos':
        # Agrupar por producto y calcular métricas
        product_data = df.groupby(['CodigoStock', 'Descripcion_Ingles', 'Descripcion_Español', 'Categoria']).agg({
            'Ingresos': ['sum', 'mean'],
            'Cantidad': ['sum', 'mean'],
            'PrecioUnitario': 'mean',
            'IDCliente': 'nunique'
        }).reset_index()
        
        product_data.columns = ['CodigoStock', 'Descripcion_Ingles', 'Descripcion_Español', 'Categoria', 
                               'Ingresos_Total', 'Ingresos_Promedio', 
                               'Cantidad_Total', 'Cantidad_Promedio', 
                               'Precio_Promedio', 'Clientes_Unicos']
        
        # Características para clustering
        features_for_clustering = ['Ingresos_Total', 'Ingresos_Promedio', 
                                  'Cantidad_Total', 'Cantidad_Promedio', 
                                  'Precio_Promedio', 'Clientes_Unicos']
        
        X_cluster = product_data[features_for_clustering].fillna(0)
        # Reemplazar infinitos con valores finitos
        X_cluster = X_cluster.replace([np.inf, -np.inf], 0)
        product_data['Producto'] = product_data['Descripcion_Ingles']
        
    elif cluster_type == 'rentabilidad':
        # Agrupar por producto y calcular rentabilidad
        product_data = df.groupby(['CodigoStock', 'Descripcion_Ingles', 'Descripcion_Español', 'Categoria']).agg({
            'Ingresos': ['sum', 'mean', 'std'],
            'Cantidad': 'sum',
            'PrecioUnitario': 'mean'
        }).reset_index()
        
        product_data.columns = ['CodigoStock', 'Descripcion_Ingles', 'Descripcion_Español', 'Categoria',
                               'Ingresos_Total', 'Ingresos_Promedio', 'Ingresos_Std',
                               'Cantidad_Total', 'Precio_Promedio']
        
        # Calcular métricas de rentabilidad
        product_data['Rentabilidad_Total'] = product_data['Ingresos_Total']
        product_data['Rentabilidad_Promedio'] = product_data['Ingresos_Promedio']
        product_data['Rentabilidad_Estabilidad'] = product_data['Ingresos_Std'].fillna(0)
        
        # Calcular ROI con protección contra división por cero
        denominator = product_data['Cantidad_Total'] * product_data['Precio_Promedio']
        # Evitar división por cero usando np.where
        product_data['ROI'] = np.where(
            denominator != 0,
            product_data['Ingresos_Total'] / denominator,
            0
        )
        # Reemplazar cualquier infinito o NaN que pueda quedar
        product_data['ROI'] = product_data['ROI'].replace([np.inf, -np.inf], 0).fillna(0)
        
        features_for_clustering = ['Rentabilidad_Total', 'Rentabilidad_Promedio', 
                                  'Rentabilidad_Estabilidad', 'ROI']
        
        X_cluster = product_data[features_for_clustering].fillna(0)
        
        # Reemplazar infinitos con valores finitos
        X_cluster = X_cluster.replace([np.inf, -np.inf], 0)
        product_data['Producto'] = product_data['Descripcion_Ingles']
        
    elif cluster_type == 'cantidad':
        # Agrupar por producto y cantidad
        product_data = df.groupby(['CodigoStock', 'Descripcion_Ingles', 'Descripcion_Español', 'Categoria']).agg({
            'Cantidad': ['sum', 'mean', 'std', 'max'],
            'Ingresos': 'sum',
            'PrecioUnitario': 'mean'
        }).reset_index()
        
        product_data.columns = ['CodigoStock', 'Descripcion_Ingles', 'Descripcion_Español', 'Categoria',
                               'Cantidad_Total', 'Cantidad_Promedio', 
                               'Cantidad_Std', 'Cantidad_Max',
                               'Ingresos_Total', 'Precio_Promedio']
        
        features_for_clustering = ['Cantidad_Total', 'Cantidad_Promedio', 
                                  'Cantidad_Std', 'Cantidad_Max']
        
        X_cluster = product_data[features_for_clustering].fillna(0)
        # Reemplazar infinitos con valores finitos
        X_cluster = X_cluster.replace([np.inf, -np.inf], 0)
        product_data['Producto'] = product_data['Descripcion_Ingles']
    
    elif cluster_type == 'clientes':
        # Agrupar por cliente y calcular métricas de comportamiento
        client_data = df.groupby('IDCliente').agg({
            'Ingresos': ['sum', 'mean', 'count'],
            'Cantidad': ['sum', 'mean'],
            'PrecioUnitario': 'mean',
            'CodigoStock': 'nunique',
            'Categoria': 'nunique',
            'Fecha': ['min', 'max']
        }).reset_index()
        
        client_data.columns = ['IDCliente', 'Ingresos_Total', 'Ingresos_Promedio', 'Num_Transacciones',
                              'Cantidad_Total', 'Cantidad_Promedio', 'Precio_Promedio',
                              'Productos_Unicos', 'Categorias_Unicas', 'Primera_Compra', 'Ultima_Compra']
        
        # Calcular días desde primera compra
        client_data['Primera_Compra'] = pd.to_datetime(client_data['Primera_Compra'])
        client_data['Ultima_Compra'] = pd.to_datetime(client_data['Ultima_Compra'])
        client_data['Dias_Activo'] = (client_data['Ultima_Compra'] - client_data['Primera_Compra']).dt.days
        client_data['Dias_Activo'] = client_data['Dias_Activo'].fillna(0)
        
        # Calcular frecuencia de compra
        client_data['Frecuencia_Compra'] = np.where(
            client_data['Dias_Activo'] > 0,
            client_data['Num_Transacciones'] / (client_data['Dias_Activo'] + 1),
            client_data['Num_Transacciones']
        )
        
        # Calcular valor promedio por transacción
        client_data['Valor_Promedio_Transaccion'] = client_data['Ingresos_Total'] / client_data['Num_Transacciones']
        client_data['Valor_Promedio_Transaccion'] = client_data['Valor_Promedio_Transaccion'].fillna(0)
        
        features_for_clustering = ['Ingresos_Total', 'Num_Transacciones', 'Cantidad_Total',
                                  'Productos_Unicos', 'Frecuencia_Compra', 'Valor_Promedio_Transaccion']
        
        X_cluster = client_data[features_for_clustering].fillna(0)
        # Reemplazar infinitos con valores finitos
        X_cluster = X_cluster.replace([np.inf, -np.inf], 0)
        product_data = client_data.copy()
        product_data['Cliente'] = client_data['IDCliente'].astype(str)
    
    else:
        raise ValueError(f"Tipo de clustering no válido: {cluster_type}")
    
    # Validar y limpiar valores infinitos o NaN antes de escalar
    inf_count = np.isinf(X_cluster.values).sum()
    nan_count = np.isnan(X_cluster.values).sum()
    
    if inf_count > 0 or nan_count > 0:
        print(f"Advertencia: Se encontraron {inf_count} valores infinitos y {nan_count} NaN. Reemplazando...")
        X_cluster = X_cluster.replace([np.inf, -np.inf], 0).fillna(0)
    
    # Verificar que todos los valores sean finitos
    X_cluster_array = X_cluster.values
    if not np.all(np.isfinite(X_cluster_array)):
        # Última limpieza
        X_cluster = pd.DataFrame(
            np.nan_to_num(X_cluster_array, nan=0.0, posinf=0.0, neginf=0.0),
            columns=X_cluster.columns,
            index=X_cluster.index
        )
    
    # Verificación final
    assert np.all(np.isfinite(X_cluster.values)), "Error: Aún hay valores no finitos en los datos después de la limpieza"
    
    # Normalizar características
    scaler = StandardScaler()
    X_cluster_scaled = scaler.fit_transform(X_cluster)
    
    # Aplicar KMeans
    print("Aplicando KMeans clustering...")
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10, verbose=1)
    clusters = kmeans.fit_predict(X_cluster_scaled)
    
    product_data['Cluster'] = clusters
    
    # Estadísticas por cluster
    print("\nEstadísticas por Cluster:")
    if cluster_type == 'clientes':
        cluster_stats = product_data.groupby('Cluster').agg({
            'Ingresos_Total': 'sum' if 'Ingresos_Total' in product_data.columns else 'count',
            'Num_Transacciones': 'sum' if 'Num_Transacciones' in product_data.columns else 'count',
            'Cliente': 'count' if 'Cliente' in product_data.columns else 'count'
        })
    else:
        cluster_stats = product_data.groupby('Cluster').agg({
            'Ingresos_Total': 'sum' if 'Ingresos_Total' in product_data.columns else 'count',
            'Cantidad_Total': 'sum' if 'Cantidad_Total' in product_data.columns else 'count',
            'Producto': 'count' if 'Producto' in product_data.columns else 'count'
        })
    print(cluster_stats)
    
    return kmeans, scaler, product_data

def save_models(model, kmeans, scaler, label_encoders, cluster_type, kmeans_clients=None, scaler_clients=None):
    """Guarda todos los modelos entrenados"""
    # Crear directorio si no existe
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # Guardar modelo de predicción
    joblib.dump(model, MODEL_PATH)
    print(f"\nModelo de predicción guardado en: {MODEL_PATH}")
    
    # Guardar modelo de clustering de productos
    if kmeans is not None:
        cluster_info = {
            'kmeans': kmeans,
            'cluster_type': cluster_type,
            'n_clusters': kmeans.n_clusters
        }
        joblib.dump(cluster_info, CLUSTER_MODEL_PATH)
        print(f"Modelo de clustering de productos guardado en: {CLUSTER_MODEL_PATH}")
        
        # Guardar scaler de productos
        if scaler is not None:
            joblib.dump(scaler, SCALER_PATH)
            print(f"Scaler de productos guardado en: {SCALER_PATH}")
    
    # Guardar modelo de clustering de clientes
    if kmeans_clients is not None:
        cluster_clients_info = {
            'kmeans': kmeans_clients,
            'cluster_type': 'clientes',
            'n_clusters': kmeans_clients.n_clusters
        }
        joblib.dump(cluster_clients_info, CLUSTER_CLIENTS_MODEL_PATH)
        print(f"Modelo de clustering de clientes guardado en: {CLUSTER_CLIENTS_MODEL_PATH}")
        
        # Guardar scaler de clientes
        if scaler_clients is not None:
            joblib.dump(scaler_clients, SCALER_CLIENTS_PATH)
            print(f"Scaler de clientes guardado en: {SCALER_CLIENTS_PATH}")
    
    # Guardar label encoders
    joblib.dump(label_encoders, LABEL_ENCODER_PATH)
    print(f"Label encoders guardados en: {LABEL_ENCODER_PATH}")

def main():
    parser = argparse.ArgumentParser(description='Entrena modelo de predicción y clustering')
    parser.add_argument('--n-clusters', type=int, default=5, 
                       help='Número de clusters de productos a crear (default: 5)')
    parser.add_argument('--n-clusters-clientes', type=int, default=None,
                       help='Número de clusters de clientes a crear (default: mismo que productos)')
    parser.add_argument('--cluster-type', type=str, default='rentabilidad',
                       choices=['productos', 'rentabilidad', 'cantidad', 'clientes'],
                       help='Tipo de clustering para productos (default: rentabilidad)')
    parser.add_argument('--skip-prediction', action='store_true',
                       help='Saltar entrenamiento del modelo de predicción')
    parser.add_argument('--skip-clustering', action='store_true',
                       help='Saltar entrenamiento del clustering')
    parser.add_argument('--skip-clustering-productos', action='store_true',
                       help='Saltar clustering de productos (solo crear clusters de clientes)')
    parser.add_argument('--skip-clustering-clientes', action='store_true',
                       help='Saltar clustering de clientes (solo crear clusters de productos)')
    
    args = parser.parse_args()
    
    # Si no se especifica número de clusters de clientes, usar el mismo que productos
    if args.n_clusters_clientes is None:
        args.n_clusters_clientes = args.n_clusters
    
    print("=" * 60)
    print("ENTRENAMIENTO DE MODELOS")
    print("=" * 60)
    
    # Cargar y preprocesar datos
    df, label_encoders = load_and_preprocess_data()
    
    model = None
    kmeans = None
    scaler = None
    product_data = None
    
    # Entrenar modelo de predicción
    if not args.skip_prediction:
        model = train_prediction_model(df, label_encoders)
    
    # Crear clusters de productos
    kmeans = None
    scaler = None
    product_data = None
    kmeans_clients = None
    scaler_clients = None
    clients_data = None
    
    if not args.skip_clustering:
        # Crear clusters de productos
        if not args.skip_clustering_productos and args.cluster_type != 'clientes':
            print("\n" + "=" * 60)
            print(f"CREANDO CLUSTERS DE PRODUCTOS ({args.cluster_type})")
            print(f"Número de clusters: {args.n_clusters}")
            print("=" * 60)
            kmeans, scaler, product_data = create_clusters(
                df, 
                n_clusters=args.n_clusters, 
                cluster_type=args.cluster_type
            )
            
            # Guardar datos de productos con clusters
            cluster_data_path = os.path.join(MODELS_DIR, 'product_clusters.csv')
            product_data.to_csv(cluster_data_path, index=False, encoding='utf-8')
            print(f"\nDatos de clusters de productos guardados en: {cluster_data_path}")
        
        # Crear clusters de clientes
        if not args.skip_clustering_clientes:
            print("\n" + "=" * 60)
            print("CREANDO CLUSTERS DE CLIENTES")
            print(f"Número de clusters: {args.n_clusters_clientes}")
            print("=" * 60)
            kmeans_clients, scaler_clients, clients_data = create_clusters(
                df,
                n_clusters=args.n_clusters_clientes,
                cluster_type='clientes'
            )
            
            # Guardar datos de clientes con clusters
            clients_cluster_data_path = os.path.join(MODELS_DIR, 'client_clusters.csv')
            clients_data.to_csv(clients_cluster_data_path, index=False, encoding='utf-8')
            print(f"\nDatos de clusters de clientes guardados en: {clients_cluster_data_path}")
    
    # Guardar modelos
    if model is not None or kmeans is not None:
        if model is None:
            # Cargar modelo existente si no se entrenó
            if os.path.exists(MODEL_PATH):
                model = joblib.load(MODEL_PATH)
            else:
                print("Advertencia: No se puede guardar sin modelo de predicción")
                return
        
        if kmeans is None:
            # Cargar modelos existentes si no se entrenaron
            if os.path.exists(CLUSTER_MODEL_PATH):
                cluster_info = joblib.load(CLUSTER_MODEL_PATH)
                kmeans = cluster_info['kmeans']
                args.cluster_type = cluster_info['cluster_type']
            if os.path.exists(SCALER_PATH):
                scaler = joblib.load(SCALER_PATH)
        
        save_models(model, kmeans, scaler, label_encoders, args.cluster_type, kmeans_clients, scaler_clients)
    
    print("\n" + "=" * 60)
    print("ENTRENAMIENTO COMPLETADO")
    print("=" * 60)

if __name__ == '__main__':
    main()

