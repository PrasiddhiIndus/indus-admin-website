import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Clock3, RefreshCcw } from 'lucide-react';
import { fetchData, updateRecord } from '../utils/apiHelpers';
import { ENQUIRY_PRIMARY_TABLES, expandEnquiryTables } from '../utils/enquirySources';

const badgeClass = (status) => {
  const value = String(status || '').toLowerCase();
  if (value === 'sent') return 'bg-emerald-50 text-emerald-700';
  if (value === 'failed') return 'bg-red-50 text-red-700';
  return 'bg-amber-50 text-amber-700';
};

const Notifications = () => {
  const [logs, setLogs] = useState([]);
  const [queue, setQueue] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState({});

  const loadData = async () => {
    setLoading(true);
    const enquiryTables = expandEnquiryTables(ENQUIRY_PRIMARY_TABLES);
    const [logsData, queueData, ...enquiryTableData] = await Promise.all([
      fetchData('notification_logs'),
      fetchData('notification_queue'),
      ...enquiryTables.map((table) => fetchData(table, { silent: true })),
    ]);
    setLogs(logsData || []);
    setQueue(queueData || []);

    const allMessages = enquiryTableData.flatMap((rows, idx) =>
      (rows || []).map((row) => ({ ...row, sourceTable: enquiryTables[idx] }))
    );

    const deduped = [];
    const seen = new Set();
    allMessages.forEach((row) => {
      const key = `${row.sourceTable}-${row.id}-${row.created_at || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(row);
      }
    });

    const unread = deduped.filter((row) => {
      const status = String(row.status || 'new').toLowerCase();
      return status === 'new' || status === 'notified';
    });
    setUnreadMessages(unread);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const sent = logs.filter((row) => row.status === 'sent').length;
    const failed = logs.filter((row) => row.status === 'failed').length;
    const pending = queue.filter((row) => !row.processed).length;
    const unread = unreadMessages.length;
    return { sent, failed, pending, unread };
  }, [logs, queue, unreadMessages]);

  const markAsRead = async (message) => {
    const key = `${message.sourceTable}-${message.id}`;
    setMarkingRead((prev) => ({ ...prev, [key]: true }));
    try {
      await updateRecord(message.sourceTable, message.id, { status: 'in_progress' });
      await loadData();
    } finally {
      setMarkingRead((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 py-6 text-white shadow-xl shadow-slate-300/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Notification Center</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Team Alerts</h2>
            <p className="mt-2 text-sm text-slate-200">Monitor delivery status for enquiry routing notifications.</p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-md transition hover:bg-slate-100"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="panel p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Unread Messages</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Clock3 className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{stats.unread}</p>
          </div>
        </div>
        <div className="panel p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Sent</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{stats.sent}</p>
          </div>
        </div>
        <div className="panel p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Pending Queue</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{stats.pending}</p>
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="panel-header">
          <h3 className="text-lg font-semibold text-slate-900">Unread Enquiries</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : unreadMessages.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No unread enquiries.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {unreadMessages.slice(0, 30).map((message) => {
              const itemKey = `${message.sourceTable}-${message.id}`;
              return (
              <article key={itemKey} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {message.full_name || 'Unnamed'} - {message.sourceTable} #{message.id}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {message.email || '-'} | {message.vertical || 'General'} / {message.sub_vertical || 'General'}
                    </p>
                    {message.message && <p className="mt-2 text-xs text-slate-600">{message.message}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(message.status || 'new')}`}>
                      <Bell className="h-3.5 w-3.5 mr-1" />
                      {message.status || 'new'}
                    </span>
                    <button
                      onClick={() => markAsRead(message)}
                      disabled={!!markingRead[itemKey]}
                      className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      {markingRead[itemKey] ? 'Updating...' : 'Mark as Read'}
                    </button>
                    <span className="text-xs text-slate-500">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </article>
            )})}
          </div>
        )}
      </section>

      <section className="panel overflow-hidden">
        <div className="panel-header">
          <h3 className="text-lg font-semibold text-slate-900">Recent Notification Delivery Logs</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No notification logs found yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.slice(0, 15).map((log) => (
              <article key={log.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {log.assigned_team || 'Unassigned Team'} - {log.enquiry_table} #{log.enquiry_id}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {log.team_email || 'No email configured'} | {log.vertical || 'General'} / {log.sub_vertical || 'General'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(log.status)}`}>
                      <Bell className="h-3.5 w-3.5 mr-1" />
                      {log.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                {log.error && <p className="mt-2 text-xs text-red-600">{log.error}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Notifications;
