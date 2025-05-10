// Google Sheets ID (replace with your actual Sheet ID)
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';
const ORDERS_SHEET = 'Orders';

/**
 * Handles form submission from the website
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.name || !data.phone || !data.email || !data.address) {
      throw new Error('All required fields must be filled');
    }
    
    // Save order to Google Sheets
    const result = saveOrder(data);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Order saved successfully',
      orderId: result.orderId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Saves order data to Google Sheets
 */
function saveOrder(orderData) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(ORDERS_SHEET);
  if (!sheet) throw new Error('Orders sheet not found');
  
  // Generate unique order ID if not provided
  const orderId = orderData.order_id || 'ORD-' + Utilities.getUuid().slice(0, 8).toUpperCase();
  
  // Prepare row data
  const rowData = [
    new Date(), // Timestamp
    orderId,
    orderData.name,
    orderData.phone,
    orderData.email,
    orderData.address,
    orderData.note || '',
    orderData.promo_code || '',
    orderData.items.map(item => `${item.name} (${item.quantity}x)`).join(', '),
    orderData.items.map(item => item.id).join(', '),
    orderData.items.map(item => item.quantity).join(', '),
    orderData.subtotal,
    orderData.delivery_charge,
    orderData.discount || 0,
    orderData.total,
    orderData.payment_method,
    orderData.bkash_number || '',
    orderData.bkash_transaction || '',
    orderData.nagad_number || '',
    orderData.nagad_transaction || '',
    'Pending' // Status
  ];
  
  // Append new row
  sheet.appendRow(rowData);
  
  // Update product stocks (if you have a products sheet)
  updateProductStocks(orderData.items);
  
  return { orderId };
}

/**
 * Updates product stocks after an order
 */
function updateProductStocks(items) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Products');
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf('ID');
  const stockCol = data[0].indexOf('Stock');
  
  if (idCol === -1 || stockCol === -1) return;
  
  items.forEach(item => {
    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol] === item.id) {
        const newStock = parseInt(data[i][stockCol]) - parseInt(item.quantity);
        sheet.getRange(i + 1, stockCol + 1).setValue(Math.max(0, newStock));
        break;
      }
    }
  });
}

/**
 * Helper function to create initial sheets structure
 */
function initializeSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  // Create Orders sheet if not exists
  let sheet = ss.getSheetByName(ORDERS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(ORDERS_SHEET);
    sheet.appendRow([
      'Timestamp', 'Order ID', 'Customer Name', 'Phone', 'Email',
      'Address', 'Note', 'Promo Code', 'Products', 'Product IDs',
      'Quantities', 'Subtotal', 'Delivery Charge', 'Discount',
      'Total', 'Payment Method', 'Bkash Number', 'Bkash Transaction',
      'Nagad Number', 'Nagad Transaction', 'Status'
    ]);
    
    // Format header
    sheet.getRange(1, 1, 1, sheet.getLastColumn())
       .setFontWeight('bold')
       .setBackground('#f0f0f0');
  }
}
