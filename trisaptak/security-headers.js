// অতিরিক্ত সিকিউরিটি হেডার মিডলওয়্যার
module.exports = function(req, res, next) {
    // XSS প্রোটেকশন
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Clickjacking প্রোটেকশন
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Content Type স্নিফিং প্রোটেকশন
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Referrer পলিসি
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Feature পলিসি
    res.setHeader('Feature-Policy', "microphone 'none'; camera 'none'");
    
    // Permissions পলিসি
    res.setHeader('Permissions-Policy', "geolocation=(), microphone=()");
    
    next();
};
