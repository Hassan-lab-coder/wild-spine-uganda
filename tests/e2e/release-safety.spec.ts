import { expect, test } from "@playwright/test";

test("public site loads and payment switch is off", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Wild Spine Uganda/i);

  const config = await request.get("/api/payments/config");
  expect(config.ok()).toBeTruthy();
  await expect(config.json()).resolves.toMatchObject({
    payments_enabled: false,
    payment_method: "bank_transfer",
    bank_transfer_bookings_enabled: true,
  });
});

test("itinerary request completes through the server workflow", async ({ page }) => {
  await page.route("**/api/itinerary-requests", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, id: "test-lead" }) });
  });
  await page.goto("/#book");
  const form = page.locator("form").filter({ has: page.getByLabel("Full name") }).last();
  await form.getByLabel("Full name").fill("Release Test");
  await form.getByLabel("Email address").fill("release@example.com");
  await form.getByLabel(/travel month/i).fill("January 2027");
  await form.getByRole("button", { name: /request|plan|journey|submit/i }).click();
  await expect(page).toHaveURL(/\/thank-you/);
});

test("contact form completes through the server workflow", async ({ page }) => {
  await page.route("**/api/itinerary-requests", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, id: "contact-test" }) });
  });
  await page.goto("/contact");
  const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Send My Inquiry" }) });
  await form.getByLabel("Full name").fill("Contact Test");
  await form.getByLabel("Email address").fill("contact@example.com");
  await form.getByRole("button", { name: "Send My Inquiry" }).click();
  await expect(page).toHaveURL(/\/thank-you/);
});

test("required Turnstile blocks an unverified lead submission", async ({ request }) => {
  const response = await request.post("/api/itinerary-requests", {
    headers: { Origin: "http://localhost:3000" },
    data: {
      name: "Blocked Bot",
      email: "bot@example.com",
      travel_month: "January 2027",
      route: "Custom Uganda Safari",
    },
  });
  expect(response.status()).toBe(403);
});

test("online checkout is not accessible", async ({ request }) => {
  const payment = await request.post("/api/payment-links", { data: { invoice_id: "not-authorized" } });
  expect(payment.status()).toBe(503);
  await expect(payment.json()).resolves.toMatchObject({
    ok: false,
    payments_enabled: false,
    payment_method: "bank_transfer",
  });
});

test("bank details are not public and invoice verification is limited", async ({ page }) => {
  await page.goto("/payment-information");
  await expect(page.getByRole("heading", { name: /formal invoices/i })).toBeVisible();
  await expect(page.getByText(/full bank account details are not published/i)).toBeVisible();
  await expect(page.getByText(/\b\d{8,}\b/)).toHaveCount(0);
  expect(await page.content()).not.toMatch(/BANK_TRANSFER_(ACCOUNT_NUMBER|SWIFT_BIC|BRANCH_NAME)/);

  const publicScriptSources = await page.locator("script[src]").evaluateAll((scripts) =>
    scripts.map((script) => (script as HTMLScriptElement).src).filter((src) => src.includes("/_next/"))
  );
  for (const source of publicScriptSources.slice(0, 8)) {
    const response = await page.request.get(source);
    const body = await response.text();
    expect(body).not.toMatch(/BANK_TRANSFER_(ACCOUNT_NUMBER|SWIFT_BIC|BRANCH_NAME)/);
  }

  await page.goto("/verify-invoice/00000000-0000-0000-0000-000000000000");
  await expect(page.getByRole("heading", { name: /invoice not valid/i })).toBeVisible();
  await expect(page.getByText(/do not transfer funds/i)).toBeVisible();
  await expect(page.getByText(/\b\d{8,}\b/)).toHaveCount(0);

  await page.goto("/verify-invoice/not-a-real-token");
  await expect(page.getByRole("heading", { name: /invoice not valid/i })).toBeVisible();
  await expect(page.getByText(/\b\d{8,}\b/)).toHaveCount(0);
});

test("admin financial APIs fail closed without an authorised session", async ({ request }) => {
  const reconciliation = await request.post("/api/admin/bank-transfer-reconciliations", {
    headers: { Origin: "http://localhost:3000" },
    data: {
      invoice_id: "fake",
      bank_transaction_reference: "BT-1",
      sender_name: "Tester",
      amount: 100,
      currency: "USD",
      value_date: "2026-08-02",
      invoice_reference: "INV-1",
      status: "matched",
      confirm_reconciliation: true,
    },
  });
  expect([400, 401, 403]).toContain(reconciliation.status());

  const document = await request.post("/api/admin/financial-documents", {
    headers: { Origin: "http://localhost:3000" },
    data: {
      document_type: "invoice",
      invoice_id: "fake",
      document_number: "INV-1",
      canonical_content: "invoice",
    },
  });
  expect([400, 401, 403]).toContain(document.status());
});

test("password reset screen is reachable", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /forgot password/i }).click();
  await expect(page.getByRole("heading", { name: /reset your password/i })).toBeVisible();
});
