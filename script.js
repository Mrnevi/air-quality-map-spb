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

// Инициализация карты
ymaps.ready(init);

async function init() {
  // Создаем карту
  myMap = new ymaps.Map("map", {
    center: SPB_CENTER,
    zoom: 10,
    controls: ['zoomControl', 'fullscreenControl']
  });

  // Добавляем элементы управления
  addMapControls();

  // Загружаем данные (только демо)
  await refreshData();

  // Добавляем легенду
  addLegend(myMap);

  // Обновляем статистику
  updateStats();
}

// Добавление кастомных элементов управления
function addMapControls() {
  // Кнопка увеличения
  document.getElementById('zoom-in').addEventListener('click', () => {
    myMap.setZoom(myMap.getZoom() + 1);
  });
  // Кнопка уменьшения
  document.getElementById('zoom-out').addEventListener('click', () => {
    myMap.setZoom(myMap.getZoom() - 1);
  });
  // Кнопка локации
  document.getElementById('locate-btn').addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        myMap.setCenter([position.coords.latitude, position.coords.longitude], 15);
      });
    }
  });
  // Кнопка обновления
  document.getElementById('refresh-btn').addEventListener('click', refreshData);
  // Кнопка закрытия информации
  document.getElementById('close-info').addEventListener('click', () => {
    document.getElementById('info').classList.add('hidden');
  });
}

// Основная функция обновления данных — ТОЛЬКО ДЕМО
async function refreshData() {
  showLoading(true);
  // Очищаем старые данные
  myMap.geoObjects.removeAll();
  currentData = [];

  // ВСЕГДА используем улучшенные демо-данные
  createDemoData();

  // Обновляем время последнего обновления
  updateLastUpdateTime();
  // Обновляем статистику
  updateStats();

  showLoading(false);
}

// УЛУЧШЕННАЯ функция демо-данных с разнообразными уровнями AQI
function createDemoData() {
  console.log('🎮 Используются улучшенные демо-данные с разнообразными цветами');
  currentData = [];

  // Диапазоны AQI для всех категорий
  const ranges = [
    { min: 0, max: 50 },      // Отличное (зелёный)
    { min: 51, max: 100 },    // Удовлетворительное (жёлтый)
    { min: 101, max: 150 },   // Нездоровое для чувствительных (оранжевый)
    { min: 151, max: 200 },   // Нездоровое (красный)
    { min: 201, max: 300 }    // Очень нездоровое (фиолетовый)
  ];

  districts.forEach((district, index) => {
    // Чередуем категории по индексу района (можно заменить на случайный выбор)
    const range = ranges[index % ranges.length];
    const aqius = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

    // Сохраняем данные для статистики
    currentData.push({
      district: district.name,
      aqi: aqius
    });

    // Создаём полигон
    createDistrictPolygon(district, aqius);
  });
}

// Создание полигона района
function createDistrictPolygon(district, aqius) {
  const qualityData = getAirQualityInfo(aqius);
  const polygon = new ymaps.Polygon([district.coords], {
    hintContent: `${district.name} - AQI: ${aqius}`
  }, {
    fillColor: qualityData.color,
    strokeColor: qualityData.strokeColor,
    strokeWidth: 2,
    opacity: 0.7,
    fillOpacity: 0.6
  });

  // Баллун с информацией
  polygon.properties.set({
    balloonContentHeader: `<strong>${district.name}</strong>`,
    balloonContentBody: `
      <div class="air-quality-balloon">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: ${qualityData.color}"></div>
          <strong style="color: ${qualityData.color}">${qualityData.text}</strong>
        </div>
        <p><strong>Индекс AQI:</strong> ${aqius}</p>
        <p><strong>Статус:</strong> ${qualityData.status}</p>
        <p><strong>Рекомендации:</strong> ${qualityData.recommendation}</p>
        <p style="margin-top: 12px; font-size: 12px; color: #666;">
          <em>Обновлено: ${new Date().toLocaleTimeString()}</em>
        </p>
      </div>
    `
  });

  myMap.geoObjects.add(polygon);

  // Обработчик клика
  polygon.events.add('click', function (e) {
    updateInfoPanel(
      district.name,
      qualityData.text,
      qualityData.description,
      aqius,
      qualityData.status,
      qualityData.recommendation,
      qualityData.color
    );
    // Открываем баллун
    polygon.balloon.open(e.get('coords'));
  });
}

// Классификация качества воздуха (ИСПРАВЛЕНО!)
function getAirQualityInfo(aqius) {
  if (aqius <= 50) {
    return {
      text: "Отличное",
      status: "Хорошо",
      description: "Качество воздуха удовлетворительное, загрязнение воздуха представляет незначительный риск или вообще не представляет риска.",
      recommendation: "Идеальные условия для outdoor activities.",
      color: '#00E400',
      strokeColor: '#009900'
    };
  } else if (aqius <= 100) {
    return {
      text: "Удовлетворительное",
      status: "Умеренно",
      description: "Качество воздуха приемлемое; однако некоторые загрязнители могут представлять умеренную проблему для здоровья.",
      recommendation: "Чувствительные группы должны сократить prolonged outdoor exertion.",
      color: '#FFFF00',
      strokeColor: '#FFAA00'
    };
  } else if (aqius <= 150) {
    return {
      text: "Нездоровое для чувствительных групп",
      status: "Внимание",
      description: "Члены чувствительных групп могут испытывать последствия для здоровья.",
      recommendation: "Дети, пожилые и больные должны избегать prolonged outdoor exertion.",
      color: '#FF7E00',
      strokeColor: '#FF5500'
    };
  } else if (aqius <= 200) {
    return {
      text: "Нездоровое",
      status: "Опасно",
      description: "Каждый может начать испытывать последствия для здоровья.",
      recommendation: "Избегайте outdoor activities, используйте маски.",
      color: '#FF0000',
      strokeColor: '#CC0000'
    };
  } else {
    return {
      text: "Очень нездоровое", // ✅ ИСПРАВЛЕНО!
      status: "Критично",
      description: "Предупреждения о вреде для здоровья: могут возникнуть более серьезные последствия для здоровья.",
      recommendation: "Оставайтесь в помещении, используйте очистители воздуха.",
      color: '#8F3F97',
      strokeColor: '#660066'
    };
  }
}

// Обновление информационной панели
function updateInfoPanel(name, quality, description, index, status, recommendation, color) {
  document.getElementById('district-name').textContent = name;
  document.getElementById('air-quality-value').textContent = index;
  document.getElementById('quality-status').textContent = `${quality} - ${status}`;
  document.getElementById('quality-description').textContent = recommendation;
  // Обновляем цвет бейджа
  const badgeDot = document.querySelector('.badge-dot');
  const qualityBadge = document.getElementById('quality-badge');
  badgeDot.style.backgroundColor = color;
  qualityBadge.style.borderLeft = `3px solid ${color}`;
  // Показываем панель
  const infoBlock = document.getElementById('info');
  infoBlock.classList.remove('hidden');
}

// Обновление статистики
function updateStats() {
  if (currentData.length === 0) return;
  // Средний AQI
  const avgAQI = Math.round(currentData.reduce((sum, item) => sum + item.aqi, 0) / currentData.length);
  document.getElementById('avg-aqi').textContent = avgAQI;
  // Лучший район
  const bestDistrict = currentData.reduce((best, current) => current.aqi < best.aqi ? current : best);
  document.getElementById('best-district').textContent = bestDistrict.district.split(' ')[0];
  // Худший район
  const worstDistrict = currentData.reduce((worst, current) => current.aqi > worst.aqi ? current : worst);
  document.getElementById('worst-district').textContent = worstDistrict.district.split(' ')[0];
}

// Обновление времени последнего обновления
function updateLastUpdateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  document.getElementById('last-update-time').textContent = `Обновлено: ${timeString}`;
}

// Легенда карты
function addLegend(map) {
  const Legend = function () {
    Legend.superclass.constructor.call(this);
  };
  ymaps.util.augment(Legend, ymaps.Control, {
    onAdd: function (map) {
      const panel = ymaps.util.createElement('div');
      panel.innerHTML = `
        <div style="
          background: white;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          max-width: 200px;
          line-height: 1.4;
          border: 1px solid #e2e8f0;
        ">
          <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Индекс качества воздуха (AQI)</h4>
          <div style="display: flex; align-items: center; margin: 6px 0;">
            <div style="width: 12px; height: 12px; background: #00E400; margin-right: 8px; border-radius: 2px; border: 1px solid #009900;"></div>
            <span>0-50: Отличное</span>
          </div>
          <div style="display: flex; align-items: center; margin: 6px 0;">
            <div style="width: 12px; height: 12px; background: #FFFF00; margin-right: 8px; border-radius: 2px; border: 1px solid #FFAA00;"></div>
            <span>51-100: Удовлетворительное</span>
          </div>
          <div style="display: flex; align-items: center; margin: 6px 0;">
            <div style="width: 12px; height: 12px; background: #FF7E00; margin-right: 8px; border-radius: 2px; border: 1px solid #FF5500;"></div>
            <span>101-150: Нездоровое</span>
          </div>
          <div style="display: flex; align-items: center; margin: 6px 0;">
            <div style="width: 12px; height: 12px; background: #FF0000; margin-right: 8px; border-radius: 2px; border: 1px solid #CC0000;"></div>
            <span>151-200: Опасно</span>
          </div>
          <div style="display: flex; align-items: center; margin: 6px 0;">
            <div style="width: 12px; height: 12px; background: #8F3F97; margin-right: 8px; border-radius: 2px; border: 1px solid #660066;"></div>
            <span>201+: Критично</span>
          </div>
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
            Источник: Демо-данные
          </div>
        </div>
      `;
      return panel;
    }
  });
  map.controls.add(new Legend({ position: { top: 120, right: 20 } }));
}

// Индикатор загрузки
function showLoading(show) {
  let loadingElement = document.getElementById('loading');
  if (!loadingElement && show) {
    loadingElement = document.createElement('div');
    loadingElement.id = 'loading';
    loadingElement.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">Загружаем актуальные данные о воздухе...</div>
    `;
    document.body.appendChild(loadingElement);
  }
  if (loadingElement) {
    loadingElement.style.display = show ? 'flex' : 'none';
  }
}

// Авто-обновление каждые 5 минут
setInterval(refreshData, 5 * 60 * 1000);

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
  updateLastUpdateTime();
});