This folder contains the database schema for the construction website.

Tables:

- **users**: stores administrator accounts
  - id
  - name
  - email
  - password_hash
  - role (default 'admin')

- **projects**: portfolio entries uploaded by admin
  - id
  - title
  - description
  - image (URL or path)
  - location
  - completion_date
  - created_at

The SQL schema is provided in `schema.sql`. You can adapt it for your chosen database (Postgres, MySQL, etc.).
