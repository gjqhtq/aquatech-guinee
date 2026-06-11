import { useState, useEffect } from 'react';
import api from '../services/api';

const statutStyle = { confirmee: { label: 'Confirmée', cls: 'badge-orange' }, en_livraison: { label: 'En livraison', cls: 'badge-blue' } };

const CarteCommande = ({ c, action, labelAction, couleurAction }) => (
  <div style={{
    background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    padding: '1.1rem', boxShadow: 'var(--shadow)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>
            {c.produit?.type_poisson || 'Produit'} — {c.quantite_kg} kg
          </span>
          <span className={`badge ${statutStyle[c.statut]?.cls || 'badge-blue'}`}>
            {statutStyle[c.statut]?.label || c.statut}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
          <div style={{ background: 'var(--surface2)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '0.1rem' }}>Acheteur</p>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{c.acheteur?.nom || 'N/A'}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.acheteur?.telephone}</p>
            {c.acheteur?.localisation && <p style={{ fontSize: '0.72rem', color: 'var(--dim)' }}>{c.acheteur.localisation}</p>}
          </div>
          <div style={{ background: 'var(--surface2)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '0.1rem' }}>Pêcheur</p>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{c.vendeur?.nom || 'N/A'}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.vendeur?.telephone}</p>
            {c.vendeur?.localisation && <p style={{ fontSize: '0.72rem', color: 'var(--dim)' }}>{c.vendeur.localisation}</p>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {c.lieu_livraison && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Destination : <strong>{c.lieu_livraison}</strong>
            </p>
          )}
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Montant : <strong style={{ color: 'var(--primary)' }}>{Number(c.prix_total).toLocaleString('fr-FR')} FG</strong>
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
            {new Date(c.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <button
        onClick={() => action(c.id)}
        style={{
          padding: '0.6rem 1.1rem', border: 'none', borderRadius: 'var(--radius-sm)',
          background: couleurAction, color: '#fff', fontWeight: 600, fontSize: '0.85rem',
          cursor: 'pointer', whiteSpace: 'nowrap', alignSelf: 'flex-start',
          transition: 'var(--transition)'
        }}
      >
        {labelAction}
      </button>
    </div>
  </div>
);

const Livraisons = () => {
  const [disponibles, setDisponibles] = useState([]);
  const [enCours, setEnCours] = useState([]);
  const [load, setLoad] = useState(true);
  const [notif, setNotif] = useState(null);

  const afficherNotif = (msg, ok = true) => {
    setNotif({ msg, ok });
    setTimeout(() => setNotif(null), 3500);
  };

  const charger = async () => {
    setLoad(true);
    try {
      const [r1, r2] = await Promise.all([
        api.get('/commandes/livraisons/disponibles'),
        api.get('/commandes/livraisons/mes-livraisons')
      ]);
      setDisponibles(r1.data.commandes || []);
      setEnCours(r2.data.commandes || []);
    } catch {}
    setLoad(false);
  };

  useEffect(() => { charger(); }, []);

  const prendreEnCharge = async (id) => {
    try {
      await api.put('/commandes/' + id + '/prendre-livraison');
      afficherNotif('Livraison prise en charge.');
      charger();
    } catch (er) {
      afficherNotif(er.response?.data?.message || 'Erreur.', false);
    }
  };

  const marquerLivree = async (id) => {
    try {
      await api.put('/commandes/' + id + '/marquer-livree');
      afficherNotif('Commande marquée comme livrée.');
      charger();
    } catch (er) {
      afficherNotif(er.response?.data?.message || 'Erreur.', false);
    }
  };

  if (load) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Chargement...</p>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header anim">
        <h1>Livraisons</h1>
        <p>Prenez en charge des livraisons et suivez vos livraisons en cours</p>
      </div>

      {notif && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem',
          background: notif.ok ? 'var(--green-bg)' : 'var(--red-bg)',
          color: notif.ok ? 'var(--green)' : 'var(--red)',
          border: `1px solid ${notif.ok ? '#86efac' : '#fca5a5'}`,
          fontSize: '0.875rem', fontWeight: 500
        }}>
          {notif.msg}
        </div>
      )}

      {/* Commandes disponibles */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Commandes disponibles</h2>
          {disponibles.length > 0 && (
            <span style={{
              background: 'var(--orange-bg)', color: 'var(--orange)',
              padding: '0.15rem 0.55rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700
            }}>{disponibles.length}</span>
          )}
        </div>

        {disponibles.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            padding: '2rem', textAlign: 'center'
          }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Aucune commande disponible pour le moment</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {disponibles.map((c, i) => (
              <div key={c.id} className={`anim-d${Math.min(i + 1, 5)}`}>
                <CarteCommande
                  c={c}
                  action={prendreEnCharge}
                  labelAction="Prendre en charge"
                  couleurAction="var(--primary)"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mes livraisons en cours */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Mes livraisons en cours</h2>
          {enCours.length > 0 && (
            <span style={{
              background: 'var(--blue-bg)', color: 'var(--blue)',
              padding: '0.15rem 0.55rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700
            }}>{enCours.length}</span>
          )}
        </div>

        {enCours.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            padding: '2rem', textAlign: 'center'
          }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Aucune livraison en cours</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {enCours.map((c, i) => (
              <div key={c.id} className={`anim-d${Math.min(i + 1, 5)}`}>
                <CarteCommande
                  c={c}
                  action={marquerLivree}
                  labelAction="Marquer comme livree"
                  couleurAction="var(--green)"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Livraisons;
