const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// ===== ১. ব্লক করা পেজ লিস্ট =====
const blockedPages = ['scripts/app.js', 'scripts/contact.js','scripts/main.js','scripts/navbar_footer.js','scripts/product_info.js','scripts/products.js', 'scripts/products.json','scripts/search.js', 'scripts/user.js', 'server.js', 'products/'];

// ===== ২. ব্লক করা IP লিস্ট =====
const blockedIPs = [];


// ===== ৪. মিডলওয়্যার: ব্লক করা IP চেক করো =====
app.use((req, res, next) => {
  const clientIP = req.ip;
  if (blockedIPs.includes(clientIP)) {
    return res.status(403).send('আপনার IP ব্লক করা হয়েছে।');
  }
  next();
});

// ===== ৫. মিডলওয়্যার: নির্দিষ্ট পেজ ব্লক করা =====
app.use((req, res, next) => {
  if (blockedPages.includes(req.path)) {
    return res.status(403).send('এই পেজে আপনার প্রবেশ নিষেধ!');
  }
  next();
});

// ===== ৬. স্ট্যাটিক ফাইল সার্ভ করা (index.html, about.html সহ সব) =====
app.use(express.static(path.join(__dirname, '/')));

// ===== ৭. ডিফল্ট রাউট: না পাওয়া গেলে 404 দেখাও =====
app.use((req, res) => {
  res.status(404).send('পেজ খুঁজে পাওয়া যায়নি!');
});

// ===== ৮. সার্ভার চালু করা =====
app.listen(port, () => {
  console.log(`সার্ভার চলছে http://localhost:${port}`);
});
