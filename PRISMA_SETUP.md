Prisma setup and migration instructions

1. Install packages

```bash
npm install
```

2. Generate Prisma client

```bash
npx prisma generate --schema=model/schema.prisma
```

3. Create and apply a migration (this will create tables in your Postgres/Neon database)

```bash
npx prisma migrate dev --name init --schema=model/schema.prisma
```

4. Optional: open Prisma Studio to view data

```bash
npx prisma studio --schema=model/schema.prisma
```

Notes:
- Ensure `DATABASE_URL` in `.env` points to your Postgres/Neon database.
- The schema is located at `model/schema.prisma` (not the default `prisma/` folder) so include `--schema` when running Prisma CLI commands.
