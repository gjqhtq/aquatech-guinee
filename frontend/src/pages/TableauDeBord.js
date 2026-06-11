import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../services/api';

const STATUT_BADGE = {
  en_attente:    { cls: 'badge-orange', lbl: 'En attente' },
  confirmee:     { cls: 'badge-blue',   lbl: 'Confirmée' },
  en_preparation:{ cls: 'badge-blue',   lbl: 'En préparation' },
  en_livraison:  { cls: 'badge-purple', lbl: 'En livraison' },
  livree:        { cls: 'badge-green',  lbl: 'Livrée' },
  annulee:       { cls: 'badge-red',    lbl: 'Annulée' },
};

// Construit les données du graphique sur les 7 derniers jours
const buildChartData = (commandes) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    const cmdsJour = commandes.filter(c => c.createdAt?.startsWith(key));
    days.push({
      label,
      commandes: cmdsJour.length,
      ca: cmdsJour.filter(c => c.statut === 'livree').reduce((s, c) => s + Number(c.prix_total), 0),
    });
  }
  return days;
};

const StarRating = ({ note, taille = '1rem', color = 'var(--primary)' }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.floor(note);
    const partial = i - note > 0 && i - note < 1;
    stars.push(
      <span key={i} style={{ fontSize: taille, color: filled || partial ? color : 'var(--dim)', opacity: filled || partial ? 1 : 0.3 }}>
        ★
      </span>
    );
  }
  return <span style={{ letterSpacing: '-2px' }}>{stars}</span>;
};

const StatCard = ({ value, label, color, sub, delay }) => (
  <div className={`anim-d${delay}`} style={{
    background: 'var(--surface)', border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius)', padding: '1.5rem 1.4rem',
    boxShadow: 'var(--shadow)', transition: 'var(--transition)',
    borderTop: `3px solid ${color}`
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
  >
    <p style={{ fontSize: '1.75rem', fontWeight: 800, color, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.4rem', fontWeight: 500 }}>{label}</p>
    {sub && <p style={{ fontSize: '0.7rem', color: 'var(--dim)', marginTop: '0.2rem' }}>{sub}</p>}
  </div>
);

const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
      boxShadow: 'var(--shadow-md)', fontSize: '0.8rem'
    }}>
      <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name} : <strong>{typeof p.value === 'number' && p.name === 'CA (FG)' ? p.value.toLocaleString('fr-FR') : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const TableauDeBord = () => {
  const { utilisateur } = useAuth();
  const [cmd, setCmd] = useState([]);
  const [prods, setProds] = useState([]);
  const [stats, setStats] = useState(null);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/commandes/historique'),
      api.get('/produits/mes/produits').catch(() => ({ data: { produits: [] } })),
      utilisateur?.role === 'pecheur' ? api.get('/utilisateurs/stats-pecheur') : Promise.resolve({ data: null })
    ]).then(([r1, r2, r3]) => {
      setCmd(r1.data.commandes || []);
      setProds(r2.data.produits || []);
      setStats(r3.data);
    }).catch(e => console.error(e))
      .finally(() => setLoad(false));
  }, [utilisateur]);

  const ca        = cmd.filter(c => c.statut === 'livree').reduce((s, c) => s + Number(c.prix_total), 0);
  const enCours   = cmd.filter(c => ['en_attente', 'confirmee', 'en_preparation', 'en_livraison'].includes(c.statut)).length;
  const livrees   = cmd.filter(c => c.statut === 'livree').length;
  const annulees  = cmd.filter(c => c.statut === 'annulee').length;
  const chartData = buildChartData(cmd);
  const isPecheur = utilisateur?.role === 'pecheur';

  if (load) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--primary-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className="page">
      {/* En-tête avec note de réputation */}
      <div className="page-header anim" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h1>Tableau de bord</h1>
          <p>Bienvenue, <strong style={{ color: 'var(--primary)' }}>{utilisateur?.nom}</strong> — {utilisateur?.role}</p>
        </div>
        {isPecheur && stats?.reputation && (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius)', padding: '1.2rem', textAlign: 'center',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Votre réputation</p>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>
              <StarRating note={parseFloat(stats.reputation.note_moyenne) || 0} />
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
              {(stats.reputation.note_moyenne || 0)}/5
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--dim)', marginTop: '0.2rem' }}>
              {stats.reputation.total_evaluations} évaluation(s)
            </p>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isPecheur && <Link to="/mes-produits" className="btn btn-secondary btn-sm">Mes produits</Link>}
          <Link to="/commandes" className="btn btn-primary btn-sm">Voir les commandes</Link>
        </div>
      </div>

      {/* Stats générales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard value={ca.toLocaleString('fr-FR') + ' FG'} label="Chiffre d'affaires" color="var(--green)"  sub="Commandes livrées" delay={1} />
        <StatCard value={cmd.length}  label="Total commandes"  color="var(--primary)" delay={2} />
        <StatCard value={enCours}     label="En cours"         color="var(--orange)"  delay={3} />
        <StatCard value={livrees}     label="Livrées"          color="var(--teal)"    delay={4} />
        {annulees > 0 && <StatCard value={annulees} label="Annulées" color="var(--red)" delay={5} />}
      </div>

      {/* Stats pêcheur si disponibles */}
      {isPecheur && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard
            value={(stats.chiffre_affaires.jour || 0).toLocaleString('fr-FR')}
            label="CA du jour"
            color="var(--teal)"
            sub="FG"
            delay={1}
          />
          <StatCard
            value={(stats.chiffre_affaires.semaine || 0).toLocaleString('fr-FR')}
            label="CA de la semaine"
            color="var(--teal)"
            sub="FG"
            delay={2}
          />
          <StatCard
            value={stats.produits.disponibles}
            label="Produits disponibles"
            color="var(--green)"
            delay={3}
          />
          <StatCard
            value={stats.commandes.par_statut.livree}
            label="Commandes livrées"
            color="var(--teal)"
            delay={4}
          />
        </div>
      )}

      {/* Graphiques */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {/* Activité 7 jours */}
        <div className="anim-d1" style={{
          background: 'var(--surface)', border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow)'
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>Activité — 7 derniers jours</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>Nombre de commandes par jour</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCmd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--dim)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--dim)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<TooltipCustom />} />
              <Area type="monotone" dataKey="commandes" name="Commandes" stroke="var(--primary)" strokeWidth={2} fill="url(#gradCmd)" dot={{ r: 3, fill: 'var(--primary)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* CA 7 jours */}
        <div className="anim-d2" style={{
          background: 'var(--surface)', border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow)'
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>Chiffre d'affaires — 7 jours</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>Montant des commandes livrées (FG)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--dim)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--dim)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="ca" name="CA (FG)" fill="var(--teal)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Produits du pêcheur */}
      {isPecheur && prods.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Mes produits actifs</h2>
            <Link to="/mes-produits" style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>Tout voir</Link>
          </div>
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {prods.filter(p => p.statut === 'disponible').slice(0, 4).map((p, i) => (
              <div key={p.id} className={`anim-d${Math.min(i + 1, 4)}`} style={{
                background: 'var(--surface)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)', padding: '0.85rem 1.1rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem' }}>{p.type_poisson}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.1rem' }}>{p.poids_kg} kg disponibles</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>{Number(p.prix_unitaire).toLocaleString('fr-FR')} FG/kg</p>
                  <span className={`badge ${p.etat === 'frais' ? 'badge-green' : p.etat === 'congele' ? 'badge-blue' : 'badge-orange'}`}>{p.etat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commandes récentes */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Commandes récentes</h2>
          <Link to="/commandes" style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>Tout voir</Link>
        </div>

        {cmd.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">Aucune commande</p>
            <p>Vos commandes apparaîtront ici.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {cmd.slice(0, 6).map((c, i) => {
              const s = STATUT_BADGE[c.statut] || { cls: 'badge-gray', lbl: c.statut };
              return (
                <div key={c.id} className={`anim-d${Math.min(i + 1, 5)}`} style={{
                  background: 'var(--surface)', border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)', padding: '0.9rem 1.1rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: '0.75rem', boxShadow: 'var(--shadow-xs)',
                  transition: 'var(--transition)'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                      background: 'var(--primary-bg)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem' }}>
                        {c.produit?.type_poisson || 'Produit'} — {c.quantite_kg} kg
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.1rem' }}>
                        {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge ${s.cls}`}>{s.lbl}</span>
                    <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      {Number(c.prix_total).toLocaleString('fr-FR')} FG
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableauDeBord;
