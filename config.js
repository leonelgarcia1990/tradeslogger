// Configuración de la API de Google Sheets

const CONFIG = {
    // ID de tu Google Spreadsheet
    SPREADSHEET_ID: '1jXas1wp_n6oC_14GDT49hWnxj5YIU43SEOe4OuhHXmw',
    
    // API Key de Google (para leer el sheet)
    API_KEY: 'AIzaSyCbIoYunAuKAu2d1D3UlkTrbHZLHUObWyk',
    
    // URL del Web App de Google Apps Script (para escribir)
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz33j2iYFcOhavqLPQ3FO9gy3-hxbKJeCoEZgGrr-iY7XoI8OhFjQ4fkJ7ULsJoeKKK/exec',
    
    // Nombre de la hoja en el spreadsheet
    SHEET_NAME: 'Trades',
    
    // ⚠️ IMPORTANTE: Cambia estos usuarios y contraseñas
    // Para mayor seguridad, considera usar un hash de contraseñas
    USERS: [
        {
            username: 'admin',
            password: 'admin123',  // ⚠️ CAMBIA ESTO
            name: 'Administrador'
        },
        {
            username: 'leonel',
            password: 'trader2024',  // ⚠️ CAMBIA ESTO
            name: 'Leonel García'
        }
        // Agrega más usuarios aquí si necesitas
    ]
};
