# 🔐 Instrucciones para Configurar el Login con Google

## Paso 1: Configurar Google Cloud Console

### 1.1 Habilitar las APIs

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto existente o crea uno nuevo
3. En el menú lateral, ve a **"APIs y servicios" > "Biblioteca"**
4. Busca y habilita:
   - **Google Sheets API**
   - **Google Identity Services** (ya está habilitada por defecto)

### 1.2 Crear credenciales OAuth 2.0

1. Ve a **"APIs y servicios" > "Credenciales"**
2. Click en **"+ CREAR CREDENCIALES"**
3. Selecciona **"ID de cliente de OAuth 2.0"**

4. Si es tu primera vez, te pedirá configurar la pantalla de consentimiento:
   - Click en **"CONFIGURAR PANTALLA DE CONSENTIMIENTO"**
   - Selecciona **"Externo"** (para uso personal)
   - Click en **"CREAR"**
   
5. Completa la información de la pantalla de consentimiento:
   - **Nombre de la aplicación**: Trades Logger
   - **Correo electrónico de asistencia**: tu-email@gmail.com
   - **Dominio de la aplicación**: (opcional)
   - **Correo electrónico del desarrollador**: tu-email@gmail.com
   - Click en **"GUARDAR Y CONTINUAR"**

6. En **"Permisos"**:
   - Click en **"AGREGAR O QUITAR PERMISOS"**
   - Busca: `https://www.googleapis.com/auth/spreadsheets`
   - Selecciónalo y click en **"ACTUALIZAR"**
   - Click en **"GUARDAR Y CONTINUAR"**

7. En **"Usuarios de prueba"** (si dejaste la app en modo Testing):
   - Click en **"+ ADD USERS"**
   - Agrega tu email y los emails que quieras que tengan acceso
   - Click en **"GUARDAR Y CONTINUAR"**

8. Revisa el resumen y click en **"VOLVER AL PANEL"**

### 1.3 Finalizar creación del OAuth Client ID

1. Regresa a **"Credenciales"**
2. Click en **"+ CREAR CREDENCIALES" > "ID de cliente de OAuth 2.0"**
3. Tipo de aplicación: **Aplicación web**
4. Nombre: `Trades Logger Web Client`
5. En **"Orígenes de JavaScript autorizados"**, agrega:
   ```
   http://localhost:8000
   http://127.0.0.1:8000
   ```
   (Y tu dominio en producción si lo tienes)

6. Click en **"CREAR"**
7. **¡IMPORTANTE!** Copia el **Client ID** que aparece (algo como: `123456789-abc.apps.googleusercontent.com`)

## Paso 2: Configurar el archivo config.js

1. Abre el archivo `config.js`
2. Reemplaza `TU_CLIENT_ID_AQUI.apps.googleusercontent.com` con el Client ID que copiaste
3. En `ALLOWED_EMAILS`, agrega los emails que quieres autorizar:
   ```javascript
   ALLOWED_EMAILS: [
       'tu-email@gmail.com',
       'otro-usuario@gmail.com'
   ]
   ```
   O déjalo vacío `[]` para permitir cualquier cuenta de Google

## Paso 3: Actualizar index.html

1. Abre `index.html`
2. Busca la línea:
   ```html
   data-client_id="TU_CLIENT_ID_AQUI"
   ```
3. Reemplaza `TU_CLIENT_ID_AQUI` con tu Client ID (el mismo del config.js)

## Paso 4: Hacer privado tu Google Sheet

Ahora que tienes autenticación OAuth, puedes hacer privado tu Sheet:

1. Abre tu Google Spreadsheet
2. Click en **"Compartir"** (botón arriba a la derecha)
3. Cambia el acceso de "Cualquier persona con el enlace" a **"Restringido"**
4. Asegúrate de que TU cuenta de Google tenga permisos de **"Editor"**
5. Click en **"Listo"**

## Paso 5: Probar la aplicación

1. Inicia un servidor local:
   ```bash
   python3 -m http.server 8000
   ```

2. Abre en tu navegador: `http://localhost:8000`

3. Deberías ver la pantalla de login con el botón de Google

4. Click en **"Sign in with Google"**

5. Selecciona tu cuenta de Google

6. Acepta los permisos (solo la primera vez)

7. ¡Listo! Ya deberías estar dentro de la aplicación

## ⚠️ Importante

### Si la app está en modo "Testing":
- Solo los usuarios que agregaste en "Usuarios de prueba" podrán acceder
- Verás un mensaje de advertencia al hacer login (es normal)
- Click en "Continuar" para proceder

### Para publicar la app:
1. Ve a **"Pantalla de consentimiento de OAuth"**
2. Click en **"PUBLICAR APLICACIÓN"**
3. Google revisará tu app (puede tomar varios días)
4. Mientras tanto, puedes seguir usándola en modo "Testing"

## 🔒 Seguridad

Ventajas de este sistema:
- ✅ Ya NO necesitas el API Key público
- ✅ Tu Google Sheet puede ser completamente privado
- ✅ Solo usuarios autorizados pueden acceder
- ✅ Los tokens OAuth son más seguros
- ✅ Ya NO necesitas Apps Script (puedes eliminar ese código)

## 📝 Notas

- El token de acceso expira después de 1 hora
- La app maneja automáticamente la renovación del token
- Si el token expira, se te pedirá que inicies sesión nuevamente
- Los datos de sesión se guardan en `sessionStorage` (se pierden al cerrar el navegador)

## ❓ Solución de problemas

### Error: "redirect_uri_mismatch"
- Asegúrate de que `http://localhost:8000` esté en "Orígenes de JavaScript autorizados"

### Error: "Invalid client ID"
- Verifica que el Client ID en `config.js` y en `index.html` sea correcto

### Error: "No tienes autorización"
- Verifica que tu email esté en la lista `ALLOWED_EMAILS` en `config.js`
- O deja la lista vacía `[]` para permitir cualquier cuenta

### No aparece el botón de login
- Verifica que el script de Google esté cargando: `https://accounts.google.com/gsi/client`
- Abre la consola del navegador (F12) y busca errores
