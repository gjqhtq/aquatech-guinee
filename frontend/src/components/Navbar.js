import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { utilisateur, estConnecte, estAdmin, deconnecter } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [menu, setMenu] = useState(false);

  const actif = (p) => loc.pathname === p || loc.pathname.startsWith(p + '/');
  const fermer = () => setMenu(false);
  const deco = () => { deconnecter(); fermer(); navigate('/'); };

  return (
    <nav className="navbar-wrap">
      <Link to="/" className="nav-logo" onClick={fermer}>
        <div className="nav-logo-icon">AT</div>
        <div className="nav-logo-text">Aqua<span>Tech</span></div>
      </Link>

      <button className="burger" onClick={() => setMenu(!menu)} aria-label="Menu">
        {menu ? 'Fermer' : 'Menu'}
      </button>

      <div className={`nav-links ${menu ? 'open' : ''}`}>
        <Link to="/catalogue" onClick={fermer} className={`nav-link ${actif('/catalogue') ? 'active' : ''}`}>Catalogue</Link>

        {estConnecte && !estAdmin && (
          <>
            {utilisateur?.role === 'pecheur' && (
              <Link to="/mes-produits" onClick={fermer} className={`nav-link ${actif('/mes-produits') ? 'active' : ''}`}>Mes Produits</Link>
            )}
            {utilisateur?.role === 'pecheur' && (
              <Link to="/meteo" onClick={fermer} className={`nav-link ${actif('/meteo') ? 'active' : ''}`}>Météo</Link>
            )}
            {(utilisateur?.role === 'distributeur' || utilisateur?.role === 'livreur') && (
              <Link to="/livraisons" onClick={fermer} className={`nav-link ${actif('/livraisons') ? 'active' : ''}`}>Livraisons</Link>
            )}
            <Link to="/commandes" onClick={fermer} className={`nav-link ${actif('/commandes') ? 'active' : ''}`}>Commandes</Link>
            <Link to="/messagerie" onClick={fermer} className={`nav-link ${actif('/messagerie') ? 'active' : ''}`}>Messages</Link>
            <Link to="/tableau-de-bord" onClick={fermer} className={`nav-link ${actif('/tableau-de-bord') ? 'active' : ''}`}>Dashboard</Link>
          </>
        )}

        {estAdmin && (
          <Link to="/admin" onClick={fermer} className={`nav-link ${actif('/admin') ? 'active' : ''}`}>Administration</Link>
        )}

        <div className="nav-sep" />

        {estConnecte ? (
          <>
            <Link to="/profil" onClick={fermer} className={`nav-link ${actif('/profil') ? 'active' : ''}`}>
              {utilisateur?.nom?.split(' ')[0] || 'Profil'}
            </Link>
            <button onClick={deco} className="nav-link nav-deco">Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/connexion" onClick={fermer} className={`nav-link ${actif('/connexion') ? 'active' : ''}`}>Connexion</Link>
            <Link to="/inscription" onClick={fermer} className="nav-link nav-cta">S'inscrire</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
