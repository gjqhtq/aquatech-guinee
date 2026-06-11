import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const STATUTS_CONFIG = {
  en_attente:     { l: 'En attente',     cls: 'badge-orange' },
  confirmee:      { l: 'Confirmée',      cls: 'badge-blue' },
  en_preparation: { l: 'En préparation', cls: 'badge-blue' },
  en_livraison:   { l: 'En livraison',   cls: 'badge-purple' },
  livree:         { l: 'Livrée',         cls: 'badge-green' },
  annulee:        { l: 'Annulée',        cls: 'badge-red' },
};

const AdminCommandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [load, setLoad] = useState(true);
  const [filtre, setFiltre] = useState('tous');
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    api.get('/admin/commandes').then(r => setCommandes(r.data.commandes || [])).catch(() => {}).finally(() => setLoad(false));
  }, []);

  const afficherNotif = (msg, ok = true) => { setNotif({ msg, ok }); setTimeout(() => setNotif(null), 3000); };

  const changerStatut = async (id, statut) => {
    try {
      await api.put('/commandes/' + id + '/statut', { statut });
      setCommandes(c => c.map(x => x.id === id ? { ...x, statut } : x));
      afficherNotif('Statut mis à jour.');
    } catch { afficherNotif('Erreur.', false); }
  };

  const filtrees = filtre === 'tous' ? commandes : commandes.filter(c => c.statut === filtre);

  if (load) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--primary-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="page">
      <div className="page-header anim" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Commandes</h1>
          <p>{commandes.length} commande{commandes.length > 1 ? 's' : ''} au total</p>
        </div>
        <Link to="/admin" className="btn btn-ghost btn-sm">Retour</Link>
      </div>

      {notif && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', background: notif.ok ? 'var(--green-bg)' : 'var(--red-bg)', color: notif.ok ? 'var(--green)' : 'var(--red)', border: `1px solid ${notif.ok ? 'var(--green-border)' : 'var(--red-border)'}`, fontSize: '0.875rem', fontWeight: 500 }}>
          {notif.msg}
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }} className="anim-d1">
        <button onClick={() => setFiltre('tous')} className={`category-tab ${filtre === 'tous' ? 'active' : ''}`}>
          Toutes ({commandes.length})
        </button>
        {Object.entries(STATUTS_CONFIG).map(([v, s]) => {
          const count = commandes.filter(c => c.statut === v).length;
          if (!count) return null;
          return (
            <button key={v} onClick={() => setFiltre(v)} className={`category-tab ${filtre === v ? 'active' : ''}`}>
              {s.l} ({count})
            </button>
          );
        })}
      </div>

      {filtrees.length === 0 ? (
        <div className="empty-state"><p>Aucune commande dans cette catégorie</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {filtrees.map((c, i) => {
            const s = STATUTS_CONFIG[c.statut] || { l: c.statut, cls: 'badge-gray' };
            const modifiable = !['livree', 'annulee'].includes(c.statut);
            return (
              <div key={c.id} className={`anim-d${Math.min(i + 1, 5)}`} style={{
                background: '#fff', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius)', padding: '1.1rem 1.3rem',
                boxShadow: 'var(--shadow-xs)', transition: 'var(--transition)'
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>
                        {c.produit?.type_poisson || 'Produit'} — {c.quantite_kg} kg
                      </span>
                      <span className={`badge ${s.cls}`}>{s.l}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem 1.5rem', fontSize: '0.75rem', color: 'var(--muted)' }}>
                      <span>Acheteur : <strong style={{ color: 'var(--text)' }}>{c.acheteur?.nom || 'N/A'}</strong></span>
                      <span>Pêcheur : <strong style={{ color: 'var(--text)' }}>{c.vendeur?.nom || 'N/A'}</strong></span>
                      <span>Montant : <strong style={{ color: 'var(--primary)' }}>{Number(c.prix_total).toLocaleString('fr-FR')} FG</strong></span>
                      <span>{new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {c.lieu_livraison && <p style={{ fontSize: '0.72rem', color: 'var(--dim)', marginTop: '0.3rem' }}>Livraison : {c.lieu_livraison}</p>}
                  </div>

                  {modifiable && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Statut :</span>
                      <select
                        value={c.statut}
                        onChange={e => changerStatut(c.id, e.target.value)}
                        style={{
                          padding: '0.38rem 0.65rem', borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid var(--border)', background: '#fff',
                          color: 'var(--text)', fontSize: '0.78rem', cursor: 'pointer',
                          fontFamily: 'var(--font-body)', outline: 'none'
                        }}
                      >
                        {Object.entries(STATUTS_CONFIG).map(([v, s]) => (
                          <option key={v} value={v}>{s.l}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCommandes;
