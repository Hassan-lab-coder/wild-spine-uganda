-- Tighten financial table/function privileges after the bank-transfer rollout.
-- Public/client access must go through server routes, RLS policies, or service-role
-- controlled APIs; anonymous users should not hold direct table privileges.

revoke all privileges on table public.invoices from anon;
revoke all privileges on table public.receipts from anon;
revoke all privileges on table public.payment_requests from anon;
revoke all privileges on table public.bank_transfer_reconciliations from anon;
revoke all privileges on table public.invoice_audit_events from anon;
revoke all privileges on table public.financial_documents from anon;

revoke all privileges on function public.generate_invoice_verification_token() from anon;
revoke all privileges on function public.generate_bank_transfer_uuid() from anon;

revoke all privileges on table public.bank_transfer_reconciliations from authenticated;
revoke all privileges on table public.invoice_audit_events from authenticated;
revoke all privileges on table public.financial_documents from authenticated;
revoke all privileges on table public.payment_requests from authenticated;

grant select on table public.bank_transfer_reconciliations to authenticated;
grant select on table public.invoice_audit_events to authenticated;
grant select on table public.financial_documents to authenticated;
grant select on table public.payment_requests to authenticated;

revoke all privileges on table public.invoices from authenticated;
revoke all privileges on table public.receipts from authenticated;

grant select, insert, update on table public.invoices to authenticated;
grant select, insert on table public.receipts to authenticated;

grant execute on function public.generate_invoice_verification_token() to authenticated;
grant execute on function public.generate_bank_transfer_uuid() to authenticated;

grant all privileges on table public.invoices to service_role;
grant all privileges on table public.receipts to service_role;
grant all privileges on table public.payment_requests to service_role;
grant all privileges on table public.bank_transfer_reconciliations to service_role;
grant all privileges on table public.invoice_audit_events to service_role;
grant all privileges on table public.financial_documents to service_role;
grant all privileges on function public.generate_invoice_verification_token() to service_role;
grant all privileges on function public.generate_bank_transfer_uuid() to service_role;
