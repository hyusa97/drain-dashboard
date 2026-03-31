import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API = 'https://drain-backend-production.up.railway.app';

const conditionColor = { clean: 'green', blocked: 'red', medium: 'orange' };
const markerColor = { start: 'green', junction: 'blue', end: 'red' };

function App() {
  const [drains, setDrains] = useState([]);

  useEffect(() => {
    const fetchDrains = async () => {
      try {
        const res = await fetch(`${API}/drains`);
        const data = await res.json();
        setDrains(data);
      } catch (e) { console.error(e); }
    };
    fetchDrains();
    const iv = setInterval(fetchDrains, 10000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <div style={{ position: 'absolute', top: 10, left: 60, zIndex: 1000, background: 'white', padding: '6px 12px', borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
        Drains: {drains.length}
      </div>
      <MapContainer center={[20.2961, 85.8245]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {drains.map(drain => {
          if (!drain.path || drain.path.length < 2) return null;
          const positions = drain.path.map(p => [p.lat, p.lng]);
          const color = conditionColor[drain.reported_condition] || 'blue';
          return (
            <React.Fragment key={drain._id}>
              <Polyline positions={positions} color={color} weight={4}>
                <Popup>
                  <b>{drain.name}</b><br />
                  Type: {drain.drain_type || '-'}<br />
                  Condition: {drain.reported_condition}<br />
                  Mapper: {drain.mapper_name}<br />
                  Status: {drain.status}<br />
                  {drain.image && <img src={drain.image} alt="drain" style={{ width: 150, marginTop: 6 }} />}
                </Popup>
              </Polyline>
              {drain.markers && drain.markers.map((m, i) => {
                const pos = drain.path[m.index];
                if (!pos) return null;
                return (
                  <CircleMarker key={i} center={[pos.lat, pos.lng]} radius={6} color={markerColor[m.type] || 'gray'}>
                    <Popup>{m.type}</Popup>
                  </CircleMarker>
                );
              })}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default App;
