/**
 * Test utilities for payment testing
 */

// Load environment variables BEFORE any other imports
import { config } from "dotenv";
config({ path: ".env.development.local" });
config({ path: ".env.local" });
config(); // Also try .env

import { sql } from "@vercel/postgres";

// Test data prefix to avoid conflicts with production data
export const TEST_PREFIX = "test_payment_";
export const TEST_EMAIL_DOMAIN = "@test.tedxbedayia.local";

// Price constants - MUST match metadata.tsx
// Individual: 400, Early: 350
// Group (per person): 350, Early: 300
// Discounted: 300
const EARLY_BIRD_UNTIL: Date | null = new Date("2026-01-10T22:00:00Z");
const isEarlyBird = EARLY_BIRD_UNTIL && new Date() < EARLY_BIRD_UNTIL;

// Use early bird prices if we're in the early bird window
// Note: getPrice() caps future dates to current date, so we always use current period pricing
export const PRICES = {
  INDIVIDUAL: isEarlyBird ? 350 : 400,
  INDIVIDUAL_EARLY: 350,
  GROUP: isEarlyBird ? 300 : 350, // per person
  GROUP_EARLY: 300, // per person
  GROUP_TOTAL: (isEarlyBird ? 300 : 350) * 4, // 1200 or 1400
  GROUP_EARLY_TOTAL: 300 * 4, // 1200
  DISCOUNTED: 300,
  TEACHER: 200, // Fixed: 0.5 * 400 (always based on regular individual price)
  SPEAKER: 0,
  GIVEAWAY: 0,
};

export interface TestAttendee {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  type: string;
  payment_method: string;
  paid: boolean;
  uuid: string | null;
  sent: boolean;
}

export interface TestGroup {
  grpid: number;
  id1: number;
  id2: number;
  id3: number;
  id4: number;
}

/**
 * Cleans up all test data from the database
 */
export async function cleanupTestData(): Promise<void> {
  console.log("🧹 Cleaning up test data...");

  // First get IDs of test attendees
  const testAttendees = await sql`
    SELECT id FROM attendees WHERE email LIKE ${`%${TEST_EMAIL_DOMAIN}`}
  `;
  const testIds = testAttendees.rows.map((r) => r.id);

  // Delete groups that contain any test attendees
  if (testIds.length > 0) {
    await sql.query(
      `DELETE FROM groups 
       WHERE id1 = ANY($1::int[]) 
          OR id2 = ANY($1::int[]) 
          OR id3 = ANY($1::int[]) 
          OR id4 = ANY($1::int[])`,
      [testIds]
    );
  }

  // Delete test attendees
  await sql`DELETE FROM attendees WHERE email LIKE ${`%${TEST_EMAIL_DOMAIN}`}`;
  await sql`DELETE FROM pay_backup WHERE stream LIKE ${`%${TEST_PREFIX}%`}`;

  console.log("✅ Test data cleaned up");
}

/**
 * Creates a test individual attendee
 *
 * The paymentMethod should be the full format (e.g., "TLDA@test_identifier")
 * which matches how attendees are stored in the database.
 */
export async function createTestIndividual(
  name: string,
  paymentMethod: string,
  paid: boolean = false
): Promise<TestAttendee> {
  const email = `${TEST_PREFIX}${name
    .toLowerCase()
    .replace(/\s/g, "_")}${TEST_EMAIL_DOMAIN}`;
  const phone = `010${Math.floor(10000000 + Math.random() * 90000000)}`;

  const result = await sql`
    INSERT INTO attendees (full_name, email, phone, type, payment_method, paid)
    VALUES (${name}, ${email}, ${phone}, 'individual', ${paymentMethod}, ${paid})
    RETURNING id, full_name, email, phone, type, payment_method, paid
  `;

  return result.rows[0] as TestAttendee;
}

/**
 * Creates a test group (4 attendees linked together)
 *
 * The paymentMethod should be the full format (e.g., "VFCASH@test_identifier")
 */
export async function createTestGroup(
  groupName: string,
  paymentMethod: string,
  paid: boolean = false
): Promise<{ group: TestGroup; members: TestAttendee[] }> {
  const members: TestAttendee[] = [];

  // Create 4 group members
  for (let i = 1; i <= 4; i++) {
    const name = `${groupName} Member ${i}`;
    const email = `${TEST_PREFIX}${groupName
      .toLowerCase()
      .replace(/\s/g, "_")}_m${i}${TEST_EMAIL_DOMAIN}`;
    const phone = `010${Math.floor(10000000 + Math.random() * 90000000)}`;

    const result = await sql`
      INSERT INTO attendees (full_name, email, phone, type, payment_method, paid)
      VALUES (${name}, ${email}, ${phone}, 'group', ${paymentMethod}, ${paid})
      RETURNING id, full_name, email, phone, type, payment_method, paid
    `;

    members.push(result.rows[0] as TestAttendee);
  }

  // Create group entry - let grpid auto-increment
  const groupResult = await sql`
    INSERT INTO groups (id1, id2, id3, id4)
    VALUES (${members[0].id}, ${members[1].id}, ${members[2].id}, ${members[3].id})
    RETURNING grpid
  `;

  const grpid = groupResult.rows[0].grpid;

  const group: TestGroup = {
    grpid,
    id1: members[0].id,
    id2: members[1].id,
    id3: members[2].id,
    id4: members[3].id,
  };

  return { group, members };
}

/**
 * Gets attendee by ID to check state after payment
 */
export async function getAttendeeById(
  id: number
): Promise<TestAttendee | null> {
  const result = await sql`
    SELECT id, full_name, email, phone, type, payment_method, paid, uuid
    FROM attendees WHERE id = ${id}
  `;
  return result.rows[0] as TestAttendee | null;
}

/**
 * Gets the latest pay_backup entry for a stream
 */
export async function getLatestPayBackup(
  streamPattern: string
): Promise<{ stream: string; incurred: number; recieved: number } | null> {
  const result = await sql`
    SELECT stream, incurred, recieved 
    FROM pay_backup 
    WHERE stream LIKE ${`%${streamPattern}%`}
    ORDER BY recieved_at DESC
    LIMIT 1
  `;
  return (
    (result.rows[0] as {
      stream: string;
      incurred: number;
      recieved: number;
    }) || null
  );
}

/**
 * Assertion helper
 */
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ ${message}`);
}

/**
 * Test result tracking
 */
export class TestRunner {
  private passed = 0;
  private failed = 0;
  private results: { name: string; passed: boolean; error?: string }[] = [];

  async run(name: string, testFn: () => Promise<void>): Promise<void> {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🧪 TEST: ${name}`);
    console.log("=".repeat(60));

    try {
      await testFn();
      this.passed++;
      this.results.push({ name, passed: true });
      console.log(`\n✅ PASSED: ${name}`);
    } catch (error) {
      this.failed++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.results.push({ name, passed: false, error: errorMsg });
      console.error(`\n❌ FAILED: ${name}`);
      console.error(`   Error: ${errorMsg}`);
    }
  }

  summary(): void {
    console.log(`\n${"=".repeat(60)}`);
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total: ${this.passed + this.failed}`);
    console.log(`Passed: ${this.passed} ✅`);
    console.log(`Failed: ${this.failed} ❌`);

    if (this.failed > 0) {
      console.log("\nFailed tests:");
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => console.log(`  - ${r.name}: ${r.error}`));
    }

    console.log("=".repeat(60));
  }

  get hasFailures(): boolean {
    return this.failed > 0;
  }
}

/**
 * Formats a date for the pay() function
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Creates a date in the early bird period (before 2026-01-10)
 */
export function earlyBirdDate(): string {
  return new Date("2026-01-05T12:00:00Z").toISOString();
}

/**
 * Creates a date after early bird period (after 2026-01-10)
 */
export function regularDate(): string {
  return new Date("2026-01-20T12:00:00Z").toISOString();
}

/**
 * Creates a test individual with specific type (for testing non-individual types)
 */
export async function createTestAttendee(
  name: string,
  paymentMethod: string,
  type: string,
  paid: boolean = false,
  customEmail?: string
): Promise<TestAttendee> {
  const email =
    customEmail ||
    `${TEST_PREFIX}${name
      .toLowerCase()
      .replace(/\s/g, "_")}${TEST_EMAIL_DOMAIN}`;
  const phone = `010${Math.floor(10000000 + Math.random() * 90000000)}`;

  const result = await sql`
    INSERT INTO attendees (full_name, email, phone, type, payment_method, paid)
    VALUES (${name}, ${email}, ${phone}, ${type}, ${paymentMethod}, ${paid})
    RETURNING id, full_name, email, phone, type, payment_method, paid, uuid, sent
  `;

  return result.rows[0] as TestAttendee;
}

/**
 * Creates an incomplete group (less than 4 members) - for edge case testing
 */
export async function createIncompleteGroup(
  groupName: string,
  paymentMethod: string,
  memberCount: number
): Promise<{ members: TestAttendee[] }> {
  const members: TestAttendee[] = [];

  for (let i = 1; i <= memberCount; i++) {
    const name = `${groupName} Member ${i}`;
    const email = `${TEST_PREFIX}${groupName
      .toLowerCase()
      .replace(/\s/g, "_")}_m${i}${TEST_EMAIL_DOMAIN}`;
    const phone = `010${Math.floor(10000000 + Math.random() * 90000000)}`;

    const result = await sql`
      INSERT INTO attendees (full_name, email, phone, type, payment_method, paid)
      VALUES (${name}, ${email}, ${phone}, 'group', ${paymentMethod}, ${false})
      RETURNING id, full_name, email, phone, type, payment_method, paid, uuid, sent
    `;

    members.push(result.rows[0] as TestAttendee);
  }

  // Only create group entry if we have exactly 4 members
  // This simulates a corrupted/incomplete group

  return { members };
}

/**
 * Gets all attendees by payment method (useful for verifying test state)
 */
export async function getAttendeesByPaymentMethod(
  paymentMethod: string
): Promise<TestAttendee[]> {
  const result = await sql`
    SELECT id, full_name, email, phone, type, payment_method, paid, uuid, sent
    FROM attendees WHERE payment_method = ${paymentMethod}
  `;
  return result.rows as TestAttendee[];
}

/**
 * Gets all pay_backup entries for a stream pattern
 */
export async function getAllPayBackups(
  streamPattern: string
): Promise<{ stream: string; incurred: number; recieved: number }[]> {
  const result = await sql`
    SELECT stream, incurred, recieved 
    FROM pay_backup 
    WHERE stream LIKE ${`%${streamPattern}%`}
    ORDER BY recieved_at DESC
  `;
  return result.rows as {
    stream: string;
    incurred: number;
    recieved: number;
  }[];
}
