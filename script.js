// Variables globales
const form = document.getElementById('tradeForm');
let tradesContainer;
let refreshBtn;
let loadingEl;
let errorEl;
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// Configuración de la API de Google Sheets
const SPREADSHEET_ID = CONFIG.SPREADSHEET_ID;
const API_KEY = CONFIG.API_KEY;
const SCRIPT_URL = CONFIG.SCRIPT_URL;
const SHEET_NAME = CONFIG.SHEET_NAME || 'Trades';

// Variable para el usuario actual
let currentUser = null;

// URLs de la API
const getReadUrl = () => `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

// Mostrar la aplicación después del login
function showApp() {
    loginScreen.style.display = 'none';
    mainApp.style.display = 'block';
    
    // Mostrar nombre del usuario
    document.getElementById('userName').textContent = currentUser.name;
    
    // Establecer la fecha actual por defecto
    document.getElementById('fecha').valueAsDate = new Date();
    
    // No cargar trades automáticamente, solo cuando se vaya a la pestaña correspondiente
}

// Manejar cierre de sesión
function handleLogout() {
    // Limpiar datos
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    
    // Mostrar pantalla de login
    mainApp.style.display = 'none';
    loginScreen.style.display = 'flex';
    
    // Limpiar formularios
    form.reset();
    loginForm.reset();
}

// Verificar sesión existente al cargar
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar elementos del DOM
    tradesContainer = document.getElementById('tradesContainer');
    refreshBtn = document.getElementById('refreshBtn');
    loadingEl = document.getElementById('loading');
    errorEl = document.getElementById('error');
    
    const savedUser = sessionStorage.getItem('currentUser');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
    }
    
    // Event listener para las pestañas
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remover clase active de todos los botones y contenidos
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Agregar clase active al botón y contenido seleccionado
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            // Si se selecciona "Mis Trades", cargar los trades
            if (tabName === 'open-trades') {
                console.log('Cargando trades...');
                loadTrades();
            }
        });
    });
    
    // Event listener para el login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Buscar usuario en la configuración
        const user = CONFIG.USERS.find(u => 
            u.username === username && u.password === password
        );
        
        if (user) {
            // Login exitoso
            currentUser = {
                username: user.username,
                name: user.name
            };
            
            // Guardar sesión
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Mostrar aplicación
            showApp();
            
            // Limpiar formulario
            loginForm.reset();
            loginError.textContent = '';
        } else {
            // Login fallido
            loginError.textContent = '❌ Usuario o contraseña incorrectos';
            document.getElementById('password').value = '';
        }
    });
    
    // Event listeners
    form.addEventListener('submit', handleSubmit);
    refreshBtn.addEventListener('click', loadTrades);
    logoutBtn.addEventListener('click', handleLogout);
});

// Manejar el envío del formulario
async function handleSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showError('Debes iniciar sesión para guardar trades');
        return;
    }
    
    // Obtener el botón de submit
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Prevenir múltiples envíos
    if (submitBtn.disabled) {
        return;
    }
    
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
        // Deshabilitar el botón y cambiar texto
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';
        
        showLoading(true);
        hideError();
        
        const values = [
            tradeData.fecha,
            tradeData.simbolo,
            tradeData.tipo,
            tradeData.cantidad,
            tradeData.precio,
            total.toFixed(2),
            tradeData.notas,
            new Date().toISOString(),
            currentUser.username  // Agregar usuario que creó el trade
        ];
        
        const success = await appendToSheet(values);
        
        if (success) {
            showSuccess('Trade guardado correctamente');
            // Limpiar formulario solo después de confirmar guardado exitoso
            form.reset();
            document.getElementById('fecha').valueAsDate = new Date();
            
            setTimeout(() => loadTrades(), 1000);
        }
    } catch (error) {
        showError('Error al guardar el trade: ' + error.message);
    } finally {
        showLoading(false);
        // Rehabilitar el botón y restaurar texto
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Trade';
    }
}

// Agregar datos al Google Sheet
async function appendToSheet(values) {
    try {
        const response = await fetch(SCRIPT_URL, {
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
        
        return true;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('No se pudo conectar con Google Sheets');
    }
}

// Cargar trades desde Google Sheets
async function loadTrades() {
    console.log('loadTrades llamada');
    console.log('tradesContainer:', tradesContainer);
    console.log('loadingEl:', loadingEl);
    console.log('errorEl:', errorEl);
    
    if (!currentUser) {
        showError('Debes iniciar sesión para ver los trades');
        return;
    }
    
    try {
        showLoading(true);
        hideError();
        
        const url = getReadUrl();
        console.log('Fetching URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error al cargar datos del Google Sheet');
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (!data.values || data.values.length <= 1) {
            console.log('No hay datos o solo hay headers');
            showEmptyState();
            return;
        }
        
        const headers = data.values[0];
        const rows = data.values.slice(1);
        console.log('Número de trades:', rows.length);
        
        displayTrades(rows);
        
    } catch (error) {
        showError('Error al cargar los trades: ' + error.message);
        console.error('Error completo:', error);
    } finally {
        showLoading(false);
    }
}

// Mostrar trades en el HTML
function displayTrades(rows) {
    console.log('displayTrades llamada con:', rows);
    
    if (rows.length === 0) {
        showEmptyState();
        return;
    }
    
    // Ordenar por fecha (más reciente primero)
    const sortedRows = rows.sort((a, b) => {
        return new Date(b[0]) - new Date(a[0]);
    });
    
    console.log('Renderizando trades en:', tradesContainer);
    
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
    
    console.log('HTML generado, trades renderizados');
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
