// Google Apps Script para escribir en Google Sheets
// Este código debe copiarse en el Google Apps Script de tu spreadsheet

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'append') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName('Trades');
      
      // Si la hoja no existe, crearla con encabezados
      if (!sheet) {
        sheet = ss.insertSheet('Trades');
        sheet.appendRow([
          'Fecha',
          'Símbolo',
          'Tipo',
          'Cantidad',
          'Precio',
          'Total',
          'Notas',
          'Timestamp'
        ]);
        
        // Formatear encabezados
        sheet.getRange(1, 1, 1, 8)
          .setFontWeight('bold')
          .setBackground('#667eea')
          .setFontColor('#ffffff');
      } else {
        // Verificar si la hoja tiene encabezados
        const firstRow = sheet.getRange(1, 1, 1, 1).getValue();
        if (firstRow === '' || firstRow !== 'Fecha') {
          // Insertar encabezados al principio
          sheet.insertRowBefore(1);
          sheet.getRange(1, 1, 1, 8).setValues([[
            'Fecha',
            'Símbolo',
            'Tipo',
            'Cantidad',
            'Precio',
            'Total',
            'Notas',
            'Timestamp'
          ]]);
          
          // Formatear encabezados
          sheet.getRange(1, 1, 1, 8)
            .setFontWeight('bold')
            .setBackground('#667eea')
            .setFontColor('#ffffff');
        }
      }
      
      // Agregar la nueva fila
      sheet.appendRow(data.data);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Service is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Función para configurar manualmente la estructura de la hoja
// Ejecuta esta función desde el editor de Apps Script
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Trades');
  
  // Si la hoja no existe, crearla
  if (!sheet) {
    sheet = ss.insertSheet('Trades');
    Logger.log('Hoja "Trades" creada');
  }
  
  // Verificar si ya tiene encabezados
  const firstCell = sheet.getRange(1, 1).getValue();
  
  if (firstCell === '' || firstCell !== 'Fecha') {
    // Si hay datos, insertar fila al principio
    if (firstCell !== '') {
      sheet.insertRowBefore(1);
      Logger.log('Fila insertada para encabezados');
    }
    
    // Agregar encabezados
    sheet.getRange(1, 1, 1, 8).setValues([[
      'Fecha',
      'Símbolo',
      'Tipo',
      'Cantidad',
      'Precio',
      'Total',
      'Notas',
      'Timestamp'
    ]]);
    
    // Formatear encabezados
    sheet.getRange(1, 1, 1, 8)
      .setFontWeight('bold')
      .setBackground('#667eea')
      .setFontColor('#ffffff');
    
    // Ajustar ancho de columnas
    sheet.autoResizeColumns(1, 8);
    
    Logger.log('Encabezados agregados y formateados');
  } else {
    Logger.log('La hoja ya tiene encabezados');
  }
  
  // Mensaje de confirmación
  SpreadsheetApp.getActiveSpreadsheet().toast('¡Configuración completada!', 'Éxito', 3);
}
