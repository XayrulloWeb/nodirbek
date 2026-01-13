import { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import './App.css';

// --- КОНФИГУРАЦИЯ FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCboYDC9dCLIYNORBXagy5iLGiGjp_cxaE",
  authDomain: "test-e6304.firebaseapp.com",
  databaseURL: "https://test-e6304-default-rtdb.firebaseio.com",
  projectId: "test-e6304",
  storageBucket: "test-e6304.firebasestorage.app",
  messagingSenderId: "629485694907",
  appId: "1:629485694907:web:2178b865f488447b0d1e9e",
  measurementId: "G-PN23X0R0K4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- КОМПОНЕНТ КАРТОЧКИ ---
const SensorCard = ({ title, value, unit, icon, color, sub, type }) => (
  <div className={`sensor-card ${type}`} style={{ '--accent-color': color }}>
    <div className="card-bg-glow"></div>
    <div className="card-header">
      <div className="icon-box">{icon}</div>
      <span className="card-title">{title}</span>
    </div>
    <div className="card-body">
      <span className="value">{value}</span>
      <span className="unit">{unit}</span>
    </div>
    <div className="card-footer">
      {sub}
    </div>
  </div>
);

// --- ИКОНКИ (SVG) ---
const Icons = {
  Temp: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>,
  Hum: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>,
  Press: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M16.24 7.76l-2.12 2.12"></path><path d="M12 16v-4"></path><path d="M8 12h4"></path></svg>,
  Oxy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1 2.96-3.08 3 3 0 0 1-.3-1.6 2.5 2.5 0 0 1-1-4.92V4.5A2.5 2.5 0 0 1 9.5 2z"></path><path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 14.5 2z"></path></svg>
};

function App() {
  const [realData, setRealData] = useState({ temp: '--', hum: '--' });
  const [fakeData, setFakeData] = useState({ pressure: 760, oxygen: 21.0 });
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Часы
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Firebase Realtime
  useEffect(() => {
    const sensorRef = ref(db, 'sensor_data');
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setRealData(val);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fake Data Generator
  useEffect(() => {
    const interval = setInterval(() => {
      setFakeData({
        pressure: Math.floor(Math.random() * (762 - 758 + 1)) + 758,
        oxygen: (Math.random() * (21.2 - 20.8) + 20.8).toFixed(1)
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-wrapper">
      {/* Фоновые эффекты */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-grid"></div>

      <div className="content-container">
        <header>
          <div className="header-top">
            <span className="live-badge">
              <span className="pulse-dot"></span> LIVE
            </span>
            <span className="time-display">{time}</span>
          </div>
          <p className="subtitle">Maktab Monitoring Sistemasi</p>
        </header>

        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Связь со спутником...</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            <SensorCard 
              title="Temperatura" 
              value={realData.temp} 
              unit="°C" 
              icon={Icons.Temp} 
              color="#ff4b1f"
              sub="Датчик DHT22 (Real)"
              type="primary"
            />
            
            <SensorCard 
              title="Namlik" 
              value={realData.hum} 
              unit="%" 
              icon={Icons.Hum} 
              color="#1fddff"
              sub="Датчик DHT22 (Real)"
              type="primary"
            />

            <SensorCard 
              title="Davleniya" 
              value={fakeData.pressure} 
              unit="мм" 
              icon={Icons.Press} 
              color="#a8ff78"
              sub="Барометр (Sim)"
              type="secondary"
            />

            <SensorCard 
              title="Kislorod" 
              value={fakeData.oxygen} 
              unit="%" 
              icon={Icons.Oxy} 
              color="#fbd786"
              sub="Анализатор (Sim)"
              type="secondary"
            />
          </div>
        )}

        <footer>
          <p>System ID: E6304 • Secure Connection</p>
        </footer>
      </div>
    </div>
  );
}

export default App;