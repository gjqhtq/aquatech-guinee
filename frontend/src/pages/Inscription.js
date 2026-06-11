import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { v: 'acheteur',     l: 'Acheteur',     d: "J'achète du poisson" },
  { v: 'pecheur',      l: 'Pêcheur',      d: 'Je vends mes prises' },
  { v: 'restaurant',   l: 'Restaurant',   d: 'Commandes en gros' },
  { v: 'distributeur', l: 'Distributeur', d: "J'organise les livraisons" },
  { v: 'livreur',      l: 'Livreur',      d: 'Je livre les commandes' },
];

const Inscription = () => {
  const { inscrire, verifierOTP } = useAuth();
  const navigate = useNavigate();
  const [etape, setEtape] = useState(1);
  const [f, setF] = useState({ nom: '', telephone: '', localisation: '', role: 'acheteur', mot_de_passe: '' });
  const [showMdp, setShowMdp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [err, setErr] = useState('');
  const [load, setLoad] = useState(false);
  const h = e => setF({ ...f, [e.target.name]: e.target.value });

  const inscrireH = async (e) => {
    e.preventDefault(); setErr(''); setLoad(true);
    try {
      const r = await inscrire(f);
      if (r.otp_test) setOtpInfo('Code de vérification : ' + r.otp_test);
      setEtape(2);
    } catch (er) {
      setErr(er.response?.data?.message || er.response?.data?.erreurs?.[0]?.msg || 'Erreur lors de l inscription.');
    } finally { setLoad(false); }
  };

  const otpH = async (e) => {
    e.preventDefault(); setErr(''); setLoad(true);
    try {
      await verifierOTP(f.telephone, otp);
      setEtape(3);
      setTimeout(() => navigate('/connexion'), 2000);
    } catch (er) {
      setErr(er.response?.data?.message || 'Code incorrect ou expiré.');
    } finally { setLoad(false); }
  };

  return (
    <div className="page page-centered">
      <main className="auth-box">
        <div className="auth-box-head">
          <span className="auth-badge">AquaTech</span>
          <div>
            <h1>{etape === 3 ? 'Inscription terminée' : 'Rejoignez AquaTech'}</h1>
            <p className="auth-desc">
              {etape === 1 && 'Créez votre compte pour acheter, vendre ou livrer facilement.'}
              {etape === 2 && `Confirmez votre téléphone ${f.telephone} pour sécuriser votre compte.`}
              {etape === 3 && 'Bravo ! Votre compte est activé. Vous allez être redirigé vers la connexion.'}
            </p>
          </div>
        </div>

        {err && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{err}</div>}
        {otpInfo && etape === 2 && <div className="alert alert-info" style={{ marginBottom: '1rem' }}>{otpInfo}</div>}

        {etape === 1 && (
          <form onSubmit={inscrireH} className="auth-form">
            <div className="form-group">
              <label className="form-label">Votre rôle</label>
              <div className="role-grid">
                {ROLES.map((r) => (
                  <button
                    key={r.v}
                    type="button"
                    className={`role-chip ${f.role === r.v ? 'active' : ''}`}
                    onClick={() => setF({ ...f, role: r.v })}
                  >
                    <span>{r.l}</span>
                    <small>{r.d}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <div className="input-wrap">
                <input name="nom" value={f.nom} onChange={h} placeholder="Ex : Ali Camara" required />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <div className="input-wrap">
                  <input name="telephone" value={f.telephone} onChange={h} placeholder="620 00 00 00" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Localisation</label>
                <div className="input-wrap">
                  <input name="localisation" value={f.localisation} onChange={h} placeholder="Conakry, Kaloum" required />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div className="input-wrap">
                <input
                  type={showMdp ? 'text' : 'password'}
                  name="mot_de_passe"
                  value={f.mot_de_passe}
                  onChange={h}
                  placeholder="6 caractères minimum"
                  required
                />
                <button type="button" className="input-action" onClick={() => setShowMdp(v => !v)}>
                  {showMdp ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={load} className="btn btn-primary btn-block btn-lg">
              {load ? 'Création en cours...' : 'Créer mon compte'}
            </button>
            <p className="form-note">Nous utilisons votre numéro uniquement pour vérifier votre compte.</p>
          </form>
        )}

        {etape === 2 && (
          <form onSubmit={otpH} className="auth-form">
            <div className="form-group">
              <label className="form-label">Code OTP</label>
              <div className="input-wrap otp-input-wrap">
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="• • • • • •"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
            </div>
            <button type="submit" disabled={load} className="btn btn-primary btn-block btn-lg">
              {load ? 'Vérification...' : 'Valider mon compte'}
            </button>
            <p className="form-note">Si vous ne recevez pas le SMS, vérifiez votre numéro ou réessayez.</p>
          </form>
        )}

        {etape === 3 && (
          <div className="register-success">
            <div className="success-mark">✓</div>
            <h2>Inscription validée</h2>
            <p>Merci ! Votre compte AquaTech est désormais activé.</p>
          </div>
        )}

        {etape < 3 && (
          <p className="auth-footer">
            Déjà inscrit ? <Link to="/connexion">Connectez-vous</Link>
          </p>
        )}
      </main>
    </div>
  );
};

export default Inscription;
