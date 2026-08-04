import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Star, AlertCircle, PackageX } from 'lucide-react';
import { api } from '../../api/client';
import { useAsync, useDebounce } from '../../hooks';
import { useShop } from '../../context/ShopContext';
import { useToast } from '../../context/ToastContext';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { SafeImage, PageLoader, EmptyState, Spinner } from '../../components/ui/Primitives';
import { formatPrice } from '../../utils/format';

const EMPTY = {
  name: '', slug: '', universe: '', genre: '', category: '',
  price: '', oldPrice: '', stock: '', shortDescription: '', description: '',
  material: '', size: '', color: '', tags: '', images: '',
  featured: false, newArrival: false, freeShipping: false, ageRestricted: false, hidden: false,
};

export default function AdminProducts() {
  const { universes, genres, categories } = useShop();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, loading, retry } = useAsync(() => api.admin.products(debounced), [debounced]);
  useEffect(() => { if (data) setItems(data); }, [data]);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, universe: universes[0]?.name || '', genre: genres[0] || '', category: categories[0]?.name || '' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name, slug: product.slug, universe: product.universe, genre: product.genre,
      category: product.category, price: product.price, oldPrice: product.oldPrice ?? '',
      stock: product.stock, shortDescription: product.shortDescription, description: product.description,
      material: product.material || '', size: product.size || '', color: product.color || '',
      tags: (product.tags || []).join(', '), images: (product.images || []).join('\n'),
      featured: product.featured, newArrival: product.newArrival, freeShipping: product.freeShipping,
      ageRestricted: product.ageRestricted, hidden: product.hidden,
    });
    setErrors({});
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice === '' ? null : Number(form.oldPrice),
        stock: Number(form.stock),
        images: form.images.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const res = editing
        ? await api.admin.updateProduct(editing.id, payload)
        : await api.admin.createProduct(payload);
      toast.success(res.message);
      setModalOpen(false);
      retry();
    } catch (err) {
      setErrors(err.errors || {});
      toast.error('შენახვა ვერ მოხერხდა', err.message);
    } finally {
      setSaving(false);
    }
  };

  const quickPatch = async (product, patch) => {
    setItems((list) => list.map((p) => (p.id === product.id ? { ...p, ...patch } : p)));
    try {
      await api.admin.patchProduct(product.id, patch);
    } catch (err) {
      toast.error('განახლება ვერ მოხერხდა', err.message);
      retry();
    }
  };

  const remove = async (product) => {
    try {
      const res = await api.admin.deleteProduct(product.id);
      toast.success(res.message);
      setItems((list) => list.filter((p) => p.id !== product.id));
    } catch (err) {
      toast.error('წაშლა ვერ მოხერხდა', err.message);
    }
  };

  const err = (key) => (errors[key] ? <span className="error-text"><AlertCircle size={12} /> {errors[key]}</span> : null);
  const cls = (key, base = 'input') => `${base}${errors[key] ? ' has-error' : ''}`;

  const stats = useMemo(() => ({
    total: items.length,
    hidden: items.filter((p) => p.hidden).length,
    out: items.filter((p) => p.stock === 0).length,
  }), [items]);

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ძიება სახელით, სამყაროთი…" />
        </div>
        <span className="text-sm text-muted">
          სულ <b style={{ color: 'var(--text)' }}>{stats.total}</b> · დამალული {stats.hidden} · ამოწურული {stats.out}
        </span>
        <button className="btn btn-primary btn-sm ml-auto" onClick={openCreate}>
          <Plus size={15} /> ახალი პროდუქტი
        </button>
      </div>

      {loading && !items.length ? <PageLoader label="პროდუქტები იტვირთება…" />
        : !items.length ? <EmptyState icon={PackageX} title="პროდუქტი ვერ მოიძებნა" description="სცადე სხვა საძიებო სიტყვა ან დაამატე ახალი." />
          : (
            <div className="admin-table-wrap">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: 56 }} />
                      <th>დასახელება</th>
                      <th>სამყარო</th>
                      <th>კატეგორია</th>
                      <th>ფასი</th>
                      <th>მარაგი</th>
                      <th style={{ textAlign: 'center' }}>Featured</th>
                      <th style={{ textAlign: 'center' }}>ხილვადობა</th>
                      <th style={{ textAlign: 'right' }}>მოქმედება</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.id} style={p.hidden ? { opacity: 0.55 } : undefined}>
                        <td><SafeImage src={p.images?.[0]} alt="" /></td>
                        <td>
                          <div className="fw-700" style={{ color: 'var(--text)' }}>{p.name}</div>
                          <div className="text-xs text-dim">{p.id} · {p.slug}</div>
                        </td>
                        <td>{p.universe}</td>
                        <td>{p.category}</td>
                        <td>
                          <div className="fw-700" style={{ color: 'var(--text)' }}>{formatPrice(p.price)}</div>
                          {p.oldPrice && <div className="text-xs text-dim" style={{ textDecoration: 'line-through' }}>{formatPrice(p.oldPrice)}</div>}
                        </td>
                        <td>
                          <input
                            className="input"
                            type="number"
                            min="0"
                            value={p.stock}
                            onChange={(e) => quickPatch(p, { stock: Number(e.target.value) })}
                            style={{ width: 78, padding: '5px 8px', fontSize: '0.82rem' }}
                            aria-label={`${p.name} — მარაგი`}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className={`row-btn${p.featured ? ' is-on' : ''}`}
                            style={p.featured ? { color: 'var(--gold)', borderColor: 'rgba(233,196,106,.4)' } : undefined}
                            onClick={() => quickPatch(p, { featured: !p.featured })}
                            aria-label="Featured გადართვა"
                          >
                            <Star size={14} fill={p.featured ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="row-btn" onClick={() => quickPatch(p, { hidden: !p.hidden })} aria-label="დამალვა/გამოჩენა">
                            {p.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="row-btn" onClick={() => openEdit(p)} aria-label="რედაქტირება"><Pencil size={14} /></button>
                            <button className="row-btn danger" onClick={() => setDeleteTarget(p)} aria-label="წაშლა"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

      {/* ─── ფორმა ─── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `რედაქტირება — ${editing.name}` : 'ახალი პროდუქტის დამატება'}
        size="modal-lg"
        footer={(
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>გაუქმება</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? <Spinner /> : null} {editing ? 'განახლება' : 'დამატება'}
            </button>
          </>
        )}
      >
        <form onSubmit={save} noValidate>
          <div className="form-grid">
            <div className="field">
              <label className="label">დასახელება <span className="req">*</span></label>
              <input className={cls('name')} value={form.name} onChange={set('name')} />
              {err('name')}
            </div>
            <div className="field">
              <label className="label">Slug (URL)</label>
              <input className="input" value={form.slug} onChange={set('slug')} placeholder="ავტომატურად შეიქმნება" />
            </div>
            <div className="field">
              <label className="label">სამყარო <span className="req">*</span></label>
              <select className={cls('universe', 'select')} value={form.universe} onChange={set('universe')}>
                <option value="">— აირჩიე —</option>
                {universes.map((u) => <option key={u.slug} value={u.name}>{u.name}</option>)}
              </select>
              {err('universe')}
            </div>
            <div className="field">
              <label className="label">ჟანრი <span className="req">*</span></label>
              <select className={cls('genre', 'select')} value={form.genre} onChange={set('genre')}>
                <option value="">— აირჩიე —</option>
                {genres.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              {err('genre')}
            </div>
            <div className="field">
              <label className="label">კატეგორია <span className="req">*</span></label>
              <select className={cls('category', 'select')} value={form.category} onChange={set('category')}>
                <option value="">— აირჩიე —</option>
                {categories.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
              </select>
              {err('category')}
            </div>
            <div className="field">
              <label className="label">მარაგი <span className="req">*</span></label>
              <input className={cls('stock')} type="number" min="0" value={form.stock} onChange={set('stock')} />
              {err('stock')}
            </div>
            <div className="field">
              <label className="label">ფასი (₾) <span className="req">*</span></label>
              <input className={cls('price')} type="number" step="0.01" min="0" value={form.price} onChange={set('price')} />
              {err('price')}
            </div>
            <div className="field">
              <label className="label">ძველი ფასი (₾)</label>
              <input className={cls('oldPrice')} type="number" step="0.01" min="0" value={form.oldPrice} onChange={set('oldPrice')} placeholder="ფასდაკლებისთვის" />
              <p className="hint">თუ ძველი ფასი ფასზე მეტია, ავტომატურად ჩაირთვება ფასდაკლების badge.</p>
            </div>
          </div>

          <div className="field">
            <label className="label">მოკლე აღწერა <span className="req">*</span></label>
            <input className={cls('shortDescription')} value={form.shortDescription} onChange={set('shortDescription')} />
            {err('shortDescription')}
          </div>

          <div className="field">
            <label className="label">სრული აღწერა <span className="req">*</span></label>
            <textarea className={cls('description', 'textarea')} value={form.description} onChange={set('description')} rows={4} />
            {err('description')}
          </div>

          <div className="form-grid">
            <div className="field">
              <label className="label">მასალა</label>
              <input className="input" value={form.material} onChange={set('material')} />
            </div>
            <div className="field">
              <label className="label">ზომა</label>
              <input className="input" value={form.size} onChange={set('size')} />
            </div>
            <div className="field">
              <label className="label">ფერი</label>
              <input className="input" value={form.color} onChange={set('color')} />
            </div>
            <div className="field">
              <label className="label">თეგები (მძიმით)</label>
              <input className="input" value={form.tags} onChange={set('tags')} placeholder="ჰარი პოტერი, ჯადოსნური" />
            </div>
          </div>

          <div className="field">
            <label className="label">სურათები — თითო ხაზზე ერთი ბილიკი ან URL</label>
            <textarea className="textarea" value={form.images} onChange={set('images')} rows={3} placeholder={'/products/rv-001-1.svg\n/products/rv-001-2.svg'} />
            <p className="hint">ცარიელად დატოვების შემთხვევაში გამოყენებული იქნება placeholder სურათი.</p>
          </div>

          <div className="grid" style={{ gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {[
              ['featured', 'რჩეული (Featured)'],
              ['newArrival', 'ახალი დამატებული'],
              ['freeShipping', 'უფასო მიწოდება'],
              ['ageRestricted', '18+ შეზღუდვა'],
              ['hidden', 'დამალული საიტზე'],
            ].map(([key, label]) => (
              <label key={key} className="check">
                <input type="checkbox" checked={form[key]} onChange={set(key)} />
                <span className="box"><Star size={10} fill="currentColor" /></span>
                {label}
              </label>
            ))}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove(deleteTarget)}
        title="პროდუქტის წაშლა"
        message={`ნამდვილად გსურთ „${deleteTarget?.name}"-ის წაშლა? წაიშლება ასევე მისი შეფასებები.`}
      />
    </div>
  );
}
