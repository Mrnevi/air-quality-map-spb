// ────────────────────────────────────────────────
const SPB_CENTER = [59.93428, 30.3351];

const districts = [
  { "name": "Адмиралтейский", "coords": [[59.901, 30.250], [59.905, 30.360], [59.934, 30.355], [59.932, 30.270]] },
  { "name": "Василеостровский", "coords": [[59.935, 30.198], [59.920, 30.260], [59.945, 30.290], [59.957, 30.210]] },
  { "name": "Выборгский", "coords": [[59.975, 30.330], [60.030, 30.410], [60.100, 30.350], [60.060, 30.250]] },
  { "name": "Калининский", "coords": [[59.957, 30.360], [59.980, 30.450], [60.052, 30.430], [60.020, 30.350]] },
  { "name": "Кировский", "coords": [[59.800, 30.170], [59.840, 30.300], [59.915, 30.310], [59.910, 30.210]] },
  { "name": "Колпинский", "coords": [[59.725, 30.550], [59.780, 30.760], [59.840, 30.650], [59.810, 30.490]] },
  { "name": "Красногвардейский", "coords": [[59.925, 30.410], [59.940, 30.530], [60.010, 30.510], [59.980, 30.420]] },
  { "name": "Красносельский", "coords": [[59.680, 30.080], [59.780, 30.220], [59.870, 30.170], [59.840, 30.050]] },
  { "name": "Кронштадтский", "coords": [[60.010, 29.660], [59.980, 29.750], [60.000, 29.830], [60.035, 29.740]] },
  { "name": "Курортный", "coords": [[60.000, 29.950], [60.100, 30.230], [60.250, 29.800], [60.150, 29.400]] },
  { "name": "Московский", "coords": [[59.770, 30.310], [59.820, 30.400], [59.890, 30.360], [59.870, 30.280]] },
  { "name": "Невский", "coords": [[59.835, 30.480], [59.880, 30.540], [59.925, 30.440], [59.890, 30.390]] },
  { "name": "Петроградский", "coords": [[59.955, 30.220], [59.950, 30.340], [59.985, 30.330], [59.980, 30.240]] },
  { "name": "Петродворцовый", "coords": [[59.850, 29.670], [59.870, 30.040], [59.920, 30.020], [59.900, 29.750]] },
  { "name": "Приморский", "coords": [[59.980, 30.210], [60.020, 30.310], [60.120, 30.150], [60.050, 29.980]] },
  { "name": "Пушкинский", "coords": [[59.630, 30.400], [59.720, 30.550], [59.820, 30.450], [59.780, 30.300]] },
  { "name": "Фрунзенский", "coords": [[59.810, 30.380], [59.840, 30.440], [59.915, 30.380], [59.890, 30.330]] },
  { "name": "Центральный", "coords": [[59.916, 30.330], [59.925, 30.400], [59.955, 30.390], [59.945, 30.320]] }
];

let myMap;
let currentData = [];
let lastRefresh = 0;
let selectedDistrict = "Центральный";
let panelData = {};
let displayFreezeUntil = 0;           // до какого времени замораживаем отображаемые значения
const FREEZE_MINUTES = 4;             // 4 минуты заморозки после выбора района или обновления

ymaps.ready(init);

function init() {
  myMap = new ymaps.Map('map', {
    center: SPB_CENTER,
    zoom: 10,
    controls: ['zoomControl', 'fullscreenControl']
  });

  document.getElementById('zoom-in').onclick     = () => myMap.setZoom(myMap.getZoom() + 1);
  document.getElementById('zoom-out').onclick    = () => myMap.setZoom(myMap.getZoom() - 1);
  document.getElementById('locate-btn').onclick  = () => navigator.geolocation?.getCurrentPosition(p => myMap.setCenter([p.coords.latitude, p.coords.longitude], 14));

  document.getElementById('refresh-btn').onclick = handleRefreshClick;
  document.getElementById('close-info').onclick  = () => {
    document.getElementById('info').classList.add('hidden');
    selectedDistrict = null;
  };

  refreshData(true);                // первый запуск
                
  setInterval(refreshData, 300000); // каждые 5 минут
}

function handleRefreshClick() {
  document.getElementById('refresh-btn').disabled = true;
  document.getElementById('refresh-btn-text').innerHTML = 'Обновление...';
  console.log('Обновление данных...');

  refreshData(true).then(() => {
    document.getElementById('refresh-btn').disabled = false;
    document.getElementById('refresh-btn-text').innerHTML = 'Обновить';
    console.log('Данные обновлены.');
  });
}

async function refreshData(force = false) {
  if (!force && Date.now() - lastRefresh < 300000) return false; // не обновляем чаще, чем раз в 5 минут
  lastRefresh = Date.now();

  currentData = await loadDistrictAQI();

  updateMap();

  const now = Date.now();
  updateStats();
  updateLastUpdateTime();

  if (selectedDistrict && panelData) {
    const fresh = currentData.find(d => d.district === selectedDistrict);
    if (fresh) {
      panelData = { ...fresh };
      renderPanel(panelData);
    }
  }
}

/**
 * Загружает данные о качестве воздуха и преобразует их в плоский формат
 * @returns {Promise<Array>} Массив объектов с данными по районам
 */
async function loadDistrictAQI() {
  const URL = 'https://spbaqi.duckdns.org/api/v1/aqi/spb';

  try {
    const response = await fetch(URL);
    
    if (!response.ok) {
      throw new Error(`Ошибка сети: ${response.status}`);
    }

    const json = await response.json();

    // Преобразование данных из формата сервера в ваш целевой формат
    const formattedData = json.items.map(item => {
      // Извлекаем current data из ответа API Open-Meteo
      const d = item.data || {};
      
      return {
        id: item.id,
        district: item.name,
        aqi: d.us_aqi || 0,         // Индекс качества воздуха (US)
        pm25: d.pm2_5 || 0,               // Мелкие частицы
        pm10: d.pm10 || 0,                // Крупные частицы
        no2: d.nitrogen_dioxide || 0,     // Диоксид азота
        o3: d.ozone || 0,                 // Озон
        so2: d.sulphur_dioxide || 0,      // Диоксид серы
        co: d.carbon_monoxide || 0        // Угарный газ
      };
    });

    return formattedData;
  } catch (error) {
    console.error('Не удалось загрузить данные AQI:', error);
    return []; // Возвращаем пустой массив в случае ошибки
  }
}

function updateMap() {
  myMap.geoObjects.removeAll();

  currentData.forEach(item => {
    const d = districts.find(x => x.name === item.district);
    if (!d) return;

    const q = getQuality(item.aqi);

    const poly = new ymaps.Polygon([d.coords], {}, {
      fillColor: q.color + '66',
      strokeColor: q.color,
      strokeWidth: 2,
      opacity: 0.75
    });

    poly.events.add('click', () => {
      // при выборе района — фиксируем отображение на 4 минуты
      displayFreezeUntil = Date.now() + FREEZE_MINUTES * 60000;

      selectedDistrict = item.district;
      panelData = { ...item };
      renderPanel(panelData);
      document.getElementById('info').classList.remove('hidden');
    });

    myMap.geoObjects.add(poly);
  });
}

function getQuality(aqi) {
  if (aqi <= 50)  return { color: '#00e400', text: 'Отличное',   status: 'Здоровое',   rec: 'Можно спокойно гулять.' };
  if (aqi <= 100) return { color: '#ffff00', text: 'Хорошее',    status: 'Умеренное',  rec: 'Подходит большинству людей.' };
  if (aqi <= 150) return { color: '#ff7e00', text: 'Умеренно',   status: 'Нездорово для чувствительных', rec: 'Сократите активность на улице.' };
  if (aqi <= 200) return { color: '#ff0000', text: 'Нездорово',  status: 'Опасно',     rec: 'Ограничьте пребывание на улице.' };
  return                 { color: '#8f3f97', text: 'Очень плохо', status: 'Критично',   rec: 'Лучше оставаться дома.' };
}

function renderPanel(data) {
  if (!data) return;

  const q = getQuality(data.aqi);

  document.getElementById('district-name').textContent      = data.district;
  document.getElementById('air-quality-value').textContent  = data.aqi;
  document.getElementById('quality-status').textContent     = `${q.text} — ${q.status}`;
  document.getElementById('quality-description').textContent = q.rec;

  document.querySelector('.badge-dot').style.backgroundColor = q.color;
  document.getElementById('quality-badge').style.borderLeftColor = q.color;

  document.getElementById('pm25').textContent = `PM2.5: ${data.pm25} µg/m³`;
  document.getElementById('pm10').textContent = `PM10: ${data.pm10} µg/m³`;
  document.getElementById('no2').textContent  = `NO₂: ${data.no2} µg/m³`;
  document.getElementById('o3').textContent   = `O₃: ${data.o3} µg/m³`;
  document.getElementById('so2').textContent  = `SO₂: ${data.so2} µg/m³`;
  document.getElementById('co').textContent   = `CO: ${data.co} mg/m³`;

  document.getElementById('info').classList.remove('hidden');
}

function updateStats() {
  if (!currentData.length) return;

  const avg = Math.round(currentData.reduce((s, x) => s + x.aqi, 0) / currentData.length);
  const best  = currentData.reduce((a,b) => a.aqi < b.aqi ? a : b);
  const worst = currentData.reduce((a,b) => a.aqi > b.aqi ? a : b);

  document.getElementById('avg-aqi').textContent       = avg;
  document.getElementById('best-district').textContent  = best.district;
  document.getElementById('worst-district').textContent = worst.district;
}

function updateLastUpdateTime() {
  document.getElementById('last-update-time').textContent =
    `Обновлено: ${new Date().toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'})}`;
}