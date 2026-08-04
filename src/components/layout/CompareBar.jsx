import { useState } from 'react';
import { GitCompareArrows, X, Trash2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Modal } from '../ui/Modal';
import { SafeImage, Stars } from '../ui/Primitives';
import { formatPrice } from '../../utils/format';

const ROWS = [
  { key: 'price', label: 'ფასი', render: (p) => formatPrice(p.price) },
  { key: 'universe', label: 'სამყარო' },
  { key: 'genre', label: 'ჟანრი' },
  { key: 'category', label: 'კატეგორია' },
  { key: 'rating', label: 'რეიტინგი', render: (p) => <Stars value={p.rating} size={12} showValue /> },
  { key: 'material', label: 'მასალა' },
  { key: 'size', label: 'ზომა' },
  { key: 'color', label: 'ფერი' },
  { key: 'stock', label: 'მარაგი', render: (p) => (p.stock > 0 ? `${p.stock} ცალი` : 'არ არის') },
];

/** შედარების ზოლი + შედარების ცხრილის ფანჯარა */
export function CompareBar() {
  const { compare, toggleCompare, clearCompare } = useShop();
  const [open, setOpen] = useState(false);

  if (!compare.length) return null;

  return (
    <>
      <div className="compare-bar">
        <GitCompareArrows size={18} style={{ color: 'var(--violet-300)', flexShrink: 0 }} />
        <div className="flex gap-6">
          {compare.map((p) => (
            <span key={p.id} className="relative">
              <SafeImage src={p.image} alt={p.name} />
              <button
                onClick={() => toggleCompare(p)}
                aria-label={`${p.name} — შედარებიდან წაშლა`}
                style={{
                  position: 'absolute', top: -5, right: -5, width: 17, height: 17,
                  borderRadius: '50%', background: 'var(--danger)', color: '#fff',
                  display: 'grid', placeItems: 'center',
                }}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>შედარება ({compare.length})</button>
        <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={clearCompare} aria-label="სიის გასუფთავება">
          <Trash2 size={15} />
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="პროდუქტების შედარება" size="modal-lg">
        <div style={{ overflowX: 'auto' }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th />
                {compare.map((p) => (
                  <td key={p.id} style={{ minWidth: 170 }}>
                    <SafeImage src={p.image} alt={p.name} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', borderRadius: 12, marginBottom: 8 }} />
                    <div className="fw-700 text-sm">{p.name}</div>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key}>
                  <th>{row.label}</th>
                  {compare.map((p) => (
                    <td key={p.id}>{row.render ? row.render(p) : (p[row.key] || '—')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}
