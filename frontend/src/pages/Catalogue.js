import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getProductImage } from '../data/productImages';

const CATEGORIES = [
  { v: 'tous',            l: 'Tous les produits' },
  { v: 'Poisson noble',   l: 'Poissons nobles' },
  { v: 'Thon',            l: 'Thons' },
  { v: 'Petits poissons', l: 'Petits poissons' },
  { v: 'Crustaces',       l: 'Crustacés' },
  { v: 'Mollusques',      l: 'Mollusques' },
  { v: 'Poisson de fond', l: 'Poissons de fond' },
  { v: 'Produit seche',   l: 'Séchés & fumés' },
  { v: 'Congele',         l: 'Congelés' },
];

const ETAT_BADGE = { frais: 'badge-green', congele: 'badge-blue', seche: 'badge-orange' };
const ETAT_BG    = { frais: '#f0fdf4',     congele: '#eff6ff',    seche: '#fffbeb' };

const getImageSrc = (p) => {
  if (p?.photos?.length > 0) return p.photos[0];
  return getProductImage(p?.type_poisson);
};

const getFallbackImage = () => {
  return '/images/default_poisson.svg';
};

const Catalogue = () => {
  const auth     = useAuth();
  const navigate = useNavigate();

  const [produits,  setProduits]  = useState([]);
  const [load,      setLoad]      = useState(true);
  const [recherche, setRecherche] = useState('');
  const [categorie, setCategorie] = useState('tous');
  const [etat,      setEtat]      = useState('tous');
  const [tri,       setTri]       = useState('recent');
  const [detail,    setDetail]    = useState(null);
  const [cmdForm,   setCmdForm]   = useState({ quantite: '', lieu: '' });
  const [cmdLoad,   setCmdLoad]   = useState(false);
  const [cmdMsg,    setCmdMsg]    = useState('');

  const charger = useCallback(async () => {
    setLoad(true);
    try {
      const params = {};
      if (etat !== 'tous') params.etat = etat;
      if (recherche)       params.recherche = recherche;
      const r = await api.get('/produits', { params });
      setProduits(r.data.produits || []);
    } catch { setProduits([]); }
    finally  { setLoad(false); }
  }, [etat, recherche]);

  useEffect(() => {
    const t = setTimeout(charger, 300);
    return () => clearTimeout(t);
  }, [charger]);

  const filtres = produits
    .filter(p => categorie === 'tous' || p.categorie === categorie)
    .sort((a, b) => {
      if (tri === 'prix_asc')  return a.prix_unitaire - b.prix_unitaire;
      if (tri === 'prix_desc') return b.prix_unitaire - a.prix_unitaire;
      return 0;
    });

  const fermerDetail = () => { setDetail(null); setCmdMsg(''); setCmdForm({ quantite: '', lieu: '' }); };

  const commander = async (e) => {
    e.preventDefault();
    setCmdLoad(true); setCmdMsg('');
    try {
      await api.post('/commandes', {
        produit_id:     detail.id,
        quantite_kg:    cmdForm.quantite,
        lieu_livraison: cmdForm.lieu,
      });
      setCmdMsg('success');
      setCmdForm({ quantite: '', lieu: '' });
      charger();
    } catch (er) {
      setCmdMsg(er.response?.data?.message || 'Erreur lors de la commande.');
    } finally { setCmdLoad(false); }
  };

  return (
    <div className="cat-page">

      {/* ── Sidebar catégories ── */}
      <aside className="cat-sidebar">
        <p className="cat-sidebar-title">Catégories</p>
        <nav className="cat-sidebar-nav">
          {CATEGORIES.map(c => (
            <button
              key={c.v}
              onClick={() => setCategorie(c.v)}
              className={`cat-sidebar-item ${categorie === c.v ? 'active' : ''}`}
            >
              {c.l}
              {categorie === c.v && filtres.length > 0 && (
                <span className="cat-sidebar-count">{filtres.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Filtre état */}
        <p className="cat-sidebar-title" style={{ marginTop: '1.75rem' }}>État</p>
        <div className="cat-sidebar-nav">
          {[
            { v: 'tous',    l: 'Tous' },
            { v: 'frais',   l: 'Frais' },
            { v: 'congele', l: 'Congelé' },
            { v: 'seche',   l: 'Séché / Fumé' },
          ].map(f => (
            <button
              key={f.v}
              onClick={() => setEtat(f.v)}
              className={`cat-sidebar-item ${etat === f.v ? 'active' : ''}`}
            >
              <span className={`cat-etat-dot cat-etat-${f.v}`} />
              {f.l}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <main className="cat-main">

        {/* En-tête + barre d'outils */}
        <div className="cat-topbar anim">
          <div className="cat-topbar-left">
            <h1 className="cat-title">Catalogue</h1>
            <p className="cat-subtitle">
              {load ? 'Chargement…' : (
                <><strong>{filtres.length}</strong> produit{filtres.length !== 1 ? 's' : ''} disponible{filtres.length !== 1 ? 's' : ''}</>
              )}
            </p>
          </div>
          <div className="cat-topbar-right">
            <div className="input-wrap cat-search-input">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--muted)', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                placeholder="Rechercher un produit…"
              />
              {recherche && (
                <button onClick={() => setRecherche('')} className="input-action">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>
            <select value={tri} onChange={e => setTri(e.target.value)} className="select-sort">
              <option value="recent">Plus récents</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* Grille produits */}
        {load ? (
          <div className="product-grid anim-d1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="product-card">
                <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div className="skeleton" style={{ height: 10, width: '35%' }}/>
                  <div className="skeleton skeleton-title"/>
                  <div className="skeleton skeleton-text" style={{ width: '85%' }}/>
                  <div className="skeleton skeleton-text" style={{ width: '65%' }}/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <div className="skeleton" style={{ height: 22, width: 90 }}/>
                    <div className="skeleton" style={{ height: 32, width: 100, borderRadius: 6 }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtres.length === 0 ? (
          <div className="empty-state anim-d1">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--border)', margin: '0 auto 1rem' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <p className="empty-state-title">Aucun produit trouvé</p>
            <p>Essayez une autre catégorie ou modifiez votre recherche.</p>
            {(categorie !== 'tous' || etat !== 'tous' || recherche) && (
              <button
                className="btn btn-secondary"
                style={{ marginTop: '1rem' }}
                onClick={() => { setCategorie('tous'); setEtat('tous'); setRecherche(''); }}
              >Réinitialiser les filtres</button>
            )}
          </div>
        ) : (
          <div className="product-grid anim-d1">
            {filtres.map((p, i) => (
              <div
                key={p.id}
                className={`product-card anim-d${Math.min(i + 1, 5)}`}
                onClick={() => { setDetail(p); setCmdMsg(''); }}
              >
                <div className="pc-state-bar" style={{ background: ETAT_BG[p.etat] || 'var(--surface3)' }}>
                  <span className={`badge ${ETAT_BADGE[p.etat] || 'badge-gray'}`}>{p.etat}</span>
                  {p.categorie && <span className="pc-cat-label">{p.categorie.replace(/_/g, ' ')}</span>}
                </div>

                <div className="product-card-image">
                  <img
                    src={getImageSrc(p)}
                    alt={p.type_poisson || 'Produit'}
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = getFallbackImage(p); }}
                  />
                </div>

                <div className="product-card-body">
                  <h3 className="product-card-name">{p.type_poisson}</h3>
                  {p.description && <p className="product-card-desc">{p.description}</p>}

                  <div className="pc-meta">
                    <div className="pc-meta-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 6v6l4 2"/></svg>
                      <span>{p.poids_kg} kg disponibles</span>
                    </div>
                    <div className="pc-meta-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span>{p.lieu_capture}</span>
                    </div>
                    {p.pecheur?.nom && (
                      <div className="pc-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span>{p.pecheur.nom}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="product-card-footer">
                  <div>
                    <span className="product-price">{Number(p.prix_unitaire).toLocaleString('fr-FR')}</span>
                    <span className="product-price-unit"> FG/kg</span>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={e => { e.stopPropagation(); setDetail(p); setCmdMsg(''); }}
                  >Commander</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Modal détail + commande ── */}
      {detail && (
        <div className="modal-overlay" onClick={fermerDetail}>
          <div className="modal-box modal-box-lg anim-scale" onClick={e => e.stopPropagation()}>
            <button onClick={fermerDetail} className="modal-close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>

            <div className="modal-product-header" style={{ background: ETAT_BG[detail.etat] || 'var(--surface2)' }}>
              {detail.categorie && (
                <p className="product-card-category">{detail.categorie.replace(/_/g, ' ')}</p>
              )}
              <h2 className="modal-product-name">{detail.type_poisson}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <span className="modal-product-price">
                  {Number(detail.prix_unitaire).toLocaleString('fr-FR')}
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--dim)', marginLeft: 4 }}>FG/kg</span>
                </span>
                <span className={`badge ${ETAT_BADGE[detail.etat] || 'badge-gray'}`}>{detail.etat}</span>
              </div>
            </div>

            <div className="modal-product-image">
              <img
                src={getImageSrc(detail)}
                alt={detail.type_poisson || 'Produit'}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = getFallbackImage(detail); }}
              />
            </div>

            {detail.description && (
              <p className="modal-desc">{detail.description}</p>
            )}

            <div className="detail-grid" style={{ marginBottom: '1.25rem' }}>
              {[
                { l: 'Poids disponible', v: `${detail.poids_kg} kg` },
                { l: 'Lieu de pêche',    v: detail.lieu_capture },
                { l: 'Pêcheur',          v: detail.pecheur?.nom || 'N/A' },
                { l: 'État',             v: detail.etat },
              ].map((x, i) => (
                <div key={i} className="detail-item">
                  <p className="detail-item-label">{x.l}</p>
                  <p className="detail-item-value">{x.v}</p>
                </div>
              ))}
            </div>

            {cmdMsg === 'success' ? (
              <div className="alert alert-success" style={{ margin: '0 2rem 1.5rem' }}>
                Commande passée avec succès !
              </div>
            ) : cmdMsg ? (
              <div className="alert alert-error" style={{ margin: '0 2rem 1rem' }}>{cmdMsg}</div>
            ) : null}

            {!auth.estConnecte ? (
              <div style={{ padding: '0 2rem 1.75rem' }}>
                <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                  Connectez-vous pour passer une commande.
                </div>
                <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/connexion')}>
                  Se connecter pour commander
                </button>
              </div>
            ) : auth.estAdmin ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '0 2rem 1.75rem' }}>
                Les administrateurs ne passent pas de commandes.
              </p>
            ) : detail.pecheur?.id === auth.utilisateur?.id ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '0 2rem 1.75rem' }}>
                Vous ne pouvez pas commander votre propre produit.
              </p>
            ) : (
              <form onSubmit={commander} style={{ padding: '0 2rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Quantité (kg)</label>
                    <div className="input-wrap">
                      <input
                        type="number" min="0.1" max={detail.poids_kg} step="0.1"
                        value={cmdForm.quantite}
                        onChange={e => setCmdForm({ ...cmdForm, quantite: e.target.value })}
                        placeholder={`Max ${detail.poids_kg} kg`} required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lieu de livraison</label>
                    <div className="input-wrap">
                      <input
                        value={cmdForm.lieu}
                        onChange={e => setCmdForm({ ...cmdForm, lieu: e.target.value })}
                        placeholder="Votre adresse" required
                      />
                    </div>
                  </div>
                </div>

                {cmdForm.quantite > 0 && (
                  <div className="cmd-total">
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Total estimé</span>
                    <span className="cmd-total-price">
                      {(cmdForm.quantite * detail.prix_unitaire).toLocaleString('fr-FR')} FG
                    </span>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={cmdLoad}>
                  {cmdLoad
                    ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}/> En cours…</>
                    : 'Confirmer la commande'
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogue;
