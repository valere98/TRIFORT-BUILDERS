This folder contains the database schema for the construction website.

Tables:

- **users**: stores administrator accounts
  - id (SERIAL PRIMARY KEY)
  - name
  - email (UNIQUE)
  - password_hash
  - role (default 'admin')

- **projects**: portfolio entries uploaded by admin
  - id (SERIAL PRIMARY KEY)
  - title
  - description
  - image (URL or path)
  - location
  - completion_date
  - created_at

- **contacts**: form submissions from contact page
  - id (UUID PRIMARY KEY)
  - name
  - email
  - subject
  - message
  - phone
  - status (new, read, responded)
  - created_at

- **quotes**: quote request submissions
  - id (UUID PRIMARY KEY)
  - name
  - email
  - phone
  - project_type
  - details
  - status (new, read, responded)
  - created_at

- **subcontractors**: subcontractor registration submissions
  - id (UUID PRIMARY KEY)
  - company
  - contact (name)
  - email
  - phone
  - trade
  - experience
  - service_area
  - message
  - status (pending, approved, rejected)
  - created_at

- **reviews**: customer reviews with moderation
  - id (UUID PRIMARY KEY)
  - name
  - email
  - rating (1-5)
  - title
  - message
  - project_type
  - status (pending, published, rejected)
  - verified (boolean - for admin approval)
  - created_at

The SQL schema is provided in `schema.sql`. To set up the database:

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor in Supabase Console
3. Copy and paste the entire content from `schema.sql`
4. Execute the SQL to create all tables
5. Ensure RLS (Row Level Security) policies are configured appropriately for your use case

For local development with Supabase, set these environment variables in `.env`:
- SUPABASE_URL: Your Supabase project URL
- SUPABASE_SECRET_KEY: Your Supabase service role key (for server-side operations)
- ADMIN_EMAIL: Initial admin user email
- ADMIN_PASSWORD: Initial admin user password

