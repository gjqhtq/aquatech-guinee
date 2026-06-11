import { useState, useEffect } from 'react';
import api from '../services/api';

const ETAT_BADGE = { frais: 'badge-green', congele: 'badge-blue', seche: 'badge-orange' };
const STATUT_BADGE = { disponible: 'badge-green', vendu: 'badge-red', expire: 'badge-orange', supprime: 'badge-red' };
const VIDE = { type_poisson: '', poids_kg: '', prix_unitaire: '', date_capture: '', lieu_capture: '', etat: 'frais', description: '', seuil_alerte: '' };

const MesProduits = () => {
  const [produits, setProduits] = useState([]);
  const [load, setLoad] = useState(true);
  const [form, setForm] = useState(VIDE);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const charger = async () => {
    setLoad(true);
    try { const r = await api.get('/produits/mes/produits'); setProduits(r.data.produits || []); }
    catch { setErr('Erreur lors du chargement.'); }
    finally { setLoad(false); }
  };

  useEffect(() => { charger(); }, []);

  const h = e => setForm({ ...form, [e.target.name]: e.target.value });

  const ouvrir = (p = null) => {
    setErr('');
    setPhotoFile(null);
    setPhotoPreview('');

    if (p) {
      setForm({ type_poisson: p.type_poisson, poids_kg: p.poids_kg, prix_unitaire: p.prix_unitaire, date_capture: p.date_capture?.split('T')[0] || '', lieu_capture: p.lieu_capture, etat: p.etat, description: p.description || '', seuil_alerte: p.seuil_alerte || '' });
      setPhotoPreview(p.photos?.[0] || '');
      setEditId(p.id);
    } else {
      setForm(VIDE);
      setEditId(null);
    }
    setShowForm(true);
  };

  const fermer = () => { setShowForm(false); setEditId(null); setForm(VIDE); setErr(''); setPhotoFile(null); setPhotoPreview(''); };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview('');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const sauver = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      if (photoFile) formData.append('photos', photoFile);

      if (editId) await api.put('/produits/' + editId, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/produits', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await charger(); fermer();
    } catch (er) {
      setErr(er.response?.data?.message || er.response?.data?.erreurs?.[0]?.msg || 'Erreur.');
    } finally { setSaving(false); }
  };

  const changerStatut = async (id, statut) => {
    try { await api.put('/produits/' + id + '/statut', { statut }); await charger(); }
    catch { setErr('Erreur lors du changement de statut.'); }
  };

  const disponibles = produits.filter(p => p.statut === 'disponible');
  const autres = produits.filter(p => p.statut !== 'disponible');

  return (
    <div className="page">
      <div className="page-header anim" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Mes Produits</h1>
          <p>{disponibles.length} produit{disponibles.length > 1 ? 's' : ''} en ligne</p>
        </div>
        <button onClick={() => ouvrir()} className="btn btn-primary">Ajouter un produit</button>
      </div>

      {err && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{err}</div>}

      {load ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--primary-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : produits.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">Aucun produit</p>
          <p style={{ marginBottom: '1.25rem' }}>Publiez votre première annonce pour commencer à vendre.</p>
          <button onClick={() => ouvrir()} className="btn btn-primary">Ajouter mon premier produit</button>
        </div>
      ) : (
        <>
          {disponibles.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 className="section-title">En ligne ({disponibles.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {disponibles.map((p, i) => (
                  <div key={p.id} className={`anim-d${Math.min(i + 1, 5)}`} style={{
                    background: '#fff', border: '1px solid var(--border-light)',
                    borderLeft: '3px solid var(--green)', borderRadius: 'var(--radius)',
                    padding: '1.1rem 1.3rem', boxShadow: 'var(--shadow-xs)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: '0.75rem', transition: 'var(--transition)'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = ''; }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{p.type_poisson}</span>
                        <span className={`badge ${ETAT_BADGE[p.etat] || 'badge-gray'}`}>{p.etat}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {p.poids_kg} kg — <strong style={{ color: 'var(--primary)' }}>{Number(p.prix_unitaire).toLocaleString('fr-FR')} FG/kg</strong> — {p.lieu_capture}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button onClick={() => ouvrir(p)} className="btn btn-sm btn-ghost">Modifier</button>
                      <button onClick={() => changerStatut(p.id, 'vendu')} className="btn btn-sm" style={{ background: 'var(--orange-bg)', color: 'var(--orange)', border: '1px solid var(--orange-border)', borderRadius: 'var(--radius-xs)', padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Vendu</button>
                      <button onClick={() => changerStatut(p.id, 'supprime')} className="btn btn-sm btn-danger">Retirer</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {autres.length > 0 && (
            <div>
              <h2 className="section-title">Archivés ({autres.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {autres.map((p, i) => (
                  <div key={p.id} style={{
                    background: 'var(--surface2)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius)', padding: '0.9rem 1.2rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: '0.75rem', opacity: 0.75
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem', marginRight: '0.5rem' }}>{p.type_poisson}</span>
                      <span className={`badge ${STATUT_BADGE[p.statut] || 'badge-gray'}`}>{p.statut}</span>
                    </div>
                    <button onClick={() => changerStatut(p.id, 'disponible')} className="btn btn-sm btn-ghost" style={{ color: 'var(--green)', borderColor: 'var(--green-border)' }}>
                      Remettre en ligne
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div className="modal-overlay" onClick={fermer}>
          <div className="modal-box anim-scale" onClick={e => e.stopPropagation()}>
            <button onClick={fermer} className="modal-close">Fermer</button>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '1.5rem' }}>
              {editId ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>

            {err && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{err}</div>}

            <form onSubmit={sauver} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group">
                <label className="form-label">Type de poisson</label>
                <div className="input-wrap">
                  <input name="type_poisson" value={form.type_poisson} onChange={h} placeholder="Ex : Thiof, Crevettes royales..." required />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Poids (kg)</label>
                  <div className="input-wrap">
                    <input type="number" name="poids_kg" value={form.poids_kg} onChange={h} placeholder="Ex : 10" min="0.1" step="0.1" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Prix (FG/kg)</label>
                  <div className="input-wrap">
                    <input type="number" name="prix_unitaire" value={form.prix_unitaire} onChange={h} placeholder="Ex : 25000" min="1" required />
                  </div>
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Date de capture</label>
                  <div className="input-wrap">
                    <input type="date" name="date_capture" value={form.date_capture} onChange={h} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">État</label>
                  <div className="input-wrap">
                    <select name="etat" value={form.etat} onChange={h}>
                      <option value="frais">Frais</option>
                      <option value="congele">Congelé</option>
                      <option value="seche">Séché</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Lieu de capture</label>
                  <div className="input-wrap">
                    <input name="lieu_capture" value={form.lieu_capture} onChange={h} placeholder="Ex : Conakry, Boulbinet" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Seuil alerte stock (kg)</label>
                  <div className="input-wrap">
                    <input type="number" name="seuil_alerte" value={form.seuil_alerte} onChange={h} placeholder="Ex : 5" min="0" step="0.1" />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <div className="input-wrap">
                  <textarea name="description" value={form.description} onChange={h} placeholder="Décrivez votre produit pour attirer les acheteurs..." />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Photo du produit</label>
                <div className="input-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} />
                  <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
                    Sur mobile, vous pouvez prendre une photo du poisson directement depuis l'appareil.
                  </span>
                  {(photoPreview || form.photos?.[0]) && (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <img
                        src={photoPreview || form.photos?.[0]}
                        alt="Aperçu du produit"
                        style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: '0.75rem', border: '1px solid var(--border-light)' }}
                      />
                      <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
                        {photoPreview ? 'Nouvelle photo sélectionnée' : 'Photo actuelle du produit'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: '0.75rem', background: saving ? 'var(--border)' : 'var(--primary)',
                  color: saving ? 'var(--muted)' : '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
                  fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', transition: 'var(--transition)',
                  boxShadow: saving ? 'none' : '0 4px 14px rgba(0,112,243,0.25)'
                }}>{saving ? 'Enregistrement...' : editId ? 'Mettre à jour' : 'Publier le produit'}</button>
                <button type="button" onClick={fermer} style={{
                  flex: 1, padding: '0.75rem', background: 'var(--surface3)', color: 'var(--text)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  fontWeight: 600, cursor: 'pointer'
                }}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesProduits;
