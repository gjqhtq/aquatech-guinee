import { useState, useEffect } from 'react';
import api from '../services/api';

const ROLE_LABEL = { pecheur: 'Pêcheur', acheteur: 'Acheteur', distributeur: 'Distributeur', livreur: 'Livreur', restaurant: 'Restaurant', admin: 'Administrateur' };

const Profil = () => {
  const [profil, setProfil] = useState(null);
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({});
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [load, setLoad] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/utilisateurs/profil')
      .then(r => {
        setProfil(r.data);
        setF({ nom: r.data.nom, telephone: r.data.telephone, localisation: r.data.localisation, description: r.data.description || '' });
      })
      .catch(() => setErr('Erreur lors du chargement.'))
      .finally(() => setLoad(false));
  }, []);

  const sauver = async (e) => {
    e.preventDefault(); setErr(''); setMsg(''); setSaving(true);
    try {
      const r = await api.put('/utilisateurs/profil', f);
      setProfil({ ...profil, ...r.data.utilisateur });
      setMsg('Profil mis à jour.');
      setEdit(false);
    } catch { setErr('Erreur lors de la sauvegarde.'); }
    finally { setSaving(false); }
  };

  if (load) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--primary-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const initiale = profil?.nom?.charAt(0).toUpperCase() || '?';

  return (
    <div className="page">
      {/* En-tête */}
      <div className="anim" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 800, color: '#fff',
          boxShadow: '0 4px 14px rgba(0,112,243,0.25)'
        }}>{initiale}</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>
            {profil.nom}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
              background: 'var(--primary-bg)', color: 'var(--primary)',
              border: '1px solid var(--primary-border)', padding: '0.2rem 0.65rem', borderRadius: '999px'
            }}>{ROLE_LABEL[profil.role] || profil.role}</span>
            <span className={`badge ${profil.statut === 'actif' ? 'badge-green' : 'badge-red'}`}>{profil.statut}</span>
          </div>
        </div>
        {!edit && (
          <button onClick={() => setEdit(true)} className="btn btn-primary">Modifier le profil</button>
        )}
      </div>

      {msg && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>{msg}</div>}
      {err && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{err}</div>}

      {!edit ? (
        /* Vue lecture */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }} className="anim-d1">
          {[
            { l: 'Téléphone',    v: profil.telephone },
            { l: 'Localisation', v: profil.localisation },
            { l: 'Membre depuis',v: new Date(profil.date_inscription).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { l: 'Description',  v: profil.description || 'Aucune description renseignée' },
          ].map((x, i) => (
            <div key={i} style={{
              background: 'var(--surface)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius)', padding: '1.25rem 1.4rem', boxShadow: 'var(--shadow-xs)'
            }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>{x.l}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>{x.v}</p>
            </div>
          ))}
        </div>
      ) : (
        /* Formulaire édition */
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: '1.75rem', boxShadow: 'var(--shadow)', maxWidth: 640 }} className="anim-d1">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.25rem' }}>Modifier le profil</h2>
          <form onSubmit={sauver} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-row-2">
              {[
                { name: 'nom',         label: 'Nom complet',  placeholder: 'Votre nom' },
                { name: 'telephone',   label: 'Téléphone',    placeholder: 'Numéro de téléphone' },
              ].map(c => (
                <div key={c.name} className="form-group">
                  <label className="form-label">{c.label}</label>
                  <div className="input-wrap">
                    <input name={c.name} value={f[c.name] || ''} onChange={e => setF({ ...f, [c.name]: e.target.value })} placeholder={c.placeholder} />
                  </div>
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Localisation</label>
              <div className="input-wrap">
                <input name="localisation" value={f.localisation || ''} onChange={e => setF({ ...f, localisation: e.target.value })} placeholder="Ville / Quartier" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <div className="input-wrap">
                <textarea name="description" value={f.description || ''} onChange={e => setF({ ...f, description: e.target.value })} placeholder="Quelques mots sur vous..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                {saving ? 'Enregistrement...' : 'Sauvegarder'}
              </button>
              <button type="button" onClick={() => setEdit(false)} className="btn btn-secondary" style={{ flex: 1 }}>Annuler</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profil;
