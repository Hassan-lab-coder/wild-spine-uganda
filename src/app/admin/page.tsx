"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Database } from "@/lib/supabase";

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"];
type ItineraryRequest = Database["public"]["Tables"]["itinerary_requests"]["Row"];
type GuideLead = Database["public"]["Tables"]["guide_leads"]["Row"];
type VolunteerApplication = Database["public"]["Tables"]["volunteer_applications"]["Row"];
type AnalyticsEvent = Database["public"]["Tables"]["analytics_events"]["Row"];
type TabKey = "requests" | "volunteers" | "guides" | "analytics";
type Status = "new" | "contacted" | "qualified" | "confirmed" | "closed";
type DateFilter = "all" | "7" | "30" | "followups";
type SortBy = "newest" | "oldest" | "follow_up" | "status";

const statuses: Status[] = ["new", "contacted", "qualified", "confirmed", "closed"];

export default function AdminDashboard() {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<ItineraryRequest[]>([]);
  const [guideLeads, setGuideLeads] = useState<GuideLead[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [dataError, setDataError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("requests");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [dashboardTime, setDashboardTime] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const loadDashboardData = useCallback(async () => {
    setRefreshing(true);
    setDataError("");

    const [requestResult, guideResult, volunteerResult, analyticsResult] = await Promise.all([
      supabase.from("itinerary_requests").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("guide_leads").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("volunteer_applications").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("analytics_events").select("*").order("created_at", { ascending: false }).limit(300),
    ]);

    const firstError = requestResult.error || guideResult.error || volunteerResult.error;

    if (firstError) {
      setDataError(firstError.message);
      setRefreshing(false);
      return;
    }

    setRequests(requestResult.data || []);
    setGuideLeads(guideResult.data || []);
    setVolunteers(volunteerResult.data || []);
    setAnalyticsEvents(analyticsResult.error ? [] : analyticsResult.data || []);
    setDashboardTime(Date.now());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
      } else {
        const { data: adminProfile } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", data.session.user.id)
          .maybeSingle();

        if (!adminProfile) {
          setDataError("This account is signed in but is not approved for admin access.");
          setLoading(false);
          return;
        }

        setIsAdmin(true);
        setSession(data.session);
        await loadDashboardData();
      }

      setLoading(false);
    };

    getSession();
  }, [loadDashboardData, router]);

  const visibleRequests = useMemo(
    () => prepareRows(requests, query, statusFilter, dateFilter, sortBy, dashboardTime),
    [dashboardTime, dateFilter, query, requests, sortBy, statusFilter]
  );

  const visibleVolunteers = useMemo(
    () => prepareRows(volunteers, query, statusFilter, dateFilter, sortBy, dashboardTime),
    [dashboardTime, dateFilter, query, sortBy, statusFilter, volunteers]
  );

  const visibleGuideLeads = useMemo(
    () => prepareRows(guideLeads, query, statusFilter, dateFilter, sortBy, dashboardTime),
    [dashboardTime, dateFilter, guideLeads, query, sortBy, statusFilter]
  );

  const allOperationalRows = useMemo(
    () => [...requests, ...volunteers, ...guideLeads],
    [guideLeads, requests, volunteers]
  );

  const metrics = useMemo(() => {
    const sevenDaysAgo = dashboardTime - 7 * 24 * 60 * 60 * 1000;
    const followUpsDue = allOperationalRows.filter((item) => isFollowUpDue(item.follow_up_at, dashboardTime)).length;

    return {
      total: allOperationalRows.length,
      new: allOperationalRows.filter((item) => item.status === "new").length,
      fresh: allOperationalRows.filter((item) => new Date(item.created_at).getTime() >= sevenDaysAgo).length,
      due: followUpsDue,
    };
  }, [allOperationalRows, dashboardTime]);

  async function updateStatus(kind: TabKey, id: string, status: Status) {
    await updateRecord(kind, id, { status });
  }

  async function saveAdminWork(
    kind: TabKey,
    id: string,
    values: { admin_notes: string | null; follow_up_at: string | null }
  ) {
    await updateRecord(kind, id, values);
  }

  async function updateRecord(
    kind: TabKey,
    id: string,
    values: { status?: Status; admin_notes?: string | null; follow_up_at?: string | null }
  ) {
    setNotice("");
    setDataError("");

    const result =
      kind === "requests"
        ? await supabase.from("itinerary_requests").update(values).eq("id", id)
        : kind === "volunteers"
          ? await supabase.from("volunteer_applications").update(values).eq("id", id)
          : await supabase.from("guide_leads").update(values).eq("id", id);

    if (result.error) {
      setDataError(result.error.message);
      return;
    }

    if (kind === "requests") {
      setRequests((current) => current.map((item) => (item.id === id ? { ...item, ...values } : item)));
    } else if (kind === "volunteers") {
      setVolunteers((current) => current.map((item) => (item.id === id ? { ...item, ...values } : item)));
    } else {
      setGuideLeads((current) => current.map((item) => (item.id === id ? { ...item, ...values } : item)));
    }

    setNotice("Record saved.");
  }

  const activeExportRows =
    activeTab === "requests"
      ? visibleRequests
      : activeTab === "volunteers"
        ? visibleVolunteers
        : activeTab === "guides"
          ? visibleGuideLeads
          : analyticsEvents;

  if (loading) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center px-6">
        <div className="max-w-lg rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <h1 className="text-3xl font-black mb-4">Admin Access Required</h1>
          <p className="text-red-100">{dataError}</p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="admin-primary-button mt-6"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-black text-white min-h-screen px-6 md:px-12 xl:px-20 py-10">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">Wild Spine Operations</p>
          <h1 className="text-4xl md:text-5xl font-black mb-3">Admin Dashboard</h1>
          <p className="text-gray-400">Signed in as {session?.user.email}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={loadDashboardData} className="admin-outline-button">
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
          <button onClick={() => exportCsv(activeTab, activeExportRows)} className="admin-primary-button">
            Export Current View
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="admin-outline-button hover:border-red-400 hover:text-red-300"
          >
            Sign Out
          </button>
        </div>
      </div>

      {(dataError || notice) && (
        <div className={`mb-6 rounded-2xl border p-5 ${dataError ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-green-500/40 bg-green-500/10 text-green-200"}`}>
          {dataError ? `Database action failed: ${dataError}` : notice}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4 mb-6">
        <MetricCard label="Total Records" value={metrics.total} />
        <MetricCard label="New Leads" value={metrics.new} />
        <MetricCard label="Last 7 Days" value={metrics.fresh} />
        <MetricCard label="Follow-Ups Due" value={metrics.due} urgent={metrics.due > 0} />
      </section>

      <PipelineSummary rows={allOperationalRows} />

      <section className="mb-8 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 xl:grid-cols-[1fr_auto_auto_auto_auto]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="form-input"
          placeholder="Search name, email, country, route, program, notes, message..."
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | Status)} className="form-input xl:w-48">
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{labelStatus(status)}</option>
          ))}
        </select>

        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as DateFilter)} className="form-input xl:w-48">
          <option value="all">All dates</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="followups">Follow-ups due</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="form-input xl:w-48">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="follow_up">Follow-up date</option>
          <option value="status">Status</option>
        </select>

        <div className="grid grid-cols-4 rounded-2xl border border-white/10 bg-black/40 p-1">
          <TabButton active={activeTab === "requests"} onClick={() => setActiveTab("requests")}>Requests</TabButton>
          <TabButton active={activeTab === "volunteers"} onClick={() => setActiveTab("volunteers")}>Volunteers</TabButton>
          <TabButton active={activeTab === "guides"} onClick={() => setActiveTab("guides")}>Guides</TabButton>
          <TabButton active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")}>Analytics</TabButton>
        </div>
      </section>

      {activeTab === "requests" && (
        <RecordGrid title="Itinerary Requests" empty="No itinerary requests match this view." rows={visibleRequests}>
          {(request) => (
            <ItineraryCard
              key={request.id}
              request={request}
              now={dashboardTime}
              onStatusChange={(status) => updateStatus("requests", request.id, status)}
              onSave={(values) => saveAdminWork("requests", request.id, values)}
            />
          )}
        </RecordGrid>
      )}

      {activeTab === "volunteers" && (
        <RecordGrid title="Volunteer Applications" empty="No volunteer applications match this view." rows={visibleVolunteers}>
          {(application) => (
            <VolunteerCard
              key={application.id}
              application={application}
              now={dashboardTime}
              onStatusChange={(status) => updateStatus("volunteers", application.id, status)}
              onSave={(values) => saveAdminWork("volunteers", application.id, values)}
            />
          )}
        </RecordGrid>
      )}

      {activeTab === "guides" && (
        <RecordGrid title="Guide Leads" empty="No guide leads match this view." rows={visibleGuideLeads}>
          {(lead) => (
            <GuideLeadCard
              key={lead.id}
              lead={lead}
              now={dashboardTime}
              onStatusChange={(status) => updateStatus("guides", lead.id, status)}
              onSave={(values) => saveAdminWork("guides", lead.id, values)}
            />
          )}
        </RecordGrid>
      )}

      {activeTab === "analytics" && (
        <AnalyticsPanel events={analyticsEvents} />
      )}
    </main>
  );
}

function AnalyticsPanel({ events }: { events: AnalyticsEvent[] }) {
  const eventCounts = countBy(events, (event) => event.event_name);
  const pageCounts = countBy(events, (event) => event.page_path || "unknown");
  const conversionEvents = events.filter((event) =>
    ["itinerary_request_submitted", "volunteer_application_submitted", "guide_download_unlocked", "thank_you_viewed"].includes(event.event_name)
  );

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black">Analytics</h2>
        <p className="text-sm text-gray-500">{events.length} events tracked</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <AnalyticsList title="Top Events" rows={eventCounts} />
        <AnalyticsList title="Top Pages" rows={pageCounts} />
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-widest text-gray-400">Conversions</p>
          <p className="mt-4 text-5xl font-black text-yellow-500">{conversionEvents.length}</p>
          <p className="mt-3 text-gray-400">Guide unlocks, request submits, volunteer submits, and thank-you views.</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
        {events.slice(0, 50).map((event) => (
          <div key={event.id} className="grid gap-2 border-b border-white/10 bg-white/5 p-4 md:grid-cols-4">
            <p className="font-bold">{event.event_name}</p>
            <p className="text-gray-400">{event.page_path || "unknown page"}</p>
            <p className="text-sm text-gray-500">{formatDate(event.created_at)}</p>
            <p className="truncate text-sm text-gray-500">{event.metadata ? JSON.stringify(event.metadata) : ""}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AnalyticsList({ title, rows }: { title: string; rows: Array<[string, number]> }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="mb-4 text-sm uppercase tracking-widest text-gray-400">{title}</p>
      <div className="grid gap-3">
        {rows.slice(0, 6).map(([label, count]) => (
          <div key={label} className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-gray-300">{label}</span>
            <span className="font-black text-yellow-500">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, urgent = false }: { label: string; value: number; urgent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${urgent ? "border-red-500/30 bg-red-500/10" : "border-white/10 bg-white/5"}`}>
      <p className="text-sm uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`mt-4 text-4xl font-black ${urgent ? "text-red-300" : "text-yellow-500"}`}>{value}</p>
    </div>
  );
}

function PipelineSummary({ rows }: { rows: Array<{ status: string }> }) {
  return (
    <section className="mb-8 grid gap-3 md:grid-cols-5">
      {statuses.map((status) => {
        const count = rows.filter((item) => item.status === status).length;
        return (
          <div key={status} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-widest text-gray-500">{labelStatus(status)}</p>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-yellow-500" style={{ width: `${rows.length ? (count / rows.length) * 100 : 0}%` }} />
            </div>
            <p className="mt-3 text-2xl font-black">{count}</p>
          </div>
        );
      })}
    </section>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-xl px-4 py-3 text-sm font-black transition ${active ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-white/10"}`}>
      {children}
    </button>
  );
}

function RecordGrid<T>({ title, empty, rows, children }: { title: string; empty: string; rows: T[]; children: (row: T) => React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="text-sm text-gray-500">{rows.length} shown</p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-gray-400">{empty}</p>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">{rows.map(children)}</div>
      )}
    </section>
  );
}

function ItineraryCard({ request, now, onStatusChange, onSave }: {
  request: ItineraryRequest;
  now: number;
  onStatusChange: (status: Status) => void;
  onSave: (values: { admin_notes: string | null; follow_up_at: string | null }) => void;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <RecordHeader title={request.name} subtitle={request.email} status={request.status} createdAt={request.created_at} followUpAt={request.follow_up_at} now={now} onStatusChange={onStatusChange} />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Field label="Route" value={request.route || "Not selected"} />
        <Field label="Travel Month" value={request.travel_month || "Not provided"} />
        <Field label="Country" value={request.country || "Not provided"} />
        <Field label="Phone / WhatsApp" value={request.phone || "Not provided"} />
      </div>
      <MessageBlock label="Message" value={request.message || "No message provided."} />
      <AdminWorkPanel
        key={`${request.admin_notes || ""}-${request.follow_up_at || ""}`}
        notes={request.admin_notes}
        followUpAt={request.follow_up_at}
        onSave={onSave}
      />
      <QuickActions email={request.email} phone={request.phone} subject={`Wild Spine itinerary request: ${request.route || "Uganda journey"}`} template={requestReplyTemplate(request)} />
    </article>
  );
}

function VolunteerCard({ application, now, onStatusChange, onSave }: {
  application: VolunteerApplication;
  now: number;
  onStatusChange: (status: Status) => void;
  onSave: (values: { admin_notes: string | null; follow_up_at: string | null }) => void;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <RecordHeader title={application.name} subtitle={application.email} status={application.status} createdAt={application.created_at} followUpAt={application.follow_up_at} now={now} onStatusChange={onStatusChange} />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Program" value={application.program || "Not selected"} />
        <Field label="Country" value={application.country || "Not provided"} />
        <Field label="Phone / WhatsApp" value={application.phone || "Not provided"} />
      </div>
      <MessageBlock label="Motivation" value={application.motivation || "No motivation provided."} />
      <AdminWorkPanel
        key={`${application.admin_notes || ""}-${application.follow_up_at || ""}`}
        notes={application.admin_notes}
        followUpAt={application.follow_up_at}
        onSave={onSave}
      />
      <QuickActions email={application.email} phone={application.phone} subject={`Wild Spine volunteer application: ${application.program || "Program"}`} template={volunteerReplyTemplate(application)} />
    </article>
  );
}

function GuideLeadCard({ lead, now, onStatusChange, onSave }: {
  lead: GuideLead;
  now: number;
  onStatusChange: (status: Status) => void;
  onSave: (values: { admin_notes: string | null; follow_up_at: string | null }) => void;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <RecordHeader title={lead.email} subtitle={lead.source} status={lead.status} createdAt={lead.created_at} followUpAt={lead.follow_up_at} now={now} onStatusChange={onStatusChange} />
      <AdminWorkPanel
        key={`${lead.admin_notes || ""}-${lead.follow_up_at || ""}`}
        notes={lead.admin_notes}
        followUpAt={lead.follow_up_at}
        onSave={onSave}
      />
      <QuickActions email={lead.email} phone={null} subject="Wild Spine Uganda travel guide" template={guideReplyTemplate()} />
    </article>
  );
}

function RecordHeader({ title, subtitle, status, createdAt, followUpAt, now, onStatusChange }: {
  title: string;
  subtitle: string;
  status: string;
  createdAt: string;
  followUpAt: string | null;
  now: number;
  onStatusChange: (status: Status) => void;
}) {
  const due = isFollowUpDue(followUpAt, now);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl font-black">{title}</h3>
          {due && <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-black text-red-200">Follow-up due</span>}
        </div>
        <p className="text-gray-400">{subtitle}</p>
        <p className="mt-1 text-sm text-gray-500">{formatDate(createdAt)}</p>
        {followUpAt && <p className="mt-1 text-sm text-yellow-300">Follow up {formatDate(followUpAt)}</p>}
      </div>

      <select value={status} onChange={(e) => onStatusChange(e.target.value as Status)} className="form-input md:w-44">
        {statuses.map((item) => (
          <option key={item} value={item}>{labelStatus(item)}</option>
        ))}
      </select>
    </div>
  );
}

function AdminWorkPanel({ notes, followUpAt, onSave }: {
  notes: string | null;
  followUpAt: string | null;
  onSave: (values: { admin_notes: string | null; follow_up_at: string | null }) => void;
}) {
  const [draftNotes, setDraftNotes] = useState(notes || "");
  const [draftFollowUp, setDraftFollowUp] = useState(toDatetimeLocal(followUpAt));

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-widest text-gray-500">Admin Notes & Follow-Up</p>
        <button
          type="button"
          onClick={() => onSave({ admin_notes: draftNotes.trim() || null, follow_up_at: draftFollowUp ? new Date(draftFollowUp).toISOString() : null })}
          className="rounded-full bg-white/10 px-4 py-2 text-xs font-black hover:bg-yellow-500 hover:text-black transition"
        >
          Save
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_210px]">
        <textarea className="form-input min-h-24" value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} placeholder="Add internal notes, next step, quote status..." />
        <input className="form-input" type="datetime-local" value={draftFollowUp} onChange={(e) => setDraftFollowUp(e.target.value)} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-widest text-gray-500">{label}</p>
      <p className="mt-2 font-bold text-gray-100">{value}</p>
    </div>
  );
}

function MessageBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-widest text-gray-500">{label}</p>
      <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-200">{value}</p>
    </div>
  );
}

function QuickActions({ email, phone, subject, template }: { email: string; phone: string | null; subject: string; template: string }) {
  const mailTo = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(template)}`;
  const whatsappHref = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : "";
  const [showComposer, setShowComposer] = useState(false);
  const [draftSubject, setDraftSubject] = useState(subject);
  const [draftMessage, setDraftMessage] = useState(template);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState("");
  const [sendError, setSendError] = useState("");

  async function sendEmail() {
    setSending(true);
    setSendResult("");
    setSendError("");

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      setSending(false);
      setSendError("Your admin session expired. Sign in again before sending email.");
      return;
    }

    const response = await fetch("/api/send-lead-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: email,
        subject: draftSubject,
        message: draftMessage,
      }),
    });

    const result = (await response.json()) as { sent?: boolean; reason?: string };
    setSending(false);

    if (!response.ok || !result.sent) {
      setSendError(result.reason || "Email could not be sent.");
      return;
    }

    setSendResult(`Email sent from reservations@wildspineuganda.com to ${email}.`);
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setShowComposer((open) => !open)} className="admin-primary-button text-sm">
          {showComposer ? "Close Email" : "Send Email"}
        </button>
        {whatsappHref && (
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="admin-primary-button text-sm">
            WhatsApp
          </a>
        )}
        <a href={mailTo} className="admin-outline-button text-sm">Open Webmail</a>
        <button type="button" onClick={() => navigator.clipboard.writeText(email)} className="admin-outline-button text-sm">Copy Email</button>
        {phone && <button type="button" onClick={() => navigator.clipboard.writeText(phone)} className="admin-outline-button text-sm">Copy Phone</button>}
        <button type="button" onClick={() => navigator.clipboard.writeText(draftMessage)} className="admin-outline-button text-sm">Copy Reply</button>
      </div>

      {showComposer && (
        <div className="mt-4 rounded-3xl border border-white/10 bg-black/35 p-5">
          <div className="mb-4 grid gap-1 text-sm text-gray-400">
            <p>From: reservations@wildspineuganda.com</p>
            <p>To: {email}</p>
          </div>
          <label className="mb-3 grid gap-2 text-sm font-bold text-gray-300">
            Subject
            <input className="form-input" value={draftSubject} onChange={(e) => setDraftSubject(e.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-gray-300">
            Message
            <textarea className="form-input min-h-52" value={draftMessage} onChange={(e) => setDraftMessage(e.target.value)} />
          </label>
          {sendError && <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{sendError}</p>}
          {sendResult && <p className="mt-4 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">{sendResult}</p>}
          <button
            type="button"
            onClick={sendEmail}
            disabled={sending || !draftSubject.trim() || !draftMessage.trim()}
            className="admin-primary-button mt-4 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send From Reservations"}
          </button>
        </div>
      )}
    </div>
  );
}

function prepareRows<T extends { status: string; created_at: string; follow_up_at: string | null }>(
  rows: T[],
  query: string,
  statusFilter: "all" | Status,
  dateFilter: DateFilter,
  sortBy: SortBy,
  now: number
) {
  const normalizedQuery = query.trim().toLowerCase();
  const cutoff = dateFilter === "7" ? now - 7 * 24 * 60 * 60 * 1000 : now - 30 * 24 * 60 * 60 * 1000;

  return rows
    .filter((row) => {
      const createdAt = new Date(row.created_at).getTime();
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "followups" ? isFollowUpDue(row.follow_up_at, now) : createdAt >= cutoff);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        Object.values(row).some((value) => String(value || "").toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesDate && matchesQuery;
    })
    .toSorted((a, b) => {
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "status") return statuses.indexOf(a.status as Status) - statuses.indexOf(b.status as Status);
      if (sortBy === "follow_up") return nullableTime(a.follow_up_at) - nullableTime(b.follow_up_at);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}

function exportCsv(tab: TabKey, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wild-spine-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    const key = getKey(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return [...counts.entries()].toSorted((a, b) => b[1] - a[1]);
}

function nullableTime(value: string | null) {
  return value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER;
}

function isFollowUpDue(value: string | null, now: number) {
  return Boolean(value && new Date(value).getTime() <= now);
}

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function labelStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function requestReplyTemplate(request: ItineraryRequest) {
  return `Hi ${request.name},\n\nThank you for reaching out to Wild Spine Uganda about ${request.route || "your Uganda journey"}.\n\nWe received your preferred travel timing (${request.travel_month || "dates to confirm"}) and will help you shape the best route, permits, and logistics.\n\nA few quick questions:\n- How many travelers will join?\n- What comfort level do you prefer?\n- Are your dates flexible?\n\nWarmly,\nWild Spine Uganda`;
}

function volunteerReplyTemplate(application: VolunteerApplication) {
  return `Hi ${application.name},\n\nThank you for applying for ${application.program || "a Wild Spine volunteer program"}.\n\nWe received your application and would love to understand your ideal timing, skills, and whether you want to add a gorilla or Rwenzori experience after volunteering.\n\nWarmly,\nWild Spine Uganda`;
}

function guideReplyTemplate() {
  return `Hi,\n\nThank you for downloading the Wild Spine Uganda guide.\n\nIf you would like help planning gorilla trekking, Rwenzori hiking, permits, or a private itinerary, reply with your travel month and number of travelers.\n\nWarmly,\nWild Spine Uganda`;
}
