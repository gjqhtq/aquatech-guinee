import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ROLE_BADGE = { pecheur: 'badge-teal', acheteur: 'badge-blue', restaurant: 'badge-green', distributeur: 'badge-purple', livreur: 'badge-orange', admin: 'badge-red' };

const AdminUtilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [load, setLoad] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [filtreRole, setFiltreRole] = useState('tous');
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    api.get('/admin/utilisateurs').then(r => setUsers(r.data.utilisateurs || [])).catch(() => {}).finally(() => setLoad(false));
  }, []);

  const afficherNotif = (msg, ok = true) => { setNotif({ msg, ok }); setTimeout(() => setNotif(null), 3000); };

  const changer = async (id, statut) => {
    try {
      await api.put('/admin/utilisateurs/' + id + '/statut', { statut });
      setUsers(u => u.map(x => x.id === id ? { ...x, statut } : x));
      afficherNotif(`Compte ${statut} avec succès.`);
    } catch { afficherNotif('Erreur.', false); }
  };

  const roles = ['tous', ...new Set(users.map(u => u.role))];
  const filtres = users.filter(u =>
    (filtreRole === 'tous' || u.role === filtreRole) &&
    (u.nom.toLowerCase().includes(recherche.toLowerCase()) || u.telephone.includes(recherche))
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
          <h1>Utilisateurs</h1>
          <p>{users.length} compte{users.length > 1 ? 's' : ''} — {users.filter(u => u.statut === 'actif').length} actifs</p>
        </div>
        <Link to="/admin" className="btn btn-ghost btn-sm">Retour</Link>
      </div>

      {notif && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', background: notif.ok ? 'var(--green-bg)' : 'var(--red-bg)', color: notif.ok ? 'var(--green)' : 'var(--red)', border: `1px solid ${notif.ok ? 'var(--green-border)' : 'var(--red-border)'}`, fontSize: '0.875rem', fontWeight: 500 }}>
          {notif.msg}
        </div>
      )}

      {/* Recherche + filtres */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }} className="anim-d1">
        <div className="input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher par nom ou téléphone..." />
          {recherche && <button onClick={() => setRecherche('')} className="input-action">Effacer</button>}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {roles.map(r => (
            <button key={r} onClick={() => setFiltreRole(r)} className={`category-tab ${filtreRole === r ? 'active' : ''}`} style={{ textTransform: 'capitalize' }}>
              {r === 'tous' ? 'Tous' : r}
            </button>
          ))}
        </div>
      </div>

      {filtres.length === 0 ? (
        <div className="empty-state"><p>Aucun utilisateur trouvé</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filtres.map((u, i) => (
            <div key={u.id} className={`anim-d${Math.min(i + 1, 5)}`} style={{
              background: '#fff', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius)', padding: '1rem 1.3rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '0.75rem', boxShadow: 'var(--shadow-xs)',
              opacity: u.statut === 'supprime' ? 0.5 : 1, transition: 'var(--transition)'
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--primary-bg)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.9rem'
                }}>{u.nom.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.875rem' }}>{u.nom}</span>
                    <span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`}>{u.role}</span>
                    <span className={`badge ${u.statut === 'actif' ? 'badge-green' : 'badge-red'}`}>{u.statut}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{u.telephone} — {u.localisation}</p>
                </div>
              </div>

              {u.role !== 'admin' && u.statut !== 'supprime' && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => changer(u.id, u.statut === 'actif' ? 'suspendu' : 'actif')} className="btn btn-sm btn-ghost">
                    {u.statut === 'actif' ? 'Suspendre' : 'Activer'}
                  </button>
                  <button onClick={() => changer(u.id, 'supprime')} className="btn btn-sm btn-danger">Supprimer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUtilisateurs;
