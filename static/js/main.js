// Global state
let productsList = [];
let categoriesList = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadDashboardData();
    loadProductsList();
    loadCategoriesList();
    loadClientsList();
    setupPredictionForm();
    setupClientPredictionForm();
    setupProductSearch();
});

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);

            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target section
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(target).classList.add('active');

            // Load data if needed
            if (target === 'dashboard') {
                loadDashboardData();
            } else if (target === 'productos') {
                loadAllProducts();
            } else if (target === 'clusters') {
                loadClustersData();
            } else if (target === 'clusters-clientes') {
                loadClientsClustersData();
            }
        });
    });
}

// Global variables for PDF export
let dashboardStats = null;
let clustersDataExport = null;
let categoriesData = null;
let topClientsData = null;

// Dashboard Functions
async function loadDashboardData() {
    try {
        // Load stats
        const statsResponse = await fetch('/api/dashboard/stats');
        const stats = await statsResponse.json();
        dashboardStats = stats;
        updateStats(stats);

        // Load top products
        const productsResponse = await fetch('/api/dashboard/top-products');
        const products = await productsResponse.json();
        updateTopProductsTable(products);

        // Load category stats
        const categoriesResponse = await fetch('/api/dashboard/categories');
        const categories = await categoriesResponse.json();
        categoriesData = categories;
        createCategoryChart(categories);

        // Load top clients data
        const clientsResponse = await fetch('/api/dashboard/top-clients');
        const clients = await clientsResponse.json();
        topClientsData = clients;
        createClientsChart(clients);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateStats(stats) {
    document.getElementById('total-ventas').textContent = formatCurrency(stats.total_ventas);
    document.getElementById('productos-unicos').textContent = stats.productos_unicos.toLocaleString();
    document.getElementById('total-transacciones').textContent = stats.total_transacciones.toLocaleString();
    document.getElementById('ingreso-promedio').textContent = formatCurrency(stats.ingreso_promedio);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function updateTopProductsTable(products) {
    const tbody = document.getElementById('table-products-body');
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay datos disponibles</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.CodigoStock}</td>
            <td>${product.Descripcion_Ingles || '-'}</td>
            <td>${product.Descripcion_Español || '-'}</td>
            <td>${product.Categoria}</td>
            <td>${formatCurrency(product.Ingresos)}</td>
            <td>${product.Cantidad.toLocaleString()}</td>
            <td>${formatCurrency(product.PrecioUnitario)}</td>
        `;
        tbody.appendChild(row);
    });
}

function createCategoryChart(categories) {
    const data = [{
        x: categories.map(c => c.Categoria),
        y: categories.map(c => c.Ingresos),
        type: 'bar',
        marker: {
            color: categories.map((_, i) => {
                const colors = ['#0EA5E9', '#3B82F6', '#06B6D4', '#38BDF8', '#22D3EE', '#7DD3FC', '#60A5FA', '#0C4A6E'];
                return colors[i % colors.length];
            })
        }
    }];

    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#1E293B' },
        xaxis: { 
            title: 'Categoría',
            tickangle: -45,
            gridcolor: '#E2E8F0'
        },
        yaxis: { 
            title: 'Ingresos ($)',
            tickformat: '$,.0f',
            gridcolor: '#E2E8F0'
        },
        margin: { l: 60, r: 20, t: 20, b: 100 },
        showlegend: false
    };

    Plotly.newPlot('chart-categories', data, layout, { responsive: true });
}

function createClientsChart(clients) {
    if (!clients || clients.length === 0) {
        document.getElementById('chart-clients').innerHTML = '<div style="text-align: center; padding: 40px; color: #64748B;">No hay datos de clientes disponibles</div>';
        return;
    }

    const data = [{
        x: clients.map(c => `Cliente ${c.IDCliente}`),
        y: clients.map(c => c.Num_Compras),
        type: 'bar',
        marker: {
            color: clients.map((_, i) => {
                const colors = ['#0EA5E9', '#3B82F6', '#06B6D4', '#38BDF8', '#22D3EE', '#7DD3FC', '#60A5FA', '#0C4A6E'];
                return colors[i % colors.length];
            }),
            line: {
                color: '#FFFFFF',
                width: 1
            }
        },
        text: clients.map(c => `${c.Num_Compras} compras`),
        textposition: 'outside',
        customdata: clients.map(c => [
            formatCurrency(c.Ingresos_Total),
            c.Productos_Unicos,
            c.Cantidad_Total
        ]),
        hovertemplate: '<b>%{x}</b><br>' +
                       'Compras: %{y}<br>' +
                       'Ingresos: %{customdata[0]}<br>' +
                       'Productos Únicos: %{customdata[1]}<br>' +
                       'Cantidad Total: %{customdata[2]:,}<extra></extra>'
    }];

    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { 
            color: '#0C4A6E',
            size: 14,
            family: 'Inter, sans-serif'
        },
        xaxis: { 
            title: {
                text: 'Clientes',
                font: { size: 16, color: '#0C4A6E' }
            },
            gridcolor: '#BAE6FD',
            gridwidth: 1,
            showgrid: false,
            tickfont: { size: 10 },
            tickangle: -45
        },
        yaxis: { 
            title: {
                text: 'Número de Compras',
                font: { size: 16, color: '#0C4A6E' }
            },
            gridcolor: '#BAE6FD',
            gridwidth: 1,
            showgrid: true,
            tickfont: { size: 12 }
        },
        margin: { l: 80, r: 40, t: 40, b: 100 },
        showlegend: false,
        hovermode: 'closest',
        hoverlabel: {
            bgcolor: 'rgba(14, 165, 233, 0.9)',
            font: { color: '#FFFFFF', size: 14 }
        }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d']
    };

    Plotly.newPlot('chart-clients', data, layout, config);
}

// Products List
async function loadProductsList() {
    try {
        const response = await fetch('/api/products/list');
        productsList = await response.json();
        populateProductSelect();
    } catch (error) {
        console.error('Error loading products list:', error);
    }
}

async function loadCategoriesList() {
    try {
        const response = await fetch('/api/categories/list');
        categoriesList = await response.json();
        populateCategorySelects();
    } catch (error) {
        console.error('Error loading categories list:', error);
    }
}

// Clients List
let clientsList = [];

async function loadClientsList() {
    try {
        const response = await fetch('/api/clients/list');
        clientsList = await response.json();
        populateClientSelect();
    } catch (error) {
        console.error('Error loading clients list:', error);
    }
}

function populateClientSelect() {
    const select = document.getElementById('client-id-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecciona un cliente...</option>';
    
    clientsList.slice(0, 100).forEach(client => {
        const option = document.createElement('option');
        option.value = client.IDCliente;
        option.textContent = `Cliente ${client.IDCliente} - ${formatCurrency(client.Ingresos_Total)} (${client.Num_Compras} compras)`;
        select.appendChild(option);
    });
}

// Client Prediction Form
function setupClientPredictionForm() {
    const form = document.getElementById('client-prediction-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await predictClient();
    });
}

async function predictClient() {
    const form = document.getElementById('client-prediction-form');
    const formData = new FormData(form);
    
    const clientId = formData.get('client_id');
    
    if (!clientId) {
        alert('Por favor, selecciona un cliente');
        return;
    }
    
    try {
        const response = await fetch('/api/predict/client', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ client_id: clientId })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al realizar la predicción');
        }
        
        const result = await response.json();
        displayClientPredictionResult(result);
    } catch (error) {
        console.error('Error predicting client:', error);
        alert('Error al realizar la predicción: ' + error.message);
    }
}

function displayClientPredictionResult(result) {
    const resultDiv = document.getElementById('client-prediction-result');
    resultDiv.classList.remove('hidden');
    
    document.getElementById('client-prediccion-diarios').textContent = formatCurrency(result.prediccion_ingresos_diarios);
    document.getElementById('client-proyeccion-mensual').textContent = formatCurrency(result.proyeccion_mensual);
    document.getElementById('client-ingresos-totales').textContent = formatCurrency(result.metricas.ingresos_totales);
    
    document.getElementById('detail-client-id').textContent = result.client_id;
    document.getElementById('detail-total-compras').textContent = result.metricas.total_compras;
    document.getElementById('detail-cantidad-total').textContent = result.metricas.cantidad_total.toLocaleString();
    document.getElementById('detail-productos-unicos').textContent = result.metricas.productos_unicos;
    document.getElementById('detail-categorias-unicas').textContent = result.metricas.categorias_unicas;
    document.getElementById('detail-categoria-preferida').textContent = result.categoria_preferida;
    
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Clients Clusters Functions
let clientsClustersData = null;

async function loadClientsClustersData() {
    try {
        const response = await fetch('/api/clusters/clients');
        if (!response.ok) {
            throw new Error('No hay datos de clusters de clientes disponibles');
        }
        clientsClustersData = await response.json();
        displayClientsClustersSummary(clientsClustersData);
        displayClientsClustersChart(clientsClustersData);
        displayClientsClustersTable(clientsClustersData);
        setupClientClusterFilter(clientsClustersData);
    } catch (error) {
        console.error('Error loading clients clusters:', error);
        const summaryDiv = document.getElementById('clients-clusters-summary');
        if (summaryDiv) {
            summaryDiv.innerHTML = `
                <div class="error-message">
                    <p>⚠️ No hay datos de clusters de clientes disponibles.</p>
                    <p>Ejecuta: <code>python train_model.py --n-clusters 5</code></p>
                </div>
            `;
        }
    }
}

function displayClientsClustersSummary(data) {
    const summaryDiv = document.getElementById('clients-clusters-summary');
    if (!summaryDiv) return;
    
    if (!data.summary || data.summary.length === 0) {
        summaryDiv.innerHTML = '<div class="loading">No hay datos de clusters</div>';
        return;
    }
    
    const cards = data.summary.map(cluster => `
        <div class="cluster-card" data-cluster-id="${cluster.Cluster}">
            <div class="cluster-header">
                <h3>Cluster ${cluster.Cluster}</h3>
                <span class="cluster-badge">${cluster.Num_Clientes} clientes</span>
            </div>
            <div class="cluster-stats">
                <div class="cluster-stat">
                    <span class="stat-label">Ingresos</span>
                    <span class="stat-value">${formatCurrency(cluster.Ingresos_Total || 0)}</span>
                </div>
                <div class="cluster-stat">
                    <span class="stat-label">Transacciones</span>
                    <span class="stat-value">${cluster.Num_Transacciones?.toLocaleString() || 0}</span>
                </div>
            </div>
            <button class="btn-view-products" onclick="showClientClusterClients(${cluster.Cluster})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Ver Clientes
            </button>
        </div>
    `).join('');
    
    summaryDiv.innerHTML = `
        <div class="clusters-grid">
            ${cards}
        </div>
    `;
}

function displayClientsClustersChart(data) {
    if (!data.summary || data.summary.length === 0) return;
    
    const chartData = [{
        x: data.summary.map(c => `Cluster ${c.Cluster}`),
        y: data.summary.map(c => c.Num_Clientes),
        type: 'bar',
        marker: {
            color: data.summary.map((_, i) => {
                const colors = ['#0EA5E9', '#3B82F6', '#06B6D4', '#38BDF8', '#22D3EE', '#7DD3FC', '#60A5FA', '#0C4A6E'];
                return colors[i % colors.length];
            })
        }
    }];
    
    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#1E293B' },
        xaxis: { title: 'Cluster', gridcolor: '#E2E8F0' },
        yaxis: { title: 'Número de Clientes', gridcolor: '#E2E8F0' },
        margin: { l: 60, r: 20, t: 20, b: 60 },
        showlegend: false
    };
    
    const chartDiv = document.getElementById('chart-clients-clusters');
    if (chartDiv) {
        Plotly.newPlot('chart-clients-clusters', chartData, layout, { responsive: true });
    }
}

function displayClientsClustersTable(data) {
    const tbody = document.getElementById('table-clients-clusters-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (!data.clusters || Object.keys(data.clusters).length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay datos disponibles</td></tr>';
        return;
    }
    
    let allClients = [];
    Object.keys(data.clusters).forEach(clusterId => {
        data.clusters[clusterId].forEach(client => {
            allClients.push({
                ...client,
                Cluster: clusterId
            });
        });
    });
    
    allClients.forEach(client => {
        const row = document.createElement('tr');
        row.dataset.cluster = client.Cluster;
        row.innerHTML = `
            <td><span class="cluster-badge">${client.Cluster}</span></td>
            <td>${client.IDCliente}</td>
            <td>${client.Ingresos_Total ? formatCurrency(client.Ingresos_Total) : '-'}</td>
            <td>${client.Num_Transacciones ? client.Num_Transacciones.toLocaleString() : '-'}</td>
            <td>${client.Cantidad_Total ? client.Cantidad_Total.toLocaleString() : '-'}</td>
            <td>${client.Productos_Unicos || '-'}</td>
            <td>${client.Frecuencia_Compra ? client.Frecuencia_Compra.toFixed(2) : '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

function setupClientClusterFilter(data) {
    const filterSelect = document.getElementById('client-cluster-filter');
    if (!filterSelect) return;
    
    filterSelect.innerHTML = '<option value="">Todos los clusters</option>';
    
    if (data.summary) {
        data.summary.forEach(cluster => {
            const option = document.createElement('option');
            option.value = cluster.Cluster;
            option.textContent = `Cluster ${cluster.Cluster} (${cluster.Num_Clientes} clientes)`;
            filterSelect.appendChild(option);
        });
    }
    
    filterSelect.addEventListener('change', (e) => {
        const selectedCluster = e.target.value;
        const rows = document.querySelectorAll('#table-clients-clusters-body tr');
        
        rows.forEach(row => {
            if (!selectedCluster || row.dataset.cluster === selectedCluster) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

function showClientClusterClients(clusterId) {
    if (!clientsClustersData) return;
    
    const clusterClients = clientsClustersData.clusters[clusterId] || [];
    
    const modal = document.createElement('div');
    modal.className = 'cluster-products-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Clientes del Cluster ${clusterId}</h2>
                <button class="modal-close" onclick="this.closest('.cluster-products-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="sort-controls">
                    <label>Ordenar por:</label>
                    <select id="sort-client-cluster" onchange="sortClientClusterClients(${clusterId})">
                        <option value="id">ID Cliente</option>
                        <option value="ingresos-desc">Más Ingresos</option>
                        <option value="ingresos-asc">Menos Ingresos</option>
                        <option value="transacciones-desc">Más Transacciones</option>
                        <option value="transacciones-asc">Menos Transacciones</option>
                    </select>
                </div>
                <div class="table-container">
                    <table class="cluster-products-table">
                        <thead>
                            <tr>
                                <th>ID Cliente</th>
                                <th>Ingresos Totales</th>
                                <th>Transacciones</th>
                                <th>Cantidad Total</th>
                                <th>Productos Únicos</th>
                                <th>Frecuencia</th>
                            </tr>
                        </thead>
                        <tbody id="client-cluster-tbody">
                            ${clusterClients.map(c => `
                                <tr>
                                    <td>${c.IDCliente}</td>
                                    <td>${c.Ingresos_Total ? formatCurrency(c.Ingresos_Total) : '-'}</td>
                                    <td>${c.Num_Transacciones ? c.Num_Transacciones.toLocaleString() : '-'}</td>
                                    <td>${c.Cantidad_Total ? c.Cantidad_Total.toLocaleString() : '-'}</td>
                                    <td>${c.Productos_Unicos || '-'}</td>
                                    <td>${c.Frecuencia_Compra ? c.Frecuencia_Compra.toFixed(2) : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.dataset.clients = JSON.stringify(clusterClients);
}

function sortClientClusterClients(clusterId) {
    const modal = document.querySelector('.cluster-products-modal');
    if (!modal) return;
    
    const sortSelect = document.getElementById('sort-client-cluster');
    const sortValue = sortSelect.value;
    const clients = JSON.parse(modal.dataset.clients);
    const tbody = document.getElementById('client-cluster-tbody');
    
    let sortedClients = [...clients];
    
    switch(sortValue) {
        case 'ingresos-desc':
            sortedClients.sort((a, b) => (b.Ingresos_Total || 0) - (a.Ingresos_Total || 0));
            break;
        case 'ingresos-asc':
            sortedClients.sort((a, b) => (a.Ingresos_Total || 0) - (b.Ingresos_Total || 0));
            break;
        case 'transacciones-desc':
            sortedClients.sort((a, b) => (b.Num_Transacciones || 0) - (a.Num_Transacciones || 0));
            break;
        case 'transacciones-asc':
            sortedClients.sort((a, b) => (a.Num_Transacciones || 0) - (b.Num_Transacciones || 0));
            break;
        case 'id':
        default:
            sortedClients.sort((a, b) => a.IDCliente - b.IDCliente);
            break;
    }
    
    tbody.innerHTML = sortedClients.map(c => `
        <tr>
            <td>${c.IDCliente}</td>
            <td>${c.Ingresos_Total ? formatCurrency(c.Ingresos_Total) : '-'}</td>
            <td>${c.Num_Transacciones ? c.Num_Transacciones.toLocaleString() : '-'}</td>
            <td>${c.Cantidad_Total ? c.Cantidad_Total.toLocaleString() : '-'}</td>
            <td>${c.Productos_Unicos || '-'}</td>
            <td>${c.Frecuencia_Compra ? c.Frecuencia_Compra.toFixed(2) : '-'}</td>
        </tr>
    `).join('');
}

function exportClientsClustersPDF() {
    if (!window.jspdf) {
        alert('Error: jsPDF no está cargado. Por favor, recarga la página.');
        return;
    }
    
    if (!clientsClustersData) {
        alert('No hay datos de clusters de clientes disponibles');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // PORTADA
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, 297, 210, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    doc.text('Analytics Pro', 148, 80, { align: 'center' });
    doc.setFontSize(24);
    doc.setFont('helvetica', 'normal');
    doc.text('Reporte de Clusters de Clientes', 148, 100, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 148, 130, { align: 'center' });
    doc.text('Análisis de Agrupación de Clientes', 148, 145, { align: 'center' });
    
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');
    doc.setFontSize(24);
    doc.setTextColor(14, 165, 233);
    doc.text('Reporte de Clusters de Clientes', 20, 20);
    
    let yPos = 40;
    
    // Resumen
    doc.setFontSize(16);
    doc.setTextColor(12, 74, 110);
    doc.text('Resumen de Clusters', 20, yPos);
    yPos += 10;
    
    const summaryData = clientsClustersData.summary.map(c => [
        `Cluster ${c.Cluster}`,
        c.Num_Clientes,
        formatCurrency(c.Ingresos_Total || 0),
        (c.Num_Transacciones || 0).toLocaleString()
    ]);
    
    doc.autoTable({
        startY: yPos,
        head: [['Cluster', 'Número de Clientes', 'Ingresos Totales', 'Transacciones']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [14, 165, 233] },
        styles: { fontSize: 10 }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Clientes por Cluster
    Object.keys(clientsClustersData.clusters).forEach((clusterId) => {
        if (yPos > 180) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(12, 74, 110);
        doc.text(`Cluster ${clusterId} - Clientes`, 20, yPos);
        yPos += 10;
        
        const clients = clientsClustersData.clusters[clusterId];
        const clientsData = clients.map(c => [
            c.IDCliente || '-',
            c.Ingresos_Total ? formatCurrency(c.Ingresos_Total) : '-',
            c.Num_Transacciones ? c.Num_Transacciones.toLocaleString() : '-',
            c.Cantidad_Total ? c.Cantidad_Total.toLocaleString() : '-',
            c.Productos_Unicos || '-',
            c.Frecuencia_Compra ? c.Frecuencia_Compra.toFixed(2) : '-'
        ]);
        
        doc.autoTable({
            startY: yPos,
            head: [['ID Cliente', 'Ingresos Totales', 'Transacciones', 'Cantidad Total', 'Productos Únicos', 'Frecuencia']],
            body: clientsData,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 7 },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 40 },
                2: { cellWidth: 30 },
                3: { cellWidth: 30 },
                4: { cellWidth: 30 },
                5: { cellWidth: 30 }
            }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
    });
    
    doc.save('clusters-clientes-reporte.pdf');
}

function populateProductSelect() {
    const select = document.getElementById('producto-select');
    select.innerHTML = '<option value="">Selecciona un producto...</option>';
    
    productsList.forEach(product => {
        const option = document.createElement('option');
        option.value = product.Descripcion_Ingles;
        const displayText = product.Descripcion_Español 
            ? `${product.Descripcion_Ingles} / ${product.Descripcion_Español}`
            : product.Descripcion_Ingles;
        option.textContent = displayText;
        option.dataset.categoria = product.Categoria;
        option.dataset.espanol = product.Descripcion_Español || '';
        select.appendChild(option);
    });
}

function populateCategorySelects() {
    const selects = [
        document.getElementById('categoria-select'),
        document.getElementById('category-filter')
    ];

    selects.forEach(select => {
        if (!select) return;
        select.innerHTML = select.id === 'category-filter' 
            ? '<option value="">Todas las categorías</option>'
            : '<option value="">Selecciona una categoría...</option>';
        
        categoriesList.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    });
}

// Prediction Form
function setupPredictionForm() {
    const form = document.getElementById('prediction-form');
    const productSelect = document.getElementById('producto-select');
    const categorySelect = document.getElementById('categoria-select');

    // Auto-fill category when product is selected
    productSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        if (selectedOption.dataset.categoria) {
            categorySelect.value = selectedOption.dataset.categoria;
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await predictRevenue();
    });
}

async function predictRevenue() {
    const form = document.getElementById('prediction-form');
    const formData = new FormData(form);
    
    const data = {
        producto: formData.get('producto'),
        categoria: formData.get('categoria'),
        cantidad: parseFloat(formData.get('cantidad')) || 1,
        precio_unitario: parseFloat(formData.get('precio_unitario')) || 0
    };

    try {
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        displayPredictionResult(result);
    } catch (error) {
        console.error('Error predicting revenue:', error);
        alert('Error al realizar la predicción. Por favor, intenta de nuevo.');
    }
}

function displayPredictionResult(result) {
    const resultDiv = document.getElementById('prediction-result');
    resultDiv.classList.remove('hidden');

    document.getElementById('prediccion-ingresos').textContent = formatCurrency(result.prediccion_ingresos);
    document.getElementById('ingresos-esperados').textContent = formatCurrency(result.ingresos_esperados);
    document.getElementById('rentabilidad-score').textContent = `${result.rentabilidad_score.toFixed(1)}%`;
    
    document.getElementById('detail-producto').textContent = result.producto || '-';
    document.getElementById('detail-categoria').textContent = result.categoria || '-';
    document.getElementById('detail-cantidad').textContent = result.cantidad;
    document.getElementById('detail-precio').textContent = formatCurrency(result.precio_unitario);

    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// All Products Section
async function loadAllProducts() {
    try {
        const response = await fetch('/api/products/list');
        const products = await response.json();
        displayAllProducts(products);
    } catch (error) {
        console.error('Error loading all products:', error);
    }
}

function displayAllProducts(products) {
    const tbody = document.getElementById('table-all-products-body');
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No hay productos disponibles</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.CodigoStock}</td>
            <td>${product.Descripcion_Ingles || '-'}</td>
            <td>${product.Descripcion_Español || '-'}</td>
            <td>${product.Categoria}</td>
            <td>
                <button class="btn-predict" onclick="predictFromProduct('${product.Descripcion_Ingles}', '${product.Categoria}')">
                    Predecir
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function predictFromProduct(producto, categoria) {
    // Switch to prediction tab
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === '#prediccion') {
            link.click();
        }
    });

    // Fill form
    document.getElementById('producto-select').value = producto;
    document.getElementById('categoria-select').value = categoria;

    // Trigger change event
    document.getElementById('producto-select').dispatchEvent(new Event('change'));
}

// Search and Filter
function setupProductSearch() {
    const searchInput = document.getElementById('product-search');
    const categoryFilter = document.getElementById('category-filter');

    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;

    const tbody = document.getElementById('table-all-products-body');
    const rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
        const productoIngles = row.cells[1]?.textContent.toLowerCase() || '';
        const productoEspanol = row.cells[2]?.textContent.toLowerCase() || '';
        const categoria = row.cells[3]?.textContent || '';

        const matchesSearch = productoIngles.includes(searchTerm) || productoEspanol.includes(searchTerm);
        const matchesCategory = !categoryFilter || categoria === categoryFilter;

        row.style.display = (matchesSearch && matchesCategory) ? '' : 'none';
    });
}

// Clusters Functions
let clustersData = null;

async function loadClustersData() {
    try {
        const response = await fetch('/api/clusters');
        if (!response.ok) {
            throw new Error('No hay datos de clusters disponibles');
        }
        clustersData = await response.json();
        clustersDataExport = clustersData;
        displayClustersSummary(clustersData);
        displayClustersChart(clustersData);
        displayClustersTable(clustersData);
        setupClusterFilter(clustersData);
    } catch (error) {
        console.error('Error loading clusters:', error);
        const summaryDiv = document.getElementById('clusters-summary');
        summaryDiv.innerHTML = `
            <div class="error-message">
                <p>⚠️ No hay datos de clusters disponibles.</p>
                <p>Ejecuta: <code>python train_model.py --n-clusters 5 --cluster-type rentabilidad</code></p>
            </div>
        `;
    }
}

function displayClustersSummary(data) {
    const summaryDiv = document.getElementById('clusters-summary');
    
    if (!data.summary || data.summary.length === 0) {
        summaryDiv.innerHTML = '<div class="loading">No hay datos de clusters</div>';
        return;
    }
    
    const cards = data.summary.map(cluster => `
        <div class="cluster-card" data-cluster-id="${cluster.Cluster}">
            <div class="cluster-header">
                <h3>Cluster ${cluster.Cluster}</h3>
                <span class="cluster-badge">${cluster.Num_Productos} productos</span>
            </div>
            <div class="cluster-stats">
                <div class="cluster-stat">
                    <span class="stat-label">Ingresos</span>
                    <span class="stat-value">${formatCurrency(cluster.Ingresos_Total || 0)}</span>
                </div>
                <div class="cluster-stat">
                    <span class="stat-label">Cantidad</span>
                    <span class="stat-value">${cluster.Cantidad_Total?.toLocaleString() || 0}</span>
                </div>
            </div>
            <button class="btn-view-products" onclick="showClusterProducts(${cluster.Cluster})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Ver Productos
            </button>
        </div>
    `).join('');
    
    summaryDiv.innerHTML = `
        <div class="clusters-grid">
            ${cards}
        </div>
    `;
}

function displayClustersChart(data) {
    if (!data.summary || data.summary.length === 0) return;
    
    const chartData = [{
        x: data.summary.map(c => `Cluster ${c.Cluster}`),
        y: data.summary.map(c => c.Num_Productos),
        type: 'bar',
        marker: {
            color: data.summary.map((_, i) => {
                const colors = ['#1E40AF', '#DC2626', '#2563EB', '#B91C1C', '#3B82F6', '#EF4444', '#60A5FA', '#F87171'];
                return colors[i % colors.length];
            })
        }
    }];
    
    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#1E293B' },
        xaxis: { title: 'Cluster', gridcolor: '#E2E8F0' },
        yaxis: { title: 'Número de Productos', gridcolor: '#E2E8F0' },
        margin: { l: 60, r: 20, t: 20, b: 60 },
        showlegend: false
    };
    
    Plotly.newPlot('chart-clusters', chartData, layout, { responsive: true });
}

// Variable global para almacenar todos los productos de clusters
let allClusterProducts = [];

function displayClustersTable(data) {
    const tbody = document.getElementById('table-clusters-body');
    tbody.innerHTML = '';
    
    if (!data.clusters || Object.keys(data.clusters).length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay datos disponibles</td></tr>';
        return;
    }
    
    // Combinar todos los productos de todos los clusters
    allClusterProducts = [];
    Object.keys(data.clusters).forEach(clusterId => {
        data.clusters[clusterId].forEach(product => {
            allClusterProducts.push({
                ...product,
                Cluster: clusterId
            });
        });
    });
    
    renderClusterProductsTable(allClusterProducts);
}

function renderClusterProductsTable(products) {
    const tbody = document.getElementById('table-clusters-body');
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay productos para mostrar</td></tr>';
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.dataset.cluster = product.Cluster;
        row.innerHTML = `
            <td><span class="cluster-badge">${product.Cluster}</span></td>
            <td>${product.CodigoStock}</td>
            <td>${product.Descripcion_Ingles || '-'}</td>
            <td>${product.Descripcion_Español || '-'}</td>
            <td>${product.Categoria}</td>
            <td>${product.Ingresos_Total ? formatCurrency(product.Ingresos_Total) : '-'}</td>
            <td>${product.Cantidad_Total ? product.Cantidad_Total.toLocaleString() : '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

function showClusterProducts(clusterId) {
    // Filtrar productos del cluster seleccionado
    const clusterProducts = allClusterProducts.filter(p => p.Cluster == clusterId);
    
    // Crear modal o actualizar tabla
    const modal = document.createElement('div');
    modal.className = 'cluster-products-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Productos del Cluster ${clusterId}</h2>
                <button class="modal-close" onclick="this.closest('.cluster-products-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="sort-controls">
                    <label>Ordenar por:</label>
                    <select id="sort-cluster-products" onchange="sortClusterProducts(${clusterId})">
                        <option value="nombre">Nombre</option>
                        <option value="ingresos-desc">Más Ingresos</option>
                        <option value="ingresos-asc">Menos Ingresos</option>
                        <option value="cantidad-desc">Más Vendidos</option>
                        <option value="cantidad-asc">Menos Vendidos</option>
                    </select>
                </div>
                <div class="table-container">
                    <table class="cluster-products-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Producto (Inglés)</th>
                                <th>Producto (Español)</th>
                                <th>Categoría</th>
                                <th>Ingresos</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody id="cluster-products-tbody">
                            ${clusterProducts.map(p => `
                                <tr>
                                    <td>${p.CodigoStock}</td>
                                    <td>${p.Descripcion_Ingles || '-'}</td>
                                    <td>${p.Descripcion_Español || '-'}</td>
                                    <td>${p.Categoria}</td>
                                    <td>${p.Ingresos_Total ? formatCurrency(p.Ingresos_Total) : '-'}</td>
                                    <td>${p.Cantidad_Total ? p.Cantidad_Total.toLocaleString() : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Guardar productos del cluster en el modal para ordenamiento
    modal.dataset.products = JSON.stringify(clusterProducts);
}

function sortClusterProducts(clusterId) {
    const modal = document.querySelector('.cluster-products-modal');
    if (!modal) return;
    
    const sortSelect = document.getElementById('sort-cluster-products');
    const sortValue = sortSelect.value;
    const products = JSON.parse(modal.dataset.products);
    const tbody = document.getElementById('cluster-products-tbody');
    
    let sortedProducts = [...products];
    
    switch(sortValue) {
        case 'ingresos-desc':
            sortedProducts.sort((a, b) => (b.Ingresos_Total || 0) - (a.Ingresos_Total || 0));
            break;
        case 'ingresos-asc':
            sortedProducts.sort((a, b) => (a.Ingresos_Total || 0) - (b.Ingresos_Total || 0));
            break;
        case 'cantidad-desc':
            sortedProducts.sort((a, b) => (b.Cantidad_Total || 0) - (a.Cantidad_Total || 0));
            break;
        case 'cantidad-asc':
            sortedProducts.sort((a, b) => (a.Cantidad_Total || 0) - (b.Cantidad_Total || 0));
            break;
        case 'nombre':
        default:
            sortedProducts.sort((a, b) => {
                const nameA = (a.Descripcion_Español || a.Descripcion_Ingles || '').toLowerCase();
                const nameB = (b.Descripcion_Español || b.Descripcion_Ingles || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
            break;
    }
    
    tbody.innerHTML = sortedProducts.map(p => `
        <tr>
            <td>${p.CodigoStock}</td>
            <td>${p.Descripcion_Ingles || '-'}</td>
            <td>${p.Descripcion_Español || '-'}</td>
            <td>${p.Categoria}</td>
            <td>${p.Ingresos_Total ? formatCurrency(p.Ingresos_Total) : '-'}</td>
            <td>${p.Cantidad_Total ? p.Cantidad_Total.toLocaleString() : '-'}</td>
        </tr>
    `).join('');
}

function setupClusterFilter(data) {
    const filterSelect = document.getElementById('cluster-filter');
    filterSelect.innerHTML = '<option value="">Todos los clusters</option>';
    
    if (data.summary) {
        data.summary.forEach(cluster => {
            const option = document.createElement('option');
            option.value = cluster.Cluster;
            option.textContent = `Cluster ${cluster.Cluster} (${cluster.Num_Productos} productos)`;
            filterSelect.appendChild(option);
        });
    }
    
    filterSelect.addEventListener('change', (e) => {
        const selectedCluster = e.target.value;
        const rows = document.querySelectorAll('#table-clusters-body tr');
        
        rows.forEach(row => {
            if (!selectedCluster || row.dataset.cluster === selectedCluster) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

// Add button style
const style = document.createElement('style');
style.textContent = `
    .btn-predict {
        background: linear-gradient(135deg, #0EA5E9 0%, #3B82F6 50%, #06B6D4 100%);
        color: white;
        border: none;
        padding: 10px 18px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 3px 10px rgba(14, 165, 233, 0.3);
    }
    .btn-predict:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
    }
    .clusters-summary {
        margin-bottom: 30px;
    }
    .clusters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
    }
    .cluster-card {
        background: linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%);
        border: 2px solid var(--border);
        border-left: 5px solid var(--primary);
        border-radius: 16px;
        padding: 24px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 16px var(--shadow);
        position: relative;
        overflow: hidden;
    }
    .cluster-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 5px;
        height: 100%;
        background: linear-gradient(180deg, #0EA5E9 0%, #3B82F6 50%, #06B6D4 100%);
        transition: width 0.3s ease;
    }
    .cluster-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 32px var(--shadow-xl);
        border-color: var(--primary-light);
    }
    .cluster-card:hover::before {
        width: 100%;
        opacity: 0.05;
    }
    .cluster-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }
    .cluster-header h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary);
    }
    .cluster-badge {
        background: linear-gradient(135deg, #0EA5E9 0%, #3B82F6 50%, #06B6D4 100%);
        color: white;
        padding: 6px 14px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
    }
    .cluster-stats {
        display: flex;
        gap: 20px;
        margin-bottom: 16px;
    }
    .cluster-stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .cluster-stat .stat-label {
        font-size: 12px;
        color: var(--text-muted);
    }
    .cluster-stat .stat-value {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
    }
    .btn-view-products {
        width: 100%;
        background: linear-gradient(135deg, #0EA5E9 0%, #3B82F6 50%, #06B6D4 100%);
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s ease;
        margin-top: 12px;
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
    }
    .btn-view-products:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
    }
    .clusters-controls {
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .clusters-controls label {
        color: var(--text-secondary);
        font-size: 14px;
        font-weight: 500;
    }
    .error-message {
        background: #FFF5F5;
        border: 2px solid var(--danger);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
    }
    .error-message p {
        color: var(--text-primary);
        margin-bottom: 8px;
    }
    .error-message code {
        background: #F8FAFC;
        padding: 4px 8px;
        border-radius: 4px;
        color: var(--primary);
        font-family: 'Courier New', monospace;
    }
    .cluster-products-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    }
    .modal-content {
        background: #FFFFFF;
        border-radius: 12px;
        width: 90%;
        max-width: 1000px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .modal-header {
        padding: 24px;
        border-bottom: 2px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, #0EA5E9 0%, #3B82F6 50%, #06B6D4 100%);
        color: white;
        border-radius: 12px 12px 0 0;
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
    }
    .modal-header h2 {
        margin: 0;
        font-size: 24px;
        color: white;
    }
    .modal-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 28px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    .modal-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
    }
    .modal-body {
        padding: 24px;
        overflow-y: auto;
    }
    .sort-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        padding: 16px;
        background: var(--bg-secondary);
        border-radius: 8px;
    }
    .sort-controls label {
        font-weight: 600;
        color: var(--text-primary);
    }
    .cluster-products-table {
        width: 100%;
        border-collapse: collapse;
    }
    .cluster-products-table thead {
        background: linear-gradient(135deg, #0EA5E9 0%, #3B82F6 50%, #06B6D4 100%);
        box-shadow: 0 2px 8px rgba(14, 165, 233, 0.2);
    }
    .cluster-products-table th {
        color: white;
        padding: 12px;
        text-align: left;
        font-weight: 600;
    }
    .cluster-products-table td {
        padding: 12px;
        border-bottom: 1px solid var(--border);
    }
    .cluster-products-table tbody tr:hover {
        background: var(--bg-hover);
    }
`;
document.head.appendChild(style);

// Helper function to get Plotly chart as image
async function getPlotlyChartAsImage(chartId, width = 800, height = 500) {
    return new Promise((resolve, reject) => {
        if (!window.Plotly) {
            reject('Plotly no está cargado');
            return;
        }
        
        const chartElement = document.getElementById(chartId);
        if (!chartElement || !chartElement.data) {
            reject('Gráfico no encontrado');
            return;
        }
        
        Plotly.toImage(chartElement, {
            format: 'png',
            width: width,
            height: height,
            scale: 2
        }).then(function(dataUrl) {
            resolve(dataUrl);
        }).catch(function(err) {
            reject(err);
        });
    });
}

// Export PDF Functions
function exportDashboardPDF() {
    if (!window.jspdf) {
        alert('Error: jsPDF no está cargado. Por favor, recarga la página.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // PORTADA
    // Fondo con gradiente (simulado con rectángulos)
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    doc.text('Analytics Pro', 148, 80, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(24);
    doc.setFont('helvetica', 'normal');
    doc.text('Dashboard de Rentabilidad', 148, 100, { align: 'center' });
    
    // Información
    doc.setFontSize(14);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 148, 130, { align: 'center' });
    doc.text('Sistema de Análisis y Predicción de Rentabilidad', 148, 145, { align: 'center' });
    
    // Agregar nueva página para el contenido
    doc.addPage();
    
    // Título en página de contenido
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');
    doc.setFontSize(24);
    doc.setTextColor(14, 165, 233);
    doc.text('Dashboard de Rentabilidad', 20, 20);
    
    // Fecha
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 20, 30);
    
    let yPos = 40;
    
    // Estadísticas
    if (dashboardStats) {
        doc.setFontSize(16);
        doc.setTextColor(12, 74, 110);
        doc.text('Estadísticas Generales', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const stats = [
            ['Métrica', 'Valor'],
            ['Ingresos Totales', formatCurrency(dashboardStats.total_ventas)],
            ['Productos Únicos', dashboardStats.productos_unicos.toLocaleString()],
            ['Total Transacciones', dashboardStats.total_transacciones.toLocaleString()],
            ['Ingreso Promedio', formatCurrency(dashboardStats.ingreso_promedio)]
        ];
        
        doc.autoTable({
            startY: yPos,
            head: [stats[0]],
            body: stats.slice(1),
            theme: 'striped',
            headStyles: { fillColor: [14, 165, 233] },
            styles: { fontSize: 10 }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
    }
    
    // Top Productos
    doc.setFontSize(16);
    doc.setTextColor(12, 74, 110);
    doc.text('Top 20 Productos Más Rentables', 20, yPos);
    yPos += 10;
    
    fetch('/api/dashboard/top-products')
        .then(res => res.json())
        .then(products => {
            const productsData = products.map(p => [
                p.CodigoStock,
                (p.Descripcion_Ingles || '').substring(0, 40),
                (p.Descripcion_Español || '').substring(0, 40),
                (p.Categoria || '').substring(0, 20),
                formatCurrency(p.Ingresos),
                (p.Cantidad || 0).toLocaleString()
            ]);
            
            doc.autoTable({
                startY: yPos,
                head: [['Código', 'Producto (Inglés)', 'Producto (Español)', 'Categoría', 'Ingresos', 'Cantidad']],
                body: productsData,
                theme: 'striped',
                headStyles: { fillColor: [14, 165, 233] },
                styles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 50 },
                    2: { cellWidth: 50 },
                    3: { cellWidth: 40 },
                    4: { cellWidth: 35 },
                    5: { cellWidth: 30 }
                }
            });
            
            yPos = doc.lastAutoTable.finalY + 15;
            
            // Agregar nueva página si es necesario
            if (yPos > 180) {
                doc.addPage();
                yPos = 20;
            }
            
            // Ingresos por Categoría - Gráfica
            doc.setFontSize(16);
            doc.setTextColor(12, 74, 110);
            doc.text('Ingresos por Categoría', 20, yPos);
            yPos += 10;
            
            // Capturar gráfico de categorías
            getPlotlyChartAsImage('chart-categories', 1000, 600)
                .then(categoryImage => {
                    // Agregar imagen del gráfico
                    doc.addImage(categoryImage, 'PNG', 20, yPos, 257, 80);
                    yPos += 90;
                    
                    // Agregar nueva página si es necesario
                    if (yPos > 180) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    // Ingresos por Categoría (Datos del gráfico)
                    doc.setFontSize(14);
                    doc.setTextColor(12, 74, 110);
                    doc.text('Datos Detallados por Categoría', 20, yPos);
                    yPos += 10;
                    
                    fetch('/api/dashboard/categories')
                        .then(res => res.json())
                        .then(categories => {
                            const categoriesData = categories.map(c => [
                                c.Categoria.substring(0, 30),
                                formatCurrency(c.Ingresos),
                                (c.Cantidad_Vendida || 0).toLocaleString(),
                                (c.Productos_Unicos || 0).toLocaleString()
                            ]);
                            
                            doc.autoTable({
                                startY: yPos,
                                head: [['Categoría', 'Ingresos Totales', 'Cantidad Vendida', 'Productos Únicos']],
                                body: categoriesData,
                                theme: 'striped',
                                headStyles: { fillColor: [59, 130, 246] },
                                styles: { fontSize: 9 },
                                columnStyles: {
                                    0: { cellWidth: 60 },
                                    1: { cellWidth: 45 },
                                    2: { cellWidth: 40 },
                                    3: { cellWidth: 40 }
                                }
                            });
                            
                            yPos = doc.lastAutoTable.finalY + 15;
                            
                            // Agregar nueva página si es necesario
                            if (yPos > 180) {
                                doc.addPage();
                                yPos = 20;
                            }
                            
                            // Top Clientes Más Frecuentes - Gráfica
                            doc.setFontSize(16);
                            doc.setTextColor(12, 74, 110);
                            doc.text('Top 20 Clientes Más Frecuentes', 20, yPos);
                            yPos += 10;
                            
                            // Capturar gráfico de clientes
                            getPlotlyChartAsImage('chart-clients', 1000, 600)
                                .then(clientsImage => {
                                    // Agregar imagen del gráfico
                                    doc.addImage(clientsImage, 'PNG', 20, yPos, 257, 80);
                                    yPos += 90;
                                    
                                    // Agregar nueva página si es necesario
                                    if (yPos > 180) {
                                        doc.addPage();
                                        yPos = 20;
                                    }
                                    
                                    // Top Clientes Más Frecuentes (Datos)
                                    doc.setFontSize(14);
                                    doc.setTextColor(12, 74, 110);
                                    doc.text('Datos Detallados de Clientes', 20, yPos);
                                    yPos += 10;
                                    
                                    fetch('/api/dashboard/top-clients')
                                        .then(res => res.json())
                                        .then(clients => {
                                            const clientsData = clients.map(c => [
                                                c.IDCliente,
                                                formatCurrency(c.Ingresos_Total || 0),
                                                (c.Num_Compras || 0).toLocaleString(),
                                                (c.Cantidad_Total || 0).toLocaleString(),
                                                (c.Productos_Unicos || 0).toLocaleString()
                                            ]);
                                            
                                            doc.autoTable({
                                                startY: yPos,
                                                head: [['ID Cliente', 'Ingresos Totales', 'Número de Compras', 'Cantidad Total', 'Productos Únicos']],
                                                body: clientsData,
                                                theme: 'striped',
                                                headStyles: { fillColor: [6, 182, 212] },
                                                styles: { fontSize: 9 },
                                                columnStyles: {
                                                    0: { cellWidth: 35 },
                                                    1: { cellWidth: 45 },
                                                    2: { cellWidth: 40 },
                                                    3: { cellWidth: 40 },
                                                    4: { cellWidth: 40 }
                                                }
                                            });
                                            
                                            doc.save('dashboard-reporte.pdf');
                                        })
                                        .catch(err => {
                                            console.error('Error:', err);
                                            doc.save('dashboard-reporte.pdf');
                                        });
                                })
                                .catch(err => {
                                    console.error('Error capturando gráfico de clientes:', err);
                                    // Continuar sin la imagen
                                    if (yPos > 180) {
                                        doc.addPage();
                                        yPos = 20;
                                    }
                                    
                                    doc.setFontSize(14);
                                    doc.setTextColor(12, 74, 110);
                                    doc.text('Datos Detallados de Clientes', 20, yPos);
                                    yPos += 10;
                                    
                                    fetch('/api/dashboard/top-clients')
                                        .then(res => res.json())
                                        .then(clients => {
                                            const clientsData = clients.map(c => [
                                                c.IDCliente,
                                                formatCurrency(c.Ingresos_Total || 0),
                                                (c.Num_Compras || 0).toLocaleString(),
                                                (c.Cantidad_Total || 0).toLocaleString(),
                                                (c.Productos_Unicos || 0).toLocaleString()
                                            ]);
                                            
                                            doc.autoTable({
                                                startY: yPos,
                                                head: [['ID Cliente', 'Ingresos Totales', 'Número de Compras', 'Cantidad Total', 'Productos Únicos']],
                                                body: clientsData,
                                                theme: 'striped',
                                                headStyles: { fillColor: [6, 182, 212] },
                                                styles: { fontSize: 9 },
                                                columnStyles: {
                                                    0: { cellWidth: 35 },
                                                    1: { cellWidth: 45 },
                                                    2: { cellWidth: 40 },
                                                    3: { cellWidth: 40 },
                                                    4: { cellWidth: 40 }
                                                }
                                            });
                                            
                                            doc.save('dashboard-reporte.pdf');
                                        })
                                        .catch(err => {
                                            console.error('Error:', err);
                                            doc.save('dashboard-reporte.pdf');
                                        });
                                });
                        })
                        .catch(err => {
                            console.error('Error:', err);
                            doc.save('dashboard-reporte.pdf');
                        });
                })
                .catch(err => {
                    console.error('Error capturando gráfico de categorías:', err);
                    // Continuar sin la imagen
                    if (yPos > 180) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    doc.setFontSize(14);
                    doc.setTextColor(12, 74, 110);
                    doc.text('Datos Detallados por Categoría', 20, yPos);
                    yPos += 10;
                    
                    fetch('/api/dashboard/categories')
                        .then(res => res.json())
                        .then(categories => {
                            const categoriesData = categories.map(c => [
                                c.Categoria.substring(0, 30),
                                formatCurrency(c.Ingresos),
                                (c.Cantidad_Vendida || 0).toLocaleString(),
                                (c.Productos_Unicos || 0).toLocaleString()
                            ]);
                            
                            doc.autoTable({
                                startY: yPos,
                                head: [['Categoría', 'Ingresos Totales', 'Cantidad Vendida', 'Productos Únicos']],
                                body: categoriesData,
                                theme: 'striped',
                                headStyles: { fillColor: [59, 130, 246] },
                                styles: { fontSize: 9 },
                                columnStyles: {
                                    0: { cellWidth: 60 },
                                    1: { cellWidth: 45 },
                                    2: { cellWidth: 40 },
                                    3: { cellWidth: 40 }
                                }
                            });
                            
                            yPos = doc.lastAutoTable.finalY + 15;
                            
                            if (yPos > 180) {
                                doc.addPage();
                                yPos = 20;
                            }
                            
                            doc.setFontSize(16);
                            doc.setTextColor(12, 74, 110);
                            doc.text('Top 20 Clientes Más Frecuentes', 20, yPos);
                            yPos += 10;
                            
                            getPlotlyChartAsImage('chart-clients', 1000, 600)
                                .then(clientsImage => {
                                    doc.addImage(clientsImage, 'PNG', 20, yPos, 257, 80);
                                    yPos += 90;
                                    
                                    if (yPos > 180) {
                                        doc.addPage();
                                        yPos = 20;
                                    }
                                    
                                    doc.setFontSize(14);
                                    doc.setTextColor(12, 74, 110);
                                    doc.text('Datos Detallados de Clientes', 20, yPos);
                                    yPos += 10;
                                    
                                    fetch('/api/dashboard/top-clients')
                                        .then(res => res.json())
                                        .then(clients => {
                                            const clientsData = clients.map(c => [
                                                c.IDCliente,
                                                formatCurrency(c.Ingresos_Total || 0),
                                                (c.Num_Compras || 0).toLocaleString(),
                                                (c.Cantidad_Total || 0).toLocaleString(),
                                                (c.Productos_Unicos || 0).toLocaleString()
                                            ]);
                                            
                                            doc.autoTable({
                                                startY: yPos,
                                                head: [['ID Cliente', 'Ingresos Totales', 'Número de Compras', 'Cantidad Total', 'Productos Únicos']],
                                                body: clientsData,
                                                theme: 'striped',
                                                headStyles: { fillColor: [6, 182, 212] },
                                                styles: { fontSize: 9 },
                                                columnStyles: {
                                                    0: { cellWidth: 35 },
                                                    1: { cellWidth: 45 },
                                                    2: { cellWidth: 40 },
                                                    3: { cellWidth: 40 },
                                                    4: { cellWidth: 40 }
                                                }
                                            });
                                            
                                            doc.save('dashboard-reporte.pdf');
                                        })
                                        .catch(err => {
                                            console.error('Error:', err);
                                            doc.save('dashboard-reporte.pdf');
                                        });
                                })
                                .catch(err => {
                                    console.error('Error capturando gráfico de clientes:', err);
                                    fetch('/api/dashboard/top-clients')
                                        .then(res => res.json())
                                        .then(clients => {
                                            const clientsData = clients.map(c => [
                                                c.IDCliente,
                                                formatCurrency(c.Ingresos_Total || 0),
                                                (c.Num_Compras || 0).toLocaleString(),
                                                (c.Cantidad_Total || 0).toLocaleString(),
                                                (c.Productos_Unicos || 0).toLocaleString()
                                            ]);
                                            
                                            doc.autoTable({
                                                startY: yPos,
                                                head: [['ID Cliente', 'Ingresos Totales', 'Número de Compras', 'Cantidad Total', 'Productos Únicos']],
                                                body: clientsData,
                                                theme: 'striped',
                                                headStyles: { fillColor: [6, 182, 212] },
                                                styles: { fontSize: 9 },
                                                columnStyles: {
                                                    0: { cellWidth: 35 },
                                                    1: { cellWidth: 45 },
                                                    2: { cellWidth: 40 },
                                                    3: { cellWidth: 40 },
                                                    4: { cellWidth: 40 }
                                                }
                                            });
                                            
                                            doc.save('dashboard-reporte.pdf');
                                        })
                                        .catch(err => {
                                            console.error('Error:', err);
                                            doc.save('dashboard-reporte.pdf');
                                        });
                                });
                        })
                        .catch(err => {
                            console.error('Error:', err);
                            doc.save('dashboard-reporte.pdf');
                        });
                });
        })
        .catch(err => {
            console.error('Error:', err);
            alert('Error al generar el PDF');
        });
}

function exportClustersPDF() {
    if (!window.jspdf) {
        alert('Error: jsPDF no está cargado. Por favor, recarga la página.');
        return;
    }
    
    if (!clustersDataExport) {
        alert('No hay datos de clusters disponibles');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // PORTADA
    // Fondo con gradiente (simulado con rectángulos)
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    doc.text('Analytics Pro', 148, 80, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(24);
    doc.setFont('helvetica', 'normal');
    doc.text('Reporte de Clusters', 148, 100, { align: 'center' });
    
    // Información
    doc.setFontSize(14);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 148, 130, { align: 'center' });
    doc.text('Análisis de Agrupación de Productos', 148, 145, { align: 'center' });
    
    // Agregar nueva página para el contenido
    doc.addPage();
    
    // Título en página de contenido
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');
    doc.setFontSize(24);
    doc.setTextColor(14, 165, 233);
    doc.text('Reporte de Clusters', 20, 20);
    
    // Fecha
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 20, 30);
    
    let yPos = 40;
    
    // Resumen de Clusters
    doc.setFontSize(16);
    doc.setTextColor(12, 74, 110);
    doc.text('Resumen de Clusters', 20, yPos);
    yPos += 10;
    
    const summaryData = clustersDataExport.summary.map(c => [
        `Cluster ${c.Cluster}`,
        c.Num_Productos,
        formatCurrency(c.Ingresos_Total || 0),
        (c.Cantidad_Total || 0).toLocaleString()
    ]);
    
    doc.autoTable({
        startY: yPos,
        head: [['Cluster', 'Número de Productos', 'Ingresos Totales', 'Cantidad Total']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [14, 165, 233] },
        styles: { fontSize: 10 }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Productos por Cluster
    Object.keys(clustersDataExport.clusters).forEach((clusterId, index) => {
        if (yPos > 180) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(12, 74, 110);
        doc.text(`Cluster ${clusterId} - Productos`, 20, yPos);
        yPos += 10;
        
        const products = clustersDataExport.clusters[clusterId];
        const productsData = products.map(p => [
            p.CodigoStock || '-',
            (p.Descripcion_Ingles || '').substring(0, 35),
            (p.Descripcion_Español || '').substring(0, 35),
            (p.Categoria || '').substring(0, 25),
            p.Ingresos_Total ? formatCurrency(p.Ingresos_Total) : '-',
            p.Cantidad_Total ? p.Cantidad_Total.toLocaleString() : '-'
        ]);
        
        doc.autoTable({
            startY: yPos,
            head: [['Código', 'Producto (Inglés)', 'Producto (Español)', 'Categoría', 'Ingresos', 'Cantidad']],
            body: productsData,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 7 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 45 },
                2: { cellWidth: 45 },
                3: { cellWidth: 35 },
                4: { cellWidth: 30 },
                5: { cellWidth: 25 }
            }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
    });
    
    doc.save('clusters-reporte.pdf');
}

