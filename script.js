// ────────────────────────────────────────────────
// КОНФИГУРАЦИЯ
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
let selectedDistrict = null;
let panelData = {};

// ────────────────────────────────────────────────
// ЗАГРУЗОЧНЫЙ ЭКРАН
// ────────────────────────────────────────────────
function showLoader(msg = 'Загрузка...') {
  let loader = document.getElementById('global-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'loader-overlay';
    loader.innerHTML = `<div class="loader"></div><span class="loader-text">${msg}</span>`;
    document.body.appendChild(loader);
  } else {
    loader.querySelector('.loader-text').textContent = msg;
    loader.style.display = '';
  }
}
function hideLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) loader.style.display = 'none';
}

// ────────────────────────────────────────────────
// FIREBASE
// ────────────────────────────────────────────────
firebase.initializeApp({
  apiKey: "AIzaSyA0-bOVlO9jBxuWPiFk0VcqGjfwn-GGAUc",
  authDomain: "ecoskan-spb.firebaseapp.com",
  projectId: "ecoskan-spb",
  storageBucket: "ecoskan-spb.firebasestorage.app",
  messagingSenderId: "767312877187",
  appId: "1:767312877187:web:1fd3759ab2e92ce942edb6"
});

// ────────────────────────────────────────────────
// ВХОД ЧЕРЕЗ GOOGLE
// ────────────────────────────────────────────────
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await firebase.auth().signInWithPopup(provider);
    return result.user;
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      console.log('Окно входа закрыто');
      return null;
    }
    console.error('Ошибка входа:', error);
    return null;
  }
}

// ────────────────────────────────────────────────
// СЛУШАТЕЛЬ АВТОРИЗАЦИИ
// ────────────────────────────────────────────────
firebase.auth().onAuthStateChanged(user => updateAuthUI(user));

// ────────────────────────────────────────────────
// ПЕРВЫЙ ВИЗИТ
// ────────────────────────────────────────────────
function checkFirstVisit() {
  if (!localStorage.getItem('hasVisited')) {
    document.getElementById('welcome-modal').classList.remove('hidden');
  } else {
    document.getElementById('welcome-modal').classList.add('hidden');
    initApp();
  }
}

// ────────────────────────────────────────────────
// КНОПКИ ПРИВЕТСТВИЯ
// ────────────────────────────────────────────────
function setupWelcomeButtons() {
  document.getElementById('welcome-google-btn').onclick = async () => {
    const user = await signInWithGoogle();
    if (user) {
      localStorage.setItem('hasVisited', 'true');
      localStorage.setItem('authMode', 'google');
      document.getElementById('welcome-modal').classList.add('hidden');
      initApp();
    }
  };

  document.getElementById('welcome-register-btn').onclick = () => {
    document.getElementById('welcome-buttons').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
  };

  document.getElementById('cancel-register').onclick = () => {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('welcome-buttons').classList.remove('hidden');
  };

  document.getElementById('submit-register').onclick = async () => {
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    if (!email || !password) { alert('Заполните все поля'); return; }
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      localStorage.setItem('hasVisited', 'true');
      localStorage.setItem('authMode', 'email');
      document.getElementById('welcome-modal').classList.add('hidden');
      initApp();
    } catch (e) {
      alert('Ошибка регистрации: ' + e.message);
    }
  };

  document.getElementById('welcome-guest-btn').onclick = () => {
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('authMode', 'guest');
    document.getElementById('welcome-modal').classList.add('hidden');
    initApp();
  };
}

// ────────────────────────────────────────────────
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ────────────────────────────────────────────────
function initApp() {
  if (myMap) return;

  // ========== МОБИЛЬНЫЙ БУРГЕР ==========
  const burgerBtn = document.getElementById('burger-btn');
  const sidebar = document.querySelector('.sidebar');
  if (burgerBtn && sidebar) {
    burgerBtn.onclick = () => {
      sidebar.classList.toggle('open');
    };
  }

  // ========== МОБИЛЬНЫЕ КНОПКИ ==========
  const mobileAccountBtn = document.getElementById('mobile-account-btn');
  const mobileSettingsBtn = document.getElementById('mobile-settings-btn');
  if (mobileAccountBtn) {
    mobileAccountBtn.onclick = () => {
      document.getElementById('account-modal').classList.remove('hidden');
      sidebar?.classList.remove('open');
    };
  }
  if (mobileSettingsBtn) {
    mobileSettingsBtn.onclick = () => {
      document.getElementById('settings-modal').classList.remove('hidden');
      sidebar?.classList.remove('open');
    };
  }

  // ========== ДЕСКТОПНЫЕ КНОПКИ ==========
  document.getElementById('account-btn').onclick = () => {
    document.getElementById('account-modal').classList.remove('hidden');
  };
  document.getElementById('close-account-modal').onclick = () => {
    document.getElementById('account-modal').classList.add('hidden');
  };

  document.getElementById('google-signin-btn').onclick = async () => {
    await signInWithGoogle();
  };

  document.getElementById('signout-btn').onclick = async () => {
    await firebase.auth().signOut();
    updateAuthUI(null);
  };

  // ========== НАСТРОЙКИ ==========
  document.getElementById('settings-btn').onclick = () => {
    document.getElementById('settings-modal').classList.remove('hidden');
  };
  document.getElementById('close-settings-modal').onclick = () => {
    document.getElementById('settings-modal').classList.add('hidden');
  };

  const themeSelect = document.getElementById('theme-select');
  themeSelect.value = localStorage.getItem('theme') || 'dark';
  applyTheme(themeSelect.value);
  themeSelect.onchange = (e) => {
    localStorage.setItem('theme', e.target.value);
    applyTheme(e.target.value);
  };

  document.getElementById('units-select').value = localStorage.getItem('units') || 'mkg';
  document.getElementById('units-select').onchange = (e) => localStorage.setItem('units', e.target.value);

  document.getElementById('push-toggle').checked = localStorage.getItem('push') === 'true';
  document.getElementById('push-toggle').onchange = (e) => localStorage.setItem('push', e.target.checked);

  // ========== ЗАКРЫТИЕ МОДАЛОК ==========
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.onclick = () => overlay.closest('.modal').classList.add('hidden');
  });

  // ========== ОБРАТНАЯ СВЯЗЬ ==========
  document.getElementById('contact-btn').onclick = () => document.getElementById('contact-modal').classList.remove('hidden');
  document.getElementById('close-modal').onclick = () => document.getElementById('contact-modal').classList.add('hidden');
  document.getElementById('contact-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('user-email').value.trim();
    const message = document.getElementById('user-message').value.trim();
    try {
      const res = await fetch('https://formspree.io/f/movjzrqz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, message, _subject: 'Сообщение с карты качества воздуха' })
      });
      if (res.ok) {
        document.getElementById('contact-form').classList.add('hidden');
        document.getElementById('form-success').classList.remove('hidden');
        setTimeout(() => {
          document.getElementById('contact-form').reset();
          document.getElementById('contact-form').classList.remove('hidden');
          document.getElementById('form-success').classList.add('hidden');
          document.getElementById('contact-modal').classList.add('hidden');
        }, 3000);
      } else {
        alert('Ошибка отправки');
      }
    } catch (err) {
      alert('Не удалось отправить сообщение');
    }
  };

  // ========== КАРТА ==========
  ymaps.ready(() => {
    myMap = new ymaps.Map('map', { center: SPB_CENTER, zoom: 10, controls: [] });
    document.getElementById('zoom-in').onclick = () => myMap.setZoom(myMap.getZoom() + 1);
    document.getElementById('zoom-out').onclick = () => myMap.setZoom(myMap.getZoom() - 1);
    document.getElementById('locate-btn').onclick = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => myMap.setCenter([pos.coords.latitude, pos.coords.longitude], 14),
          err => console.warn('Геолокация недоступна:', err.message)
        );
      }
    };
    document.getElementById('refresh-btn').onclick = handleRefreshClick;
    document.getElementById('close-info').onclick = () => {
      document.getElementById('info').classList.add('hidden');
      selectedDistrict = null;
    };
    showLoader('Собираем свежие данные о качестве воздуха Санкт-Петербурга…');
    refreshData(true).then(() => hideLoader());
    setInterval(refreshData, 300000);
  });
}

// ────────────────────────────────────────────────
// ТЕМЫ
// ────────────────────────────────────────────────
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.style.setProperty('--bg-primary', '#f8fafc');
    root.style.setProperty('--bg-secondary', '#ffffff');
    root.style.setProperty('--bg-card', '#f1f5f9');
    root.style.setProperty('--text-primary', '#0f172a');
    root.style.setProperty('--text-secondary', '#64748b');
  } else {
    root.style.setProperty('--bg-primary', '#0f1117');
    root.style.setProperty('--bg-secondary', '#1a1d27');
    root.style.setProperty('--bg-card', '#242836');
    root.style.setProperty('--text-primary', '#eef0f6');
    root.style.setProperty('--text-secondary', '#8b8fa3');
  }
}

// ────────────────────────────────────────────────
// AQI И КАРТА
// ────────────────────────────────────────────────
function handleRefreshClick() {
  const btn = document.getElementById('refresh-btn');
  const text = document.getElementById('refresh-btn-text');
  btn.disabled = true;
  text.textContent = 'Обновление...';
  showLoader('Обновление данных…');
  refreshData(true).then(() => {
    btn.disabled = false;
    text.textContent = 'Обновить';
    hideLoader();
  });
}

async function refreshData(force = false) {
  if (!force && Date.now() - lastRefresh < 300000) return;
  lastRefresh = Date.now();
  currentData = await loadDistrictAQI();
  updateMap();
  updateStats();
  updateLastUpdateTime();
}

async function loadDistrictAQI() {
  try {
    const res = await fetch('https://spbaqi.duckdns.org/api/v1/aqi/spb');
    if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
    const json = await res.json();
    return json.items.map(item => ({
      id: item.id, district: item.name,
      aqi: item.data?.us_aqi || 0, pm25: item.data?.pm2_5 || 0,
      pm10: item.data?.pm10 || 0, no2: item.data?.nitrogen_dioxide || 0,
      o3: item.data?.ozone || 0, so2: item.data?.sulphur_dioxide || 0,
      co: item.data?.carbon_monoxide || 0
    }));
  } catch (err) { console.error(err); return []; }
}

function updateMap() {
  if (!myMap) return;
  myMap.geoObjects.removeAll();
  currentData.forEach(item => {
    const d = districts.find(x => x.name === item.district);
    if (!d) return;
    const q = getQuality(item.aqi);
    const poly = new ymaps.Polygon([d.coords], {}, {
      fillColor: q.color + '66', strokeColor: q.color, strokeWidth: 2, opacity: 0.75
    });
    poly.events.add('click', () => {
      selectedDistrict = item.district; panelData = { ...item };
      renderPanel(panelData);
      document.getElementById('info').classList.remove('hidden');
    });
    myMap.geoObjects.add(poly);
  });
}

function getQuality(aqi) {
  if (aqi <= 50)  return { color: '#00e400', text: 'Отличное',   status: 'Здоровое',                     rec: 'Можно спокойно гулять.' };
  if (aqi <= 100) return { color: '#ffff00', text: 'Хорошее',    status: 'Умеренное',                    rec: 'Подходит большинству людей.' };
  if (aqi <= 150) return { color: '#ff7e00', text: 'Умеренно',   status: 'Нездорово для чувствительных', rec: 'Сократите активность на улице.' };
  if (aqi <= 200) return { color: '#ff0000', text: 'Нездорово',  status: 'Опасно',                       rec: 'Ограничьте пребывание на улице.' };
  return                 { color: '#8f3f97', text: 'Очень плохо', status: 'Критично',                     rec: 'Лучше оставаться дома.' };
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
  const best  = currentData.reduce((a, b) => a.aqi < b.aqi ? a : b);
  const worst = currentData.reduce((a, b) => a.aqi > b.aqi ? a : b);
  document.getElementById('avg-aqi').textContent       = avg;
  document.getElementById('best-district').textContent  = best.district;
  document.getElementById('worst-district').textContent = worst.district;
}

function updateLastUpdateTime() {
  document.getElementById('last-update-time').textContent = 
    `Обновлено: ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
}

// ────────────────────────────────────────────────
// UI АВТОРИЗАЦИИ
// ────────────────────────────────────────────────
function updateAuthUI(user) {
  const googleBtn = document.getElementById('google-signin-btn');
  const userInfo = document.getElementById('user-info');
  if (!googleBtn || !userInfo) return;

  if (user) {
    googleBtn.classList.add('hidden');
    userInfo.classList.remove('hidden');
    document.getElementById('user-name').textContent = user.displayName || user.email || 'Пользователь';
    const avatar = document.getElementById('user-avatar');
    if (user.photoURL) {
      avatar.innerHTML = `<img src="${user.photoURL}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      avatar.innerHTML = '';
    }
  } else {
    googleBtn.classList.remove('hidden');
    userInfo.classList.add('hidden');
  }
}

// ────────────────────────────────────────────────
// ЗАПУСК
// ────────────────────────────────────────────────
setupWelcomeButtons();
checkFirstVisit();