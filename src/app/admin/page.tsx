"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Database } from "@/lib/supabase";

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"];
type ItineraryRequest = Database["public"]["Tables"]["itinerary_requests"]["Row"];
type GuideLead = Database["public"]["Tables"]["guide_leads"]["Row"];
type VolunteerApplication = Database["public"]["Tables"]["volunteer_applications"]["Row"];
type AnalyticsEvent = Database["public"]["Tables"]["analytics_events"]["Row"];
type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type Receipt = Database["public"]["Tables"]["receipts"]["Row"];
type InboundEmail = Database["public"]["Tables"]["inbound_emails"]["Row"];
type LineItem = Invoice["line_items"][number];
type TabKey = "requests" | "volunteers" | "guides" | "inbox" | "invoices" | "receipts" | "analytics";
type Status = "new" | "contacted" | "qualified" | "confirmed" | "closed";
type DateFilter = "all" | "7" | "30" | "followups";
type SortBy = "newest" | "oldest" | "follow_up" | "status";
type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";

const statuses: Status[] = ["new", "contacted", "qualified", "confirmed", "closed"];
const invoiceStatuses: InvoiceStatus[] = ["draft", "sent", "paid", "cancelled"];

export default function AdminDashboard() {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<ItineraryRequest[]>([]);
  const [guideLeads, setGuideLeads] = useState<GuideLead[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [inboundEmails, setInboundEmails] = useState<InboundEmail[]>([]);
  const [dataError, setDataError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("requests");
  const [invoiceDraft, setInvoiceDraft] = useState<InvoiceDraft | null>(null);
  const [invoiceDraftVersion, setInvoiceDraftVersion] = useState(0);
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

    const [requestResult, guideResult, volunteerResult, analyticsResult, invoiceResult, receiptResult, inboundEmailResult] = await Promise.all([
      supabase.from("itinerary_requests").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("guide_leads").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("volunteer_applications").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("analytics_events").select("*").order("created_at", { ascending: false }).limit(300),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("receipts").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("inbound_emails").select("*").order("received_at", { ascending: false }).limit(200),
    ]);

    const firstError = requestResult.error || guideResult.error || volunteerResult.error || invoiceResult.error || receiptResult.error || inboundEmailResult.error;

    if (firstError) {
      setDataError(firstError.message);
      setRefreshing(false);
      return;
    }

    setRequests(requestResult.data || []);
    setGuideLeads(guideResult.data || []);
    setVolunteers(volunteerResult.data || []);
    setAnalyticsEvents(analyticsResult.error ? [] : analyticsResult.data || []);
    setInvoices(invoiceResult.data || []);
    setReceipts(receiptResult.data || []);
    setInboundEmails(inboundEmailResult.data || []);
    setDashboardTime(Date.now());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        setLoading(false);
        return;
      }

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
  const visibleInvoices = useMemo(() => filterRows(invoices, query), [invoices, query]);
  const visibleReceipts = useMemo(() => filterRows(receipts, query), [receipts, query]);
  const visibleInboundEmails = useMemo(() => filterRows(inboundEmails, query, "received_at"), [inboundEmails, query]);
  const operationalRows = useMemo(() => [...requests, ...volunteers, ...guideLeads], [guideLeads, requests, volunteers]);

  const metrics = useMemo(() => {
    const sevenDaysAgo = dashboardTime - 7 * 24 * 60 * 60 * 1000;

    return {
      total: operationalRows.length,
      new: operationalRows.filter((item) => item.status === "new").length,
      fresh: operationalRows.filter((item) => new Date(item.created_at).getTime() >= sevenDaysAgo).length,
      due: operationalRows.filter((item) => isFollowUpDue(item.follow_up_at, dashboardTime)).length,
      invoices: invoices.length,
      receipts: receipts.length,
      unreadEmails: inboundEmails.filter((email) => !email.read_at).length,
      unpaid: invoices.filter((invoice) => !["paid", "cancelled"].includes(invoice.status)).length,
    };
  }, [dashboardTime, inboundEmails, invoices, operationalRows, receipts]);

  async function updateStatus(kind: "requests" | "volunteers" | "guides", id: string, status: Status) {
    await updateRecord(kind, id, { status });
  }

  async function saveAdminWork(
    kind: "requests" | "volunteers" | "guides",
    id: string,
    values: { admin_notes: string | null; follow_up_at: string | null }
  ) {
    await updateRecord(kind, id, values);
  }

  async function updateRecord(
    kind: "requests" | "volunteers" | "guides",
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

    if (kind === "requests") setRequests((current) => current.map((item) => item.id === id ? { ...item, ...values } : item));
    if (kind === "volunteers") setVolunteers((current) => current.map((item) => item.id === id ? { ...item, ...values } : item));
    if (kind === "guides") setGuideLeads((current) => current.map((item) => item.id === id ? { ...item, ...values } : item));
    setNotice("Record saved.");
  }

  async function createInvoice(values: InvoiceFormValues) {
    setNotice("");
    setDataError("");

    const lineItems = values.lineItems.map((item) => ({ ...item, total: roundMoney(item.quantity * item.unit_price) }));
    const subtotal = roundMoney(lineItems.reduce((sum, item) => sum + item.total, 0));
    const tax = roundMoney(values.tax);
    const total = roundMoney(subtotal + tax);

    const result = await supabase.from("invoices").insert({
      invoice_number: values.invoiceNumber,
      client_name: values.clientName,
      client_email: values.clientEmail || null,
      client_phone: values.clientPhone || null,
      trip_name: values.tripName || null,
      issue_date: values.issueDate,
      due_date: values.dueDate || null,
      currency: values.currency,
      subtotal,
      tax,
      total,
      status: values.status,
      notes: values.notes || null,
      line_items: lineItems,
    }).select("*").single();

    if (result.error) {
      setDataError(result.error.message);
      return;
    }

    setInvoices((current) => [result.data, ...current]);
    setNotice("Invoice created.");
  }

  async function updateInboundEmailReadState(id: string, read: boolean) {
    setNotice("");
    setDataError("");

    const readAt = read ? new Date().toISOString() : null;
    const result = await supabase.from("inbound_emails").update({ read_at: readAt }).eq("id", id);

    if (result.error) {
      setDataError(result.error.message);
      return;
    }

    setInboundEmails((current) => current.map((email) => email.id === id ? { ...email, read_at: readAt } : email));
    setNotice(read ? "Email marked as read." : "Email marked as unread.");
  }

  async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
    setNotice("");
    setDataError("");
    const result = await supabase.from("invoices").update({ status }).eq("id", id);

    if (result.error) {
      setDataError(result.error.message);
      return;
    }

    setInvoices((current) => current.map((invoice) => invoice.id === id ? { ...invoice, status } : invoice));
    setNotice("Invoice status saved.");
  }

  async function updateInvoiceMoney(id: string, values: InvoiceMoneyValues) {
    setNotice("");
    setDataError("");

    const lineItems = values.lineItems
      .filter((item) => item.description.trim())
      .map((item) => ({
        ...item,
        quantity: roundMoney(Number(item.quantity || 0)),
        unit_price: roundMoney(Number(item.unit_price || 0)),
        total: roundMoney(Number(item.quantity || 0) * Number(item.unit_price || 0)),
      }));
    const subtotal = roundMoney(lineItems.reduce((sum, item) => sum + item.total, 0));
    const tax = roundMoney(values.tax);
    const total = roundMoney(subtotal + tax);

    const result = await supabase
      .from("invoices")
      .update({
        currency: values.currency,
        subtotal,
        tax,
        total,
        notes: values.notes.trim() || null,
        line_items: lineItems,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (result.error) {
      setDataError(result.error.message);
      return;
    }

    setInvoices((current) => current.map((invoice) => invoice.id === id ? result.data : invoice));
    setNotice("Invoice money saved.");
  }

  async function createReceipt(values: ReceiptFormValues) {
    setNotice("");
    setDataError("");

    const invoice = invoices.find((item) => item.invoice_number === values.invoiceNumber);
    const result = await supabase.from("receipts").insert({
      receipt_number: values.receiptNumber,
      invoice_id: invoice?.id || null,
      invoice_number: values.invoiceNumber || null,
      client_name: values.clientName,
      client_email: values.clientEmail || null,
      payment_date: values.paymentDate,
      currency: values.currency,
      amount: roundMoney(values.amount),
      payment_method: values.paymentMethod,
      reference: values.reference || null,
      notes: values.notes || null,
    }).select("*").single();

    if (result.error) {
      setDataError(result.error.message);
      return;
    }

    setReceipts((current) => [result.data, ...current]);
    if (invoice && result.data.amount >= invoice.total) {
      await updateInvoiceStatus(invoice.id, "paid");
    }
    setNotice("Receipt created.");
  }

  function startInvoiceFromRequest(request: ItineraryRequest) {
    setInvoiceDraft({
      clientName: request.name,
      clientEmail: request.email,
      clientPhone: request.phone || "",
      tripName: request.route || "Private Uganda journey",
      notes: [
        `Generated from itinerary request submitted ${formatPlainDate(request.created_at)}.`,
        request.travel_month ? `Preferred travel month: ${request.travel_month}.` : "",
        request.country ? `Client country: ${request.country}.` : "",
        request.message ? `Client message: ${request.message}` : "",
      ].filter(Boolean).join("\n"),
      lineItems: [
        {
          description: request.route || "Private Uganda travel services",
          quantity: 1,
          unit_price: 0,
          total: 0,
        },
      ],
    });
    setInvoiceDraftVersion((version) => version + 1);
    setActiveTab("invoices");
    setNotice("Invoice draft prepared from request. Add pricing, then create the invoice.");
  }

  const exportRows =
    activeTab === "requests" ? visibleRequests :
      activeTab === "volunteers" ? visibleVolunteers :
        activeTab === "guides" ? visibleGuideLeads :
          activeTab === "invoices" ? visibleInvoices :
            activeTab === "receipts" ? visibleReceipts :
              activeTab === "inbox" ? visibleInboundEmails :
              analyticsEvents;

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-black text-white">Loading...</main>;
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-lg rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <h1 className="mb-4 text-3xl font-black">Admin Access Required</h1>
          <p className="text-red-100">{dataError}</p>
          <button onClick={() => router.push("/login")} className="admin-primary-button mt-6">Back to Login</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-12 xl:px-20">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">Wild Spine Operations</p>
          <h1 className="mb-3 text-4xl font-black md:text-5xl">Admin Dashboard</h1>
          <p className="text-gray-400">Signed in as {session?.user.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={loadDashboardData} className="admin-outline-button">{refreshing ? "Refreshing..." : "Refresh Data"}</button>
          <button onClick={() => exportCsv(activeTab, exportRows as Array<Record<string, unknown>>)} className="admin-primary-button">Export Current View</button>
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

      <section className="mb-6 grid gap-4 md:grid-cols-4 xl:grid-cols-8">
        <MetricCard label="Total Records" value={metrics.total} />
        <MetricCard label="New Leads" value={metrics.new} />
        <MetricCard label="Last 7 Days" value={metrics.fresh} />
        <MetricCard label="Follow-Ups Due" value={metrics.due} urgent={metrics.due > 0} />
        <MetricCard label="Unread Inbox" value={metrics.unreadEmails} urgent={metrics.unreadEmails > 0} />
        <MetricCard label="Invoices" value={metrics.invoices} />
        <MetricCard label="Receipts" value={metrics.receipts} />
        <MetricCard label="Unpaid Invoices" value={metrics.unpaid} urgent={metrics.unpaid > 0} />
      </section>

      <PipelineSummary rows={operationalRows} />

      <section className="mb-8 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 xl:grid-cols-[1fr_auto_auto_auto_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="form-input"
          placeholder="Search name, email, country, route, program, notes, message..."
        />

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | Status)} className="form-input xl:w-48">
          <option value="all">All statuses</option>
          {statuses.map((status) => <option key={status} value={status}>{labelStatus(status)}</option>)}
        </select>

        <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as DateFilter)} className="form-input xl:w-48">
          <option value="all">All dates</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="followups">Follow-ups due</option>
        </select>

        <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)} className="form-input xl:w-48">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="follow_up">Follow-up date</option>
          <option value="status">Status</option>
        </select>

        <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-black/40 p-1 md:grid-cols-7">
          <TabButton active={activeTab === "requests"} onClick={() => setActiveTab("requests")}>Requests</TabButton>
          <TabButton active={activeTab === "volunteers"} onClick={() => setActiveTab("volunteers")}>Volunteers</TabButton>
          <TabButton active={activeTab === "guides"} onClick={() => setActiveTab("guides")}>Guides</TabButton>
          <TabButton active={activeTab === "inbox"} onClick={() => setActiveTab("inbox")}>Inbox</TabButton>
          <TabButton active={activeTab === "invoices"} onClick={() => setActiveTab("invoices")}>Invoices</TabButton>
          <TabButton active={activeTab === "receipts"} onClick={() => setActiveTab("receipts")}>Receipts</TabButton>
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
              onInvoice={() => startInvoiceFromRequest(request)}
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

      {activeTab === "inbox" && (
        <RecordGrid title="Inbox Emails" empty="No received emails match this view." rows={visibleInboundEmails}>
          {(email) => (
            <InboundEmailCard
              key={email.id}
              email={email}
              onReadStateChange={(read) => updateInboundEmailReadState(email.id, read)}
            />
          )}
        </RecordGrid>
      )}

      {activeTab === "invoices" && (
        <FinancialPanel title="Invoices" count={visibleInvoices.length}>
          <InvoiceForm key={invoiceDraft ? `request-invoice-${invoiceDraftVersion}` : "blank-invoice"} draft={invoiceDraft} invoices={invoices} onCreate={createInvoice} />
          <RecordGrid title="Invoice Records" empty="No invoices match this view." rows={visibleInvoices}>
            {(invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onMoneySave={(values) => updateInvoiceMoney(invoice.id, values)}
                onStatusChange={(status) => updateInvoiceStatus(invoice.id, status)}
                onPrint={() => printInvoice(invoice)}
              />
            )}
          </RecordGrid>
        </FinancialPanel>
      )}

      {activeTab === "receipts" && (
        <FinancialPanel title="Receipts" count={visibleReceipts.length}>
          <ReceiptForm invoices={invoices} receipts={receipts} onCreate={createReceipt} />
          <RecordGrid title="Receipt Records" empty="No receipts match this view." rows={visibleReceipts}>
            {(receipt) => <ReceiptCard key={receipt.id} receipt={receipt} onPrint={() => printReceipt(receipt)} />}
          </RecordGrid>
        </FinancialPanel>
      )}

      {activeTab === "analytics" && <AnalyticsPanel events={analyticsEvents} />}
    </main>
  );
}

type InvoiceFormValues = {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  tripName: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  tax: number;
  status: InvoiceStatus;
  notes: string;
  lineItems: LineItem[];
};

type InvoiceMoneyValues = {
  currency: string;
  tax: number;
  notes: string;
  lineItems: LineItem[];
};

type InvoiceDraft = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  tripName: string;
  notes: string;
  lineItems: LineItem[];
};

type ReceiptFormValues = {
  receiptNumber: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  paymentDate: string;
  currency: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  notes: string;
};

function FinancialPanel({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="grid gap-8">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="text-sm text-gray-500">{count} shown</p>
      </div>
      {children}
    </section>
  );
}

function InvoiceForm({ draft, invoices, onCreate }: { draft: InvoiceDraft | null; invoices: Invoice[]; onCreate: (values: InvoiceFormValues) => void }) {
  const [clientName, setClientName] = useState(draft?.clientName || "");
  const [clientEmail, setClientEmail] = useState(draft?.clientEmail || "");
  const [clientPhone, setClientPhone] = useState(draft?.clientPhone || "");
  const [tripName, setTripName] = useState(draft?.tripName || "");
  const [issueDate, setIssueDate] = useState(todayInputValue());
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [tax, setTax] = useState("0");
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [notes, setNotes] = useState(draft?.notes || "");
  const [lineItems, setLineItems] = useState<LineItem[]>(draft?.lineItems || [{ description: "Private Uganda travel services", quantity: 1, unit_price: 0, total: 0 }]);
  const invoiceNumber = useMemo(() => nextDocumentNumber("INV", invoices.map((invoice) => invoice.invoice_number)), [invoices]);
  const subtotal = roundMoney(lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0));
  const total = roundMoney(subtotal + Number(tax || 0));

  function updateLineItem(index: number, values: Partial<LineItem>) {
    setLineItems((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const next = { ...item, ...values };
      return { ...next, total: roundMoney(next.quantity * next.unit_price) };
    }));
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onCreate({
          invoiceNumber,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim(),
          tripName: tripName.trim(),
          issueDate,
          dueDate,
          currency,
          tax: Number(tax || 0),
          status,
          notes: notes.trim(),
          lineItems: lineItems.filter((item) => item.description.trim()),
        });
        setClientName("");
        setClientEmail("");
        setClientPhone("");
        setTripName("");
        setDueDate("");
        setTax("0");
        setStatus("draft");
        setNotes("");
        setLineItems([{ description: "Private Uganda travel services", quantity: 1, unit_price: 0, total: 0 }]);
      }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6"
    >
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500">New Invoice</p>
          <h3 className="mt-2 text-2xl font-black">{invoiceNumber}</h3>
        </div>
        <p className="text-3xl font-black text-yellow-500">{formatMoney(total, currency)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <input required className="form-input" value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Client name" />
        <input className="form-input" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} placeholder="Client email" />
        <input className="form-input" value={clientPhone} onChange={(event) => setClientPhone(event.target.value)} placeholder="Client phone" />
        <input className="form-input" value={tripName} onChange={(event) => setTripName(event.target.value)} placeholder="Trip / package" />
        <input required className="form-input" type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} />
        <input className="form-input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        <select className="form-input" value={currency} onChange={(event) => setCurrency(event.target.value)}>
          <option>USD</option>
          <option>UGX</option>
          <option>EUR</option>
          <option>GBP</option>
        </select>
        <select className="form-input" value={status} onChange={(event) => setStatus(event.target.value as InvoiceStatus)}>
          {invoiceStatuses.map((item) => <option key={item} value={item}>{labelStatus(item)}</option>)}
        </select>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="hidden px-1 text-xs font-black uppercase tracking-widest text-gray-500 md:grid md:grid-cols-[1fr_120px_160px_44px] md:gap-3">
          <span>Description</span>
          <span>Qty</span>
          <span>Money / unit price</span>
          <span />
        </div>
        {lineItems.map((item, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-[1fr_120px_160px_44px]">
            <label className="grid gap-2 md:block">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 md:hidden">Description</span>
              <input required className="form-input" value={item.description} onChange={(event) => updateLineItem(index, { description: event.target.value })} placeholder="Description" />
            </label>
            <label className="grid gap-2 md:block">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 md:hidden">Qty</span>
              <input required className="form-input" type="number" min="0" step="0.01" value={item.quantity} onChange={(event) => updateLineItem(index, { quantity: Number(event.target.value) })} placeholder="Qty" />
            </label>
            <label className="grid gap-2 md:block">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 md:hidden">Money / unit price</span>
              <input required className="form-input" type="number" min="0" step="0.01" value={item.unit_price} onChange={(event) => updateLineItem(index, { unit_price: Number(event.target.value) })} placeholder="Amount" />
            </label>
            <button type="button" aria-label="Remove invoice line" className="admin-outline-button px-0" onClick={() => setLineItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>x</button>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_180px_180px]">
        <textarea className="form-input min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Invoice notes, payment terms, bank details..." />
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Tax / extra fees</span>
          <input className="form-input" type="number" min="0" step="0.01" value={tax} onChange={(event) => setTax(event.target.value)} placeholder="Tax / fees" />
        </label>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-widest text-gray-500">Subtotal</p>
          <p className="mt-2 font-black">{formatMoney(subtotal, currency)}</p>
          <p className="mt-3 text-xs uppercase tracking-widest text-gray-500">Total</p>
          <p className="mt-2 font-black text-yellow-500">{formatMoney(total, currency)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className="admin-outline-button" onClick={() => setLineItems((current) => [...current, { description: "", quantity: 1, unit_price: 0, total: 0 }])}>Add Line</button>
        <button type="submit" disabled={!clientName.trim() || lineItems.length === 0} className="admin-primary-button disabled:cursor-not-allowed disabled:opacity-60">Create Invoice</button>
      </div>
    </form>
  );
}

function ReceiptForm({ invoices, receipts, onCreate }: { invoices: Invoice[]; receipts: Receipt[]; onCreate: (values: ReceiptFormValues) => void }) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayInputValue());
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const receiptNumber = useMemo(() => nextDocumentNumber("RCT", receipts.map((receipt) => receipt.receipt_number)), [receipts]);

  function selectInvoice(value: string) {
    setInvoiceNumber(value);
    const invoice = invoices.find((item) => item.invoice_number === value);
    if (!invoice) return;
    setClientName(invoice.client_name);
    setClientEmail(invoice.client_email || "");
    setCurrency(invoice.currency);
    setAmount(String(invoice.total));
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onCreate({
          receiptNumber,
          invoiceNumber,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          paymentDate,
          currency,
          amount: Number(amount || 0),
          paymentMethod,
          reference: reference.trim(),
          notes: notes.trim(),
        });
        setInvoiceNumber("");
        setClientName("");
        setClientEmail("");
        setAmount("");
        setPaymentMethod("bank_transfer");
        setReference("");
        setNotes("");
      }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6"
    >
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500">New Receipt</p>
          <h3 className="mt-2 text-2xl font-black">{receiptNumber}</h3>
        </div>
        <p className="text-3xl font-black text-yellow-500">{formatMoney(Number(amount || 0), currency)}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <select className="form-input" value={invoiceNumber} onChange={(event) => selectInvoice(event.target.value)}>
          <option value="">No linked invoice</option>
          {invoices.map((invoice) => <option key={invoice.id} value={invoice.invoice_number}>{invoice.invoice_number} - {invoice.client_name}</option>)}
        </select>
        <input required className="form-input" value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Client name" />
        <input className="form-input" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} placeholder="Client email" />
        <input required className="form-input" type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
        <select className="form-input" value={currency} onChange={(event) => setCurrency(event.target.value)}>
          <option>USD</option>
          <option>UGX</option>
          <option>EUR</option>
          <option>GBP</option>
        </select>
        <input required className="form-input" type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount paid" />
        <select className="form-input" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
          <option value="bank_transfer">Bank transfer</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="mobile_money">Mobile money</option>
          <option value="paypal">PayPal</option>
          <option value="flutterwave">Flutterwave</option>
        </select>
        <input className="form-input" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Payment reference" />
      </div>
      <textarea className="form-input mt-4 min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Receipt notes..." />
      <button type="submit" disabled={!clientName.trim() || Number(amount || 0) <= 0} className="admin-primary-button mt-5 disabled:cursor-not-allowed disabled:opacity-60">Create Receipt</button>
    </form>
  );
}

function InvoiceCard({ invoice, onMoneySave, onStatusChange, onPrint }: {
  invoice: Invoice;
  onMoneySave: (values: InvoiceMoneyValues) => void;
  onStatusChange: (status: InvoiceStatus) => void;
  onPrint: () => void;
}) {
  const [editingMoney, setEditingMoney] = useState(false);
  const [currency, setCurrency] = useState(invoice.currency);
  const [tax, setTax] = useState(String(invoice.tax));
  const [notes, setNotes] = useState(invoice.notes || "");
  const [lineItems, setLineItems] = useState<LineItem[]>(
    invoice.line_items.length > 0
      ? invoice.line_items
      : [{ description: "Private Uganda travel services", quantity: 1, unit_price: invoice.total, total: invoice.total }]
  );
  const subtotal = roundMoney(lineItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0), 0));
  const total = roundMoney(subtotal + Number(tax || 0));

  function updateLineItem(index: number, values: Partial<LineItem>) {
    setLineItems((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const next = { ...item, ...values };
      return { ...next, total: roundMoney(Number(next.quantity || 0) * Number(next.unit_price || 0)) };
    }));
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-2xl font-black">{invoice.invoice_number}</h3>
          <p className="text-gray-400">{invoice.client_name}</p>
          <p className="mt-1 text-sm text-gray-500">Issued {formatPlainDate(invoice.issue_date)}{invoice.due_date ? `, due ${formatPlainDate(invoice.due_date)}` : ""}</p>
        </div>
        <select value={invoice.status} onChange={(event) => onStatusChange(event.target.value as InvoiceStatus)} className="form-input md:w-44">
          {invoiceStatuses.map((item) => <option key={item} value={item}>{labelStatus(item)}</option>)}
        </select>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Field label="Trip" value={invoice.trip_name || "Not provided"} />
        <Field label="Email" value={invoice.client_email || "Not provided"} />
        <Field label="Total" value={formatMoney(invoice.total, invoice.currency)} />
      </div>
      <LineItemList items={invoice.line_items} currency={invoice.currency} />
      {invoice.notes && <MessageBlock label="Notes" value={invoice.notes} />}
      {editingMoney && (
        <div className="mt-5 rounded-3xl border border-yellow-500/30 bg-black/35 p-5">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-yellow-500">Edit invoice money</p>
              <p className="mt-1 text-sm text-gray-400">Change line prices, tax, currency, and notes. Totals recalculate automatically.</p>
            </div>
            <p className="text-2xl font-black text-yellow-500">{formatMoney(total, currency)}</p>
          </div>

          <div className="mb-3 grid gap-3 md:grid-cols-[1fr_160px]">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">Currency</span>
              <select className="form-input" value={currency} onChange={(event) => setCurrency(event.target.value)}>
                <option>USD</option>
                <option>UGX</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">Tax / extra fees</span>
              <input className="form-input" type="number" min="0" step="0.01" value={tax} onChange={(event) => setTax(event.target.value)} />
            </label>
          </div>

          <div className="grid gap-3">
            <div className="hidden px-1 text-xs font-black uppercase tracking-widest text-gray-500 md:grid md:grid-cols-[1fr_110px_150px_44px] md:gap-3">
              <span>Description</span>
              <span>Qty</span>
              <span>Money / unit price</span>
              <span />
            </div>
            {lineItems.map((item, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[1fr_110px_150px_44px]">
                <input className="form-input" value={item.description} onChange={(event) => updateLineItem(index, { description: event.target.value })} placeholder="Description" />
                <input className="form-input" type="number" min="0" step="0.01" value={item.quantity} onChange={(event) => updateLineItem(index, { quantity: Number(event.target.value) })} placeholder="Qty" />
                <input className="form-input" type="number" min="0" step="0.01" value={item.unit_price} onChange={(event) => updateLineItem(index, { unit_price: Number(event.target.value) })} placeholder="Amount" />
                <button type="button" aria-label="Remove invoice line" className="admin-outline-button px-0" onClick={() => setLineItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>x</button>
              </div>
            ))}
          </div>

          <textarea className="form-input mt-4 min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Invoice notes, payment terms, bank details..." />

          <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 md:grid-cols-2">
            <Field label="Subtotal" value={formatMoney(subtotal, currency)} />
            <Field label="Total" value={formatMoney(total, currency)} />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="admin-outline-button text-sm" onClick={() => setLineItems((current) => [...current, { description: "", quantity: 1, unit_price: 0, total: 0 }])}>Add Line</button>
            <button type="button" className="admin-primary-button text-sm" disabled={lineItems.length === 0} onClick={() => onMoneySave({ currency, tax: Number(tax || 0), notes, lineItems })}>Save Money</button>
          </div>
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => setEditingMoney((open) => !open)} className="admin-outline-button text-sm">
          {editingMoney ? "Close Money Editor" : "Edit Money"}
        </button>
        <button type="button" onClick={onPrint} className="admin-primary-button text-sm">Print Invoice</button>
        {invoice.client_email && <a href={`mailto:${invoice.client_email}?subject=${encodeURIComponent(`Invoice ${invoice.invoice_number} from Wild Spine Uganda`)}`} className="admin-outline-button text-sm">Email Client</a>}
      </div>
    </article>
  );
}

function ReceiptCard({ receipt, onPrint }: { receipt: Receipt; onPrint: () => void }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-2xl font-black">{receipt.receipt_number}</h3>
          <p className="text-gray-400">{receipt.client_name}</p>
          <p className="mt-1 text-sm text-gray-500">Paid {formatPlainDate(receipt.payment_date)}</p>
        </div>
        <p className="text-3xl font-black text-yellow-500">{formatMoney(receipt.amount, receipt.currency)}</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Field label="Invoice" value={receipt.invoice_number || "Not linked"} />
        <Field label="Method" value={labelStatus(receipt.payment_method.replaceAll("_", " "))} />
        <Field label="Reference" value={receipt.reference || "Not provided"} />
      </div>
      {receipt.notes && <MessageBlock label="Notes" value={receipt.notes} />}
      <button type="button" onClick={onPrint} className="admin-primary-button mt-5 text-sm">Print Receipt</button>
    </article>
  );
}

function InboundEmailCard({ email, onReadStateChange }: { email: InboundEmail; onReadStateChange: (read: boolean) => void }) {
  const body = email.text_body || stripHtml(email.html_body || "") || "No message body was returned by Resend.";
  const replySubject = `Re: ${email.subject || "Wild Spine Uganda"}`;

  return (
    <article className={`rounded-3xl border p-6 ${email.read_at ? "border-white/10 bg-white/5" : "border-yellow-500/40 bg-yellow-500/10"}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-2xl font-black">{email.subject || "No subject"}</h3>
            {!email.read_at && <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-black text-black">Unread</span>}
          </div>
          <p className="mt-2 text-gray-400">From: {email.from_email}</p>
          <p className="mt-1 text-sm text-gray-500">To: {email.to_emails.join(", ") || "Not provided"}</p>
          <p className="mt-1 text-sm text-gray-500">Received {formatDate(email.received_at)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => onReadStateChange(!email.read_at)} className="admin-outline-button text-sm">
            {email.read_at ? "Mark Unread" : "Mark Read"}
          </button>
        </div>
      </div>

      <MessageBlock label="Message" value={body} />
      <QuickActions email={email.from_email} phone={null} subject={replySubject} template={inboundReplyTemplate(email, body)} />

      {(email.cc_emails.length > 0 || email.attachments?.length || email.raw_download_url) && (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {email.cc_emails.length > 0 && <Field label="CC" value={email.cc_emails.join(", ")} />}
          {email.attachments?.length ? <Field label="Attachments" value={email.attachments.map((item) => item.filename || item.id).join(", ")} /> : null}
          {email.raw_download_url && (
            <a href={email.raw_download_url} className="rounded-2xl border border-white/10 bg-black/30 p-4 hover:border-yellow-500/40">
              <p className="text-xs uppercase tracking-widest text-gray-500">Raw Email</p>
              <p className="mt-2 font-bold text-yellow-500">Download original</p>
            </a>
          )}
        </div>
      )}
    </article>
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

function ItineraryCard({ request, now, onStatusChange, onSave, onInvoice }: {
  request: ItineraryRequest;
  now: number;
  onStatusChange: (status: Status) => void;
  onSave: (values: { admin_notes: string | null; follow_up_at: string | null }) => void;
  onInvoice: () => void;
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
      <button type="button" onClick={onInvoice} className="admin-primary-button mt-5 text-sm">Generate Invoice</button>
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
      <select value={status} onChange={(event) => onStatusChange(event.target.value as Status)} className="form-input md:w-44">
        {statuses.map((item) => <option key={item} value={item}>{labelStatus(item)}</option>)}
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
          className="rounded-full bg-white/10 px-4 py-2 text-xs font-black transition hover:bg-yellow-500 hover:text-black"
        >
          Save
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_210px]">
        <textarea className="form-input min-h-24" value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} placeholder="Add internal notes, next step, quote status..." />
        <input className="form-input" type="datetime-local" value={draftFollowUp} onChange={(event) => setDraftFollowUp(event.target.value)} />
      </div>
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
            <input className="form-input" value={draftSubject} onChange={(event) => setDraftSubject(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-gray-300">
            Message
            <textarea className="form-input min-h-52" value={draftMessage} onChange={(event) => setDraftMessage(event.target.value)} />
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

function LineItemList({ items, currency }: { items: LineItem[]; currency: string }) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
      {items.map((item, index) => (
        <div key={`${item.description}-${index}`} className="grid gap-2 border-b border-white/10 bg-black/30 p-4 md:grid-cols-[1fr_80px_120px_120px]">
          <p className="font-bold">{item.description}</p>
          <p className="text-gray-400">{item.quantity}</p>
          <p className="text-gray-400">{formatMoney(item.unit_price, currency)}</p>
          <p className="font-black text-yellow-500">{formatMoney(item.total, currency)}</p>
        </div>
      ))}
    </div>
  );
}

function AnalyticsPanel({ events }: { events: AnalyticsEvent[] }) {
  const eventCounts = countBy(events, (event) => event.event_name);
  const pageCounts = countBy(events, (event) => event.page_path || "unknown");

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black">Analytics</h2>
        <p className="text-sm text-gray-500">{events.length} events tracked</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <AnalyticsList title="Top Events" rows={eventCounts} />
        <AnalyticsList title="Top Pages" rows={pageCounts} />
      </div>
    </section>
  );
}

function AnalyticsList({ title, rows }: { title: string; rows: Array<[string, number]> }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="mb-4 text-sm uppercase tracking-widest text-gray-400">{title}</p>
      <div className="grid gap-3">
        {rows.slice(0, 8).map(([label, count]) => (
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

function filterRows<T extends object>(rows: T[], query: string, dateKey: keyof T = "created_at" as keyof T) {
  const normalizedQuery = query.trim().toLowerCase();

  return rows
    .filter((row) => normalizedQuery.length === 0 || Object.values(row).some((value) => String(value || "").toLowerCase().includes(normalizedQuery)))
    .toSorted((a, b) => new Date(String(b[dateKey] || "")).getTime() - new Date(String(a[dateKey] || "")).getTime());
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
  items.forEach((item) => counts.set(getKey(item), (counts.get(getKey(item)) || 0) + 1));
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

function formatPlainDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(value);
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function nextDocumentNumber(prefix: string, existingNumbers: string[]) {
  const year = new Date().getFullYear();
  const next = existingNumbers
    .map((value) => Number(value.replace(`${prefix}-${year}-`, "")))
    .filter((value) => Number.isFinite(value))
    .reduce((max, value) => Math.max(max, value), 0) + 1;

  return `${prefix}-${year}-${String(next).padStart(4, "0")}`;
}

function labelStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function stripHtml(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function requestReplyTemplate(request: ItineraryRequest) {
  return `Hi ${request.name},

Thank you for reaching out to Wild Spine Uganda about ${request.route || "your Uganda journey"}.

We received your preferred travel timing (${request.travel_month || "dates to confirm"}) and will help you shape the best route, permits, and logistics.

A few quick questions:
- How many travelers will join?
- What comfort level do you prefer?
- Are your dates flexible?

Warmly,
Wild Spine Uganda`;
}

function volunteerReplyTemplate(application: VolunteerApplication) {
  return `Hi ${application.name},

Thank you for applying for ${application.program || "a Wild Spine volunteer program"}.

We received your application and would love to understand your ideal timing, skills, and whether you want to add a gorilla or Rwenzori experience after volunteering.

Warmly,
Wild Spine Uganda`;
}

function guideReplyTemplate() {
  return `Hi,

Thank you for downloading the Wild Spine Uganda guide.

If you would like help planning gorilla trekking, Rwenzori hiking, permits, or a private itinerary, reply with your travel month and number of travelers.

Warmly,
Wild Spine Uganda`;
}

function inboundReplyTemplate(email: InboundEmail, body: string) {
  return `Hello,

Thank you for your email. We have received your message and will be happy to help.

Kind regards,
Wild Spine Uganda

---
Original message from ${email.from_email} on ${formatDate(email.received_at)}:
${body}`;
}

function printInvoice(invoice: Invoice) {
  const rows = invoice.line_items.map((item) => `
    <tr>
      <td>${escapeHtml(item.description)}</td>
      <td>${item.quantity}</td>
      <td>${formatMoney(item.unit_price, invoice.currency)}</td>
      <td>${formatMoney(item.total, invoice.currency)}</td>
    </tr>
  `).join("");

  printDocument("Invoice", `
    <section class="hero"><div><p class="kicker">Wild Spine Uganda</p><h1>Invoice</h1></div><div class="doc-number">${escapeHtml(invoice.invoice_number)}</div></section>
    <section class="grid">
      <div><p class="label">Bill To</p><p>${escapeHtml(invoice.client_name)}</p><p>${escapeHtml(invoice.client_email || "")}</p><p>${escapeHtml(invoice.client_phone || "")}</p></div>
      <div><p><strong>Issue date:</strong> ${formatPlainDate(invoice.issue_date)}</p>${invoice.due_date ? `<p><strong>Due date:</strong> ${formatPlainDate(invoice.due_date)}</p>` : ""}<p><strong>Status:</strong> ${labelStatus(invoice.status)}</p>${invoice.trip_name ? `<p><strong>Trip:</strong> ${escapeHtml(invoice.trip_name)}</p>` : ""}</div>
    </section>
    <table><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
    <section class="totals"><p><span>Subtotal</span><strong>${formatMoney(invoice.subtotal, invoice.currency)}</strong></p><p><span>Tax / fees</span><strong>${formatMoney(invoice.tax, invoice.currency)}</strong></p><p class="grand"><span>Total</span><strong>${formatMoney(invoice.total, invoice.currency)}</strong></p></section>
    ${invoice.notes ? `<section class="notes"><p class="label">Notes</p><p>${escapeHtml(invoice.notes)}</p></section>` : ""}
  `);
}

function printReceipt(receipt: Receipt) {
  printDocument("Receipt", `
    <section class="hero"><div><p class="kicker">Wild Spine Uganda</p><h1>Receipt</h1></div><div class="doc-number">${escapeHtml(receipt.receipt_number)}</div></section>
    <section class="grid">
      <div><p class="label">Received From</p><p>${escapeHtml(receipt.client_name)}</p><p>${escapeHtml(receipt.client_email || "")}</p></div>
      <div><p><strong>Payment date:</strong> ${formatPlainDate(receipt.payment_date)}</p>${receipt.invoice_number ? `<p><strong>Invoice:</strong> ${escapeHtml(receipt.invoice_number)}</p>` : ""}<p><strong>Method:</strong> ${labelStatus(receipt.payment_method.replaceAll("_", " "))}</p>${receipt.reference ? `<p><strong>Reference:</strong> ${escapeHtml(receipt.reference)}</p>` : ""}</div>
    </section>
    <section class="paid"><p>Amount Received</p><strong>${formatMoney(receipt.amount, receipt.currency)}</strong></section>
    ${receipt.notes ? `<section class="notes"><p class="label">Notes</p><p>${escapeHtml(receipt.notes)}</p></section>` : ""}
  `);
}

function printDocument(title: string, body: string) {
  const popup = window.open("", "_blank", "width=900,height=1100");
  if (!popup) return;

  popup.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${title} - Wild Spine Uganda</title>
        <style>
          body { color: #111; font-family: Arial, sans-serif; margin: 0; padding: 48px; }
          .hero { align-items: flex-start; border-bottom: 3px solid #111; display: flex; justify-content: space-between; padding-bottom: 28px; }
          .kicker, .label { color: #777; font-size: 12px; font-weight: 800; letter-spacing: 0.18em; margin: 0 0 8px; text-transform: uppercase; }
          h1 { font-size: 52px; line-height: 1; margin: 0; text-transform: uppercase; }
          .doc-number { background: #eab308; color: #000; font-weight: 900; padding: 14px 18px; }
          .grid { display: grid; gap: 32px; grid-template-columns: 1fr 1fr; margin: 34px 0; }
          p { line-height: 1.55; margin: 0 0 6px; }
          table { border-collapse: collapse; margin-top: 24px; width: 100%; }
          th { background: #111; color: white; text-align: left; }
          th, td { border-bottom: 1px solid #ddd; padding: 14px; }
          .totals { margin-left: auto; margin-top: 28px; max-width: 340px; }
          .totals p { display: flex; justify-content: space-between; }
          .grand { border-top: 2px solid #111; font-size: 24px; margin-top: 12px; padding-top: 12px; }
          .paid { background: #111; color: white; margin-top: 34px; padding: 28px; }
          .paid strong { color: #eab308; display: block; font-size: 44px; margin-top: 8px; }
          .notes { border-top: 1px solid #ddd; margin-top: 34px; padding-top: 24px; }
        </style>
      </head>
      <body>${body}<script>window.print();</script></body>
    </html>
  `);
  popup.document.close();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char] || char);
}
