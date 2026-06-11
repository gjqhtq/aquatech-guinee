import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import faq from './chatbotData';

const normaliser = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

// Calcul de similarité Levenshtein pour meilleure détection
const similarite = (s1, s2) => {
  const a = normaliser(s1), b = normaliser(s2);
  const matrice = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrice[0][i] = i;
  for (let i = 0; i <= b.length; i++) matrice[i][0] = i;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrice[i][j] = Math.min(
        matrice[i - 1][j] + 1,
        matrice[i][j - 1] + 1,
        matrice[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1)
      );
    }
  }
  return 1 - (matrice[b.length][a.length] / Math.max(a.length, b.length));
};

const trouverReponse = (question, utilisateur) => {
  const q = normaliser(question);
  let meilleur = null;
  let score = 0;

  for (const item of faq) {
    // Chercher le mot clé avec la meilleure correspondance
    let scoreItem = 0;
    for (const mot of item.mots) {
      const sim = similarite(q, mot);
      if (sim > 0.6) scoreItem = Math.max(scoreItem, sim);
      if (q.includes(normaliser(mot))) scoreItem = Math.max(scoreItem, 1);
    }
    if (scoreItem > score) {
      score = scoreItem;
      meilleur = item;
    }
  }

  if (meilleur) {
    let reponse = meilleur.reponse;
    // Adapter la réponse au rôle
    if (utilisateur?.role === 'pecheur' && meilleur.reponse.includes('acheteur')) {
      reponse = meilleur.reponse.replace(/acheteur/gi, 'vous');
    }
    return reponse;
  }

  return "Je n'ai pas bien compris. Essayez : commander, produit, livraison, profil, météo, aide. 🤔";
};

const Chatbot = () => {
  const { utilisateur } = useAuth();
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState([
    { de: 'bot', texte: "Bonjour 👋 ! Je suis l'assistant AquaTech. Comment puis-je vous aider ?" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [cmdCount, setCmdCount] = useState(0);
  const finRef = useRef(null);

  useEffect(() => {
    if (ouvert) {
      finRef.current?.scrollIntoView({ behavior: 'smooth' });
      // Charger le nombre de commandes si connecté
      if (utilisateur) {
        api.get('/commandes/historique')
          .then(r => setCmdCount(r.data.commandes?.length || 0))
          .catch(() => {});
      }
    }
  }, [ouvert, utilisateur]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const getSuggestions = () => {
    if (!utilisateur) {
      return ['Comment commander ?', 'Créer un compte', 'Voir le catalogue'];
    }
    if (utilisateur.role === 'pecheur') {
      return ['Ajouter un produit', 'Mes commandes', 'Suivre mon stock', 'Conditions météo'];
    }
    if (utilisateur.role === 'acheteur') {
      return ['Voir le catalogue', 'Mes commandes', 'Chercher du poisson', 'Comment commander ?'];
    }
    return ['Mes livraisons', 'Commandes disponibles', 'Mes livraisons en cours'];
  };

  const envoyer = async (texte) => {
    const msg = (texte || input).trim();
    if (!msg) return;
    setMessages(prev => [...prev, { de: 'user', texte: msg }]);
    setInput('');
    setTyping(true);

    // Simuler traitement
    await new Promise(r => setTimeout(r, 600));

    const reponse = trouverReponse(msg, utilisateur);
    setTyping(false);
    setMessages(prev => [...prev, { de: 'bot', texte: reponse }]);
  };

  const handleKey = (e) => { if (e.key === 'Enter') envoyer(); };

  return (
    <div className="chatbot-container">
      {ouvert && (
        <div className="chatbot-fenetre">
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="chatbot-avatar-header">AT</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Assistant AquaTech</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  En ligne
                  {utilisateur && <span style={{ marginLeft: '0.3rem' }}>• {utilisateur.nom}</span>}
                </div>
              </div>
            </div>
            <button onClick={() => setOuvert(false)} className="chatbot-fermer" aria-label="Fermer">✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-row ${m.de}`}>
                {m.de === 'bot' && <div className="chatbot-avatar-bot">AT</div>}
                <div className={`chatbot-bulle ${m.de}`}>
                  <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{m.texte}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div className="chatbot-row bot">
                <div className="chatbot-avatar-bot">AT</div>
                <div className="chatbot-bulle bot chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={finRef} />
          </div>

          {messages.length <= 2 && (
            <div className="chatbot-suggestions">
              {getSuggestions().map((s, i) => (
                <button key={i} className="chatbot-suggestion" onClick={() => envoyer(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className="chatbot-input-zone">
            <input
              type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Posez votre question..."
              className="chatbot-input"
            />
            <button onClick={() => envoyer()} className="chatbot-send" aria-label="Envoyer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m22 2-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
      <button className="chatbot-bouton" onClick={() => setOuvert(!ouvert)} aria-label="Assistant">
        {ouvert
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          : <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {cmdCount > 0 && <span className="chatbot-badge">{cmdCount}</span>}
          </>
        }
      </button>
    </div>
  );
};

export default Chatbot;
