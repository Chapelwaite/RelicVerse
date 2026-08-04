import { useEffect, useState } from 'react';
import { Mail, Trash2, Copy, Users, Check } from 'lucide-react';
import { api } from '../../api/client';
import { useAsync } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { PageLoader, EmptyState, Avatar } from '../../components/ui/Primitives';
import { ConfirmDialog } from '../../components/ui/Modal';
import { formatDate } from '../../utils/format';

export default function AdminNewsletter() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const subs = useAsync(() => api.admin.newsletter(), []);
  const users = useAsync(() => api.admin.users(), []);

  useEffect(() => { if (subs.data) setList(subs.data); }, [subs.data]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(list.map((e) => e.email).join(', '));
      setCopied(true);
      toast.success('ელფოსტები დაკოპირდა');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error('კოპირება ვერ მოხერხდა');
    }
  };

  const remove = async (item) => {
    try {
      await api.admin.deleteSubscriber(item.email);
      setList((prev) => prev.filter((e) => e.email !== item.email));
      toast.success('ელფოსტა წაიშალა');
    } catch (err) {
      toast.error('წაშლა ვერ მოხერხდა', err.message);
    }
  };

  if (subs.loading) return <PageLoader label="მონაცემები იტვირთება…" />;

  return (
    <div>
      <div className="grid" style={{ gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* ─── Newsletter ─── */}
        <div>
          <div className="admin-toolbar">
            <span className="text-sm text-muted"><Mail size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} /> გამომწერი: <b style={{ color: 'var(--text)' }}>{list.length}</b></span>
            <button className="btn btn-ghost btn-sm ml-auto" onClick={copyAll} disabled={!list.length}>
              {copied ? <Check size={14} /> : <Copy size={14} />} ყველას კოპირება
            </button>
          </div>

          {!list.length ? <EmptyState icon={Mail} title="გამომწერები არ არიან" />
            : (
              <div className="admin-table-wrap">
                <div className="admin-table-scroll">
                  <table className="admin-table" style={{ minWidth: 320 }}>
                    <thead><tr><th>ელფოსტა</th><th>თარიღი</th><th style={{ textAlign: 'right' }} /></tr></thead>
                    <tbody>
                      {list.map((item) => (
                        <tr key={item.email}>
                          <td style={{ color: 'var(--text)' }}>{item.email}</td>
                          <td className="text-xs text-dim">{formatDate(item.createdAt)}</td>
                          <td>
                            <div className="row-actions">
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
        </div>

        {/* ─── მომხმარებლები ─── */}
        <div>
          <div className="admin-toolbar">
            <span className="text-sm text-muted">
              <Users size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
              რეგისტრირებული: <b style={{ color: 'var(--text)' }}>{users.data?.length ?? 0}</b>
            </span>
          </div>

          {!users.data?.length ? <EmptyState icon={Users} title="მომხმარებლები არ არიან" />
            : (
              <div className="admin-table-wrap">
                <div className="admin-table-scroll">
                  <table className="admin-table" style={{ minWidth: 320 }}>
                    <thead><tr><th style={{ width: 46 }} /><th>მომხმარებელი</th><th>როლი</th><th>რეგისტრაცია</th></tr></thead>
                    <tbody>
                      {users.data.map((u) => (
                        <tr key={u.id}>
                          <td><Avatar name={`${u.firstName} ${u.lastName}`} size={34} /></td>
                          <td>
                            <div className="fw-700" style={{ color: 'var(--text)' }}>{u.firstName} {u.lastName}</div>
                            <div className="text-xs text-dim">{u.email}</div>
                          </td>
                          <td><span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-muted'}`}>{u.role === 'admin' ? 'ადმინი' : 'მომხმარებელი'}</span></td>
                          <td className="text-xs text-dim">{formatDate(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove(deleteTarget)}
        title="ელფოსტის წაშლა"
        message={`ნამდვილად გსურთ ${deleteTarget?.email}-ის წაშლა გამომწერების სიიდან?`}
      />
    </div>
  );
}
