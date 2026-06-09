# 🌍 World Explorer

An interactive world map built with [Leaflet.js](https://leafletjs.com/) and D3.js that lets you explore countries around the globe. Click on any country to view its capital, population, area, continent, currency, and GDP.

![Demo Screenshot](/screenshots/demo.png) <!-- Placeholder for future screenshot -->

## ✨ Features

- **Interactive Map** – Zoom in/out with mousewheel; pan by dragging
- **Country Details Panel** – Click any country to see:
  - Capital city
  - Population (formatted as millions/billions)
  - Area (km²)
  - Continent
  - Currency
  - GDP in billions USD
- **Search Functionality** – Type a country name and press Enter or click the magnifying glass to find it
- **Responsive Design** – Works on desktop and mobile
- **Choropleth-style coloring** – Countries are colored by continent for easy visual reference

## 🚀 Live Demo

View the app live: [https://vbrichzin.github.io/world-explorer/](https://vbrichzin.github.io/world-explorer/)

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend Framework | Vanilla JavaScript (ES6+) |
| Map Library | Leaflet.js 1.9.4 |
| Styling | CSS3 with custom variables |
| Icon Set | Font Awesome 6.4.0 |
| Data Source | Natural Earth Vector Data (GeoJSON) |

## 📦 Local Development

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/vbrichzin/world-explorer.git
   cd world-explorer
   ```

2. Open `index.html` in your browser, or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (if npm available)
   npx serve .
   ```

3. Navigate to `http://localhost:8000` in your browser

## 🌐 Deploying to GitHub Pages

This app is configured for GitHub Pages deployment:

1. Go to **Repository Settings → Pages**
2. Under **Source**, select **master branch / root folder**
3. Click **Save**
4. Wait 1–2 minutes for deployment

Your map will be available at `https://<your-username>.github.io/<repository-name>/`

## 📊 Data Source

Country data is sourced from:
- **Natural Earth** – Country boundaries (via [nvkelso/natural-earth-vector](https://github.com/nvkelso/natural-earth-vector))
- **World Bank / UN estimates** – Population, GDP, currency codes

All data is embedded directly in the codebase for fast load times. No external API calls required.

## 📄 License

MIT License – feel free to use, modify, and distribute this project.

---

> Built with ❤️ using vanilla JavaScript & Leaflet.js. No build steps, no dependencies to install—just open and explore!
