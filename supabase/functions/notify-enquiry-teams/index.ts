import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type QueueRow = {
  id: number;
  enquiry_table: string;
  enquiry_id: number;
  assigned_team: string | null;
  team_email: string | null;
  payload: Record<string, unknown>;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-notify-secret",
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const normalize = (value: unknown) => String(value ?? "").trim();

const sendSlackNotification = async (webhookUrl: string, row: QueueRow) => {
  const payload = row.payload || {};
  const text = [
    "*New Enquiry Received*",
    `*Vertical:* ${normalize(payload.vertical) || "General"}`,
    `*Sub Vertical:* ${normalize(payload.sub_vertical) || "General"}`,
    `*Team:* ${row.assigned_team || "Unassigned"}`,
    `*Name:* ${normalize(payload.full_name)}`,
    `*Email:* ${normalize(payload.email)}`,
    `*Phone:* ${normalize(payload.phone) || "-"}`,
    `*Message:* ${normalize(payload.message) || "-"}`,
  ].join("\n");

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Slack webhook failed (${response.status}): ${details}`);
  }

  return { channel: "slack", status: "sent" };
};

const sendEmailNotification = async (
  resendApiKey: string,
  fromEmail: string,
  toEmail: string,
  row: QueueRow
) => {
  const payload = row.payload || {};
  const subject = `New ${normalize(payload.vertical) || "General"} enquiry: ${normalize(payload.full_name) || "Lead"}`;

  const html = `
    <h2>New Enquiry Received</h2>
    <p><strong>Vertical:</strong> ${normalize(payload.vertical) || "General"}</p>
    <p><strong>Sub Vertical:</strong> ${normalize(payload.sub_vertical) || "General"}</p>
    <p><strong>Assigned Team:</strong> ${normalize(row.assigned_team) || "Unassigned"}</p>
    <hr />
    <p><strong>Name:</strong> ${normalize(payload.full_name)}</p>
    <p><strong>Email:</strong> ${normalize(payload.email)}</p>
    <p><strong>Phone:</strong> ${normalize(payload.phone) || "-"}</p>
    <p><strong>Company:</strong> ${normalize(payload.company) || "-"}</p>
    <p><strong>Message:</strong></p>
    <p>${normalize(payload.message) || "-"}</p>
    <hr />
    <p><small>Source: ${row.enquiry_table} #${row.enquiry_id}</small></p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend failed (${response.status}): ${details}`);
  }

  const result = await response.json();
  return { channel: "email", status: "sent", result };
};

const run = async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed. Use POST." });
  }

  const notifySecret = Deno.env.get("NOTIFY_FUNCTION_SECRET");
  if (notifySecret) {
    const providedSecret = request.headers.get("x-notify-secret");
    if (providedSecret !== notifySecret) {
      return json(401, { error: "Unauthorized request." });
    }
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return json(500, { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY." });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
  const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "";
  const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL") || "";
  const defaultTeamEmail = Deno.env.get("DEFAULT_TEAM_EMAIL") || "";

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") || "20");
  const limit = Number.isNaN(limitParam) ? 20 : Math.max(1, Math.min(100, limitParam));

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data: queueRows, error: queueError } = await supabase
    .from("notification_queue")
    .select("id, enquiry_table, enquiry_id, assigned_team, team_email, payload")
    .eq("processed", false)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (queueError) {
    return json(500, { error: "Failed to read queue.", details: queueError.message });
  }

  const rows = (queueRows || []) as QueueRow[];
  if (rows.length === 0) {
    return json(200, { message: "No pending notifications.", processed: 0 });
  }

  const summary = {
    processed: 0,
    failed: 0,
    results: [] as Array<Record<string, unknown>>,
  };

  for (const row of rows) {
    const targetEmail = row.team_email || defaultTeamEmail;
    const attempts: Array<Record<string, unknown>> = [];

    try {
      if (!slackWebhookUrl && (!resendApiKey || !resendFromEmail || !targetEmail)) {
        throw new Error(
          "No delivery channel configured. Set SLACK_WEBHOOK_URL or RESEND_API_KEY + RESEND_FROM_EMAIL + team_email/default."
        );
      }

      if (slackWebhookUrl) {
        attempts.push(await sendSlackNotification(slackWebhookUrl, row));
      }

      if (resendApiKey && resendFromEmail && targetEmail) {
        attempts.push(await sendEmailNotification(resendApiKey, resendFromEmail, targetEmail, row));
      }

      const { error: queueUpdateError } = await supabase
        .from("notification_queue")
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq("id", row.id);

      if (queueUpdateError) {
        throw new Error(`Could not mark queue row ${row.id} as processed: ${queueUpdateError.message}`);
      }

      await supabase
        .from("notification_logs")
        .update({
          status: "sent",
          response: { attempts, delivered_at: new Date().toISOString() },
          error: null,
        })
        .eq("enquiry_table", row.enquiry_table)
        .eq("enquiry_id", row.enquiry_id)
        .eq("status", "pending");

      summary.processed += 1;
      summary.results.push({
        queue_id: row.id,
        enquiry: `${row.enquiry_table}#${row.enquiry_id}`,
        status: "sent",
        channels: attempts.map((entry) => entry.channel),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      summary.failed += 1;

      await supabase
        .from("notification_logs")
        .update({
          status: "failed",
          error: message,
          response: { attempts, failed_at: new Date().toISOString() },
        })
        .eq("enquiry_table", row.enquiry_table)
        .eq("enquiry_id", row.enquiry_id)
        .eq("status", "pending");

      summary.results.push({
        queue_id: row.id,
        enquiry: `${row.enquiry_table}#${row.enquiry_id}`,
        status: "failed",
        error: message,
      });
    }
  }

  return json(200, summary);
};

Deno.serve(run);
