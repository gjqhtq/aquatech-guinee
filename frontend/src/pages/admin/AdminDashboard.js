import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const ROLE_COLORS = { pecheur: '#0d9488', acheteur: '#0070f3', restaurant: '#16a34a', distributeur: '#7c3aed', livreur: '#d97706', admin: '#dc2626' };

const StatCard = ({ value, label, color, sub, delay, to }) => {
  const inner = (
    <div style={{
      background: '#fff', border: '1px solid var(--border-light)',
      borderTop: `3px solid ${color}`, borderRadius: 'var(--radius)',
      padding: '1.4rem 1.25rem', boxShadow: 'var(--shadow)',
      transition: 'var(--transition)', cursor: to ? 'pointer' : 'default'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
    >
      <p style={{ fontSize: '1.75rem', fontWeight: 800, color, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.4rem', fontWeight: 500 }}>{label}</p>
      {sub && <p style={{ fontSize: '0.7rem', color: 'var(--dim)', marginTop: '0.15rem' }}>{sub}</p>}
    </div>
  );
  return <div className={`anim-d${delay}`}>{to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner}</div>;
};

const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }}>
      <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.fill || p.color }}>{p.name} : <strong>{p.value}</strong></p>)}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    api.get('/admin/statistiques').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoad(false));
  }, []);

  if (load) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--primary-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const pieData = (stats.utilisateurs.par_role || []).map(r => ({
    name: r.role, value: Number(r.total), color: ROLE_COLORS[r.role] || '#94a3b8'
  }));

  const barData = [
    { name: 'En attente', value: stats.commandes.total - stats.commandes.livrees - stats.commandes.annulees - stats.commandes.en_cours, fill: '#f59e0b' },
    { name: 'En cours',   value: stats.commandes.en_cours,  fill: '#0070f3' },
    { name: 'Livrées',    value: stats.commandes.livrees,   fill: '#16a34a' },
    { name: 'Annulées',   value: stats.commandes.annulees,  fill: '#dc2626' },
  ].filter(d => d.value > 0);

  return (
    <div className="page">
      <div className="page-header anim" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Administration</h1>
          <p>Vue globale de la plateforme AquaTech Guinée</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/admin/utilisateurs" className="btn btn-secondary btn-sm">Utilisateurs</Link>
          <Link to="/admin/commandes" className="btn btn-primary btn-sm">Commandes</Link>
        </div>
      </div>

      {/* Stats principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard value={stats.utilisateurs.total}   label="Utilisateurs"   color="var(--primary)" sub={`${stats.utilisateurs.actifs} actifs`} delay={1} to="/admin/utilisateurs" />
        <StatCard value={stats.produits.disponibles} label="Produits actifs" color="var(--teal)"    delay={2} to="/admin/produits" />
        <StatCard value={stats.commandes.total}      label="Commandes"       color="var(--text)"    delay={3} to="/admin/commandes" />
        <StatCard value={stats.commandes.en_cours}   label="En cours"        color="var(--orange)"  delay={4} />
        <StatCard value={stats.commandes.livrees}    label="Livrées"         color="var(--green)"   delay={5} />
        <StatCard value={(stats.volume_transactions || 0).toLocaleString('fr-FR') + ' FG'} label="Volume transactions" color="var(--primary)" sub="Commandes livrées" delay={5} />
      </div>

      {/* Graphiques */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {/* Répartition commandes */}
        <div className="anim-d1" style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>Répartition des commandes</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>Par statut</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--dim)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--dim)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="value" name="Commandes" radius={[4, 4, 0, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition utilisateurs */}
        <div className="anim-d2" style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>Utilisateurs par rôle</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '1rem' }}>Répartition des comptes actifs</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip content={<TooltipCustom />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', flex: 1, textTransform: 'capitalize' }}>{d.name}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accès rapides */}
      <div className="anim-d3">
        <h2 className="section-title">Accès rapides</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { to: '/admin/utilisateurs', t: 'Gestion Utilisateurs', d: 'Activer, suspendre ou supprimer des comptes', color: 'var(--primary)' },
            { to: '/admin/produits',     t: 'Gestion Produits',     d: 'Modérer les annonces de produits',           color: 'var(--teal)' },
            { to: '/admin/commandes',    t: 'Gestion Commandes',    d: 'Suivre et mettre à jour toutes les commandes',color: 'var(--orange)' },
          ].map((l, i) => (
            <Link key={i} to={l.to} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', border: '1px solid var(--border-light)',
                borderLeft: `3px solid ${l.color}`, borderRadius: 'var(--radius)',
                padding: '1.4rem', boxShadow: 'var(--shadow)', transition: 'var(--transition)'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              >
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.35rem' }}>{l.t}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>{l.d}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
