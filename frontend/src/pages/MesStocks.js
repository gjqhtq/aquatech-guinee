import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MesStocks = () => {
  const { utilisateur } = useAuth();
  const [produits, setProduits] = useState([]);
  const [stats, setStats] = useState(null);
  const [load, setLoad] = useState(true);
  const [notif, setNotif] = useState(null);
  const [modalEditSeuil, setModalEditSeuil] = useState(null);
  const [seuilInput, setSeuilInput] = useState('');
  const [loadSave, setLoadSave] = useState(false);

  useEffect(() => {
    chargerStocks();
  }, []);

  const chargerStocks = async () => {
    try {
      setLoad(true);
      const r = await api.get('/stocks/mes-stocks');
      setProduits(r.data.produits || []);
      setStats(r.data.statistiques);
    } catch (e) {
      console.error('Erreur stocks :', e);
    } finally {
      setLoad(false);
    }
  };

  const afficherNotif = (msg, ok = true) => {
    setNotif({ msg, ok });
    setTimeout(() => setNotif(null), 3000);
  };

  const sauvegarderSeuil = async () => {
    if (!seuilInput || isNaN(seuilInput)) {
      afficherNotif('Entrez une valeur valide.', false);
      return;
    }
    setLoadSave(true);
    try {
      await api.put('/stocks/seuil', {
        produit_id: modalEditSeuil.id,
        seuil_kg: parseFloat(seuilInput)
      });
      setProduits(p => p.map(x => x.id === modalEditSeuil.id ? { ...x, seuil_alerte: seuilInput } : x));
      afficherNotif('Seuil d\'alerte mis à jour.');
      setModalEditSeuil(null);
    } catch (e) {
      afficherNotif(e.response?.data?.message || 'Erreur.', false);
    } finally {
      setLoadSave(false);
    }
  };

  if (!utilisateur || utilisateur.role !== 'pecheur') {
    return (
      <div className="page">
        <div className="empty-state">
          <p className="empty-state-title">Accès réservé</p>
          <p>Cette page est réservée aux pêcheurs.</p>
        </div>
      </div>
    );
  }

  if (load) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--primary-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      <div className="page">
        <div className="page-header anim">
          <div>
            <h1>Gestion des Stocks 📦</h1>
            <p>Suivi en temps réel de vos produits</p>
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

        {/* Statistiques */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }} className="anim-d1">
            <div style={{
              background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)',
              padding: '1.5rem', textAlign: 'center', boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.3rem' }}>
                {stats.total_produits}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Produits publiés</div>
            </div>

            <div style={{
              background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)',
              padding: '1.5rem', textAlign: 'center', boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)', marginBottom: '0.3rem' }}>
                {stats.poids_total.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>kg en stock</div>
            </div>

            <div style={{
              background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)',
              padding: '1.5rem', textAlign: 'center', boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--orange)', marginBottom: '0.3rem' }}>
                {stats.en_alerte}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>En alerte</div>
            </div>

            <div style={{
              background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)',
              padding: '1.5rem', textAlign: 'center', boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.3rem' }}>
                {(stats.valeur_totale / 1000000).toFixed(1)}M
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>FGN de valeur</div>
            </div>
          </div>
        )}

        {/* Liste des produits */}
        <div style={{ marginBottom: '2rem' }} className="anim-d2">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>Vos produits</h2>

          {produits.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">Aucun produit</p>
              <p>Allez dans <strong>Mes Produits</strong> pour en ajouter.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {produits.map((p, i) => {
                const pourc = Math.round((parseFloat(p.poids_kg) / 50) * 100);
                const enAlerte = parseFloat(p.poids_kg) <= (parseFloat(p.seuil_alerte) || 5);

                return (
                  <div key={p.id} className={`anim-d${Math.min(i + 1, 5)}`} style={{
                    background: '#fff', border: enAlerte ? '2px solid var(--orange)' : '1px solid var(--border-light)',
                    borderRadius: 'var(--radius)', padding: '1rem', boxShadow: 'var(--shadow-xs)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>
                          {p.type_poisson} — {p.etat}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                          Capture: {new Date(p.date_capture).toLocaleDateString('fr-FR')} • Prix: {p.prix_unitaire} FGN/kg
                        </div>

                        {/* Barre de progression */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(pourc, 100)}%`,
                              background: enAlerte ? 'var(--orange)' : 'var(--green)',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', minWidth: '50px' }}>
                            {p.poids_kg}kg
                          </span>
                        </div>

                        {enAlerte && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--orange)', fontWeight: 600 }}>
                            ⚠️ Stock sous le seuil ({p.seuil_alerte}kg)
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => { setModalEditSeuil(p); setSeuilInput(p.seuil_alerte || 5); }}
                        className="btn btn-sm btn-ghost"
                        style={{ color: 'var(--primary)', borderColor: 'var(--primary-border)' }}
                      >
                        Seuil
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Seuil d'alerte */}
      {modalEditSeuil && (
        <div className="modal-overlay" onClick={() => setModalEditSeuil(null)}>
          <div className="modal-box anim-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <button onClick={() => setModalEditSeuil(null)} className="modal-close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <div style={{ padding: '1.75rem 2rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                Seuil d'alerte
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
                {modalEditSeuil.type_poisson} — Stock actuel: {modalEditSeuil.poids_kg}kg
              </p>
              <div className="form-group">
                <label className="form-label">Seuil minimum (kg)</label>
                <input
                  type="number"
                  value={seuilInput}
                  onChange={e => setSeuilInput(e.target.value)}
                  placeholder="Ex: 5"
                  step="0.5"
                  min="0"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                Vous recevrez une alerte quand le stock descend sous ce seuil.
              </p>
              <button
                onClick={sauvegarderSeuil}
                disabled={loadSave}
                className="btn btn-primary btn-block"
                style={{ marginTop: '1.5rem' }}
              >
                {loadSave ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MesStocks;
