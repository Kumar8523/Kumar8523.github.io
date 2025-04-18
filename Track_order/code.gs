function doGet(e) {
  const orderId = e.parameter.orderId;
  
  // Open your Google Sheet
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('Orders');
  const data = sheet.getDataRange().getValues();
  
  // Find the order (assuming order ID is in column 1)
  const order = data.find(row => row[0] == orderId);
  
  if (!order) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'Not Found'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Return minimal data
  return ContentService.createTextOutput(JSON.stringify({
    orderId: order[0],
    receivedDate: order[1], // Column with received date
    shippingInfo: order[2], // Column with shipping info
    deliveredDate: order[3] // Column with delivered date (empty if not delivered)
  })).setMimeType(ContentService.MimeType.JSON);
}