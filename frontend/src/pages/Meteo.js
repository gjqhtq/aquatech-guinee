import { useState, useEffect } from 'react';

// Coordonnées des principales zones de pêche en Guinée
const ZONES = [
  { nom: 'Conakry',       lat: 9.6412,  lon: -13.5784 },
  { nom: 'Coyah',         lat: 9.7050,  lon: -13.3822 },
  { nom: 'Boffa',         lat: 10.1833, lon: -14.0333 },
  { nom: 'Boké',          lat: 10.9333, lon: -14.3000 },
  { nom: 'Kindia',        lat: 10.0500, lon: -12.8667 },
  { nom: 'Forécariah',    lat: 9.4333,  lon: -13.0833 },
];

const CODES_METEO = {
  0: 'Ciel dégagé', 1: 'Principalement dégagé', 2: 'Partiellement nuageux', 3: 'Couvert',
  45: 'Brouillard', 48: 'Brouillard givrant',
  51: 'Bruine légère', 53: 'Bruine modérée', 55: 'Bruine dense',
  61: 'Pluie légère', 63: 'Pluie modérée', 65: 'Pluie forte',
  80: 'Averses légères', 81: 'Averses modérées', 82: 'Averses violentes',
  95: 'Orage', 96: 'Orage avec grêle', 99: 'Orage violent',
};

const niveauVent = (v) => {
  if (v < 20) return { label: 'Faible', color: 'var(--green)' };
  if (v < 40) return { label: 'Modéré', color: 'var(--orange)' };
  return { label: 'Fort — Prudence', color: 'var(--red)' };
};

const niveauPluie = (p) => {
  if (p < 1) return { label: 'Aucune', color: 'var(--green)' };
  if (p < 5) return { label: 'Légère', color: 'var(--orange)' };
  return { label: 'Forte', color: 'var(--red)' };
};

const Meteo = () => {
  const [zone, setZone] = useState(ZONES[0]);
  const [data, setData] = useState(null);
  const [load, setLoad] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const charger = async () => {
      setLoad(true); setErreur(''); setData(null);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${zone.lat}&longitude=${zone.lon}` +
          `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weathercode` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weathercode` +
          `&timezone=Africa%2FConakry&forecast_days=5`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Erreur réseau');
        const json = await res.json();
        setData(json);
      } catch {
        setErreur('Impossible de récupérer les données météo. Vérifiez votre connexion internet.');
      } finally { setLoad(false); }
    };
    charger();
  }, [zone]);

  const current = data?.current;
  const daily   = data?.daily;
  const vent    = current ? niveauVent(current.wind_speed_10m) : null;
  const pluie   = current ? niveauPluie(current.precipitation) : null;
  const sortirEnMer = vent?.label === 'Faible' && pluie?.label === 'Aucune';

  return (
    <div className="page">
      <div className="page-header anim">
        <div>
          <h1>Conditions météo marines</h1>
          <p>Données en temps réel — Source : Open-Meteo (gratuit)</p>
        </div>
      </div>

      {/* Sélecteur de zone */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }} className="anim-d1">
        {ZONES.map(z => (
          <button
            key={z.nom}
            onClick={() => setZone(z)}
            className={`category-tab ${zone.nom === z.nom ? 'active' : ''}`}
          >
            {z.nom}
          </button>
        ))}
      </div>

      {load && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--primary-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {erreur && (
        <div className="alert alert-error">{erreur}</div>
      )}

      {current && !load && (
        <>
          {/* Alerte sortie en mer */}
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius)',
            marginBottom: '1.5rem',
            background: sortirEnMer ? 'var(--green-bg)' : 'var(--red-bg)',
            border: `1px solid ${sortirEnMer ? 'var(--green-border)' : 'var(--red-border)'}`,
            borderLeft: `4px solid ${sortirEnMer ? 'var(--green)' : 'var(--red)'}`,
            display: 'flex', alignItems: 'center', gap: '0.75rem'
          }} className="anim-d1">
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: sortirEnMer ? 'var(--green)' : 'var(--red)', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, color: sortirEnMer ? 'var(--green)' : 'var(--red)', fontSize: '0.9rem' }}>
                {sortirEnMer ? 'Conditions favorables à la pêche' : 'Conditions défavorables — Prudence recommandée'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.1rem' }}>
                Zone : {zone.nom} — {CODES_METEO[current.weathercode] || 'Conditions variables'}
              </p>
            </div>
          </div>

          {/* Données actuelles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }} className="anim-d2">
            {[
              { label: 'Température', value: `${current.temperature_2m}°C`, color: 'var(--primary)' },
              { label: 'Humidité',    value: `${current.relative_humidity_2m}%`, color: 'var(--teal)' },
              { label: 'Vent',        value: `${current.wind_speed_10m} km/h`, sub: vent.label, color: vent.color },
              { label: 'Précipitations', value: `${current.precipitation} mm`, sub: pluie.label, color: pluie.color },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border-light)',
                borderTop: `3px solid ${s.color}`, borderRadius: 'var(--radius)',
                padding: '1.25rem', boxShadow: 'var(--shadow)'
              }}>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.3rem' }}>{s.label}</p>
                {s.sub && <p style={{ fontSize: '0.72rem', fontWeight: 600, color: s.color, marginTop: '0.15rem' }}>{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Prévisions 5 jours */}
          {daily && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }} className="anim-d3">
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)' }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Prévisions 5 jours</p>
              </div>
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)', textAlign: 'left' }}>
                      {['Date', 'Conditions', 'Min / Max', 'Vent max', 'Pluie'].map(h => (
                        <th key={h} style={{ padding: '0.65rem 1rem', fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {daily.time.map((date, i) => {
                      const v = niveauVent(daily.wind_speed_10m_max[i]);
                      const p = niveauPluie(daily.precipitation_sum[i]);
                      return (
                        <tr key={date} style={{ borderTop: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                            {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--muted)' }}>
                            {CODES_METEO[daily.weathercode[i]] || '—'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                            {daily.temperature_2m_min[i]}° / {daily.temperature_2m_max[i]}°C
                          </td>
                          <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                            <span style={{ color: v.color, fontWeight: 600 }}>{daily.wind_speed_10m_max[i]} km/h</span>
                            <span style={{ fontSize: '0.72rem', color: v.color, marginLeft: '0.3rem' }}>({v.label})</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                            <span style={{ color: p.color, fontWeight: 600 }}>{daily.precipitation_sum[i]} mm</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Meteo;
