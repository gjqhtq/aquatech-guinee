import { useState, useEffect } from 'react';
import api from '../services/api';

const TYPE_CONFIG = {
  commande: { label: 'Commande', color: 'var(--primary)',  bg: 'var(--primary-bg)' },
  message:  { label: 'Message',  color: 'var(--purple)',   bg: 'var(--purple-bg)' },
  stock:    { label: 'Stock',    color: 'var(--orange)',   bg: 'var(--orange-bg)' },
  meteo:    { label: 'Météo',    color: 'var(--teal)',     bg: 'var(--teal-bg)' },
  sanitaire:{ label: 'Alerte',   color: 'var(--red)',      bg: 'var(--red-bg)' },
  systeme:  { label: 'Système',  color: 'var(--muted)',    bg: 'var(--surface3)' },
};

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then(r => setNotifs(r.data.notifications || []))
      .catch(() => {})
      .finally(() => setLoad(false));
  }, []);

  const marquerLue = async (id) => {
    try {
      await api.put('/notifications/' + id + '/lue');
      setNotifs(n => n.map(x => x.id === id ? { ...x, lu: true } : x));
    } catch {}
  };

  const toutMarquer = async () => {
    try {
      await api.put('/notifications/toutes-lues');
      setNotifs(n => n.map(x => ({ ...x, lu: true })));
    } catch {}
  };

  const nonLues = notifs.filter(n => !n.lu).length;

  if (load) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--primary-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="page">
      <div className="page-header anim" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Notifications</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {nonLues > 0
              ? <><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>{nonLues}</span> non lue{nonLues > 1 ? 's' : ''}</>
              : 'Tout est à jour'
            }
          </p>
        </div>
        {nonLues > 0 && (
          <button onClick={toutMarquer} className="btn btn-ghost btn-sm">Tout marquer comme lu</button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--border)', margin: '0 auto 1rem', display: 'block' }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <p className="empty-state-title">Aucune notification</p>
          <p>Vous serez notifié ici pour vos commandes, messages et alertes.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {notifs.map((n, i) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.systeme;
            return (
              <div
                key={n.id}
                className={`anim-d${Math.min(i + 1, 5)}`}
                onClick={() => { if (!n.lu) marquerLue(n.id); }}
                style={{
                  background: n.lu ? '#fff' : 'var(--primary-bg)',
                  border: `1px solid ${n.lu ? 'var(--border-light)' : 'var(--primary-border)'}`,
                  borderLeft: `3px solid ${n.lu ? 'var(--border-light)' : 'var(--primary)'}`,
                  borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
                  cursor: n.lu ? 'default' : 'pointer',
                  transition: 'var(--transition)', boxShadow: 'var(--shadow-xs)',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start'
                }}
                onMouseEnter={e => { if (!n.lu) { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = ''; }}
              >
                {/* Icône type */}
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                  background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
                      color: cfg.color, background: cfg.bg, padding: '0.15rem 0.5rem', borderRadius: '999px'
                    }}>{cfg.label}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--dim)' }}>
                      {new Date(n.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!n.lu && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />}
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem' }}>{n.titre}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.55 }}>{n.contenu}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
