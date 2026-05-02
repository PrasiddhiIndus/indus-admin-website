import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Mail, Phone, Building2, UserRound, MessageSquareText, Clock3, UsersRound, CircleDot } from 'lucide-react';
import { fetchData } from '../utils/apiHelpers';
import { expandEnquiryTables } from '../utils/enquirySources';

const SERVICE_KEYWORDS = [
  { key: 'manpower', label: 'Manpower' },
  { key: 'trucks', label: 'Trucks' },
  { key: 'projects', label: 'Projects' },
  { key: 'products', label: 'Products' },
  { key: 'training', label: 'Training' },
  { key: 'repair', label: 'Repair & Maintenance' },
];

const VERTICAL_MAP = [
  { key: 'nfpa', label: 'NFPA', keywords: ['nfpa', 'course', 'batch', 'fire safety', 'certification'] },
  { key: 'services', label: 'Services', keywords: ['service', 'manpower', 'truck', 'project', 'product', 'repair', 'maintenance', 'training'] },
  { key: 'careers', label: 'Careers', keywords: ['career', 'job', 'hiring', 'resume', 'vacancy', 'position'] },
  { key: 'blogs', label: 'Blogs', keywords: ['blog', 'article', 'news', 'post'] },
];

const normalize = (value) => String(value || '').toLowerCase().trim();

const toCanonicalVertical = (value) => {
  const normalized = normalize(value);
  if (!normalized) return '';
  if (normalized === 'nfpa') return 'NFPA';
  if (normalized === 'services' || normalized === 'service') return 'Services';
  if (normalized === 'careers' || normalized === 'career') return 'Careers';
  if (normalized === 'blogs' || normalized === 'blog') return 'Blogs';
  if (normalized === 'general') return 'General';
  return value;
};

const classifyEnquiry = (row) => {
  const explicitSignals = [
    row.vertical,
    row.source,
    row.page,
    row.path,
    row.url,
    row.form_name,
    row.page_type,
    row.enquiry_type,
    row.service_type,
    row.category,
    row.subject,
    row.topic,
    row.course,
    row.course_name,
    row.sub_vertical,
    row.assigned_team,
    row.team_email,
  ]
    .map(normalize)
    .filter(Boolean);

  const freeText = [
    row.message,
    row.company,
  ]
    .map(normalize)
    .join(' ');

  const joinedSignals = `${explicitSignals.join(' ')} ${freeText}`;

  let vertical = 'General';
  for (const item of VERTICAL_MAP) {
    if (item.keywords.some((keyword) => joinedSignals.includes(keyword))) {
      vertical = item.label;
      break;
    }
  }

  let subVertical = 'General';
  if (vertical === 'Services') {
    const match = SERVICE_KEYWORDS.find((item) => joinedSignals.includes(item.key));
    subVertical = match?.label || 'Other Services';
  } else if (vertical === 'NFPA') {
    if (joinedSignals.includes('batch')) subVertical = 'Batches';
    else if (joinedSignals.includes('course')) subVertical = 'Courses';
    else subVertical = 'General NFPA';
  }

  return { vertical, subVertical };
};

const resolveVertical = (row, classification) => {
  const canonicalVertical = toCanonicalVertical(row.vertical);

  // If DB still has a weak/default "General" label but richer signals
  // point to a specific vertical, prefer the inferred one.
  if (normalize(canonicalVertical) === 'general' && normalize(classification.vertical) !== 'general') {
    return classification.vertical;
  }

  return canonicalVertical || classification.vertical;
};

const normalizeEnquiryRecord = (row, table) => {
  const payload = row?.payload && typeof row.payload === 'object' ? row.payload : {};
  const sourceTable = row.enquiry_table || payload.enquiry_table || table;
  const sourceId = row.enquiry_id ?? payload.enquiry_id ?? row.id;

  return {
    ...payload,
    ...row,
    table: sourceTable,
    id: sourceId,
    full_name: row.full_name ?? payload.full_name ?? null,
    email: row.email ?? payload.email ?? null,
    phone: row.phone ?? payload.phone ?? null,
    company: row.company ?? payload.company ?? null,
    message: row.message ?? payload.message ?? null,
    vertical: row.vertical ?? payload.vertical ?? null,
    sub_vertical: row.sub_vertical ?? payload.sub_vertical ?? null,
    assigned_team: row.assigned_team ?? payload.assigned_team ?? null,
    team_email: row.team_email ?? payload.team_email ?? null,
    status: row.status ?? payload.status ?? 'new',
    created_at: payload.created_at ?? row.created_at ?? null,
  };
};

const formatDate = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const statusPillClass = (status) => {
  const value = normalize(status);
  if (value === 'closed') return 'bg-emerald-50 text-emerald-700';
  if (value === 'in_progress') return 'bg-amber-50 text-amber-700';
  if (value === 'notified') return 'bg-blue-50 text-blue-700';
  return 'bg-slate-100 text-slate-700';
};

const EnquiryBoard = ({ title, subtitle, tables, limitToVertical = null }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeVertical, setActiveVertical] = useState('All');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const resolvedTables = expandEnquiryTables(tables);
      const allData = await Promise.all(
        resolvedTables.map(async (table) => ({ table, rows: await fetchData(table, { silent: true }) }))
      );

      const mergedRows = allData.flatMap(({ table, rows: sourceRows }) =>
        sourceRows.map((row) => {
          const normalizedRow = normalizeEnquiryRecord(row, table);
          const classification = classifyEnquiry(normalizedRow);
          return {
            ...normalizedRow,
            vertical: resolveVertical(normalizedRow, classification),
            subVertical: normalizedRow.sub_vertical || classification.subVertical,
            assignedTeam: normalizedRow.assigned_team || null,
            teamEmail: normalizedRow.team_email || null,
            enquiryStatus: normalizedRow.status || 'new',
          };
        })
      );

      const deduped = [];
      const seen = new Set();
      mergedRows.forEach((row) => {
        const dedupeKey = `${row.table}-${row.id}-${row.created_at || ''}`;
        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          deduped.push(row);
        }
      });

      setRows(deduped);
      setLoading(false);
    };

    load();
  }, [tables]);

  const scopedRows = useMemo(() => {
    if (!limitToVertical) return rows;
    return rows.filter((row) => normalize(row.vertical) === normalize(limitToVertical));
  }, [rows, limitToVertical]);

  const verticalCounts = useMemo(() => {
    const counts = scopedRows.reduce((acc, row) => {
      acc[row.vertical] = (acc[row.vertical] || 0) + 1;
      return acc;
    }, {});
    return counts;
  }, [scopedRows]);

  const verticalTabs = useMemo(() => ['All', ...Object.keys(verticalCounts)], [verticalCounts]);

  useEffect(() => {
    if (activeVertical !== 'All' && !verticalTabs.includes(activeVertical)) {
      setActiveVertical('All');
    }
  }, [activeVertical, verticalTabs]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = normalize(query);
    return scopedRows.filter((row) => {
      const matchesVertical = activeVertical === 'All' || row.vertical === activeVertical;
      if (!matchesVertical) return false;
      if (!normalizedQuery) return true;
      return [row.full_name, row.email, row.phone, row.company, row.message, row.subVertical, row.vertical]
        .map(normalize)
        .join(' ')
        .includes(normalizedQuery);
    });
  }, [activeVertical, scopedRows, query]);

  const groupedRows = useMemo(() => {
    return filteredRows.reduce((acc, row) => {
      const key = row.subVertical || 'General';
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});
  }, [filteredRows]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 py-6 text-white shadow-xl shadow-slate-300/40">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Enquiry Inbox</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-slate-200">{subtitle}</p>
      </section>

      <div className="panel p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {verticalTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveVertical(tab)}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  activeVertical === tab
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'
                }`}
              >
                <Filter className="mr-1.5 h-3.5 w-3.5" />
                {tab}
                {tab !== 'All' && (
                  <span className="ml-1.5 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                    {verticalCounts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search enquiries..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>

      {Object.keys(groupedRows).length === 0 ? (
        <div className="panel p-10 text-center text-slate-500">No enquiries found for the selected filter.</div>
      ) : (
        Object.entries(groupedRows).map(([groupName, entries]) => (
          <section key={groupName} className="panel overflow-hidden">
            <div className="panel-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{groupName}</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {entries.length} enquiries
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <article key={`${entry.table}-${entry.id}`} className="p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {entry.vertical}
                      </p>
                      <h4 className="text-base font-semibold text-slate-900">
                        <UserRound className="mr-1.5 inline h-4 w-4 text-slate-500" />
                        {entry.full_name || 'Unnamed'}
                      </h4>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusPillClass(entry.enquiryStatus)}`}>
                          <CircleDot className="mr-1 inline h-3.5 w-3.5" />
                          {entry.enquiryStatus?.replace('_', ' ') || 'new'}
                        </span>
                        {entry.assignedTeam && (
                          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                            <UsersRound className="mr-1 inline h-3.5 w-3.5" />
                            {entry.assignedTeam}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="inline-flex items-center text-xs text-slate-500">
                      <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                      {formatDate(entry.created_at)}
                    </p>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                    <p className="inline-flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-slate-500" />
                      {entry.email || '-'}
                    </p>
                    <p className="inline-flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-slate-500" />
                      {entry.phone || '-'}
                    </p>
                    {entry.company && (
                      <p className="inline-flex items-center md:col-span-2">
                        <Building2 className="mr-2 h-4 w-4 text-slate-500" />
                        {entry.company}
                      </p>
                    )}
                    <p className="inline-flex items-start md:col-span-2">
                      <MessageSquareText className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      <span>{entry.message || '-'}</span>
                    </p>
                    {entry.teamEmail && (
                      <p className="inline-flex items-center md:col-span-2 text-xs text-slate-500">
                        Team notification target: {entry.teamEmail}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default EnquiryBoard;
