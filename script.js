// --- КОНФИГУРАЦИЯ FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyA0-bOVlO9jBxuWPiFk0VcqGjfwn-GGAUc",
    authDomain: "ecoskan-spb.firebaseapp.com",
    projectId: "ecoskan-spb",
    storageBucket: "ecoskan-spb.firebasestorage.app",
    messagingSenderId: "767312877187",
    appId: "1:767312877187:web:1fd3759ab2e92ce942edb6"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
let myMap;
let districtsData = [];
let currentUser = null;

// Координаты районов (упрощенные полигоны)
const districtsCoords = [
    { name: "Адмиралтейский", coords: [[59.901, 30.250], [59.905, 30.360], [59.934, 30.355], [59.932, 30.270]] },
    { name: "Василеостровский", coords: [[59.935, 30.198], [59.920, 30.260], [59.945, 30.290], [59.957, 30.210]] },
    { name: "Выборгский", coords: [[59.975, 30.330], [60.030, 30.410], [60.100, 30.350], [60.060, 30.250]] },
    { name: "Калининский", coords: [[59.957, 30.360], [59.980, 30.450], [60.052, 30.430], [60.020, 30.350]] },
    { name: "Кировский", coords: [[59.800, 30.170], [59.840, 30.300], [59.915, 30.310], [59.910, 30.210]] },
    { name: "Колпинский", coords: [[59.725, 30.550], [59.780, 30.760], [59.840, 30.650], [59.810, 30.490]] },
    { name: "Красногвардейский", coords: [[59.925, 30.410], [59.940, 30.530], [60.010, 30.510], [59.980, 30.420]] },
    { name: "Красносельский", coords: [[59.680, 30.080], [59.780, 30.220], [59.870, 30.170], [59.840, 30.050]] },
    { name: "Кронштадтский", coords: [[60.010, 29.660], [59.980, 29.750], [60.000, 29.830], [60.035, 29.740]] },
    { name: "Курортный", coords: [[60.000, 29.950], [60.100, 30.230], [60.250, 29.800], [60.150, 29.400]] },
    { name: "Московский", coords: [[59.770, 30.310], [59.820, 30.400], [59.890, 30.360], [59.870, 30.280]] },
    { name: "Невский", coords: [[59.835, 30.480], [59.880, 30.540], [59.925, 30.440], [59.890, 30.390]] },
    { name: "Петроградский", coords: [[59.955, 30.220], [59.950, 30.340], [59.985, 30.330], [59.980, 30.240]] },
    { name: "Петродворцовый", coords: [[59.850, 29.670], [59.870, 30.040], [59.920, 30.020], [59.900, 29.750]] },
    { name: "Приморский", coords: [[59.980, 30.210], [60.020, 30.310], [60.120, 30.150], [60.050, 29.980]] },
    { name: "Пушкинский", coords: [[59.630, 30.400], [59.720, 30.550], [59.820, 30.450], [59.780, 30.300]] },
    { name: "Фрунзенский", coords: [[59.810, 30.380], [59.840, 30.440], [59.915, 30.380], [59.890, 30.330]] },
    { name: "Центральный", coords: [[59.916, 30.330], [59.925, 30.400], [59.955, 30.390], [59.945, 30.320]] }
];

// --- ИНИЦИАЛИЗАЦИЯ ---
window.addEventListener('DOMContentLoaded', () => {
    initAuthListener();
    setupTabs();
    initMap();
});

// --- AUTH LOGIC ---
function initAuthListener() {
    auth.onAuthStateChanged(user => {
        currentUser = user;
        updateUI();
        if (user) saveVisitToHistory("Главная");
    });
}

function updateUI() {
    const trigger = document.getElementById('auth-trigger');
    const display = document.getElementById('user-display');
    
    if (currentUser) {
        trigger.classList.add('hidden');
        display.classList.remove('hidden');
        const name = currentUser.displayName || currentUser.email.split('@')[0];
        display.textContent = name[0].toUpperCase();
        display.title = name + " (Нажмите для выхода)";
        display.onclick = () => auth.signOut();
    } else {
        trigger.classList.remove('hidden');
        display.classList.add('hidden');
        trigger.onclick = () => toggleAuthModal(true);
    }
}

function toggleAuthModal(show) {
    const modal = document.getElementById('auth-modal');
    if (show) modal.classList.add('open');
    else modal.classList.remove('open');
}

function setupTabs() {
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (tab.dataset.tab === 'login') {
                document.getElementById('form-login').classList.remove('hidden');
                document.getElementById('form-register').classList.add('hidden');
            } else {
                document.getElementById('form-login').classList.add('hidden');
                document.getElementById('form-register').classList.remove('hidden');
            }
            clearErrors();
        });
    });
}

function clearErrors() {
    document.getElementById('login-error').textContent = '';
    document.getElementById('reg-error').textContent = '';
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    try {
        await auth.signInWithEmailAndPassword(email, pass);
        toggleAuthModal(false);
        saveVisitToHistory("Вход выполнен");
    } catch (e) {
        document.getElementById('login-error').textContent = getErrorText(e.code);
    }
}

async function handleRegister() {
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    const confirm = document.getElementById('reg-pass-confirm').value;
    
    if (pass !== confirm) {
        document.getElementById('reg-error').textContent = "Пароли не совпадают";
        return;
    }
    try {
        await auth.createUserWithEmailAndPassword(email, pass);
        toggleAuthModal(false);
    } catch (e) {
        document.getElementById('reg-error').textContent = getErrorText(e.code);
    }
}

async function handleGoogleAuth() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
        toggleAuthModal(false);
    } catch (e) {
        alert("Ошибка Google входа: " + e.message);
    }
}

function handleGuest() {
    toggleAuthModal(false);
}

function getErrorText(code) {
    const errors = {
        'auth/user-not-found': 'Пользователь не найден',
        'auth/wrong-password': 'Неверный пароль',
        'auth/email-already-in-use': 'Email уже занят',
        'auth/weak-password': 'Слабый пароль',
        'auth/invalid-email': 'Неверный email'
    };
    return errors[code] || 'Ошибка авторизации';
}

// --- УМНАЯ ФУНКЦИЯ: ИСТОРИЯ ПОСЕЩЕНИЙ ---
function saveVisitToHistory(districtName) {
    if (!currentUser) return;
    const visitData = {
        district: districtName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        date: new Date().toLocaleDateString('ru-RU')
    };
    db.collection('users').doc(currentUser.uid).collection('visits')
      .add(visitData)
      .catch(err => console.log("История не сохранена:", err));
}

// --- MAP & DATA LOGIC ---
function initMap() {
    ymaps.ready(() => {
        myMap = new ymaps.Map("map", {
            center: [59.9343, 30.3351],
            zoom: 10,
            controls: ['zoomControl']
        });
        loadData();
        setInterval(loadData, 300000); // Автообновление 5 мин
    });
}

async function loadData() {
    try {
        const res = await fetch('https://spbaqi.duckdns.org/api/v1/aqi/spb');
        const data = await res.json();
        districtsData = Object.keys(data).map(key => ({
            name: key,
            ...data[key]
        }));
        drawPolygons();
        document.getElementById('global-loader').style.display = 'none';
    } catch (e) {
        console.error("Ошибка данных:", e);
        document.querySelector('.loader-text').textContent = "Ошибка загрузки данных";
    }
}

function drawPolygons() {
    myMap.geoObjects.removeAll();
    
    districtsCoords.forEach(district => {
        // Попытка найти данные, если не нашли - ставим заглушку
        let data = districtsData.find(d => d.name === district.name) || { aqi_us: 50, pm2_5: 10, pm10: 20, nitrogen_dioxide: 30, ozone: 40 };
        
        const aqi = data.aqi_us || 50;
        const color = getAQIColor(aqi);

        const polygon = new ymaps.Polygon([district.coords], {}, {
            fillColor: color + '60',
            strokeColor: color,
            strokeWidth: 2,
            opacity: 0.8
        });

        polygon.events.add('click', () => {
            showPanel(district.name, data, aqi, color);
            if(currentUser) saveVisitToHistory(district.name);
        });

        myMap.geoObjects.add(polygon);
    });
}

function getAQIColor(aqi) {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#fbbf24';
    if (aqi <= 150) return '#f97316';
    return '#ef4444';
}

function showPanel(name, data, aqi, color) {
    const panel = document.getElementById('info-panel');
    document.getElementById('panel-district').textContent = name;
    document.getElementById('panel-aqi').textContent = aqi;
    document.getElementById('panel-aqi').style.backgroundColor = color;
    document.getElementById('panel-aqi').style.color = aqi > 150 ? '#fff' : '#000';
    
    document.getElementById('panel-status').textContent = getStatusText(aqi);
    document.getElementById('panel-desc').textContent = getRecommendation(aqi);

    document.getElementById('val-pm25').textContent = (data.pm2_5 || 0).toFixed(1);
    document.getElementById('val-pm10').textContent = (data.pm10 || 0).toFixed(1);
    document.getElementById('val-no2').textContent = (data.nitrogen_dioxide || 0).toFixed(1);
    document.getElementById('val-o3').textContent = (data.ozone || 0).toFixed(1);

    panel.classList.add('active');
}

function closePanel() {
    document.getElementById('info-panel').classList.remove('active');
}

function getStatusText(aqi) {
    if (aqi <= 50) return "Отличное";
    if (aqi <= 100) return "Нормальное";
    if (aqi <= 150) return "Умеренное";
    return "Опасное";
}

function getRecommendation(aqi) {
    if (aqi <= 50) return "Идеально для прогулок.";
    if (aqi <= 100) return "Комфортно для большинства.";
    if (aqi <= 150) return "Чувствительным людям лучше быть осторожнее.";
    return "Избегайте активности на улице.";
}
