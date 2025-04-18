const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('Reviews');

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const row = [
    data.timestamp,
    data.teacher,
    data.subject,
    data.class,
    data.section,
    data.name,
    data.roll,
    data.rating,
    data.comment,
    data.anonymous
  ];
  sheet.appendRow(row);
  return ContentService.createTextOutput(JSON.stringify({ success: true }));
}

function doGet(e) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Check if stats are requested
  if (e.parameter.stats === 'true') {
    return getStats(data);
  }
  
  // Return regular reviews data
  const reviews = data.slice(1).map(row => ({
    timestamp: row[0],
    teacher: row[1],
    subject: row[2],
    class: row[3],
    section: row[4],
    rating: row[7],
    comment: row[8],
    anonymous: row[9]
  }));
  
  return ContentService.createTextOutput(JSON.stringify(reviews))
    .setMimeType(ContentService.MimeType.JSON);
}

function getStats(data) {
  const reviews = data.slice(1);
  
  // Total reviews
  const totalReviews = reviews.length;
  
  // Average rating
  const avgRating = reviews.reduce((sum, row) => sum + Number(row[7]), 0) / totalReviews;
  
  // Top teacher
  const teacherRatings = {};
  reviews.forEach(row => {
    const teacher = row[1];
    const rating = Number(row[7]);
    if (!teacherRatings[teacher]) {
      teacherRatings[teacher] = { sum: 0, count: 0 };
    }
    teacherRatings[teacher].sum += rating;
    teacherRatings[teacher].count++;
  });
  
  let topTeacher = '';
  let maxAvg = 0;
  for (const [teacher, data] of Object.entries(teacherRatings)) {
    const avg = data.sum / data.count;
    if (avg > maxAvg) {
      maxAvg = avg;
      topTeacher = teacher;
    }
  }
  
  // Class distribution
  const classDistribution = {};
  reviews.forEach(row => {
    const classVal = row[3];
    classDistribution[classVal] = (classDistribution[classVal] || 0) + 1;
  });
  
  return ContentService.createTextOutput(JSON.stringify({
    totalReviews,
    avgRating,
    topTeacher,
    classDistribution
  })).setMimeType(ContentService.MimeType.JSON);
}