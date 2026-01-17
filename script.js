// Конфигурация
const SPB_CENTER = [59.939095, 30.315868];
// ⚠️ ЗАМЕНИТЕ НА СВОЙ КЛЮЧ С https://www.weatherapi.com/
const WEATHERAPI_KEY = 'YOUR_WEATHERAPI_KEY'; // ← ОБЯЗАТЕЛЬНО!

// Все 18 районов Санкт-Петербурга
const districts = [
  { name: "Адмиралтейский район", coords: [[59.915, 30.300], [59.915, 30.350], [59.930, 30.350], [59.930, 30.300], [59.915, 30.300]], points: [{ lat: 59.916, lon: 30.318 }] },
  { name: "Василеостровский район", coords: [[59.930, 30.220], [59.930, 30.280], [59.950, 30.280], [59.950, 30.220], [59.930, 30.220]], points: [{ lat: 59.941, lon: 30.258 }] },
  { name: "Выборгский район", coords: [[60.000, 30.250], [60.000, 30.350], [60.050, 30.350], [60.050, 30.250], [60.000, 30.250]], points: [{ lat: 60.025, lon: 30.290 }] },
  { name: "Калининский район", coords: [[59.970, 30.350], [59.970, 30.450], [60.020, 30.450], [60.020, 30.350], [59.970, 30.350]], points: [{ lat: 59.990, lon: 30.390 }] },
  { name: "Кировский район", coords: [[59.850, 30.150], [59.850, 30.250], [59.900, 30.250], [59.900, 30.150], [59.850, 30.150]], points: [{ lat: 59.875, lon: 30.200 }] },
  { name: "Колпинский район", coords: [[59.730, 30.500], [59.730, 30.600], [59.800, 30.600], [59.800, 30.500], [59.730, 30.500]], points: [{ lat: 59.765, lon: 30.550 }] },
  { name: "Красногвардейский район", coords: [[59.930, 30.400], [59.930, 30.500], [59.980, 30.500], [59.980, 30.400], [59.930, 30.400]], points: [{ lat: 59.955, lon: 30.450 }] },
  { name: "Красносельский район", coords: [[59.810, 30.080], [59.810, 30.180], [59.870, 30.180], [59.870, 30.080], [59.810, 30.080]], points: [{ lat: 59.840, lon: 30.130 }] },
  { name: "Кронштадтский район", coords: [[59.980, 29.750], [59.980, 29.800], [60.020, 29.800], [60.020, 29.750], [59.980, 29.750]], points: [{ lat: 60.000, lon: 29.775 }] },
  { name: "Курортный район", coords: [[60.100, 29.800], [60.100, 29.900], [60.150, 29.900], [60.150, 29.800], [60.100, 29.800]], points: [{ lat: 60.125, lon: 29.850 }] },
  { name: "Московский район", coords: [[59.850, 30.320], [59.850, 30.400], [59.900, 30.400], [59.900, 30.320], [59.850, 30.320]], points: [{ lat: 59.875, lon: 30.360 }] },
  { name: "Невский район", coords: [[59.850, 30.400], [59.850, 30.500], [59.900, 30.500], [59.900, 30.400], [59.850, 30.400]], points: [{ lat: 59.875, lon: 30.450 }] },
  { name: "Петроградский район", coords: [[59.950, 30.280], [59.950, 30.320], [59.970, 30.320], [59.970, 30.280], [59.950, 30.280]], points: [{ lat: 59.960, lon: 30.300 }] },
  { name: "Петродворцовый район", coords: [[59.870, 29.900], [59.870, 30.000], [59.920, 30.000], [59.920, 29.900], [59.870, 29.900]], points: [{ lat: 59.895, lon: 29.950 }] },
  { name: "Приморский район", coords: [[59.970, 30.150], [59.970, 30.250], [60.050, 30.250], [60.050, 30.150], [59.970, 30.150]], points: [{ lat: 60.010, lon: 30.200 }] },
  { name: "Пушкинский район", coords: [[59.700, 30.350], [59.700, 30.450], [59.750, 30.450], [59.750, 30.350], [59.700, 30.350]], points: [{ lat: 59.725, lon: 30.400 }] },
  { name: "Фрунзенский район", coords: [[59.860, 30.320], [59.860, 30.400], [59.900, 30.400], [59.900, 30.320], [59.860, 30.320]], points: [{ lat: 59.880, lon: 30.360 }] },
  { name: "Центральный район", coords: [[59.920, 30.340], [59.920, 30.400], [59.950, 30.400], [59.950, 30.340], [59.920, 30.340]], points: [{ lat: 59.935, lon: 30.370 }] }
];

let myMap;
let currentData = [];
const districtPolygons = {}; // Для плавного обновления

ymaps.ready(init);

async function init() {
  myMap = new ymaps.Map("map", {
    center: SPB_CENTER,
    zoom: 10,
    controls: ['zoomControl', 'fullscreenControl']
  });

  addMapControls();
  await refreshData();
  addLegend(myMap);
  updateStats();
}

function addMapControls() {
  document.getElementById('zoom-in').addEventListener('click', () => myMap.setZoom(myMap.getZoom() + 1));
  document.getElementById('zoom-out').addEventListener('click', () => myMap.setZoom(myMap.getZoom() - 1));
  document.getElementById('locate-btn').addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        myMap.setCenter([pos.coords.latitude, pos.coords.longitude], 15);
      });
    }
  });
  document.getElementById('refresh-btn').addEventListener('click', refreshData);
  document.getElementById('close-info').addEventListener('click', () => {
    document.getElementById('info').classList.add('hidden');
  });
}

async function refreshData() {
  showLoading(true);
  currentData = [];

  try {
    await loadAirQualityData();
    updateLastUpdateTime();
    updateStats();
  } catch (error) {
    console.error('❌ Ошибка:', error);
    createDemoData();
  }

  showLoading(false);
}

// === НОВАЯ ФУНКЦИЯ: WeatherAPI ===
async function fetchAirQualityData(lat, lon) {
  const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_KEY}&q=${lat},${lon}&aqi=yes`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.current?.air_quality) {
    const aq = data.current.air_quality;
    return {
      aqius: Math.round(aq["us-epa-index"]),
      pm2_5: aq.pm2_5 ?? 0,
      pm10: aq.pm10 ?? 0,
      no2: aq.no2 ?? 0,
      o3: aq.o3 ?? 0,
      so2: aq.so2 ?? 0,
      co: aq.co ?? 0
    };
  }
  return null;
}

async function loadAirQualityData() {
  for (const district of districts) {
    let totalAQI = 0, valid = 0;
    let agg = { pm2_5: 0, pm10: 0, no2: 0, o3: 0, so2: 0, co: 0 };

    for (const point of district.points) {
      try {
        const air = await fetchAirQualityData(point.lat, point.lon);
        if (air) {
          totalAQI += air.aqius;
          valid++;
          Object.keys(agg).forEach(k => agg[k] += air[k]);
        }
      } catch (e) {
        console.warn(`Нет данных для ${district.name}:`, e);
      }
    }

    const avgAQI = valid ? Math.round(totalAQI / valid) : 50;
    const pollutants = valid ? Object.fromEntries(Object.entries(agg).map(([k, v]) => [k, (v / valid).toFixed(1)])) : null;

    currentData.push({ district: district.name, aqi: avgAQI, pollutants });

    updateOrCreatePolygon(district, avgAQI, pollutants);
  }
}

function updateOrCreatePolygon(district, aqius, pollutants) {
  const qualityData = getAirQualityInfo(aqius);
  const balloonContent = createBalloonContent(district.name, aqius, qualityData, pollutants);

  if (districtPolygons[district.name]) {
    const poly = districtPolygons[district.name];
    poly.options.set({ fillColor: qualityData.color, strokeColor: qualityData.strokeColor });
    poly.properties.set({
      balloonContentHeader: `<strong>${district.name}</strong>`,
      balloonContentBody: balloonContent
    });
  } else {
    const polygon = new ymaps.Polygon([district.coords], {
      hintContent: `${district.name} - AQI: ${aqius}`,
      balloonContentHeader: `<strong>${district.name}</strong>`,
      balloonContentBody: balloonContent
    }, {
      fillColor: qualityData.color,
      strokeColor: qualityData.strokeColor,
      strokeWidth: 2,
      opacity: 0.7,
      fillOpacity: 0.6
    });

    polygon.events.add('click', function (e) {
      updateInfoPanel(district.name, aqius, qualityData, pollutants);
      polygon.balloon.open(e.get('coords'));
    });

    myMap.geoObjects.add(polygon);
    districtPolygons[district.name] = polygon;
  }
}

function createBalloonContent(name, aqius, qualityData, pollutants) {
  const now = new Date().toLocaleTimeString();
  let pollHtml = '';
  if (pollutants) {
    pollHtml = `
      <p><strong>Загрязнители:</strong></p>
      <p>PM2.5: ${pollutants.pm2_5} µg/m³</p>
      <p>PM10: ${pollutants.pm10} µg/m³</p>
      <p>NO₂: ${pollutants.no2} µg/m³</p>
      <p>O₃: ${pollutants.o3} µg/m³</p>
      <p>SO₂: ${pollutants.so2} µg/m³</p>
      <p>CO: ${pollutants.co} µg/m³</p>
    `;
  }
  return `
    <div class="air-quality-balloon">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${qualityData.color}"></div>
        <strong style="color: ${qualityData.color}">${qualityData.text}</strong>
      </div>
      <p><strong>AQI:</strong> ${aqius}</p>
      <p><strong>Статус:</strong> ${qualityData.status}</p>
      <p><strong>Рекомендации:</strong> ${qualityData.recommendation}</p>
      ${pollHtml}
      <p style="margin-top: 12px; font-size: 12px; color: #666;"><em>Обновлено: ${now}</em></p>
    </div>
  `;
}

function getAirQualityInfo(aqius) {
  if (aqius <= 50) {
    return {
      text: "Отличное",
      status: "Хорошо",
      description: "Качество воздуха удовлетворительное.",
      recommendation: "Идеальные условия для outdoor activities.",
      color: '#00E400',
      strokeColor: '#009900'
    };
  } else if (aqius <= 100) {
    return {
      text: "Удовлетворительное",
      status: "Умеренно",
      description: "Качество воздуха приемлемое.",
      recommendation: "Чувствительные группы должны сократить prolonged outdoor exertion.",
      color: '#FFFF00',
      strokeColor: '#FFAA00'
    };
  } else if (aqius <= 150) {
    return {
      text: "Нездоровое для чувствительных групп",
      status: "Внимание",
      description: "Члены чувствительных групп могут испытывать последствия.",
      recommendation: "Дети, пожилые и больные должны избегать prolonged outdoor exertion.",
      color: '#FF7E00',
      strokeColor: '#FF5500'
    };
  } else if (aqius <= 200) {
    return {
      text: "Нездоровое",
      status: "Опасно",
      description: "Каждый может начать испытывать последствия.",
      recommendation: "Избегайте outdoor activities, используйте маски.",
      color: '#FF0000',
      strokeColor: '#CC0000'
    };
  } else {
    return {
      text: "Очень нездоровое", // ✅ ИСПРАВЛЕНО!
      status: "Критично",
      description: "Предупреждения о вреде для здоровья.",
      recommendation: "Оставайтесь в помещении, используйте очистители воздуха.",
      color: '#8F3F97',
      strokeColor: '#660066'
    };
  }
}

function updateInfoPanel(name, aqius, qualityData, pollutants) {
  document.getElementById('district-name').textContent = name;
  document.getElementById('air-quality-value').textContent = aqius;
  document.getElementById('quality-status').textContent = `${qualityData.text} - ${qualityData.status}`;
  document.getElementById('quality-description').textContent = qualityData.recommendation;

  const badgeDot = document.querySelector('.badge-dot');
  const qualityBadge = document.getElementById('quality-badge');
  badgeDot.style.backgroundColor = qualityData.color;
  qualityBadge.style.borderLeft = `3px solid ${qualityData.color}`;

  // Обновляем загрязнители
  const p = pollutants || {};
  document.getElementById('pm25').textContent = `PM2.5: ${p.pm2_5 || '—'}`;
  document.getElementById('pm10').textContent = `PM10: ${p.pm10 || '—'}`;
  document.getElementById('no2').textContent = `NO₂: ${p.no2 || '—'}`;
  document.getElementById('o3').textContent = `O₃: ${p.o3 || '—'}`;
  document.getElementById('so2').textContent = `SO₂: ${p.so2 || '—'}`;
  document.getElementById('co').textContent = `CO: ${p.co || '—'}`;

  document.getElementById('info').classList.remove('hidden');
}

function createDemoData() {
  currentData = [];
  districts.forEach(d => {
    const aqius = Math.round(20 + Math.random() * 120);
    const pollutants = {
      pm2_5: (Math.random() * 30).toFixed(1),
      pm10: (Math.random() * 50).toFixed(1),
      no2: (Math.random() * 40).toFixed(1),
      o3: (Math.random() * 60).toFixed(1),
      so2: (Math.random() * 10).toFixed(1),
      co: (Math.random() * 5).toFixed(1)
    };
    currentData.push({ district: d.name, aqi: aqius, pollutants });
    updateOrCreatePolygon(d, aqius, pollutants);
  });
}

function updateStats() {
  if (!currentData.length) return;
  const avg = Math.round(currentData.reduce((s, i) => s + i.aqi, 0) / currentData.length);
  const best = currentData.reduce((a, b) => a.aqi < b.aqi ? a : b);
  const worst = currentData.reduce((a, b) => a.aqi > b.aqi ? a : b);
  document.getElementById('avg-aqi').textContent = avg;
  document.getElementById('best-district').textContent = best.district.split(' ')[0];
  document.getElementById('worst-district').textContent = worst.district.split(' ')[0];
}

function updateLastUpdateTime() {
  const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('last-update-time').textContent = `Обновлено: ${time}`;
}

function addLegend(map) {
  const Legend = function () { Legend.superclass.constructor.call(this); };
  ymaps.util.augment(Legend, ymaps.Control, {
    onAdd: function () {
      const el = ymaps.util.createElement('div');
      el.innerHTML = `
        <div style="background:white;padding:16px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);font-family:'Inter',sans-serif;font-size:12px;max-width:200px;line-height:1.4;border:1px solid #e2e8f0;">
          <h4 style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:#1e293b;">Индекс качества воздуха (AQI)</h4>
          <div style="display:flex;align-items:center;margin:6px 0;"><div style="width:12px;height:12px;background:#00E400;margin-right:8px;border-radius:2px;"></div><span>🟢 0–50: Отличное</span></div>
          <div style="display:flex;align-items:center;margin:6px 0;"><div style="width:12px;height:12px;background:#FFFF00;margin-right:8px;border-radius:2px;"></div><span>🟡 51–100: Удовлетворительное</span></div>
          <div style="display:flex;align-items:center;margin:6px 0;"><div style="width:12px;height:12px;background:#FF7E00;margin-right:8px;border-radius:2px;"></div><span>🟠 101–150: Нездоровое (чувствительные)</span></div>
          <div style="display:flex;align-items:center;margin:6px 0;"><div style="width:12px;height:12px;background:#FF0000;margin-right:8px;border-radius:2px;"></div><span>🔴 151–200: Нездоровое</span></div>
          <div style="display:flex;align-items:center;margin:6px 0;"><div style="width:12px;height:12px;background:#8F3F97;margin-right:8px;border-radius:2px;"></div><span>🟣 201+: Очень нездоровое</span></div>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;">Источник: WeatherAPI</div>
        </div>`;
      return el;
    }
  });
  map.controls.add(new Legend({ position: { top: 120, right: 20 } }));
}

function showLoading(show) {
  let el = document.getElementById('loading');
  if (!el && show) {
    el = document.createElement('div');
    el.id = 'loading';
    el.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">Загружаем актуальные данные о воздухе...</div>
    `;
    document.body.appendChild(el);
  }
  if (el) el.style.display = show ? 'flex' : 'none';
}

setInterval(refreshData, 5 * 60 * 1000);
document.addEventListener('DOMContentLoaded', () => updateLastUpdateTime());