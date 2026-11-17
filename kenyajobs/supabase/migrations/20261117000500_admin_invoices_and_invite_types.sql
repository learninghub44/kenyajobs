BEGIN;
ALTER TABLE public.job_posting_links ADD COLUMN IF NOT EXISTS submission_type TEXT NOT NULL DEFAULT 'job';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='job_posting_links_submission_type_check' AND conrelid='public.job_posting_links'::regclass) THEN
    ALTER TABLE public.job_posting_links ADD CONSTRAINT job_posting_links_submission_type_check CHECK (submission_type IN ('job','event'));
  END IF;
END $$;
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq;
CREATE TABLE IF NOT EXISTS public.invoices (
 id BIGSERIAL PRIMARY KEY,
 invoice_number TEXT NOT NULL UNIQUE DEFAULT ('JHK-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text,5,'0')),
 customer_name TEXT NOT NULL, customer_company TEXT NOT NULL DEFAULT '', customer_email TEXT NOT NULL,
 customer_phone TEXT NOT NULL DEFAULT '', customer_address TEXT NOT NULL DEFAULT '',
 currency TEXT NOT NULL DEFAULT 'KES' CHECK(currency IN ('KES','USD')),
 issue_date DATE NOT NULL DEFAULT CURRENT_DATE, due_date DATE NOT NULL,
 items JSONB NOT NULL DEFAULT '[]'::jsonb CHECK(jsonb_typeof(items)='array'),
 subtotal NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK(subtotal>=0),
 tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK(tax_rate>=0 AND tax_rate<=100),
 tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK(tax_amount>=0),
 discount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK(discount>=0),
 total NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK(total>=0),
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','sent','partially_paid','paid','overdue','void')),
 amount_paid NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK(amount_paid>=0),
 payment_method TEXT NOT NULL DEFAULT '', payment_reference TEXT NOT NULL DEFAULT '',
 payment_instructions TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
 terms TEXT NOT NULL DEFAULT 'Payment is due by the date shown above. Please quote the invoice number when making payment.',
 sent_at TIMESTAMPTZ, paid_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), CHECK(amount_paid<=total)
);
CREATE INDEX IF NOT EXISTS invoices_status_due_idx ON public.invoices(status,due_date);
CREATE INDEX IF NOT EXISTS invoices_created_idx ON public.invoices(created_at DESC);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.invoices FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.invoice_number_seq FROM anon, authenticated;
GRANT ALL ON public.invoices TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.invoice_number_seq TO service_role;
COMMIT;