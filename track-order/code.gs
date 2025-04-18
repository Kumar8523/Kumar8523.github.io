function doGet(e) {
  const orderId = e.parameter.orderId;
  
  try {
    // Open Google Sheet (replace with your Sheet ID)
    const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('Orders');
    const data = sheet.getDataRange().getValues();
    
    // Find order in the sheet (assuming order ID is in first column)
    const headers = data[0];
    const orderRow = data.slice(1).find(row => row[0].toString() === orderId);
    
    if (!orderRow) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'Not Found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Create order object
    const order = {};
    headers.forEach((header, index) => {
      order[header] = orderRow[index];
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'Success',
      orderId: order['Order ID'],
      status: order['Status'],
      orderDate: order['Order Date'],
      productName: order['Product Name'],
      quantity: order['Quantity'],
      customerName: order['Customer Name'],
      deliveryAddress: order['Delivery Address']
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'Error',
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}