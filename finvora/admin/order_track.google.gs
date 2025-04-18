function doGet(e) {
  const orderId = e.parameter.orderId;
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  const header = data[0];
  const row = data.find(row => row[0] === orderId);
  
  if (!row) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Order not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const response = {
    orderId: row[0],
    status: row[1],
    currentStatus: row[2],
    lastUpdated: row[3],
    destination: row[4],
    estimatedDelivery: row[5]
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}