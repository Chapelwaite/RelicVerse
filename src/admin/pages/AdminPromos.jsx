import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Ticket, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { useAsync } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { PageLoader, EmptyState, Spinner } from '../../components/ui/Primitives';
import { formatPrice, formatDate } from '../../utils/format';

const EMPTY = { code: '', type: 'percent', value: 10, minTotal: 0, maxUses: 100, expiresAt: '', active: true, description: '' };

export default function AdminPromos() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, loading } = useAsync(() => api.admin.promos(), []);
  useEffect(() => { if (data) setList(data); }, [data]);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setOpen(true); };
  const openEdit = (promo) => {
    setEditing(promo);
    setForm({ ...promo, expiresAt: promo.expiresAt ? promo.expiresAt.slice(0, 10) : '' });
    setErrors({});
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        minTotal: Number(form.minTotal) || 0,
        maxUses: Number(form.maxUses) || 0,
        expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null,
      };
      const res = editing ? await api.admin.updatePromo(editing.code, payload) : await api.admin.createPromo(payload);
      setList((prev) => (editing ? prev.map((p) => (p.code === editing.code ? res.item : p)) : [...prev, res.item]));
      toast.success(res.message);
      setOpen(false);
    } catch (err) {
      setErrors(err.errors || {});
      toast.error('შენახვა ვერ მოხერხდა', err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (promo) => {
    try {
      await api.admin.deletePromo(promo.code);
      setList((prev) => prev.filter((p) => p.code !== promo.code));
      toast.success('პრომოკოდი წაიშალა');
    } catch (err) {
      toast.error('წაშლა ვერ მოხერხდა', err.message);
    }
  };

  const err = (key) => (errors[key] ? <span className="error-text"><AlertCircle size={12} /> {errors[key]}</span> : null);

  if (loading) return <PageLoader label="პრომოკოდები იტვირთება…" />;

  return (
    <div>
      <div className="admin-toolbar">
        <span className="text-sm text-muted">სულ <b style={{ color: 'var(--text)' }}>{list.length}</b> პრომოკოდი</span>
        <button className="btn btn-primary btn-sm ml-auto" onClick={openCreate}><Plus size={15} /> ახალი კოდი</button>
      </div>

      {!list.length ? <EmptyState icon={Ticket} title="პრომოკოდები არ არის" description="დაამატე პირველი კოდი და გაუშვი აქცია." />
        : (
          <div className="admin-table-wrap">
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>კოდი</th><th>ტიპი</th><th>ფასდაკლება</th><th>მინ. თანხა</th>
                    <th>გამოყენება</th><th>ვადა</th><th>სტატუსი</th><th style={{ textAlign: 'right' }}>მოქმედება</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.code}>
                      <td>
                        <div className="fw-700" style={{ color: 'var(--text)', letterSpacing: '.06em' }}>{p.code}</div>
                        <div className="text-xs text-dim truncate" style={{ maxWidth: 200 }}>{p.description}</div>
                      </td>
                      <td>{p.type === 'percent' ? 'პროცენტული' : 'ფიქსირებული'}</td>
                      <td className="fw-700" style={{ color: 'var(--text)' }}>
                        {p.type === 'percent' ? `${p.value}%` : formatPrice(p.value)}
                      </td>
                      <td>{p.minTotal ? formatPrice(p.minTotal) : '—'}</td>
                      <td>{p.used} / {p.maxUses || '∞'}</td>
                      <td className="text-xs">{p.expiresAt ? formatDate(p.expiresAt) : 'უვადო'}</td>
                      <td>
                        <span className={`badge ${p.active ? 'badge-new' : 'badge-muted'}`}>{p.active ? 'აქტიური' : 'გამორთული'}</span>
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `რედაქტირება — ${editing.code}` : 'ახალი პრომოკოდი'}
        footer={(
          <>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>გაუქმება</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <Spinner /> : null} შენახვა</button>
          </>
        )}
      >
        <form onSubmit={save} noValidate>
          <div className="form-grid">
            <div className="field">
              <label className="label">კოდი <span className="req">*</span></label>
              <input
                className={`input${errors.code ? ' has-error' : ''}`}
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                disabled={Boolean(editing)}
                placeholder="RELIC10"
              />
              {err('code')}
            </div>
            <div className="field">
              <label className="label">ტიპი</label>
              <select className="select" value={form.type} onChange={set('type')}>
                <option value="percent">პროცენტული (%)</option>
                <option value="fixed">ფიქსირებული (₾)</option>
              </select>
            </div>
            <div className="field">
              <label className="label">ფასდაკლების ოდენობა <span className="req">*</span></label>
              <input className={`input${errors.value ? ' has-error' : ''}`} type="number" min="1" value={form.value} onChange={set('value')} />
              {err('value')}
            </div>
            <div className="field">
              <label className="label">მინიმალური შეკვეთის თანხა (₾)</label>
              <input className="input" type="number" min="0" value={form.minTotal} onChange={set('minTotal')} />
            </div>
            <div className="field">
              <label className="label">გამოყენების ლიმიტი</label>
              <input className="input" type="number" min="0" value={form.maxUses} onChange={set('maxUses')} placeholder="0 = შეუზღუდავი" />
            </div>
            <div className="field">
              <label className="label">მოქმედების ვადა</label>
              <input className="input" type="date" value={form.expiresAt} onChange={set('expiresAt')} />
            </div>
          </div>

          <div className="field">
            <label className="label">აღწერა</label>
            <input className="input" value={form.description} onChange={set('description')} placeholder="10% ფასდაკლება მთელ კალათაზე" />
          </div>

          <label className="check">
            <input type="checkbox" checked={form.active} onChange={set('active')} />
            <span className="box">✓</span>
            აქტიური
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove(deleteTarget)}
        title="პრომოკოდის წაშლა"
        message={`ნამდვილად გსურთ კოდი ${deleteTarget?.code}-ის წაშლა?`}
      />
    </div>
  );
}
