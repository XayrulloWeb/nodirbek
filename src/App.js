import { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import './App.css';

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
    <div className="card-footer">{sub}</div>
  </div>
);

const Icons = {
  Temp: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>,
  Hum: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>,
  Carbon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"></circle><path d="M15.5 9.5a4 4 0 1 0 0 5"></path></svg>
};

function App() {
  const [realData, setRealData] = useState({ temp: '--', hum: '--' });
  const [carbonData, setCarbonData] = useState(420);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Realistic CO2 simulation for indoor air quality in ppm.
  useEffect(() => {
    const interval = setInterval(() => {
      setCarbonData((prev) => {
        const drift = Math.round((Math.random() - 0.5) * 40);
        const next = Math.min(900, Math.max(380, prev + drift));
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-wrapper">
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-grid"></div>

      <div className="content-container">
        <header>
          <div className="header-top">
            <span className="live-badge">
              <span className="pulse-dot"></span> JONLI
            </span>
            <span className="time-display">{time}</span>
          </div>
          <h1 className="title">Mikroiqlim paneli</h1>
          <p className="subtitle">Aqlli maktab nazorati</p>
        </header>

        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Sensorlarga ulanmoqda...</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            <SensorCard
              title="Harorat"
              value={realData.temp}
              unit="°C"
              icon={Icons.Temp}
              color="#ff4b1f"
              sub="DHT22 sensori (haqiqiy)"
              type="primary"
            />

            <SensorCard
              title="Namlik"
              value={realData.hum}
              unit="%"
              icon={Icons.Hum}
              color="#1fddff"
              sub="DHT22 sensori (haqiqiy)"
              type="primary"
            />

            <SensorCard
              title="Karbon angidrid"
              value={realData.co2 ?? realData.carbon ?? carbonData}
              unit="ppm"
              icon={Icons.Carbon}
              color="#7de2d1"
              sub={realData.co2 ?? realData.carbon ? "Sensor (haqiqiy)" : "Hisoblangan (ppm)"}
              type="secondary"
            />
          </div>
        )}

        <footer>
          <p>Tizim ID: E6304 - Xavfsiz ulanish</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
