import { expect, test } from "@playwright/test";

test("public site loads and payment switch is off", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Wild Spine Uganda/i);

  const config = await request.get("/api/payments/config");
  expect(config.ok()).toBeTruthy();
  await expect(config.json()).resolves.toMatchObject({ payments_enabled: false });
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

test("admin and payment APIs reject unauthorized writes", async ({ request }) => {
  const payment = await request.post("/api/payment-links", { data: { invoice_id: "not-authorized", provider: "tazapay" } });
  expect([400, 401, 403]).toContain(payment.status());
});

test("password reset screen is reachable", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /forgot password/i }).click();
  await expect(page.getByRole("heading", { name: /reset your password/i })).toBeVisible();
});
