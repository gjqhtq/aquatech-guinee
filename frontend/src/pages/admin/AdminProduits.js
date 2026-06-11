import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ETAT_BADGE = { frais: 'badge-green', congele: 'badge-blue', seche: 'badge-orange' };

const AdminProduits = () => {
  const [prods, setProds] = useState([]);
  const [load, setLoad] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    api.get('/produits').then(r => setProds(r.data.produits || [])).catch(() => {}).finally(() => setLoad(false));
  }, []);

  const afficherNotif = (msg, ok = true) => { setNotif({ msg, ok }); setTimeout(() => setNotif(null), 3000); };

  const supprimer = async (id) => {
    try {
      await api.put('/produits/' + id + '/statut', { statut: 'supprime' });
      setProds(p => p.filter(x => x.id !== id));
      afficherNotif('Produit supprimé.');
    } catch { afficherNotif('Erreur.', false); }
  };

  const filtres = prods.filter(p =>
    p.type_poisson.toLowerCase().includes(recherche.toLowerCase()) ||
    (p.pecheur?.nom || '').toLowerCase().includes(recherche.toLowerCase())
  );

  if (load) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--primary-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="page">
      <div className="page-header anim" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Produits</h1>
          <p>{prods.length} produit{prods.length > 1 ? 's' : ''} disponible{prods.length > 1 ? 's' : ''}</p>
        </div>
        <Link to="/admin" className="btn btn-ghost btn-sm">Retour</Link>
      </div>

      {notif && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', background: notif.ok ? 'var(--green-bg)' : 'var(--red-bg)', color: notif.ok ? 'var(--green)' : 'var(--red)', border: `1px solid ${notif.ok ? 'var(--green-border)' : 'var(--red-border)'}`, fontSize: '0.875rem', fontWeight: 500 }}>
          {notif.msg}
        </div>
      )}

      <div className="input-wrap anim-d1" style={{ marginBottom: '1.5rem', maxWidth: 400 }}>
        <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher par poisson ou pêcheur..." />
        {recherche && <button onClick={() => setRecherche('')} className="input-action">Effacer</button>}
      </div>

      {filtres.length === 0 ? (
        <div className="empty-state"><p>Aucun produit trouvé</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filtres.map((p, i) => (
            <div key={p.id} className={`anim-d${Math.min(i + 1, 5)}`} style={{
              background: '#fff', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius)', padding: '1rem 1.3rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '0.75rem', boxShadow: 'var(--shadow-xs)', transition: 'var(--transition)'
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{p.type_poisson}</span>
                  <span className={`badge ${ETAT_BADGE[p.etat] || 'badge-gray'}`}>{p.etat}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {p.poids_kg} kg — <strong style={{ color: 'var(--primary)' }}>{Number(p.prix_unitaire).toLocaleString('fr-FR')} FG/kg</strong> — {p.lieu_capture}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--dim)', marginTop: '0.15rem' }}>
                  Pêcheur : {p.pecheur?.nom || 'N/A'}
                </p>
              </div>
              <button onClick={() => supprimer(p.id)} className="btn btn-sm btn-danger">Retirer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProduits;
