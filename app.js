// World Explorer - Interactive Map Application
let map, geojsonLayer;
const DEFAULT_COLORS = {
    'Europe': '#4A90E2',
    'Asia': '#E74C3C', 
    'Africa': '#F39C12',
    'North America': '#27AE60',
    'South America': '#8E44AD',
    'Oceania': '#16A085',
    'Europe/Asia': '#9B59B6'
};

function getChoroplethColor(value) {
    const colors = ['#F1F3F4', '#D8DEE9', '#BBDEFB', '#64B5F6', '#2196F3', '#1976D2'];
    if (!value || isNaN(value)) return colors[0];
    const normalized = Math.min(9, Math.max(0, value / 1e8));
    return colors[Math.floor(normalized)] || colors[1];
}

function getContinentColor(continent) {
    return DEFAULT_COLORS[continent] || '#95A5A6';
}

function formatPopulation(pop) {
    if (!pop || pop === 0) return '-';
    if (pop >= 1e9) return (pop / 1e9).toFixed(2) + 'B';
    if (pop >= 1e6) return (pop / 1e6).toFixed(1) + 'M';
    if (pop >= 1e3) return (pop / 1e3).toFixed(0) + 'K';
    return pop.toString();
}

function formatArea(area) {
    if (!area || area === 0) return '-';
    if (area >= 1e6) return (area / 1e6).toFixed(1);
    return area.toLocaleString();
}

function showCountryInfo(feature) {
    const name = feature.properties.NAME || feature.properties.name || 'Unknown';
    const data = countryDatabase[name];
    
    if (!data) {
        document.getElementById('countryName').textContent = name;
        document.getElementById('capital').textContent = '-';
        document.getElementById('population').textContent = '-';
        document.getElementById('continent').textContent = '-';
        document.getElementById('area').textContent = '-';
        document.getElementById('currency').textContent = '-';
        document.getElementById('gdp').textContent = '-';
    } else {
        document.getElementById('countryName').innerHTML = `${data.flag || '🏳️'} ${name}`;
        document.getElementById('capital').textContent = data.capital || '-';
        document.getElementById('population').textContent = formatPopulation(data.population);
        document.getElementById('continent').textContent = data.continent || '-';
        document.getElementById('area').textContent = formatArea(data.areaKm2 ? data.areaKm2 : 0) + 'M';
        document.getElementById('currency').textContent = data.currency || '-';
        document.getElementById('gdp').textContent = data.gdpBillionUsd ? '$' + data.gdpBillionUsd.toFixed(1) + 'B' : '-';
    }
    
    document.getElementById('infoPanel').classList.remove('hidden');
}

function hideInfo() {
    document.getElementById('infoPanel').classList.add('hidden');
    if (geojsonLayer) {
        geojsonLayer.eachLayer(layer => {
            layer.setStyle({fillColor: '#E8F4F8', fillOpacity: 0.3});
        });
    }
}

function setSearchStyle(event, style) {
    event.target.setStyle(style); 
}

function highlightFeature(e) {
    const layer = e.target;
    setSearchStyle(e, {fillColor: '#667eea', fillOpacity: 0.8});
    document.getElementById('searchBox').value = layer.feature.properties.NAME || '';
    
    if (!layer.bringToFront) {
        // Leaflet v1 approach
        if (map._layers[leaflet.Util.stamp(layer)]) {
            layer.bringToFront();  
        }
    } else {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    const feature = e.target.feature;
    geojsonLayer.resetStyle(e.target);
    document.getElementById('searchBox').value = '';
}

function onCountryClick(e) {
    showCountryInfo(e.target.feature);
    
    // Zoom to country
    const bounds = e.target.getBounds();
    if (bounds && bounds.isValid()) {
        map.fitBounds(bounds.pad(0.2));
    }
}

async function initMap() {
    try {
        document.getElementById('loading').style.opacity = '0';
        setTimeout(() => { 
            document.getElementById('loading').style.display = 'none'; 
        }, 500);
        
        map = L.map('map', {
            center: [30, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 8,
            zoomControl: true,
            attributionControl: false,
            preferCanvas: true
        });
        
        // Add base tiles (light style)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);
        
        // Load country GeoJSON
        const response = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/GeoJSON/ne_110m_admin_0_countries.geojson');
        if (!response.ok) throw new Error('Failed to load map data');
        
        const geoJsonData = await response.json();
        
        geojsonLayer = L.geoJSON(geoJsonData, {
            style: function(feature) {
                return {
                    fillColor: getContinentColor(feature.properties.CONTINENT),
                    weight: 0.5,  
                    fillOpacity: 0.4,
                    color: '#ffffff'
                };
            },
            
            onEachFeature: function(feature, layer) {
                const name = feature.properties.NAME || feature.properties.name;
                
                layer.bindTooltip(`<b>${name}</b>`);
                
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight, 
                    click: onCountryClick
                });
            }
        }).addTo(map);
        
    } catch (error) {
        console.error('Map initialization error:', error);
        document.getElementById('loading').innerHTML = `<div style="text-align:center;padding:2rem;color:#e74c3c">Failed to load map: ${error.message}</div>`;
        setTimeout(() => document.getElementById('loading').style.display = 'none', 5000);
    }
}

// Search function
function performSearch() {
    const searchTerm = document.getElementById('searchBox').value.trim().toLowerCase();
    
    if (!geojsonLayer || !searchTerm) return;
    
    let foundFeature = null;
    geojsonLayer.eachLayer(layer => {
        const name = (layer.feature.properties.NAME || '').toLowerCase();
        if (name.includes(searchTerm)) {
            foundFeature = layer;
            return false; // break loop
        }
    });
    
    if (foundFeature) {
        showCountryInfo(foundFeature.target ? foundFeature : foundFeature._leaflet_id ? foundFeature : Object.keys(geojsonLayer._layers).find(k => geoJsonLayer.getLayer(k) === foundFeature));
        onCountryClick({target: foundFeature}); 
    } else {
        alert('Country not found. Please try another search.');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    
    // Add event listeners for search
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.getElementById('searchBox');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }
    }
});
