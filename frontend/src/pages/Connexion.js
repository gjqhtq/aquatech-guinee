import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Connexion = () => {
  const { connecter } = useAuth();
  const navigate = useNavigate();
  const [tel, setTel] = useState('');
  const [mdp, setMdp] = useState('');
  const [showMdp, setShowMdp] = useState(false);
  const [err, setErr] = useState('');
  const [load, setLoad] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoad(true);
    try {
      const r = await connecter(tel.replace(/\D/g, ''), mdp);
      navigate(r.utilisateur.role === 'admin' ? '/admin' : '/tableau-de-bord');
    } catch (er) {
      const msg = er.response?.data?.message;
      if (!msg) {
        setErr('Impossible de contacter le serveur. Vérifiez votre connexion.');
      } else {
        setErr(msg);
      }
    } finally { setLoad(false); }
  };

  return (
    <div className="auth-page">
      <div className="anim-scale" style={{
        width: '100%', maxWidth: 420,
        background: '#fff', border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)', padding: '2.5rem 2.25rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--radius)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', boxShadow: '0 4px 14px rgba(0,112,243,0.3)',
            color: '#fff', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.5px'
          }}>AT</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px', marginBottom: '0.3rem' }}>
            Bon retour
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Connectez-vous à votre compte AquaTech</p>
        </div>

        {err && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
            {err}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="form-group">
            <label className="form-label">Numéro de téléphone</label>
            <div className="input-wrap">
              <input
                value={tel}
                onChange={e => setTel(e.target.value)}
                placeholder="Ex : 620 00 00 00"
                type="tel" required autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div className="input-wrap">
              <input
                type={showMdp ? 'text' : 'password'}
                value={mdp}
                onChange={e => setMdp(e.target.value)}
                placeholder="Votre mot de passe" required
              />
              <button type="button" className="input-action" onClick={() => setShowMdp(v => !v)}>
                {showMdp ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={load}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '0.25rem' }}
          >
            {load
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}/> Connexion…</>
              : 'Se connecter'
            }
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
            Pas encore de compte ?{' '}
            <Link to="/inscription" style={{ color: 'var(--primary)', fontWeight: 700 }}>Créer un compte gratuit</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
