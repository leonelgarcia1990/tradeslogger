// Variables globales
const form = document.getElementById('tradeForm');
const tradesContainer = document.getElementById('tradesContainer');
const refreshBtn = document.getElementById('refreshBtn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

// Configuración de la API de Google Sheets
const SPREADSHEET_ID = CONFIG.SPREADSHEET_ID;
const API_KEY = CONFIG.API_KEY;
const SHEET_NAME = CONFIG.SHEET_NAME || 'Trades';

// URLs de la API
const READ_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Establecer la fecha actual por defecto
    document.getElementById('fecha').valueAsDate = new Date();
    
    // Cargar trades existentes
    loadTrades();
    
    // Event listeners
    form.addEventListener('submit', handleSubmit);
    refreshBtn.addEventListener('click', loadTrades);
});

// Manejar el envío del formulario
async function handleSubmit(e) {
    e.preventDefault();
    
    const tradeData = {
        fecha: document.getElementById('fecha').value,
        simbolo: document.getElementById('simbolo').value.toUpperCase(),
        tipo: document.getElementById('tipo').value,
        cantidad: parseFloat(document.getElementById('cantidad').value),
        precio: parseFloat(document.getElementById('precio').value),
        notas: document.getElementById('notas').value
    };
    
    const total = tradeData.cantidad * tradeData.precio;
    
    try {
        showLoading(true);
        hideError();
        
        // Agregar la fila al Google Sheet
        const success = await appendToSheet([
            tradeData.fecha,
            tradeData.simbolo,
            tradeData.tipo,
            tradeData.cantidad,
            tradeData.precio,
            total.toFixed(2),
            tradeData.notas,
            new Date().toISOString()
        ]);
        
        if (success) {
            showSuccess('Trade guardado correctamente');
            form.reset();
            document.getElementById('fecha').valueAsDate = new Date();
            
            // Recargar la lista de trades
            setTimeout(() => loadTrades(), 1000);
        }
    } catch (error) {
        showError('Error al guardar el trade: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Agregar datos al Google Sheet usando Apps Script
async function appendToSheet(values) {
    // Esta función requiere un Web App de Google Apps Script
    // Ver instrucciones en README.md
    
    if (!CONFIG.SCRIPT_URL) {
        throw new Error('No se ha configurado SCRIPT_URL. Ver README.md para instrucciones.');
    }
    
    const response = await fetch(CONFIG.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'append',
            data: values
        })
    });
    
    // Con mode: 'no-cors', no podemos leer la respuesta, pero la solicitud se envía
    return true;
}

// Cargar trades desde Google Sheets
async function loadTrades() {
    try {
        showLoading(true);
        hideError();
        
        const response = await fetch(READ_URL);
        
        if (!response.ok) {
            throw new Error('Error al cargar datos del Google Sheet');
        }
        
        const data = await response.json();
        
        if (!data.values || data.values.length <= 1) {
            showEmptyState();
            return;
        }
        
        // La primera fila son los encabezados
        const headers = data.values[0];
        const rows = data.values.slice(1);
        
        displayTrades(rows);
        
    } catch (error) {
        showError('Error al cargar los trades: ' + error.message);
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

// Mostrar trades en el HTML
function displayTrades(rows) {
    if (rows.length === 0) {
        showEmptyState();
        return;
    }
    
    // Ordenar por fecha (más reciente primero)
    const sortedRows = rows.sort((a, b) => {
        return new Date(b[0]) - new Date(a[0]);
    });
    
    tradesContainer.innerHTML = sortedRows.map(row => {
        const [fecha, simbolo, tipo, cantidad, precio, total, notas] = row;
        const tipoClass = tipo.toLowerCase();
        
        return `
            <div class="trade-card ${tipoClass}">
                <div class="trade-header">
                    <div class="trade-symbol">${simbolo}</div>
                    <div class="trade-type ${tipoClass}">${tipo}</div>
                </div>
                <div class="trade-details">
                    <div class="trade-detail">
                        <span class="trade-detail-label">Fecha:</span>
                        <span class="trade-detail-value">${formatDate(fecha)}</span>
                    </div>
                    <div class="trade-detail">
                        <span class="trade-detail-label">Cantidad:</span>
                        <span class="trade-detail-value">${formatNumber(cantidad)}</span>
                    </div>
                    <div class="trade-detail">
                        <span class="trade-detail-label">Precio:</span>
                        <span class="trade-detail-value">$${formatNumber(precio)}</span>
                    </div>
                    <div class="trade-detail">
                        <span class="trade-detail-label">Total:</span>
                        <span class="trade-detail-value">$${formatNumber(total)}</span>
                    </div>
                </div>
                ${notas ? `<div class="trade-notes">${notas}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Mostrar estado vacío
function showEmptyState() {
    tradesContainer.innerHTML = `
        <div class="empty-state">
            <h3>No hay trades registrados</h3>
            <p>Comienza agregando tu primer trade usando el formulario arriba</p>
        </div>
    `;
}

// Funciones de UI
function showLoading(show) {
    loadingEl.classList.toggle('show', show);
}

function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
}

function hideError() {
    errorEl.classList.remove('show');
}

function showSuccess(message) {
    // Crear y mostrar mensaje de éxito temporal
    const successEl = document.createElement('div');
    successEl.className = 'success';
    successEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #22c55e;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 1000;
    `;
    successEl.textContent = message;
    document.body.appendChild(successEl);
    
    setTimeout(() => {
        successEl.remove();
    }, 3000);
}

// Funciones de formato
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
