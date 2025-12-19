// Configuración de la API de Google Sheets

const CONFIG = {
    // ID de tu Google Spreadsheet (extraído de la URL)
    SPREADSHEET_ID: '1jXas1wp_n6oC_14GDT49hWnxj5YIU43SEOe4OuhHXmw',
    
    // API Key de Google Cloud Console
    // 1. Ve a https://console.cloud.google.com
    // 2. Crea un proyecto o selecciona uno existente
    // 3. Habilita "Google Sheets API"
    // 4. Ve a Credenciales > Crear credenciales > Clave de API
    API_KEY: 'AIzaSyCbIoYunAuKAu2d1D3UlkTrbHZLHUObWyk',
    
    // URL del Web App de Google Apps Script (para escritura)
    // 1. Abre tu spreadsheet
    // 2. Extensiones > Apps Script
    // 3. Pega el código de google-script.js
    // 4. Implementar > Nueva implementación > Aplicación web
    // 5. Copia la URL que te da
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz33j2iYFcOhavqLPQ3FO9gy3-hxbKJeCoEZgGrr-iY7XoI8OhFjQ4fkJ7ULsJoeKKK/exec',
    
    // Nombre de la hoja en el spreadsheet
    SHEET_NAME: 'Trades'
};
