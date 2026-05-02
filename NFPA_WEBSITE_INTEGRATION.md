# NFPA Website -> `nfpa_enquiry_hits` integration

Use this in the `indusfiresafety.com` NFPA form submit handler so every submit is guaranteed to land in `nfpa_enquiry_hits`.

## 1) Call Supabase RPC from NFPA website submit

```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function submitNfpaEnquiry(formData) {
  const sourceId = Date.now();

  const payload = {
    source_table: 'nfpa_page_api',
    source_id: sourceId,
    full_name: formData.full_name || formData.name || '',
    email: formData.email || '',
    phone: formData.phone || '',
    company: formData.company || '',
    message: formData.message || '',
    page: 'nfpa',
    path: window.location.pathname,
    url: window.location.href,
    api_endpoint: 'indusfiresafety-nfpa-form',
    enquiry_type: 'nfpa',
    sub_vertical: formData.sub_vertical || 'General NFPA',
    status: 'new',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.rpc('ingest_nfpa_enquiry_hit', {
    hit: payload
  });

  if (error) {
    throw error;
  }

  return data;
}
```

## 2) Ensure migration has been applied

Run in Supabase SQL Editor:

```sql
select to_regclass('public.nfpa_enquiry_hits');
select proname from pg_proc where proname = 'ingest_nfpa_enquiry_hit';
```

Expected: both rows exist.

## 3) Reload PostgREST schema cache

```sql
notify pgrst, 'reload schema';
```

## 4) Verify data is arriving

```sql
select id, source_table, source_id, full_name, email, message, created_at
from nfpa_enquiry_hits
order by created_at desc
limit 20;
```

## 5) Verify admin page fetch

`/nfpa/enquiries` already reads from:

- `nfpa_enquiry_hits` (primary)
- `contact_messages`
- `services_contact_form`
- `notification_logs`

So once inserts happen, entries should appear in the NFPA admin list.
