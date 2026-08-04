import { useEffect, useState } from 'react';
import { Search, Eye, Trash2, ShoppingCart, Phone, Mail, MapPin, Package } from 'lucide-react';
import { api } from '../../api/client';
import { useAsync, useDebounce } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { SafeImage, PageLoader, EmptyState } from '../../components/ui/Primitives';
import { formatPrice, formatDateTime } from '../../utils/format';

const STATUSES = ['ახალი', 'დამუშავებაში', 'გაგზავნილი', 'მიწოდებული', 'გაუქმებული'];
const COLORS = {
  'ახალი': '#a78bfa', 'დამუშავებაში': '#fbbf24', 'გაგზავნილი': '#60a5fa',
  'მიწოდებული': '#34d399', 'გაუქმებული': '#f87171',
};

export default function AdminOrders() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ყველა');
  const debounced = useDebounce(search, 300);
  const [orders, setOrders] = useState([]);
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, loading, retry } = useAsync(() => api.admin.orders({ q: debounced, status }), [debounced, status]);
  useEffect(() => { if (data) setOrders(data); }, [data]);

  const changeStatus = async (order, next) => {
    setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    try {
      await api.admin.updateOrder(order.id, next);
      toast.success('სტატუსი განახლდა', `${order.id} → ${next}`);
    } catch (err) {
      toast.error('განახლება ვერ მოხერხდა', err.message);
      retry();
    }
  };

  const remove = async (order) => {
    try {
      await api.admin.deleteOrder(order.id);
      setOrders((list) => list.filter((o) => o.id !== order.id));
      toast.success('შეკვეთა წაიშალა');
    } catch (err) {
      toast.error('წაშლა ვერ მოხერხდა', err.message);
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ნომერი, სახელი, ტელეფონი…" />
        </div>
        <select className="select" style={{ width: 'auto', minWidth: 170 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ყველა">ყველა სტატუსი</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-sm text-muted ml-auto">სულ <b style={{ color: 'var(--text)' }}>{orders.length}</b> შეკვეთა</span>
      </div>

      {loading && !orders.length ? <PageLoader label="შეკვეთები იტვირთება…" />
        : !orders.length ? <EmptyState icon={ShoppingCart} title="შეკვეთა ვერ მოიძებნა" description="შეცვალე ფილტრი ან საძიებო სიტყვა." />
          : (
            <div className="admin-table-wrap">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ნომერი</th><th>მომხმარებელი</th><th>თარიღი</th><th>ნივთი</th>
                      <th>თანხა</th><th>გადახდა</th><th>სტატუსი</th><th style={{ textAlign: 'right' }}>მოქმედება</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="fw-700" style={{ color: 'var(--text)' }}>{o.id}</td>
                        <td>
                          <div>{o.customer.firstName} {o.customer.lastName}</div>
                          <div className="text-xs text-dim">{o.customer.phone}</div>
                        </td>
                        <td className="text-dim text-xs">{formatDateTime(o.createdAt)}</td>
                        <td>{o.items.reduce((n, i) => n + i.quantity, 0)} ც.</td>
                        <td className="fw-700" style={{ color: 'var(--text)' }}>{formatPrice(o.total)}</td>
                        <td className="text-xs">{o.paymentMethod}</td>
                        <td>
                          <select
                            className="status-select"
                            value={o.status}
                            onChange={(e) => changeStatus(o, e.target.value)}
                            style={{ color: COLORS[o.status], borderColor: `${COLORS[o.status]}66` }}
                            aria-label={`${o.id} — სტატუსი`}
                          >
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="row-btn" onClick={() => setDetail(o)} aria-label="დეტალები"><Eye size={14} /></button>
                            <button className="row-btn danger" onClick={() => setDeleteTarget(o)} aria-label="წაშლა"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={`შეკვეთა ${detail?.id || ''}`} size="modal-lg">
        {detail && (
          <>
            <div className="grid mb-20" style={{ gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <div className="panel panel-pad">
                <b className="text-sm">მიმღები</b>
                <div className="footer-contact mt-14">
                  <div><Package size={15} /> {detail.customer.firstName} {detail.customer.lastName}</div>
                  <div><Phone size={15} /> {detail.customer.phone}</div>
                  <div><Mail size={15} /> {detail.customer.email}</div>
                  <div><MapPin size={15} /> {detail.customer.city}, {detail.customer.address}</div>
                </div>
                {detail.customer.note && <p className="hint">შენიშვნა: {detail.customer.note}</p>}
              </div>

              <div className="panel panel-pad">
                <b className="text-sm">შეკვეთის ინფორმაცია</b>
                <div className="footer-contact mt-14">
                  <div>მიწოდება: {detail.shippingMethod}</div>
                  <div>გადახდა: {detail.paymentMethod}</div>
                  <div>გაფორმდა: {formatDateTime(detail.createdAt)}</div>
                  <div>განახლდა: {formatDateTime(detail.updatedAt)}</div>
                  <div>სტატუსი: <span className="badge" style={{ color: COLORS[detail.status], borderColor: `${COLORS[detail.status]}66`, background: `${COLORS[detail.status]}1f` }}>{detail.status}</span></div>
                </div>
              </div>
            </div>

            <b className="text-sm">პროდუქტები</b>
            <div className="mt-14">
              {detail.items.map((item) => (
                <div key={item.productId} className="flex-center gap-12" style={{ padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <SafeImage src={item.image} alt="" style={{ width: 46, height: 46, borderRadius: 9, objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm truncate">{item.name}</div>
                    <div className="text-xs text-dim">{item.quantity} × {formatPrice(item.price)}</div>
                  </div>
                  <b className="text-sm">{formatPrice(item.price * item.quantity)}</b>
                </div>
              ))}
            </div>

            <div className="mt-14">
              <div className="summary-line"><span>პროდუქტები</span><span>{formatPrice(detail.subtotal)}</span></div>
              {detail.discount > 0 && <div className="summary-line"><span>ფასდაკლება ({detail.promoCode})</span><span className="discount-val">−{formatPrice(detail.discount)}</span></div>}
              <div className="summary-line"><span>მიწოდება</span><span>{detail.shipping === 0 ? 'უფასო' : formatPrice(detail.shipping)}</span></div>
              <div className="summary-line total"><span>სულ</span><span>{formatPrice(detail.total)}</span></div>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove(deleteTarget)}
        title="შეკვეთის წაშლა"
        message={`ნამდვილად გსურთ შეკვეთა ${deleteTarget?.id}-ის წაშლა?`}
      />
    </div>
  );
}
