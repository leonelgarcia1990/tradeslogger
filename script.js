// Variables globales
const form = document.getElementById('tradeForm');
const tradesContainer = document.getElementById('tradesContainer');
const refreshBtn = document.getElementById('refreshBtn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const logoutBtn = document.getElementById('logoutBtn');

// Configuración de la API de Google Sheets
const SPREADSHEET_ID = CONFIG.SPREADSHEET_ID;
const SHEET_NAME = CONFIG.SHEET_NAME || 'Trades';

// Variable para almacenar el token de acceso
let accessToken = null;
let userEmail = null;

// URLs de la API
const getReadUrl = () => `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}`;
const getAppendUrl = () => `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`;

// Manejar la respuesta de Google Sign-In
function handleCredentialResponse(response) {
    // Decodificar el JWT para obtener información del usuario
    const userInfo = parseJwt(response.credential);
    
    // Validar que el email esté autorizado (opcional)
    if (CONFIG.ALLOWED_EMAILS && CONFIG.ALLOWED_EMAILS.length > 0) {
        if (!CONFIG.ALLOWED_EMAILS.includes(userInfo.email)) {
            showError('No tienes autorización para acceder a esta aplicación');
            return;
        }
    }
    
    // Obtener el access token usando Google Identity Services
    google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        callback: (tokenResponse) => {
            accessToken = tokenResponse.access_token;
            userEmail = userInfo.email;
            
            // Guardar en sessionStorage
            sessionStorage.setItem('accessToken', accessToken);
            sessionStorage.setItem('userEmail', userEmail);
            sessionStorage.setItem('userName', userInfo.name);
            sessionStorage.setItem('userPhoto', userInfo.picture);
            
            showApp(userInfo);
        }
    }).requestAccessToken();
}

// Función para decodificar JWT
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
}

// Mostrar la aplicación después del login
function showApp(userInfo) {
    loginScreen.style.display = 'none';
    mainApp.style.display = 'block';
    
    // Mostrar información del usuario
    document.getElementById('userName').textContent = userInfo.name;
    document.getElementById('userPhoto').src = userInfo.picture;
    
    // Establecer la fecha actual por defecto
    document.getElementById('fecha').valueAsDate = new Date();
    
    // Cargar trades existentes
    loadTrades();
    
    // Event listeners
    form.addEventListener('submit', handleSubmit);
    refreshBtn.addEventListener('click', loadTrades);
    logoutBtn.addEventListener('click', handleLogout);
}

// Manejar cierre de sesión
function handleLogout() {
    // Limpiar datos
    accessToken = null;
    userEmail = null;
    sessionStorage.clear();
    
    // Revocar el token
    google.accounts.id.disableAutoSelect();
    
    // Mostrar pantalla de login
    mainApp.style.display = 'none';
    loginScreen.style.display = 'flex';
    
    // Recargar la página para limpiar el estado
    setTimeout(() => location.reload(), 100);
}

// Verificar sesión existente al cargar
document.addEventListener('DOMContentLoaded', () => {
    const savedToken = sessionStorage.getItem('accessToken');
    const savedEmail = sessionStorage.getItem('userEmail');
    const savedName = sessionStorage.getItem('userName');
    const savedPhoto = sessionStorage.getItem('userPhoto');
    
    if (savedToken && savedEmail) {
        accessToken = savedToken;
        userEmail = savedEmail;
        
        showApp({
            email: savedEmail,
            name: savedName,
            picture: savedPhoto
        });
    }
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
        
        const values = [
            tradeData.fecha,
            tradeData.simbolo,
            tradeData.tipo,
            tradeData.cantidad,
            tradeData.precio,
            total.toFixed(2),
            tradeData.notas,
            new Date().toISOString()
        ];
        
        const success = await appendToSheet(values);
        
        if (success) {
            showSuccess('Trade guardado correctamente');
            form.reset();
            document.getElementById('fecha').valueAsDate = new Date();
            
            setTimeout(() => loadTrades(), 1000);
        }
    } catch (error) {
        showError('Error al guardar el trade: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Agregar datos al Google Sheet con OAuth
async function appendToSheet(values) {
    if (!accessToken) {
        throw new Error('No hay sesión activa');
    }
    
    const response = await fetch(getAppendUrl(), {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            values: [values]
        })
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            // Token expirado
            handleLogout();
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error('Error al guardar en Google Sheets');
    }
    
    return true;
}

// Cargar trades desde Google Sheets
async function loadTrades() {
    if (!accessToken) {
        showError('No hay sesión activa');
        return;
    }
    
    try {
        showLoading(true);
        hideError();
        
        const response = await fetch(getReadUrl(), {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
                throw new Error('Sesión expirada');
            }
            throw new Error('Error al cargar datos del Google Sheet');
        }
        
        const data = await response.json();
        
        if (!data.values || data.values.length <= 1) {
            showEmptyState();
            return;
        }
        
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
