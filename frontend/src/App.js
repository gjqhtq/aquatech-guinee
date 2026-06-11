import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Accueil from './pages/Accueil';
import Inscription from './pages/Inscription';
import Connexion from './pages/Connexion';
import Profil from './pages/Profil';
import Catalogue from './pages/Catalogue';
import TableauDeBord from './pages/TableauDeBord';
import Commandes from './pages/Commandes';
import Messagerie from './pages/Messagerie';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUtilisateurs from './pages/admin/AdminUtilisateurs';
import AdminProduits from './pages/admin/AdminProduits';
import AdminCommandes from './pages/admin/AdminCommandes';
import MesProduits from './pages/MesProduits';
import NotFound from './pages/NotFound';
import Livraisons from './pages/Livraisons';
import Meteo from './pages/Meteo';
import MesStocks from './pages/MesStocks';
import Parametres from './pages/Parametres';

var RouteProtegee = function(_ref) {
  var children = _ref.children;
  var auth = useAuth();
  if (!auth.estConnecte) return <Navigate to="/connexion" />;
  return children;
};

var RouteAdmin = function(_ref) {
  var children = _ref.children;
  var auth = useAuth();
  if (!auth.estConnecte || !auth.estAdmin) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Chatbot />
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/profil" element={<RouteProtegee><Profil /></RouteProtegee>} />
          <Route path="/tableau-de-bord" element={<RouteProtegee><TableauDeBord /></RouteProtegee>} />
          <Route path="/commandes" element={<RouteProtegee><Commandes /></RouteProtegee>} />
          <Route path="/messagerie" element={<RouteProtegee><Messagerie /></RouteProtegee>} />
          <Route path="/notifications" element={<RouteProtegee><Notifications /></RouteProtegee>} />
          <Route path="/mes-produits" element={<RouteProtegee><MesProduits /></RouteProtegee>} />
          <Route path="/livraisons" element={<RouteProtegee><Livraisons /></RouteProtegee>} />
          <Route path="/meteo" element={<RouteProtegee><Meteo /></RouteProtegee>} />
          <Route path="/mes-stocks" element={<RouteProtegee><MesStocks /></RouteProtegee>} />
          <Route path="/parametres" element={<RouteProtegee><Parametres /></RouteProtegee>} />
          <Route path="/admin" element={<RouteAdmin><AdminDashboard /></RouteAdmin>} />
          <Route path="/admin/utilisateurs" element={<RouteAdmin><AdminUtilisateurs /></RouteAdmin>} />
          <Route path="/admin/produits" element={<RouteAdmin><AdminProduits /></RouteAdmin>} />
          <Route path="/admin/commandes" element={<RouteAdmin><AdminCommandes /></RouteAdmin>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
