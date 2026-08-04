import { useState } from 'react';
import { Plus, Pencil, Trash2, Tags, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { useShop } from '../../context/ShopContext';
import { useToast } from '../../context/ToastContext';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { EmptyState, Spinner } from '../../components/ui/Primitives';

/**
 * კატეგორიებისა და სამყაროების მართვა — ერთი კომპონენტი, ორი რეჟიმი.
 * (ცვლილება ინახება JSON ფაილში; გვერდის განახლების შემდეგ რჩება)
 */
function TaxonomyManager({ kind }) {
  const isCategory = kind === 'category';
  const shop = useShop();
  const toast = useToast();

  const items = isCategory ? shop.categories : shop.universes;
  const [list, setList] = useState(items);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // shop-ის მონაცემები ჩატვირთვისას მოგვიანებით მოდის
  if (items.length && !list.length) setList(items);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(isCategory
      ? { name: '', slug: '', icon: 'Sparkles', desc: '' }
      : { name: '', nameKa: '', slug: '', color: '#8b5cf6', accent: '#1a1030', desc: '', ageRestricted: false });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...item });
    setErrors({});
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res;
      if (isCategory) {
        res = editing ? await api.admin.updateCategory(editing.slug, form) : await api.admin.createCategory(form);
      } else {
        res = editing ? await api.admin.updateUniverse(editing.slug, form) : await api.admin.createUniverse(form);
      }
      setList((prev) => (editing ? prev.map((i) => (i.slug === editing.slug ? res.item : i)) : [...prev, res.item]));
      toast.success(res.message);
      setOpen(false);
    } catch (err) {
      setErrors(err.errors || {});
      toast.error('შენახვა ვერ მოხერხდა', err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    try {
      const res = isCategory ? await api.admin.deleteCategory(item.slug) : await api.admin.deleteUniverse(item.slug);
      setList((prev) => prev.filter((i) => i.slug !== item.slug));
      toast.success(res.message);
    } catch (err) {
      toast.error('წაშლა ვერ მოხერხდა', err.message);
    }
  };

  const err = (key) => (errors[key] ? <span className="error-text"><AlertCircle size={12} /> {errors[key]}</span> : null);

  return (
    <div>
      <div className="admin-toolbar">
        <span className="text-sm text-muted">
          სულ <b style={{ color: 'var(--text)' }}>{list.length}</b> {isCategory ? 'კატეგორია' : 'სამყარო'}
        </span>
        <button className="btn btn-primary btn-sm ml-auto" onClick={openCreate}>
          <Plus size={15} /> {isCategory ? 'ახალი კატეგორია' : 'ახალი სამყარო'}
        </button>
      </div>

      {!list.length ? <EmptyState icon={isCategory ? Tags : Sparkles} title="სია ცარიელია" />
        : (
          <div className="admin-table-wrap">
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    {!isCategory && <th style={{ width: 50 }}>ფერი</th>}
                    <th>დასახელება</th>
                    <th>Slug</th>
                    <th>აღწერა</th>
                    <th>პროდუქტი</th>
                    <th style={{ textAlign: 'right' }}>მოქმედება</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => (
                    <tr key={item.slug}>
                      {!isCategory && (
                        <td>
                          <span style={{
                            display: 'block', width: 26, height: 26, borderRadius: 8,
                            background: `linear-gradient(135deg, ${item.color}, ${item.accent})`,
                            border: '1px solid var(--border)',
                          }} />
                        </td>
                      )}
                      <td className="fw-700" style={{ color: 'var(--text)' }}>
                        {isCategory ? item.name : (item.nameKa || item.name)}
                        {!isCategory && <div className="text-xs text-dim">{item.name}</div>}
                      </td>
                      <td className="text-xs text-dim">{item.slug}</td>
                      <td className="text-xs truncate" style={{ maxWidth: 260 }}>{item.desc}</td>
                      <td>{item.count ?? '—'}</td>
                      <td>
                        <div className="row-actions">
                          <button className="row-btn" onClick={() => openEdit(item)} aria-label="რედაქტირება"><Pencil size={14} /></button>
                          <button className="row-btn danger" onClick={() => setDeleteTarget(item)} aria-label="წაშლა"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'რედაქტირება' : (isCategory ? 'ახალი კატეგორია' : 'ახალი სამყარო')}
        footer={(
          <>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>გაუქმება</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <Spinner /> : null} შენახვა</button>
          </>
        )}
      >
        <form onSubmit={save} noValidate>
          <div className="field">
            <label className="label">დასახელება <span className="req">*</span></label>
            <input className={`input${errors.name ? ' has-error' : ''}`} value={form.name || ''} onChange={set('name')} />
            {err('name')}
          </div>

          {!isCategory && (
            <div className="field">
              <label className="label">ქართული დასახელება</label>
              <input className="input" value={form.nameKa || ''} onChange={set('nameKa')} />
            </div>
          )}

          <div className="field">
            <label className="label">Slug (URL)</label>
            <input className="input" value={form.slug || ''} onChange={set('slug')} disabled={Boolean(editing)} placeholder="ავტომატურად შეიქმნება" />
          </div>

          <div className="field">
            <label className="label">აღწერა</label>
            <textarea className="textarea" value={form.desc || ''} onChange={set('desc')} rows={2} />
          </div>

          {isCategory ? (
            <div className="field">
              <label className="label">Lucide აიქონის სახელი</label>
              <input className="input" value={form.icon || ''} onChange={set('icon')} placeholder="მაგ. Gem, Shirt, Coffee" />
              <p className="hint">იხილე lucide.dev/icons — სახელი უნდა ემთხვეოდეს ზუსტად.</p>
            </div>
          ) : (
            <>
              <div className="form-grid">
                <div className="field">
                  <label className="label">ძირითადი ფერი</label>
                  <input className="input" type="color" value={form.color || '#8b5cf6'} onChange={set('color')} style={{ height: 44, padding: 4 }} />
                </div>
                <div className="field">
                  <label className="label">ფონის ფერი (accent)</label>
                  <input className="input" type="color" value={form.accent || '#1a1030'} onChange={set('accent')} style={{ height: 44, padding: 4 }} />
                </div>
              </div>
              <label className="check">
                <input type="checkbox" checked={Boolean(form.ageRestricted)} onChange={set('ageRestricted')} />
                <span className="box">✓</span>
                18+ შეზღუდვა
              </label>
              <p className="hint">ბანერის სურათი გენერირდება ავტომატურად: <code>npm run art</code></p>
            </>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove(deleteTarget)}
        title="წაშლა"
        message={`ნამდვილად გსურთ „${deleteTarget?.name}"-ის წაშლა? წაშლა შესაძლებელია მხოლოდ მაშინ, თუ პროდუქტები არ არის მიბმული.`}
      />
    </div>
  );
}

export const AdminCategories = () => <TaxonomyManager kind="category" />;
export const AdminUniverses = () => <TaxonomyManager kind="universe" />;
