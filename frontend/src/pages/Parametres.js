import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const Parametres = () => {
  const [prefs, setPrefs] = useState([]);
  const [load, setLoad] = useState(true);
  const [notif, setNotif] = useState(null);
  const [saving, setSaving] = useState(false);

  const LABELS = {
    commande: { emoji: '📦', label: 'Notifications de commandes' },
    message: { emoji: '💬', label: 'Messages reçus' },
    stock: { emoji: '📉', label: 'Alertes de stock bas' },
    produit: { emoji: '🐟', label: 'Produit non vendu (48h)' },
    evaluation: { emoji: '⭐', label: 'Nouvelles évaluations' },
    sanitaire: { emoji: '🏥', label: 'Alertes sanitaires' },
    promo: { emoji: '🎁', label: 'Promotions et offres' },
    systeme: { emoji: '⚙️', label: 'Notifications système' }
  };

  const chargerPrefs = useCallback(async () => {
    try {
      setLoad(true);
      const r = await api.get('/preferences-notification');
      setPrefs(r.data.preferences || []);
    } catch (e) {
      console.error('Erreur :', e);
      afficherNotif('Erreur lors du chargement des préférences.', false);
    } finally {
      setLoad(false);
    }
  }, []);

  useEffect(() => {
    chargerPrefs();
  }, [chargerPrefs]);

  const afficherNotif = (msg, ok = true) => {
    setNotif({ msg, ok });
    setTimeout(() => setNotif(null), 3000);
  };

  const sauvegarderPref = async (type, field, value) => {
    setSaving(true);
    try {
      const current = prefs.find(p => p.type === type) || {};
      const updated = { ...current, [field]: value };

      await api.put(`/preferences-notification/${type}`, {
        enabled: updated.enabled !== undefined ? updated.enabled : true,
        canal: updated.canal || 'app',
        frequence: updated.frequence || 'immediat'
      });

      setPrefs(prefs.map(p => p.type === type ? { ...p, [field]: value } : p));
      afficherNotif('Préférence mise à jour.');
    } catch (e) {
      afficherNotif(e.response?.data?.message || 'Erreur.', false);
    } finally {
      setSaving(false);
    }
  };

  const reinitialiserPrefs = async () => {
    if (!window.confirm('Êtes-vous sûr(e) ? Les préférences seront restaurées aux défauts.')) {
      return;
    }
    try {
      setSaving(true);
      await api.post('/preferences-notification/reset/all');
      chargerPrefs();
      afficherNotif('Préférences réinitialisées.');
    } catch (e) {
      afficherNotif('Erreur.', false);
    } finally {
      setSaving(false);
    }
  };

  if (load) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--primary-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header anim">
        <div>
          <h1>Paramètres 🔧</h1>
          <p>Gérez vos préférences de notifications</p>
        </div>
      </div>

      {notif && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem',
          background: notif.ok ? 'var(--green-bg)' : 'var(--red-bg)',
          color: notif.ok ? 'var(--green)' : 'var(--red)',
          border: `1px solid ${notif.ok ? 'var(--green-border)' : 'var(--red-border)'}`,
          fontSize: '0.875rem', fontWeight: 500, animation: 'fadeUp 0.3s ease both'
        }}>{notif.msg}</div>
      )}

      <div style={{ marginBottom: '2rem' }} className="anim-d1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Types de notification</h2>
          <button
            onClick={reinitialiserPrefs}
            disabled={saving}
            className="btn btn-sm btn-ghost"
            style={{ fontSize: '0.8rem', color: 'var(--muted)' }}
          >
            Réinitialiser
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {prefs.map((p, i) => {
            const info = LABELS[p.type] || { emoji: '📧', label: p.type };
            return (
              <div key={p.type} className={`anim-d${Math.min(i + 1, 5)}`} style={{
                background: '#fff', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius)', padding: '1rem',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{info.emoji}</span>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                      {info.label}
                    </h3>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  {/* Activé/Désactivé */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500, marginBottom: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={p.enabled !== false}
                        onChange={(e) => sauvegarderPref(p.type, 'enabled', e.target.checked)}
                        disabled={saving}
                        style={{ cursor: 'pointer' }}
                      />
                      Activée
                    </label>
                  </div>

                  {/* Canal */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500, marginBottom: '0.4rem' }}>
                      Canal
                    </label>
                    <select
                      value={p.canal || 'app'}
                      onChange={(e) => sauvegarderPref(p.type, 'canal', e.target.value)}
                      disabled={saving || p.enabled === false}
                      style={{
                        width: '100%', padding: '0.5rem 0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem', background: '#fff', cursor: 'pointer'
                      }}
                    >
                      <option value="app">App</option>
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                    </select>
                  </div>

                  {/* Fréquence */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500, marginBottom: '0.4rem' }}>
                      Fréquence
                    </label>
                    <select
                      value={p.frequence || 'immediat'}
                      onChange={(e) => sauvegarderPref(p.type, 'frequence', e.target.value)}
                      disabled={saving || p.enabled === false}
                      style={{
                        width: '100%', padding: '0.5rem 0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem', background: '#fff', cursor: 'pointer'
                      }}
                    >
                      <option value="immediat">Immédiat</option>
                      <option value="quotidien">Quotidien</option>
                      <option value="hebdo">Hebdo</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-xs)', color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.6, marginTop: '2rem' }} className="anim-d2">
        <p style={{ margin: 0, marginBottom: '0.5rem', fontWeight: 600 }}>💡 Besoin d'aide ?</p>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li><strong>Activée</strong> : Vous recevrez ce type de notification</li>
          <li><strong>Canal</strong> : App (dans l'application), SMS, ou Email</li>
          <li><strong>Fréquence</strong> : Immédiat (dès que ça se passe), Quotidien (une fois par jour), ou Hebdomadaire</li>
        </ul>
      </div>
    </div>
  );
};

export default Parametres;
