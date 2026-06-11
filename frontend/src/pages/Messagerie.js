import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Messagerie = () => {
  const { utilisateur } = useAuth();
  const [convs, setConvs] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [sel, setSel] = useState(null);
  const [selNom, setSelNom] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [txt, setTxt] = useState('');
  const [load, setLoad] = useState(true);
  const [loadMsgs, setLoadMsgs] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [onglet, setOnglet] = useState('conversations'); // 'conversations' | 'nouveau'
  const chatRef = useRef(null);

  const chargerConversations = () => {
    api.get('/messages/conversations')
      .then(r => setConvs(r.data.conversations || []))
      .catch(() => {})
      .finally(() => setLoad(false));
  };

  useEffect(() => {
    chargerConversations();
    api.get('/messages/utilisateurs')
      .then(r => setUtilisateurs(r.data.utilisateurs || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  const ouvrirConv = async (contactId, contactNom) => {
    setSel(contactId);
    setSelNom(contactNom);
    setLoadMsgs(true);
    setOnglet('conversations');
    try {
      const r = await api.get('/messages/conversations/' + contactId);
      setMsgs(r.data.messages || []);
    } catch { setMsgs([]); }
    finally { setLoadMsgs(false); }
  };

  const envoyer = async (e) => {
    e.preventDefault();
    if (!txt.trim() || !sel) return;
    const contenu = txt.trim();
    setTxt('');
    const msgTemp = {
      contenu,
      expediteur: { id: utilisateur.id, nom: utilisateur.nom },
      createdAt: new Date().toISOString()
    };
    setMsgs(prev => [...prev, msgTemp]);
    try {
      await api.post('/messages', { destinataire_id: sel, contenu });
      chargerConversations();
    } catch {
      setMsgs(prev => prev.slice(0, -1));
    }
  };

  const utilisateursFiltres = utilisateurs.filter(u =>
    u.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    u.role.toLowerCase().includes(recherche.toLowerCase())
  );

  const roleLabel = { pecheur: 'Pêcheur', acheteur: 'Acheteur', distributeur: 'Distributeur', livreur: 'Livreur', restaurant: 'Restaurant', admin: 'Admin' };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '280px 1fr',
      gap: 0,
      height: 'calc(100vh - 60px)',
      background: 'var(--bg)',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <div style={{
        background: '#fff',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header sidebar */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>Messagerie</h2>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setOnglet('conversations')}
              style={{
                flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.78rem', fontWeight: 600,
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                background: onglet === 'conversations' ? 'var(--primary)' : 'transparent',
                color: onglet === 'conversations' ? '#fff' : 'var(--muted)',
                transition: 'var(--transition)'
              }}
            >
              Conversations
            </button>
            <button
              onClick={() => setOnglet('nouveau')}
              style={{
                flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.78rem', fontWeight: 600,
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                background: onglet === 'nouveau' ? 'var(--primary)' : 'transparent',
                color: onglet === 'nouveau' ? '#fff' : 'var(--muted)',
                transition: 'var(--transition)'
              }}
            >
              Nouveau
            </button>
          </div>
        </div>

        {/* Contenu sidebar */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {onglet === 'conversations' ? (
            load ? (
              <p style={{ padding: '1.5rem', color: 'var(--muted)', textAlign: 'center', fontSize: '0.85rem' }}>Chargement...</p>
            ) : convs.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Aucune conversation</p>
                <p style={{ color: 'var(--dim)', fontSize: '0.78rem' }}>Cliquez sur "Nouveau" pour démarrer</p>
              </div>
            ) : (
              convs.map(c => (
                <div
                  key={c.contact_id}
                  onClick={() => ouvrirConv(c.contact_id, c.contact_nom)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: sel === c.contact_id ? 'var(--primary-bg)' : 'transparent',
                    borderLeft: sel === c.contact_id ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--primary)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                    }}>
                      {c.contact_nom?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{c.contact_nom}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.dernier_message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            <div style={{ padding: '0.75rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <input
                  value={recherche}
                  onChange={e => setRecherche(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  style={{
                    width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface2)', color: 'var(--text)'
                  }}
                />
              </div>
              {utilisateursFiltres.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' }}>Aucun utilisateur trouvé</p>
              ) : (
                utilisateursFiltres.map(u => (
                  <div
                    key={u.id}
                    onClick={() => ouvrirConv(u.id, u.nom)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.6rem 0.5rem', borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', marginBottom: '0.2rem',
                      background: sel === u.id ? 'var(--primary-bg)' : 'transparent',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'var(--surface3)', color: 'var(--text)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
                    }}>
                      {u.nom?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{u.nom}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{roleLabel[u.role] || u.role}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Zone chat */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
        {!sel ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1rem' }}>Bienvenue dans la messagerie</p>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Sélectionnez une conversation ou démarrez-en une nouvelle</p>
          </div>
        ) : (
          <>
            {/* Header chat */}
            <div style={{
              padding: '0.9rem 1.25rem', background: '#fff',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700
              }}>
                {selNom?.charAt(0).toUpperCase()}
              </div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{selNom}</p>
            </div>

            {/* Messages */}
            <div ref={chatRef} style={{
              flex: 1, padding: '1.25rem', overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: '0.6rem'
            }}>
              {loadMsgs ? (
                <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>Chargement...</p>
              ) : msgs.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', marginTop: '3rem' }}>
                  Aucun message. Commencez la conversation.
                </p>
              ) : (
                msgs.map((m, i) => {
                  const isMe = m.expediteur?.id === utilisateur?.id;
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '68%',
                        padding: '0.6rem 1rem',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe ? 'var(--primary)' : '#fff',
                        color: isMe ? '#fff' : 'var(--text)',
                        border: isMe ? 'none' : '1px solid var(--border)',
                        fontSize: '0.875rem', lineHeight: 1.5,
                        boxShadow: 'var(--shadow)'
                      }}>
                        <p>{m.contenu}</p>
                        <p style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '0.2rem', textAlign: 'right' }}>
                          {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Zone de saisie */}
            <form onSubmit={envoyer} style={{
              display: 'flex', gap: '0.6rem', padding: '0.85rem 1rem',
              borderTop: '1px solid var(--border)', background: '#fff',
              alignItems: 'flex-end'
            }}>
              <textarea
                value={txt}
                onChange={e => setTxt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer(e); } }}
                placeholder="Écrivez votre message... (Entrée pour envoyer)"
                rows={1}
                style={{
                  flex: 1, padding: '0.65rem 0.9rem', fontSize: '0.875rem',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  resize: 'none', background: 'var(--surface2)', color: 'var(--text)',
                  lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto'
                }}
              />
              <button
                type="submit"
                disabled={!txt.trim()}
                style={{
                  padding: '0.65rem 1.2rem', background: txt.trim() ? 'var(--primary)' : 'var(--border)',
                  color: txt.trim() ? '#fff' : 'var(--muted)', border: 'none',
                  borderRadius: 'var(--radius)', cursor: txt.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 600, fontSize: '0.875rem', transition: 'var(--transition)',
                  whiteSpace: 'nowrap'
                }}
              >
                Envoyer
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Messagerie;
