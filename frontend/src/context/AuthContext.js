import { createContext, useState, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Initialisation synchrone — pas de useEffect, pas de flash de redirection
const getInitialUser = () => {
  try {
    const token = localStorage.getItem('token');
    const data = localStorage.getItem('utilisateur');
    if (token && data) return JSON.parse(data);
  } catch {}
  return null;
};

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(getInitialUser);

  const connecter = async (tel, mdp) => {
    const res = await api.post('/utilisateurs/connexion', { telephone: tel, mot_de_passe: mdp });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('utilisateur', JSON.stringify(res.data.utilisateur));
    setUtilisateur(res.data.utilisateur);
    return res.data;
  };

  const inscrire = async (d) => (await api.post('/utilisateurs/inscription', d)).data;
  const verifierOTP = async (tel, otp) => (await api.post('/utilisateurs/verifier-otp', { telephone: tel, otp })).data;

  const deconnecter = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    setUtilisateur(null);
  };

  return (
    <AuthContext.Provider value={{
      utilisateur,
      chargement: false,
      connecter, inscrire, verifierOTP, deconnecter,
      estConnecte: !!utilisateur,
      estAdmin: utilisateur?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};
