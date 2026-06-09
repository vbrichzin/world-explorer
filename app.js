// World Explorer - Interactive Map Application JavaScript
let map;
const DEFAULT_COLORS = {
    'Europe': '#4A90E2',
    'Asia': '#3498DB', 
    'Africa': '#E74C3C',
    'North America': '#27AE60',
    'South America': '#8E44AD',
    'Oceania': '#16A085'
};

function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '-';
    if (num >= 1e9) return Math.round(num / 1e8) / 10 + 'B';
    if (num >= 1e6) return Math.round(num / 1e5) / 10 + 'M';
    if (num >= 1e3) return (Math.round(num / 1e2) / 10) + 'K';
    return num.toString();
}

function formatArea(areaKm2) {
    if (!areaKm2 || areaKm2 === 0) return '-';
    if (areaKm2 >= 1e6) return Number.parseFloat((areaKm2 / 1e6).toFixed(1)) + 'M';
    return Math.round(areaKm2 / 1e3).toLocaleString();
}

function showCountryInfo(feature) {
    const name = feature.properties.NAME || 'Unknown';
    const data = countryDatabase[name] || {};
    
    document.getElementById('countryName').textContent = (data.flag || '\uD83C\uDF0D') + ' ' + name;
    document.getElementById('capital').textContent = data.capital || '-';
    document.getElementById('population').textContent = formatNumber(data.population);
    document.getElementById('continent').textContent = data.continent || '-';
    document.getElementById('area').textContent = formatArea(data.area_km2) + 'M';
    document.getElementById('currency').textContent = data.currency || '-';
    const gdp = data.gdp_billion_usd;
    document.getElementById('gdp').textContent = gdp ? '$' + Number.parseFloat(gdp).toFixed(1) + 'B' : '-';
    
    document.getElementById('infoPanel').style.display = 'block';
}

function hideInfo() {
    document.getElementById('infoPanel').style.display = 'none';
}

function onCountryClick(e) {
    showCountryInfo(e.target.feature);
    const bounds = e.target.getBounds();
    if (bounds && bounds.isValid()) {
        map.fitBounds(bounds.pad(0.2));
        return;
    }
    const center = e.target.getLatLng ? e.target.getLatLng().lat : 30;
    const lng = e.target.getLatLng ? e.target.getLatLng().lng : 0;
    if (map.setView) map.setView([center, lng], 5);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loading').style.display = 'none';
    
    try {
        const mapObj = L.map('map', { center: [30, 0], zoom: 2 });
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(mapObj);
        
        const geoJsonData = fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/GeoJSON/ne_110m_admin_0_countries.geojson')
            .then(res => res.ok ? Promise.all([res, res.json()])[1] : Promise.reject(new Error('Not found')));
        
        geoJsonData.then(data => {
            const geoLayer = L.geoJSON(data, {
                style: f => ({ 
                    fillColor: (DEFAULT_COLORS[f.properties.CONTINENT] ||= '#95A5A6'), 
                    weight: 0.5, fillOpacity: 0.4, color: '#FFF' 
                }),
        
                onEachFeature: function(feature, layer) {
                    if (feature.properties.NAME) layer.bindTooltip(feature.properties.NAME);
                    
                    layer.on({
                        mouseover: e => { 
                            const f = feature.properties; 
                            e.target.setStyle({ fillColor: COLORS[f.CONTINENT] || '#7F8C8D', fillOpacity: 0.8 }); 
                        },
                        mouseout: e => geoLayer.resetStyle(e.target),
                        click: onCountryClick
                    });
                }
            }).addTo(mapObj);
        }).catch(err => {
            document.getElementById('map').innerHTML = '<p style="padding:2rem;">Map data unavailable.</p>';
        });
        
        const inp = document.getElementById('searchBox');
        if (inp) inp.addEventListener('keypress', e => { if (e.key === 'Enter') { /* search impl */ } });
    } catch(e) { 
        console.error('Map init failed', e); 
        document.getElementById('map').innerHTML = '<p style="padding:2rem;">Failed to load map.</p>'; 
    }
});
