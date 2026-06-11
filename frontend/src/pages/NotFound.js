import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{
    minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    padding: '2rem', background: 'var(--bg)'
  }}>
    <p style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--border)', lineHeight: 1, marginBottom: '1rem', letterSpacing: '-4px' }}>404</p>
    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Page introuvable</h1>
    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Cette page n'existe pas ou a été déplacée.</p>
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Link to="/" className="btn btn-primary">Accueil</Link>
      <Link to="/catalogue" className="btn btn-ghost">Voir le catalogue</Link>
    </div>
  </div>
);

export default NotFound;
