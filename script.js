// ────────────────────────────────────────────────
const SPB_CENTER = [59.93428, 30.3351];

const districts = [
  { name: "Адмиралтейский",     coords: [[59.915,30.300],[59.915,30.350],[59.930,30.350],[59.930,30.300],[59.915,30.300]] },
  { name: "Василеостровский",   coords: [[59.930,30.220],[59.930,30.280],[59.950,30.280],[59.950,30.220],[59.930,30.220]] },
  { name: "Выборгский",         coords: [[60.000,30.250],[60.000,30.350],[60.050,30.350],[60.050,30.250],[60.000,30.250]] },
  { name: "Калининский",        coords: [[59.970,30.350],[59.970,30.450],[60.020,30.450],[60.020,30.350],[59.970,30.350]] },
  { name: "Кировский",          coords: [[59.850,30.150],[59.850,30.250],[59.900,30.250],[59.900,30.150],[59.850,30.150]] },
  { name: "Колпинский",         coords: [[59.730,30.500],[59.730,30.600],[59.800,30.600],[59.800,30.500],[59.730,30.500]] },
  { name: "Красногвардейский",  coords: [[59.930,30.400],[59.930,30.500],[59.980,30.500],[59.980,30.400],[59.930,30.400]] },
  { name: "Красносельский",     coords: [[59.810,30.080],[59.810,30.180],[59.870,30.180],[59.870,30.080],[59.810,30.080]] },
  { name: "Кронштадтский",      coords: [[59.980,29.750],[59.980,29.800],[60.020,29.800],[60.020,29.750],[59.980,29.750]] },
  { name: "Курортный",          coords: [[60.100,29.800],[60.100,29.900],[60.150,29.900],[60.150,29.800],[60.100,29.800]] },
  { name: "Московский",         coords: [[59.850,30.320],[59.850,30.400],[59.900,30.400],[59.900,30.320],[59.850,30.320]] },
  { name: "Невский",            coords: [[59.850,30.400],[59.850,30.500],[59.900,30.500],[59.900,30.400],[59.850,30.400]] },
  { name: "Петроградский",      coords: [[59.950,30.280],[59.950,30.320],[59.970,30.320],[59.970,30.280],[59.950,30.280]] },
  { name: "Петродворцовый",     coords: [[59.870,29.900],[59.870,30.000],[59.920,30.000],[59.920,29.900],[59.870,29.900]] },
  { name: "Приморский",         coords: [[59.970,30.150],[59.970,30.250],[60.050,30.250],[60.050,30.150],[59.970,30.150]] },
  { name: "Пушкинский",         coords: [[59.700,30.350],[59.700,30.450],[59.750,30.450],[59.750,30.350],[59.700,30.350]] },
  { name: "Фрунзенский",        coords: [[59.860,30.320],[59.860,30.400],[59.900,30.400],[59.900,30.320],[59.860,30.320]] },
  { name: "Центральный",        coords: [[59.920,30.340],[59.920,30.400],[59.950,30.400],[59.950,30.340],[59.920,30.340]] }
];

let myMap;
let currentData = [];
let lastRefresh = 0;
let selectedDistrict = null;
let panelData = null;
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

  refreshData();                    // первый запуск
  setInterval(refreshData, 300000); // каждые 5 минут
}

function handleRefreshClick() {
  const now = Date.now();
  // принудительная заморозка отображения на 4 минуты после нажатия "Обновить"
  displayFreezeUntil = now + FREEZE_MINUTES * 60000;

  document.getElementById('refresh-btn').disabled = true;
  let sec = FREEZE_MINUTES * 60;
  const t = setInterval(() => {
    sec--;
    document.getElementById('refresh-btn').innerHTML = `⏳ ${Math.floor(sec/60)}:${(sec%60).toString().padStart(2,'0')}`;
    if (sec <= 0) {
      clearInterval(t);
      document.getElementById('refresh-btn').disabled = false;
      document.getElementById('refresh-btn').innerHTML = '<span class="btn-icon">🔄</span> Обновить';
    }
  }, 1000);

  refreshData();
}

async function refreshData() {
  if (Date.now() - lastRefresh < 300000) return;
  lastRefresh = Date.now();

  // имитация задержки запроса
  await new Promise(r => setTimeout(r, 700));

  const prev = currentData.slice();
  currentData = [];

  if (prev.length === 0) {
    initDemoData();
  } else {
    evolveDemoData(prev);
  }

  updateMap();

  const now = Date.now();
  if (now >= displayFreezeUntil) {
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
  // если заморозка активна — ничего не обновляем в статистике и панели
}

function initDemoData() {
  districts.forEach(d => {
    const aqi = 35 + Math.floor(Math.random() * 130);
    currentData.push({
      district: d.name,
      aqi,
      pm25: 10 + Math.floor(Math.random() * 50),
      pm10: 20 + Math.floor(Math.random() * 70),
      no2:  12 + Math.floor(Math.random() * 40),
      o3:   25 + Math.floor(Math.random() * 80),
      so2:   4 + Math.floor(Math.random() * 15),
      co:   (0.6 + Math.random() * 2.5).toFixed(1)
    });
  });
}

function evolveDemoData(prev) {
  districts.forEach(d => {
    const old = prev.find(x => x.district === d.name) || {aqi:60,pm25:25,pm10:45,no2:20,o3:40,so2:8,co:"1.5"};
    currentData.push({
      district: d.name,
      aqi:  Math.max(10, Math.min(250, old.aqi  + Math.floor(Math.random()*9)-4)),
      pm25: Math.max(5,  Math.min(100, old.pm25 + Math.floor(Math.random()*5)-2)),
      pm10: Math.max(10, Math.min(150, old.pm10 + Math.floor(Math.random()*7)-3)),
      no2:  Math.max(5,  Math.min(80,  old.no2  + Math.floor(Math.random()*7)-3)),
      o3:   Math.max(10, Math.min(140, old.o3   + Math.floor(Math.random()*9)-4)),
      so2:  Math.max(1,  Math.min(40,  old.so2  + Math.floor(Math.random()*5)-2)),
      co:   (Math.max(0.4, Math.min(6, parseFloat(old.co) + (Math.random()*0.4 - 0.2)))).toFixed(1)
    });
  });
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