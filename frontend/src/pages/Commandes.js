import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUTS = [
  { v: 'en_attente',     l: 'En attente',     cls: 'badge-orange', step: 1 },
  { v: 'confirmee',      l: 'Confirmée',       cls: 'badge-blue',   step: 2 },
  { v: 'en_preparation', l: 'En préparation',  cls: 'badge-blue',   step: 3 },
  { v: 'en_livraison',   l: 'En livraison',    cls: 'badge-purple', step: 4 },
  { v: 'livree',         l: 'Livrée',          cls: 'badge-green',  step: 5 },
  { v: 'annulee',        l: 'Annulée',         cls: 'badge-red',    step: 0 },
];

const getBadge = s => STATUTS.find(x => x.v === s) || { l: s, cls: 'badge-gray' };

const Commandes = () => {
  const { utilisateur } = useAuth();
  const [cmd, setCmd] = useState([]);
  const [load, setLoad] = useState(true);
  const [filtre, setFiltre] = useState('tous');
  const [notif, setNotif] = useState(null);
  const [evalModal, setEvalModal] = useState(null); // commande à évaluer
  const [evalForm, setEvalForm] = useState({ note: 5, commentaire: '' });
  const [evalLoad, setEvalLoad] = useState(false);
  const isPecheur = utilisateur?.role === 'pecheur';

  useEffect(() => {
    api.get('/commandes/historique')
      .then(r => setCmd(r.data.commandes || []))
      .catch(() => {})
      .finally(() => setLoad(false));
  }, []);

  const afficherNotif = (msg, ok = true) => {
    setNotif({ msg, ok });
    setTimeout(() => setNotif(null), 3500);
  };

  const soumettrEval = async (e) => {
    e.preventDefault();
    setEvalLoad(true);
    try {
      await api.post('/commandes/' + evalModal.id + '/evaluer', evalForm);
      setCmd(c => c.map(x => x.id === evalModal.id ? { ...x, evaluation_note: evalForm.note } : x));
      afficherNotif('Évaluation enregistrée. Merci !');
      setEvalModal(null);
    } catch (er) { afficherNotif(er.response?.data?.message || 'Erreur.', false); }
    finally { setEvalLoad(false); }
  };

  const annuler = async (id) => {
    try {
      await api.put('/commandes/' + id + '/annuler');
      setCmd(c => c.map(x => x.id === id ? { ...x, statut: 'annulee' } : x));
      afficherNotif('Commande annulée.');
    } catch (er) { afficherNotif(er.response?.data?.message || 'Erreur.', false); }
  };

  const repondre = async (id, action) => {
    try {
      await api.put('/commandes/' + id + '/repondre', { action });
      setCmd(c => c.map(x => x.id === id ? { ...x, statut: action === 'accepter' ? 'confirmee' : 'annulee' } : x));
      afficherNotif(action === 'accepter' ? 'Commande acceptée.' : 'Commande refusée.');
    } catch (er) { afficherNotif(er.response?.data?.message || 'Erreur.', false); }
  };

  const filtrees = filtre === 'tous' ? cmd : cmd.filter(c => c.statut === filtre);
  const enCours = cmd.filter(c => ['en_attente', 'confirmee', 'en_preparation', 'en_livraison'].includes(c.statut)).length;

  if (load) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--primary-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <>
    <div className="page">
      <div className="page-header anim" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Mes Commandes</h1>
          <p>{cmd.length} commande{cmd.length > 1 ? 's' : ''} au total{enCours > 0 && ` — ${enCours} en cours`}</p>
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

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }} className="anim-d1">
        <button onClick={() => setFiltre('tous')} className={`category-tab ${filtre === 'tous' ? 'active' : ''}`}>
          Toutes ({cmd.length})
        </button>
        {STATUTS.filter(s => s.step > 0).map(s => {
          const count = cmd.filter(c => c.statut === s.v).length;
          if (count === 0) return null;
          return (
            <button key={s.v} onClick={() => setFiltre(s.v)} className={`category-tab ${filtre === s.v ? 'active' : ''}`}>
              {s.l} ({count})
            </button>
          );
        })}
        {cmd.some(c => c.statut === 'annulee') && (
          <button onClick={() => setFiltre('annulee')} className={`category-tab ${filtre === 'annulee' ? 'active' : ''}`}>
            Annulées ({cmd.filter(c => c.statut === 'annulee').length})
          </button>
        )}
      </div>

      {filtrees.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">Aucune commande</p>
          <p>Aucune commande dans cette catégorie.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtrees.map((c, i) => {
            const s = getBadge(c.statut);
            const isActive = ['en_attente', 'confirmee', 'en_preparation', 'en_livraison'].includes(c.statut);
            return (
              <div key={c.id} className={`anim-d${Math.min(i + 1, 5)}`} style={{
                background: '#fff', border: '1px solid var(--border-light)',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid var(--border-light)',
                borderRadius: 'var(--radius)', padding: '1.2rem 1.4rem',
                boxShadow: 'var(--shadow-xs)', transition: 'var(--transition)'
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = ''; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>
                        {c.produit?.type_poisson || 'Produit'} — {c.quantite_kg} kg
                      </span>
                      <span className={`badge ${s.cls}`}>{s.l}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--muted)' }}>
                      <span>Montant : <strong style={{ color: 'var(--primary)' }}>{Number(c.prix_total).toLocaleString('fr-FR')} FG</strong></span>
                      {c.lieu_livraison && <span>Livraison : {c.lieu_livraison}</span>}
                      <span>{new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {isPecheur && c.acheteur && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
                        Acheteur : <strong style={{ color: 'var(--text)' }}>{c.acheteur.nom}</strong> — {c.acheteur.telephone}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Acheteur : annuler si en attente */}
                    {!isPecheur && c.statut === 'en_attente' && (
                      <button onClick={() => annuler(c.id)} className="btn btn-sm btn-danger">Annuler</button>
                    )}
                    {/* Pêcheur : accepter/refuser si en attente */}
                    {isPecheur && c.statut === 'en_attente' && (
                      <>
                        <button onClick={() => repondre(c.id, 'accepter')} style={{
                          padding: '0.3rem 0.75rem', background: 'var(--green)', color: '#fff',
                          border: 'none', borderRadius: 'var(--radius-xs)', fontSize: '0.78rem',
                          fontWeight: 600, cursor: 'pointer'
                        }}>Accepter</button>
                        <button onClick={() => repondre(c.id, 'refuser')} className="btn btn-sm btn-danger">Refuser</button>
                      </>
                    )}
                    {/* Évaluation si livrée */}
                    {!isPecheur && c.statut === 'livree' && !c.evaluation_note && (
                      <button
                        className="btn btn-sm btn-ghost"
                        style={{ color: 'var(--orange)', borderColor: 'var(--orange-border)' }}
                        onClick={() => { setEvalModal(c); setEvalForm({ note: 5, commentaire: '' }); }}
                      >
                        Évaluer
                      </button>
                    )}
                    {c.evaluation_note && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--orange)', fontWeight: 600 }}>
                        {c.evaluation_note}/5
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* Modal évaluation */}
      {evalModal && (
        <div className="modal-overlay" onClick={() => setEvalModal(null)}>
          <div className="modal-box anim-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <button onClick={() => setEvalModal(null)} className="modal-close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <div style={{ padding: '1.75rem 2rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Évaluer la commande</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
                {evalModal.produit?.type_poisson} — {evalModal.quantite_kg} kg
              </p>
              <form onSubmit={soumettrEval} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.5rem' }}>Note</label>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n} type="button"
                        onClick={() => setEvalForm(f => ({ ...f, note: n }))}
                        style={{
                          width: 40, height: 40, borderRadius: '50%', border: '2px solid',
                          borderColor: evalForm.note >= n ? 'var(--orange)' : 'var(--border)',
                          background: evalForm.note >= n ? 'var(--orange-bg)' : 'transparent',
                          color: evalForm.note >= n ? 'var(--orange)' : 'var(--muted)',
                          fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem'
                        }}
                      >★</button>
                    ))}
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{evalForm.note}/5</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Commentaire (optionnel)</label>
                  <textarea
                    value={evalForm.commentaire}
                    onChange={e => setEvalForm(f => ({ ...f, commentaire: e.target.value }))}
                    placeholder="Votre avis sur ce produit..."
                    rows={3}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', resize: 'vertical', color: 'var(--text)', background: 'var(--surface2)' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={evalLoad}>
                  {evalLoad ? 'Envoi...' : "Soumettre l'évaluation"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Commandes;
