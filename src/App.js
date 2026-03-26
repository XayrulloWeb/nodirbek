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

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const co2ToAirQuality = (co2Value) => {
  if (co2Value == null) {
    return null;
  }

  const normalized = 100 - ((co2Value - 400) / 14);
  return Math.round(clamp(normalized, 42, 99));
};

const getNextAirQualityTarget = (current) => {
  const baseDrift = (Math.random() - 0.5) * 4;
  const dip = Math.random() < 0.22 ? -(3 + Math.random() * 6) : 0;
  const recovery = Math.random() < 0.18 ? 2 + Math.random() * 4 : 0;

  return Math.round(clamp(current + baseDrift + dip + recovery, 78, 99));
};

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
  const [airQualityTarget, setAirQualityTarget] = useState(96);
  const [airQualityValue, setAirQualityValue] = useState(96);
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

  useEffect(() => {
    const sensorPercent = toNumber(
      realData.airQuality ?? realData.air_quality ?? realData.co2_percent ?? realData.carbon_percent
    );
    const sensorCo2 = toNumber(realData.co2 ?? realData.carbon);

    if (sensorPercent !== null) {
      setAirQualityTarget(Math.round(clamp(sensorPercent, 0, 100)));
      return;
    }

    if (sensorCo2 !== null) {
      setAirQualityTarget(co2ToAirQuality(sensorCo2));
    }
  }, [realData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAirQualityValue((prev) => {
        const difference = airQualityTarget - prev;

        if (Math.abs(difference) < 0.35) {
          return airQualityTarget;
        }

        const step = difference * 0.28 + (Math.random() - 0.5) * 0.45;
        const nextValue = prev + step;
        return Number(clamp(nextValue, 0, 100).toFixed(1));
      });
    }, 900);

    return () => clearInterval(interval);
  }, [airQualityTarget]);

  useEffect(() => {
    const sensorPercent = toNumber(
      realData.airQuality ?? realData.air_quality ?? realData.co2_percent ?? realData.carbon_percent
    );
    const sensorCo2 = toNumber(realData.co2 ?? realData.carbon);

    if (sensorPercent !== null || sensorCo2 !== null) {
      return;
    }

    const interval = setInterval(() => {
      setAirQualityTarget((prev) => getNextAirQualityTarget(prev));
    }, 4500);

    return () => clearInterval(interval);
  }, [realData]);

  const hasLiveAirQuality =
    toNumber(realData.airQuality ?? realData.air_quality ?? realData.co2_percent ?? realData.carbon_percent) !== null ||
    toNumber(realData.co2 ?? realData.carbon) !== null;

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
              unit={"\u00B0C"}
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
              title="Havo sifati"
              value={Math.round(airQualityValue)}
              unit="%"
              icon={Icons.Carbon}
              color="#7de2d1"
              sub={hasLiveAirQuality ? "Sensor asosida (haqiqiy)" : "Dinamik hisoblangan (foiz)"}
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
