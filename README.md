# 📊 Trades Logger

Aplicación web simple para registrar y visualizar trades en Google Sheets.

## 🚀 Características

- ✅ Registrar trades con información detallada
- 📊 Visualizar trades en tarjetas organizadas
- 🔄 Sincronización en tiempo real con Google Sheets
- 📱 Diseño responsive para móvil y escritorio
- 🎨 Interfaz moderna y fácil de usar

## 📋 Requisitos Previos

1. Una cuenta de Google
2. Un navegador web moderno
3. Un servidor web local o hosting (puede ser GitHub Pages, Netlify, etc.)

## 🔧 Configuración

### Paso 1: Crear Google Spreadsheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala como quieras (ej: "Trades Logger")
4. Copia el ID del spreadsheet de la URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   ```

### Paso 2: Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Sheets:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Sheets API"
   - Haz clic en "Enable"
4. Crea credenciales (API Key):
   - Ve a "APIs & Services" > "Credentials"
   - Haz clic en "Create Credentials" > "API Key"
   - Copia la API Key generada
   - (Opcional) Restringe la API Key para mayor seguridad

### Paso 3: Hacer público el Google Sheet

Para poder leer los datos desde JavaScript:

1. Abre tu Google Spreadsheet
2. Haz clic en "Compartir" (esquina superior derecha)
3. Cambia el acceso a "Cualquier persona con el enlace"
4. Asegúrate de que el permiso sea "Lector"

### Paso 4: Configurar Google Apps Script (para escribir datos)

1. Abre tu Google Spreadsheet
2. Ve a "Extensiones" > "Apps Script"
3. Borra el código existente y pega el contenido de `google-script.js`
4. Guarda el proyecto (Dale un nombre como "Trades Logger API")
5. Despliega como Web App:
   - Haz clic en "Implementar" > "Nueva implementación"
   - Selecciona "Aplicación web"
   - Descripción: "API para Trades Logger"
   - Ejecutar como: "Yo"
   - Quién tiene acceso: "Cualquier persona"
   - Haz clic en "Implementar"
   - Copia la URL del Web App
   - Autoriza los permisos necesarios

### Paso 5: Configurar la aplicación web

1. Copia `config.example.js` a `config.js`:
   ```bash
   cp config.example.js config.js
   ```

2. Edita `config.js` con tus valores:
   ```javascript
   const CONFIG = {
       SPREADSHEET_ID: 'tu-spreadsheet-id',
       API_KEY: 'tu-api-key',
       SCRIPT_URL: 'tu-script-url',
       SHEET_NAME: 'Trades'
   };
   ```

3. Asegúrate de que `config.js` esté en tu `.gitignore` (para no compartir tus credenciales)

## 🚀 Uso Local

Para probar localmente, necesitas un servidor web. Opciones:

**Opción 1: Python**
```bash
# Python 3
python -m http.server 8000

# Luego abre: http://localhost:8000
```

**Opción 2: Node.js (http-server)**
```bash
npx http-server
```

**Opción 3: VS Code Extension**
- Instala la extensión "Live Server"
- Click derecho en `index.html` > "Open with Live Server"

## 📁 Estructura del Google Sheet

La aplicación creará automáticamente una hoja llamada "Trades" con estas columnas:

| Fecha | Símbolo | Tipo | Cantidad | Precio | Total | Notas | Timestamp |
|-------|---------|------|----------|--------|-------|-------|-----------|

## 🎨 Personalización

- **Colores**: Edita `styles.css` para cambiar el esquema de colores
- **Campos**: Modifica `index.html` y `script.js` para agregar o quitar campos
- **Validaciones**: Agrega validaciones personalizadas en `script.js`

## 🔒 Seguridad

⚠️ **IMPORTANTE**: 
- Nunca compartas tu `config.js` en repositorios públicos
- La API Key debe tener restricciones para evitar uso no autorizado
- Considera usar autenticación OAuth2 para aplicaciones en producción

## 🐛 Solución de Problemas

### No se cargan los trades
- Verifica que el spreadsheet sea público (acceso de lectura)
- Confirma que el SPREADSHEET_ID sea correcto
- Revisa la consola del navegador para errores

### No se guardan los trades
- Verifica que el SCRIPT_URL sea correcto
- Asegúrate de haber autorizado los permisos en Apps Script
- Revisa los logs en Apps Script (Ver > Registros de ejecución)

### Error de CORS
- Recuerda que la escritura usa `mode: 'no-cors'`
- Si el problema persiste, verifica la configuración del Web App

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

---

Hecho con ❤️ para traders