import { useRef, useState } from 'react';
import { Save, Store, Truck, Share2, Flame, Database, Download, Upload, RotateCcw } from 'lucide-react';
import { api } from '../../api/client';
import { useShop } from '../../context/ShopContext';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui/Primitives';
import { ConfirmDialog } from '../../components/ui/Modal';
import { downloadBackup, parseBackupFile, applyImport, resetData } from '../../services/dataService';

export default function AdminSettings() {
  const { settings } = useShop();
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    ...settings,
    social: { facebook: '', instagram: '', tiktok: '', youtube: '', ...(settings.social || {}) },
    saleBanner: { title: '', subtitle: '', endsAt: '', active: true, ...(settings.saleBanner || {}) },
  }));
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };
  const setNested = (group, key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        shippingFee: Number(form.shippingFee),
        freeShippingThreshold: Number(form.freeShippingThreshold),
        saleBanner: {
          ...form.saleBanner,
          endsAt: form.saleBanner.endsAt
            ? new Date(form.saleBanner.endsAt).toISOString()
            : null,
        },
      };
      const res = await api.admin.updateSettings(payload);
      toast.success(res.message);
    } catch (err) {
      toast.error('შენახვა ვერ მოხერხდა', err.message);
    } finally {
      setSaving(false);
    }
  };

  const bannerDate = form.saleBanner.endsAt ? String(form.saleBanner.endsAt).slice(0, 16) : '';

  return (
    <form onSubmit={save} style={{ maxWidth: 900 }}>
      <div className="grid" style={{ gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        {/* ─── ზოგადი ─── */}
        <section className="chart-card">
          <div className="chart-title"><Store size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} /> ზოგადი ინფორმაცია</div>
          <div className="chart-sub">საიტის სახელი, სლოგანი და კონტაქტი</div>

          <div className="field">
            <label className="label">საიტის სახელი</label>
            <input className="input" value={form.siteName || ''} onChange={set('siteName')} />
          </div>
          <div className="field">
            <label className="label">სლოგანი</label>
            <input className="input" value={form.slogan || ''} onChange={set('slogan')} />
          </div>
          <div className="field">
            <label className="label">ქვე-სლოგანი (footer)</label>
            <input className="input" value={form.tagline || ''} onChange={set('tagline')} />
          </div>
          <div className="field">
            <label className="label">ტელეფონი</label>
            <input className="input" value={form.phone || ''} onChange={set('phone')} />
          </div>
          <div className="field">
            <label className="label">ელფოსტა</label>
            <input className="input" type="email" value={form.email || ''} onChange={set('email')} />
          </div>
          <div className="field">
            <label className="label">მისამართი</label>
            <input className="input" value={form.address || ''} onChange={set('address')} />
          </div>
        </section>

        {/* ─── მიწოდება + სოც. ქსელები ─── */}
        <div className="flex" style={{ flexDirection: 'column', gap: 18 }}>
          <section className="chart-card">
            <div className="chart-title"><Truck size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} /> მიწოდება</div>
            <div className="chart-sub">ფასები ავტომატურად აისახება checkout-ზე</div>

            <div className="field">
              <label className="label">მიწოდების ფასი (₾)</label>
              <input className="input" type="number" min="0" step="0.5" value={form.shippingFee ?? 0} onChange={set('shippingFee')} />
            </div>
            <div className="field">
              <label className="label">უფასო მიწოდების ზღვარი (₾)</label>
              <input className="input" type="number" min="0" step="1" value={form.freeShippingThreshold ?? 0} onChange={set('freeShippingThreshold')} />
            </div>
          </section>

          <section className="chart-card">
            <div className="chart-title"><Share2 size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} /> სოციალური ქსელები</div>
            <div className="chart-sub">ცარიელი ველი footer-ში არ გამოჩნდება</div>

            {['facebook', 'instagram', 'tiktok', 'youtube'].map((key) => (
              <div className="field" key={key}>
                <label className="label" style={{ textTransform: 'capitalize' }}>{key}</label>
                <input className="input" value={form.social[key] || ''} onChange={setNested('social', key)} placeholder={`https://${key}.com/relicverse`} />
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* ─── აქციის ბანერი ─── */}
      <section className="chart-card mt-20">
        <div className="chart-title"><Flame size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} /> აქციის ბანერი</div>
        <div className="chart-sub">ჩანს მთავარ გვერდსა და აქციების გვერდზე</div>

        <div className="form-grid">
          <div className="field">
            <label className="label">სათაური</label>
            <input className="input" value={form.saleBanner.title || ''} onChange={setNested('saleBanner', 'title')} />
          </div>
          <div className="field">
            <label className="label">ქვესათაური</label>
            <input className="input" value={form.saleBanner.subtitle || ''} onChange={setNested('saleBanner', 'subtitle')} />
          </div>
          <div className="field">
            <label className="label">დასრულების თარიღი</label>
            <input className="input" type="datetime-local" value={bannerDate} onChange={setNested('saleBanner', 'endsAt')} />
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label className="check">
              <input type="checkbox" checked={form.saleBanner.active !== false} onChange={setNested('saleBanner', 'active')} />
              <span className="box">✓</span>
              ბანერი აქტიურია
            </label>
          </div>
        </div>
      </section>

      <button className="btn btn-primary mt-20" type="submit" disabled={saving}>
        {saving ? <Spinner /> : <Save size={16} />} პარამეტრების შენახვა
      </button>
      <p className="hint">ცვლილებები ინახება ამ ბრაუზერის მეხსიერებაში (localStorage) და გვერდის განახლების შემდეგაც რჩება.</p>

      <DataManagement />
    </form>
  );
}

/* ─────────── მონაცემების მართვა (Demo) — export / import / reset ─────────── */
function DataManagement() {
  const toast = useToast();
  const fileRef = useRef(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const onExport = () => {
    try {
      const res = downloadBackup();
      toast.success(res.message);
    } catch (err) {
      toast.error('ექსპორტი ვერ მოხერხდა', err.message);
    }
  };

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = await parseBackupFile(file);
      setPendingImport(data);
    } catch (err) {
      toast.error('იმპორტი ვერ მოხერხდა', err.message);
    }
  };

  return (
    <section className="chart-card mt-20">
      <div className="chart-title"><Database size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} /> მონაცემების მართვა (Demo)</div>
      <div className="chart-sub">
        ეს არის frontend-only demo — ყველა ცვლილება ინახება მხოლოდ ამ ბრაუზერში.
        Backup-ისთვის გამოიყენე ექსპორტი, აღდგენისთვის — იმპორტი.
      </div>

      <div className="flex gap-8 flex-wrap">
        <button type="button" className="btn btn-outline btn-sm" onClick={onExport}>
          <Download size={14} /> მონაცემების ექსპორტი
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
          <Upload size={14} /> მონაცემების იმპორტი
        </button>
        <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirmReset(true)}>
          <RotateCcw size={14} /> საწყისი მონაცემების აღდგენა
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onPickFile} style={{ display: 'none' }} aria-label="Backup ფაილის არჩევა" />
      </div>

      <ConfirmDialog
        open={Boolean(pendingImport)}
        onClose={() => setPendingImport(null)}
        onConfirm={() => {
          try {
            const res = applyImport(pendingImport);
            toast.success(res.message);
          } catch (err) {
            toast.error('იმპორტი ვერ მოხერხდა', err.message);
          }
        }}
        title="მონაცემების იმპორტი"
        message="ფაილის მონაცემები ჩაანაცვლებს ამ ბრაუზერში შენახულ RelicVerse-ის მონაცემებს (პროდუქტები, შეკვეთები, პარამეტრები…). გავაგრძელოთ?"
        confirmLabel="დიახ, ჩაანაცვლე"
        danger={false}
      />

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          const res = resetData();
          toast.success(res.message);
        }}
        title="საწყისი მონაცემების აღდგენა"
        message="ამ ბრაუზერში შეტანილი ყველა ცვლილება (პროდუქტები, შეკვეთები, პარამეტრები, მომხმარებლები) წაიშლება და საწყისი demo მონაცემები დაბრუნდება. კალათა და რჩეულები შენარჩუნდება."
        confirmLabel="დიახ, აღადგინე"
      />
    </section>
  );
}
