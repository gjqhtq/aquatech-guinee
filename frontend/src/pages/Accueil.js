import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { n: '01', t: 'Parcourez le catalogue', d: 'Consultez librement tous les produits disponibles, sans compte requis.' },
  { n: '02', t: 'Créez votre compte', d: 'Inscription gratuite en moins de 2 minutes avec votre numéro de téléphone.' },
  { n: '03', t: 'Commandez et recevez', d: 'Passez commande directement au pêcheur et faites-vous livrer.' },
];

const AVANTAGES = [
  { t: 'Prix direct pêcheur', d: 'Aucun intermédiaire. Vous achetez au prix juste, directement à la source.' },
  { t: 'Fraîcheur garantie', d: 'Chaque produit est daté et noté par les acheteurs précédents.' },
  { t: 'Livraison rapide', d: 'Des livreurs partenaires assurent la livraison le jour même.' },
  { t: 'Alertes en temps réel', d: 'Météo marine, prix du marché et alertes stock pour les pêcheurs.' },
  { t: '30 espèces disponibles', d: 'Thon, crevettes, homard, thiof, sole et bien plus encore.' },
  { t: 'Paiement sécurisé', d: 'Transactions traçables et historique complet de vos commandes.' },
];

const STATS = [
  { nb: '300 km', lbl: 'de côte maritime' },
  { nb: '30+',    lbl: 'espèces de poisson' },
  { nb: '24h',    lbl: 'fraîcheur garantie' },
  { nb: '500+',   lbl: 'pêcheurs connectés' },
];

const Accueil = () => {
  const { estConnecte } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '5rem 2rem',
        background: 'linear-gradient(160deg, #f0f7ff 0%, #e8f4fd 45%, #f0f4f8 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Cercles décoratifs */}
        <div style={{
          position: 'absolute', top: '-120px', right: '-120px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,112,243,0.07) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="anim" style={{ maxWidth: '640px', textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--primary-bg)', color: 'var(--primary)',
            border: '1px solid var(--primary-border)',
            padding: '0.32rem 1rem', borderRadius: '999px',
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px',
            textTransform: 'uppercase', marginBottom: '1.5rem'
          }}>
            Plateforme FishTech — Guinée
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
            fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.06,
            color: 'var(--text)', marginBottom: '1.2rem'
          }}>
            Le poisson frais,<br />
            <span style={{ color: 'var(--primary)' }}>directement du pêcheur</span><br />
            à votre table
          </h1>

          <p style={{
            fontSize: '1.05rem', color: 'var(--muted)', lineHeight: 1.75,
            marginBottom: '2.25rem', maxWidth: '480px', margin: '0 auto 2.25rem'
          }}>
            AquaTech Guinée connecte pêcheurs artisans, ménages et restaurants
            pour une filière halieutique plus juste et plus efficace.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link to="/catalogue" className="btn btn-primary btn-xl">
              Voir le catalogue
            </Link>
            {!estConnecte && (
              <Link to="/inscription" className="btn btn-secondary btn-xl">
                Créer un compte gratuit
              </Link>
            )}
          </div>

          <p style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--dim)' }}>
            Consultation gratuite — Compte requis uniquement pour commander
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-light)',
        borderBottom: '1px solid var(--border-light)',
        padding: '2.5rem 2.5rem'
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1.5rem', textAlign: 'center'
        }}>
          {STATS.map((s, i) => (
            <div key={i} className={`anim-d${i + 1}`}>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>{s.nb}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.35rem', fontWeight: 500 }}>{s.lbl}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMMENT CA MARCHE ── */}
      <section style={{ padding: '5rem 2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="anim">
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.6rem' }}>
            Simple et rapide
          </p>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
            Comment ca marche ?
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} className={`anim-d${i + 1}`} style={{
              background: 'var(--surface)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius)', padding: '2rem 1.75rem',
              boxShadow: 'var(--shadow)', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: '-10px', right: '-10px',
                fontSize: '4rem', fontWeight: 900, color: 'var(--primary-bg)',
                lineHeight: 1, userSelect: 'none', letterSpacing: '-2px'
              }}>{s.n}</div>
              <div style={{
                width: '38px', height: '38px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.85rem',
                marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,112,243,0.3)'
              }}>{s.n}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', letterSpacing: '-0.1px' }}>{s.t}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.65 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AVANTAGES ── */}
      <section style={{
        padding: '5rem 2.5rem',
        background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)',
        borderTop: '1px solid var(--border-light)'
      }}>
        <div>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="anim">
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.6rem' }}>
              Pourquoi nous choisir
            </p>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
              La plateforme qui modernise la peche
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {AVANTAGES.map((a, i) => (
              <div key={i} className={`anim-d${Math.min(i + 1, 5)}`} style={{
                background: 'var(--surface)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius)', padding: '1.5rem',
                boxShadow: 'var(--shadow)', display: 'flex', gap: '1rem', alignItems: 'flex-start',
                transition: 'var(--transition)'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--primary-border)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
              >
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: 'var(--primary)', marginTop: '0.45rem', flexShrink: 0
                }} />
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>{a.t}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>{a.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!estConnecte && (
        <section style={{ padding: '3rem 2.5rem 5rem' }} className="anim">
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            borderRadius: 'var(--radius-lg)', padding: '3.5rem 2.5rem', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,112,243,0.25)', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: '-60px', right: '-60px',
              width: '250px', height: '250px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', pointerEvents: 'none'
            }} />
            <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 800, color: '#fff', marginBottom: '0.6rem', letterSpacing: '-0.4px' }}>
              Pret a commander du poisson frais ?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Rejoignez des centaines d'acheteurs et de pêcheurs sur AquaTech Guinée.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/inscription" style={{
                background: '#fff', color: 'var(--primary)', fontWeight: 700,
                padding: '0.75rem 1.75rem', borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem', textDecoration: 'none', transition: 'var(--transition)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                Créer mon compte
              </Link>
              <Link to="/catalogue" style={{
                background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600,
                padding: '0.75rem 1.75rem', borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)',
                transition: 'var(--transition)'
              }}>
                Voir le catalogue
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{
        textAlign: 'center', padding: '2rem 1.5rem',
        borderTop: '1px solid var(--border-light)',
        background: 'var(--surface)'
      }}>
        <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', marginBottom: '0.3rem', letterSpacing: '-0.2px' }}>
          Aqua<span style={{ color: 'var(--primary)' }}>Tech</span> Guinée
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>Moderniser la peche artisanale en Guinee © 2025</p>
      </footer>
    </div>
  );
};

export default Accueil;
