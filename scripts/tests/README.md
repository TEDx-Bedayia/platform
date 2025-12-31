# Payment Test Suite Setup

## Prerequisites

1. **Environment Variables**: Ensure your `.env.development.local` or `.env.local` has:

   ```
   POSTGRES_URL=your_postgres_connection_string
   JWT_SECRET=your_jwt_secret
   ```

2. **Database Access**: You need write access to the database.

## Database Setup (One-Time)

The tests use special prefixes (`test_payment_`) and high group IDs (`>= 900000`) to isolate test data from production data. **No separate test database is required** — the tests clean up after themselves.

However, if you want to verify your schema matches what the tests expect, here's what the tests assume:

### Expected Schema

```sql
-- Attendees table
CREATE TABLE IF NOT EXISTS attendees (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'individual', 'group', 'individual_early_bird', 'group_early_bird', etc.
  payment_method TEXT NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  uuid UUID,
  sent BOOLEAN DEFAULT FALSE,
  admitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Groups table (links 4 attendees together)
CREATE TABLE IF NOT EXISTS groups (
  grpid SERIAL PRIMARY KEY,
  id1 INTEGER REFERENCES attendees(id),
  id2 INTEGER REFERENCES attendees(id),
  id3 INTEGER REFERENCES attendees(id),
  id4 INTEGER REFERENCES attendees(id)
);

-- Payment backup/audit log
CREATE TABLE IF NOT EXISTS pay_backup (
  id SERIAL PRIMARY KEY,
  stream TEXT NOT NULL,
  incurred INTEGER NOT NULL,
  recieved TEXT NOT NULL,
  recieved_at TIMESTAMP NOT NULL
);
```

### Verify Schema (psql commands)

Connect to your database and run:

```sql
-- Check attendees table structure
\d attendees

-- Check groups table structure
\d groups

-- Check pay_backup table structure
\d pay_backup

-- Verify indexes exist for performance
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'attendees';
```

### Recommended Indexes

If not already present, add these indexes for better test/production performance:

```sql
-- Index for payment lookups (used heavily by pay())
CREATE INDEX IF NOT EXISTS idx_attendees_payment_method_paid
ON attendees(payment_method, paid);

-- Index for email lookups (CASH payments)
CREATE INDEX IF NOT EXISTS idx_attendees_email
ON attendees(email);

-- Index for UUID lookups (ticket validation)
CREATE INDEX IF NOT EXISTS idx_attendees_uuid
ON attendees(uuid);

-- Index for group lookups
CREATE INDEX IF NOT EXISTS idx_groups_members
ON groups(id1, id2, id3, id4);
```

## Running Tests

### All Payment Tests

```bash
npm run test:payment
```

### Concurrency Tests Only

```bash
npm run test:payment:concurrent
```

### Performance Benchmark

```bash
npm run test:payment:bench
```

### Run All Tests

```bash
npm run test:payment:all
```

## Test Data Cleanup

The tests automatically clean up test data before and after running. Test data is identified by:

- Emails ending with `@test.tedxbedayia.local`
- Group IDs >= 900000
- Pay backup entries containing `test_payment_`

If you need to manually clean up test data:

```sql
-- Remove test groups
DELETE FROM groups WHERE grpid >= 900000;

-- Remove test attendees
DELETE FROM attendees WHERE email LIKE '%@test.tedxbedayia.local';

-- Remove test pay_backup entries
DELETE FROM pay_backup WHERE stream LIKE '%test_payment_%';
```

## Troubleshooting

### "Key is not set" Error

- Ensure `JWT_SECRET` is set in your environment

### Connection Errors

- Verify `POSTGRES_URL` is correct
- Check if the database is accessible from your machine

### Tests Hanging

- The concurrency tests use row-level locking (`SELECT ... FOR UPDATE`)
- If a previous test crashed, locks may still be held
- Restart the database connection or wait for lock timeout

### "Not found" When Expected to Find

- Check if a previous test run left data in an unexpected state
- Run cleanup manually (see above)

## Test Categories

| Test File               | Purpose                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `test-payments.ts`      | Core functionality: individual/group payments, early bird, ambiguity handling |
| `test-concurrency.ts`   | Row-level locking: prevents double-processing of same ticket                  |
| `benchmark-payments.ts` | Performance measurement: identifies slow paths                                |
