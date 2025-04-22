(async () => {
  // Get Public IP
  const ipData = await fetch("https://api.ipify.org?format=json").then(res => res.json());

  // Geo info (Free API, optional)
  const geo = await fetch(`https://ipapi.co/${ipData.ip}/json/`).then(res => res.json());

  // Browser info
  const data = {
    ip: ipData.ip,
    path: window.location.pathname,
    browser: navigator.userAgent,
    os: navigator.platform,
    screen: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    country: geo.country_name,
    city: geo.city
  };

  // Send to Google Apps Script Web App
  fetch("YOUR_WEB_APP_URL", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });
})();
