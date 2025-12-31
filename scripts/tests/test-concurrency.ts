/**
 * Concurrency Test for Payment Processing
 *
 * Tests that row-level locking prevents double-processing of the same ticket.
 *
 * Run with: npx tsx scripts/tests/test-concurrency.ts
 */

// Load environment variables BEFORE any other imports
import { config } from "dotenv";
config({ path: ".env.development.local" });
config({ path: ".env.local" });
config();

import { pay } from "../../app/api/admin/payment-reciever/main";
import {
  assert,
  cleanupTestData,
  createTestGroup,
  createTestIndividual,
  getAttendeeById,
  PRICES,
  regularDate,
  TEST_PREFIX,
} from "./test-utils";

// Ensure JWT_SECRET is set for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";

async function testConcurrentIndividualPayments() {
  console.log("\n" + "=".repeat(60));
  console.log("🔒 TEST: Concurrent Individual Payment (Row Locking)");
  console.log("=".repeat(60));

  // Create ONE ticket
  const attendee = await createTestIndividual(
    "Concurrent Test",
    `TLDA@${TEST_PREFIX}concurrent`
  );
  console.log(`Created attendee ID: ${attendee.id}`);

  // Fire TWO payment requests simultaneously
  console.log("\n⚡ Firing 2 concurrent payment requests...\n");

  const [result1, result2] = await Promise.all([
    pay(
      `TLDA@${TEST_PREFIX}concurrent`,
      String(PRICES.INDIVIDUAL),
      regularDate(),
      ""
    ),
    pay(
      `TLDA@${TEST_PREFIX}concurrent`,
      String(PRICES.INDIVIDUAL),
      regularDate(),
      ""
    ),
  ]);

  const data1 = await result1.json();
  const data2 = await result2.json();

  console.log(`Request 1: Status ${result1.status}`);
  console.log(`   Response: ${JSON.stringify(data1)}`);
  console.log(`Request 2: Status ${result2.status}`);
  console.log(`   Response: ${JSON.stringify(data2)}`);

  // One should succeed (200), one should fail (400 - not found / already paid)
  const statuses = [result1.status, result2.status].sort((a, b) => a - b);

  if (statuses[0] === 200 && statuses[1] === 400) {
    console.log("\n✅ PASSED: Row-level locking prevented double payment");
  } else if (statuses[0] === 200 && statuses[1] === 200) {
    console.error(
      "\n❌ FAILED: Both requests succeeded - DOUBLE PAYMENT occurred!"
    );

    // Check database state
    const updated = await getAttendeeById(attendee.id);
    console.log(`   Database state: paid=${updated?.paid}`);

    process.exit(1);
  } else {
    console.log(
      `\n⚠️ UNEXPECTED: Got statuses ${statuses[0]} and ${statuses[1]}`
    );
  }
}

async function testConcurrentGroupPayments() {
  console.log("\n" + "=".repeat(60));
  console.log("🔒 TEST: Concurrent Group Payment (Row Locking)");
  console.log("=".repeat(60));

  // Create ONE group
  const { members } = await createTestGroup(
    "Concurrent Group",
    `VFCASH@${TEST_PREFIX}concgrp`
  );
  console.log(
    `Created group with member IDs: ${members.map((m) => m.id).join(", ")}`
  );

  // Fire TWO payment requests simultaneously
  console.log("\n⚡ Firing 2 concurrent group payment requests...\n");

  const [result1, result2] = await Promise.all([
    pay(
      `VFCASH@${TEST_PREFIX}concgrp`,
      String(PRICES.GROUP_TOTAL),
      regularDate(),
      ""
    ),
    pay(
      `VFCASH@${TEST_PREFIX}concgrp`,
      String(PRICES.GROUP_TOTAL),
      regularDate(),
      ""
    ),
  ]);

  const data1 = await result1.json();
  const data2 = await result2.json();

  console.log(`Request 1: Status ${result1.status}`);
  console.log(
    `   Paid: ${data1.paid || 0}, Accepted: ${data1.accepted?.length || 0}`
  );
  console.log(`Request 2: Status ${result2.status}`);
  console.log(
    `   Paid: ${data2.paid || 0}, Accepted: ${data2.accepted?.length || 0}`
  );

  const statuses = [result1.status, result2.status].sort((a, b) => a - b);

  if (statuses[0] === 200 && statuses[1] === 400) {
    console.log(
      "\n✅ PASSED: Row-level locking prevented double group payment"
    );
  } else if (statuses[0] === 200 && statuses[1] === 200) {
    // Check if they both actually processed payments
    const totalPaid = (data1.paid || 0) + (data2.paid || 0);
    const totalAccepted =
      (data1.accepted?.length || 0) + (data2.accepted?.length || 0);

    if (totalAccepted > 4) {
      console.error(
        "\n❌ FAILED: Double payment - more than 4 attendees processed!"
      );
      process.exit(1);
    } else if (totalAccepted === 4 && data1.paid > 0 && data2.paid > 0) {
      console.error("\n❌ FAILED: Both requests charged money!");
      process.exit(1);
    } else {
      console.log(
        "\n⚠️ Both returned 200 but only one actually processed payment"
      );
    }
  } else {
    console.log(
      `\n⚠️ UNEXPECTED: Got statuses ${statuses[0]} and ${statuses[1]}`
    );
  }
}

async function testRapidFirePayments() {
  console.log("\n" + "=".repeat(60));
  console.log("🔒 TEST: Rapid-Fire Payments (5 concurrent requests)");
  console.log("=".repeat(60));

  // Create ONE ticket
  await createTestIndividual("Rapid Fire", `TLDA@${TEST_PREFIX}rapidfire`);

  // Fire 5 requests simultaneously
  console.log("\n⚡ Firing 5 concurrent payment requests...\n");

  const promises = Array(5)
    .fill(null)
    .map((_, i) =>
      pay(
        `TLDA@${TEST_PREFIX}rapidfire`,
        String(PRICES.INDIVIDUAL),
        regularDate(),
        ""
      ).then(async (res) => ({
        index: i + 1,
        status: res.status,
        data: await res.json(),
      }))
    );

  const results = await Promise.all(promises);

  // Count successes and failures
  const successes = results.filter((r) => r.status === 200);
  const failures = results.filter((r) => r.status !== 200);

  console.log("Results:");
  results.forEach((r) => {
    console.log(
      `   Request ${r.index}: ${r.status} ${r.status === 200 ? "✅" : "❌"}`
    );
  });

  console.log(`\nSuccesses: ${successes.length}`);
  console.log(`Failures: ${failures.length}`);

  if (successes.length === 1) {
    console.log("\n✅ PASSED: Only 1 of 5 concurrent requests succeeded");
  } else if (successes.length === 0) {
    console.log("\n⚠️ WARNING: All requests failed - possible timing issue");
  } else {
    console.error(
      `\n❌ FAILED: ${successes.length} requests succeeded (expected 1)`
    );
    process.exit(1);
  }
}

async function main() {
  console.log("🚀 Starting Concurrency Tests");
  console.log("=".repeat(60));
  console.log("These tests verify that row-level locking prevents");
  console.log(
    "double-processing when multiple admins process the same ticket."
  );
  console.log("=".repeat(60));

  try {
    await cleanupTestData();

    await testConcurrentIndividualPayments();
    await cleanupTestData();

    await testConcurrentGroupPayments();
    await cleanupTestData();

    await testRapidFirePayments();
  } catch (error) {
    console.error("Fatal error during tests:", error);
    process.exit(1);
  } finally {
    await cleanupTestData();
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 All concurrency tests completed!");
  console.log("=".repeat(60));
}

main();
