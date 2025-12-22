// Configuración de la API de Google Sheets

const CONFIG = {
    // Client ID de Google Cloud Console (OAuth 2.0)
    // 1. Ve a https://console.cloud.google.com
    // 2. Credenciales > Crear credenciales > ID de cliente de OAuth 2.0
    // 3. Tipo de aplicación: Aplicación web
    // 4. Orígenes autorizados: http://localhost:8000 (y tu dominio en producción)
    CLIENT_ID: '700022590876-p1si93gcrq36sioa7jk2g122vm8lvidk.apps.googleusercontent.com',
    
    // ID de tu Google Spreadsheet
    SPREADSHEET_ID: '1jXas1wp_n6oC_14GDT49hWnxj5YIU43SEOe4OuhHXmw',
    
    // Nombre de la hoja en el spreadsheet
    SHEET_NAME: 'Trades',
    
    // (Opcional) Lista de emails autorizados
    // Deja vacío [] para permitir cualquier cuenta de Google
    ALLOWED_EMAILS: [
        // 'tu-email@gmail.com',
        // 'otro-email@gmail.com'
    ]
};
