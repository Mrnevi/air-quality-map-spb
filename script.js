// Конфигурация
const SPB_CENTER = [59.939095, 30.315868];

// Все 18 районов Санкт-Петербурга
const districts = [
  {
    name: "Адмиралтейский район",
    coords: [[59.915, 30.300], [59.915, 30.350], [59.930, 30.350], [59.930, 30.300], [59.915, 30.300]],
    points: [{ lat: 59.916, lon: 30.318 }]
  },
  {
    name: "Василеостровский район",
    coords: [[59.930, 30.220], [59.930, 30.280], [59.950, 30.280], [59.950, 30.220], [59.930, 30.220]],
    points: [{ lat: 59.941, lon: 30.258 }]
  },
  {
    name: "Выборгский район",
    coords: [[60.000, 30.250], [60.000, 30.350], [60.050, 30.350], [60.050, 30.250], [60.000, 30.250]],
    points: [{ lat: 60.025, lon: 30.290 }]
  },
  {
    name: "Калининский район",
    coords: [[59.970, 30.350], [59.970, 30.450], [60.020, 30.450], [60.020, 30.350], [59.970, 30.350]],
    points: [{ lat: 59.990, lon: 30.390 }]
  },
  {
    name: "Кировский район",
    coords: [[59.850, 30.150], [59.850, 30.250], [59.900, 30.250], [59.900, 30.150], [59.850, 30.150]],
    points: [{ lat: 59.875, lon: 30.200 }]
  },
  {
    name: "Колпинский район",
    coords: [[59.730, 30.500], [59.730, 30.600], [59.800, 30.600], [59.800, 30.500], [59.730, 30.500]],
    points: [{ lat: 59.765, lon: 30.550 }]
  },
  {
    name: "Красногвардейский район",
    coords: [[59.930, 30.400], [59.930, 30.500], [59.980, 30.500], [59.980, 30.400], [59.930, 30.400]],
    points: [{ lat: 59.955, lon: 30.450 }]
  },
  {
    name: "Красносельский район",
    coords: [[59.810, 30.080], [59.810, 30.180], [59.870, 30.180], [59.870, 30.080], [59.810, 30.080]],
    points: [{ lat: 59.840, lon: 30.130 }]
  },
  {
    name: "Кронштадтский район",
    coords: [[59.980, 29.750], [59.980, 29.800], [60.020, 29.800], [60.020, 29.750], [59.980, 29.750]],
    points: [{ lat: 60.000, lon: 29.775 }]
  },
  {
    name: "Курортный район",
    coords: [[60.100, 29.800], [60.100, 29.900], [60.150, 29.900], [60.150, 29.800], [60.100, 29.800]],
    points: [{ lat: 60.125, lon: 29.850 }]
  },
  {
    name: "Московский район",
    coords: [[59.850, 30.320], [59.850, 30.400], [59.900, 30.400], [59.900, 30.320], [59.850, 30.320]],
    points: [{ lat: 59.875, lon: 30.360 }]
  },
  {
    name: "Невский район",
    coords: [[59.850, 30.400], [59.850, 30.500], [59.900, 30.500], [59.900, 30.400], [59.850, 30.400]],
    points: [{ lat: 59.875, lon: 30.450 }]
  },
  {
    name: "Петроградский район",
    coords: [[59.950, 30.280], [59.950, 30.320], [59.970, 30.320], [59.970, 30.280], [59.950, 30.280]],
    points: [{ lat: 59.960, lon: 30.300 }]
  },
  {
    name: "Петродворцовый район",
    coords: [[59.870, 29.900], [59.870, 30.000], [59.920, 30.000], [59.920, 29.900], [59.870, 29.900]],
    points: [{ lat: 59.895, lon: 29.950 }]
  },
  {
    name: "Приморский район",
    coords: [[59.970, 30.150], [59.970, 30.250], [60.050, 30.250], [60.050, 30.150], [59.970, 30.150]],
    points: [{ lat: 60.010, lon: 30.200 }]
  },
  {
    name: "Пушкинский район",
    coords: [[59.700, 30.350], [59.700, 30.450], [59.750, 30.450], [59.750, 30.350], [59.700, 30.350]],
    points: [{ lat: 59.725, lon: 30.400 }]
  },
  {
    name: "Фрунзенский район",
    coords: [[59.860, 30.320], [59.860, 30.400], [59.900, 30.400], [59.900, 30.320], [59.860, 30.320]],
    points: [{ lat: 59.880, lon: 30.360 }]
  },
  {
    name: "Центральный район",
    coords: [[59.920, 30.340], [59.920, 30.400], [59.950, 30.400], [59.950, 30.340], [59.920, 30.340]],
    points: [{ lat: 59.935, lon: 30.370 }]
  }
];

let myMap;
let currentData = [];
let isFirstLoad = true;  // чтобы не показывать второй loading при старте

// Инициализация карты
ymaps.ready(init);

async function init() {
  myMap = new ymaps.Map("map", {
    center: SPB_CENTER,
    zoom: 10,
    controls: ['zoomControl', 'fullscreenControl']
  });

  addMapControls();
  await refreshData();           // здесь рисуются все полигоны
  addLegend(myMap);
  updateStats();
}

// Управление кнопками на карте
function addMapControls() {
  document.getElementById('zoom-in').addEventListener('click', () => myMap.setZoom(myMap.getZoom() + 1));
  document.getElementById('zoom-out').addEventListener('click', () => myMap.setZoom(myMap.getZoom() - 1));
  document.getElementById('locate-btn').addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        myMap.setCenter([pos.coords.latitude, pos.coords.longitude], 15);
      }, () => {
        alert('Не удалось определить местоположение');
      });
    }
  });
  document.getElementById('refresh-btn').addEventListener('click', refreshData);
  document.getElementById('close-info').addEventListener('click', () => {
    document.getElementById('info').classList.add('hidden');
  });
}

// Основная функция обновления данных
async function refreshData() {
  if (!isFirstLoad) {
    showLoading(true);
  }

  myMap.geoObjects.removeAll();
  currentData = [];

  createDemoData();               // здесь создаются полигоны и данные

  updateLastUpdateTime();
  updateStats();

  if (!isFirstLoad) {
    showLoading(false);
  }

  isFirstLoad = false;
}

// Генерация демо-данных + отрисовка полигонов
function createDemoData() {
  console.log('🎮 Используются демо-данные');

  const ranges = [
    { min: 0, max: 50 },      // Отличное
    { min: 51, max: 100 },    // Удовлетворительное
    { min: 101, max: 150 },   // Нездоровое для чувствительных
    { min: 151, max: 200 },   // Нездоровое
    { min: 201, max: 300 }    // Очень нездоровое / опасное
  ];

  districts.forEach((district, index) => {
    // случайный AQI в пределах диапазона
    const range = ranges[index % ranges.length];
    const aqius = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

    currentData.push({ district: district.name, aqi: aqius });

    // Отрисовка полигона района
    createDistrictPolygon(district, aqius);
  });
}

// Создание полигона района на карте
function createDistrictPolygon(district, aqius) {
  const quality = getAirQualityInfo(aqius);

  const polygon = new ymaps.Polygon([
    district.coords
  ], {
    hintContent: `${district.name} — AQI ${aqius}`
  }, {
    fillColor: quality.color + '88',     // полупрозрачный заливка
    strokeColor: quality.strokeColor,
    strokeWidth: 2,
    opacity: 0.85,
    fillOpacity: 0.55
  });

  // Содержимое балуна
  polygon.properties.set({
    balloonContentHeader: `<b>${district.name}</b>`,
    balloonContentBody: `
      <b>${quality.text} (${quality.status})</b><br>
      AQI: <b>${aqius}</b><br><br>
      ${quality.recommendation}<br><br>
      <small>Обновлено: ${new Date().toLocaleTimeString('ru-RU')}</small>
    `
  });

  // При клике по полигону — открываем боковую панель
  polygon.events.add('click', function () {
    updateInfoPanel(
      district.name,
      quality.text,
      quality.description,
      aqius,
      quality.status,
      quality.recommendation,
      quality.color
    );
  });

  myMap.geoObjects.add(polygon);
}

// Определение качества воздуха по AQI
function getAirQualityInfo(aqius) {
  if (aqius <= 50) {
    return {
      text: "Отличное",
      status: "Здоровое",
      description: "Качество воздуха идеальное.",
      recommendation: "Можно спокойно проводить время на улице.",
      color: '#00E400',
      strokeColor: '#009900'
    };
  } else if (aqius <= 100) {
    return {
      text: "Удовлетворительное",
      status: "Умеренно",
      description: "Качество воздуха приемлемое.",
      recommendation: "Чувствительные группы могут заниматься обычной активностью.",
      color: '#FFFF00',
      strokeColor: '#FFAA00'
    };
  } else if (aqius <= 150) {
    return {
      text: "Нездоровое для чувствительных групп",
      status: "Внимание",
      description: "Члены чувствительных групп могут испытывать последствия.",
      recommendation: "Сократите длительные нагрузки на улице.",
      color: '#FF7E00',
      strokeColor: '#FF5500'
    };
  } else if (aqius <= 200) {
    return {
      text: "Нездоровое",
      status: "Опасно",
      description: "Все могут начать испытывать последствия.",
      recommendation: "Ограничьте пребывание на улице, особенно дети и пожилые.",
      color: '#FF0000',
      strokeColor: '#CC0000'
    };
  } else {
    return {
      text: "Очень нездоровое",
      status: "Критично",
      description: "Серьёзный риск для здоровья всех групп.",
      recommendation: "Оставайтесь в помещении, используйте очистители воздуха.",
      color: '#8F3F97',
      strokeColor: '#660066'
    };
  }
}

// Обновление боковой панели
function updateInfoPanel(name, quality, description, index, status, recommendation, color) {
  document.getElementById('district-name').textContent = name;
  document.getElementById('air-quality-value').textContent = index;
  document.getElementById('quality-status').textContent = `${quality} — ${status}`;
  document.getElementById('quality-description').textContent = recommendation;

  const badgeDot = document.querySelector('.badge-dot');
  const qualityBadge = document.getElementById('quality-badge');
  badgeDot.style.backgroundColor = color;
  qualityBadge.style.borderLeft = `4px solid ${color}`;

  document.getElementById('info').classList.remove('hidden');
}

// Обновление статистики
function updateStats() {
  if (!currentData.length) return;
  const avg = Math.round(currentData.reduce((s, i) => s + i.aqi, 0) / currentData.length);
  const best = currentData.reduce((a, b) => a.aqi < b.aqi ? a : b);
  const worst = currentData.reduce((a, b) => a.aqi > b.aqi ? a : b);

  document.getElementById('avg-aqi').textContent = avg;
  document.getElementById('best-district').textContent = best.district.split(' ')[0];
  document.getElementById('worst-district').textContent = worst.district.split(' ')[0];
}

// Время последнего обновления
function updateLastUpdateTime() {
  const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('last-update-time').textContent = `Обновлено: ${time}`;
}

// Добавление легенды на карту
function addLegend(map) {
  const Legend = function () { ymaps.util.augment(Legend, ymaps.Control); };
  Legend.prototype.onAdd = function () {
    const el = ymaps.util.createElement('div');
    el.innerHTML = `
      <div style="background:white; padding:16px; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.15); font-family:'Inter',sans-serif; font-size:12px; max-width:220px; line-height:1.4; border:1px solid #e2e8f0;">
        <h4 style="margin:0 0 12px 0; font-size:14px; font-weight:600; color:#1e293b;">Индекс качества воздуха (AQI)</h4>
        <div style="display:flex; align-items:center; margin:6px 0;"><div style="width:12px; height:12px; background:#00E400; margin-right:8px; border-radius:2px;"></div><span>0–50: Отличное</span></div>
        <div style="display:flex; align-items:center; margin:6px 0;"><div style="width:12px; height:12px; background:#FFFF00; margin-right:8px; border-radius:2px;"></div><span>51–100: Удовлетворительное</span></div>
        <div style="display:flex; align-items:center; margin:6px 0;"><div style="width:12px; height:12px; background:#FF7E00; margin-right:8px; border-radius:2px;"></div><span>101–150: Нездоровое</span></div>
        <div style="display:flex; align-items:center; margin:6px 0;"><div style="width:12px; height:12px; background:#FF0000; margin-right:8px; border-radius:2px;"></div><span>151–200: Опасно</span></div>
        <div style="display:flex; align-items:center; margin:6px 0;"><div style="width:12px; height:12px; background:#8F3F97; margin-right:8px; border-radius:2px;"></div><span>201+: Критично</span></div>
        <div style="margin-top:12px; padding-top:12px; border-top:1px solid #e2e8f0; font-size:11px; color:#64748b;">Источник: Демо-данные</div>
      </div>`;
    return el;
  };

  map.controls.add(new Legend({ position: { top: 120, right: 20 } }));
}

// Показ/скрытие оверлея загрузки
function showLoading(show) {
  let el = document.getElementById('loading');
  if (!el && show) {
    el = document.createElement('div');
    el.id = 'loading';
    el.innerHTML = `
      <div><img src="loading.gif" alt="Загрузка"></div>
      <div class="loading-text">Загружаем актуальные данные о воздухе...</div>
    `;
    document.body.appendChild(el);
  }
  if (el) el.style.display = show ? 'flex' : 'none';
}

// Автообновление каждые 5 минут
setInterval(refreshData, 5 * 60 * 1000);