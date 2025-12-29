/**
 * Payment Processing Benchmark
 *
 * Measures performance of the pay() function across various scenarios.
 *
 * Run with: npx tsx scripts/tests/benchmark-payments.ts
 */

// Load environment variables BEFORE any other imports
import { config } from "dotenv";
config({ path: ".env.development.local" });
config({ path: ".env.local" });
config();

import { sql } from "@vercel/postgres";
import { pay } from "../../app/api/admin/payment-reciever/main";
import {
  cleanupTestData,
  PRICES,
  regularDate,
  TEST_EMAIL_DOMAIN,
  TEST_PREFIX,
} from "./test-utils";

// Ensure JWT_SECRET is set for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
}

async function benchmark(
  name: string,
  iterations: number,
  setup: () => Promise<{ from: string; amount: string }>,
  teardown?: () => Promise<void>
): Promise<BenchmarkResult> {
  const times: number[] = [];

  console.log(`\n📊 Benchmarking: ${name}`);
  console.log(`   Iterations: ${iterations}`);

  for (let i = 0; i < iterations; i++) {
    // Setup for this iteration
    const { from, amount } = await setup();

    // Time the payment
    const start = performance.now();
    await pay(from, amount, regularDate(), "");
    const end = performance.now();

    times.push(end - start);

    // Progress indicator
    if ((i + 1) % 10 === 0 || i === iterations - 1) {
      process.stdout.write(`\r   Progress: ${i + 1}/${iterations}`);
    }

    // Optional teardown
    if (teardown) {
      await teardown();
    }
  }

  console.log(); // New line after progress

  const totalMs = times.reduce((a, b) => a + b, 0);
  const avgMs = totalMs / iterations;
  const minMs = Math.min(...times);
  const maxMs = Math.max(...times);

  const result: BenchmarkResult = {
    name,
    iterations,
    totalMs,
    avgMs,
    minMs,
    maxMs,
  };

  console.log(`   Total: ${totalMs.toFixed(0)}ms`);
  console.log(`   Avg: ${avgMs.toFixed(2)}ms`);
  console.log(`   Min: ${minMs.toFixed(2)}ms`);
  console.log(`   Max: ${maxMs.toFixed(2)}ms`);

  return result;
}

async function createBenchmarkIndividual(suffix: string): Promise<number> {
  const email = `${TEST_PREFIX}bench_${suffix}${TEST_EMAIL_DOMAIN}`;
  const result = await sql`
    INSERT INTO attendees (full_name, email, phone, type, payment_method, paid)
    VALUES (
      ${"Bench " + suffix}, 
      ${email}, 
      ${"010" + Math.floor(10000000 + Math.random() * 90000000)}, 
      'individual', 
      ${"TLDA@" + TEST_PREFIX + "bench"}, 
      false
    )
    RETURNING id
  `;
  return result.rows[0].id;
}

async function createBenchmarkGroup(suffix: string): Promise<number[]> {
  const ids: number[] = [];

  for (let i = 1; i <= 4; i++) {
    const email = `${TEST_PREFIX}bench_grp_${suffix}_m${i}${TEST_EMAIL_DOMAIN}`;
    const result = await sql`
      INSERT INTO attendees (full_name, email, phone, type, payment_method, paid)
      VALUES (
        ${"Bench Group " + suffix + " M" + i}, 
        ${email}, 
        ${"010" + Math.floor(10000000 + Math.random() * 90000000)}, 
        'group', 
        ${"VFCASH@" + TEST_PREFIX + "benchgrp"}, 
        false
      )
      RETURNING id
    `;
    ids.push(result.rows[0].id);
  }

  const grpid = 900000 + Math.floor(Math.random() * 100000);
  await sql`
    INSERT INTO groups (grpid, id1, id2, id3, id4)
    VALUES (${grpid}, ${ids[0]}, ${ids[1]}, ${ids[2]}, ${ids[3]})
  `;

  return ids;
}

async function main() {
  console.log("🚀 Payment Processing Benchmark");
  console.log("=".repeat(60));
  console.log("This benchmark measures the performance of the pay() function.");
  console.log("=".repeat(60));

  const results: BenchmarkResult[] = [];

  try {
    await cleanupTestData();

    // Benchmark 1: Individual ticket payments
    let counter = 0;
    results.push(
      await benchmark("Individual Ticket Payment", 30, async () => {
        counter++;
        await createBenchmarkIndividual(`ind_${counter}`);
        return {
          from: `TLDA@${TEST_PREFIX}bench`,
          amount: String(PRICES.INDIVIDUAL),
        };
      })
    );

    await cleanupTestData();

    // Benchmark 2: Group ticket payments
    counter = 0;
    results.push(
      await benchmark("Group Ticket Payment (4 members)", 20, async () => {
        counter++;
        await createBenchmarkGroup(`grp_${counter}`);
        return {
          from: `VFCASH@${TEST_PREFIX}benchgrp`,
          amount: String(PRICES.GROUP_TOTAL),
        };
      })
    );

    await cleanupTestData();

    // Benchmark 3: Multiple individuals (batch UUID generation)
    results.push(
      await benchmark(
        "Multiple Individuals (5 tickets)",
        15,
        async () => {
          for (let i = 0; i < 5; i++) {
            await createBenchmarkIndividual(`multi_${Date.now()}_${i}`);
          }
          return {
            from: `TLDA@${TEST_PREFIX}bench`,
            amount: String(PRICES.INDIVIDUAL * 5),
          };
        },
        async () => {
          await cleanupTestData();
        }
      )
    );

    // Benchmark 4: Payment not found (should be fast)
    results.push(
      await benchmark("Payment Not Found (fast path)", 50, async () => {
        return {
          from: `TLDA@${TEST_PREFIX}nonexistent_${Date.now()}`,
          amount: String(PRICES.INDIVIDUAL),
        };
      })
    );

    // Benchmark 5: Refund processing
    results.push(
      await benchmark("Refund Processing", 30, async () => {
        return {
          from: `TLDA@${TEST_PREFIX}refund_${Date.now()}`,
          amount: "-100",
        };
      })
    );
  } catch (error) {
    console.error("Fatal error during benchmark:", error);
    process.exit(1);
  } finally {
    await cleanupTestData();
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 BENCHMARK SUMMARY");
  console.log("=".repeat(60));
  console.log(
    "| Scenario                          | Avg (ms) | Min (ms) | Max (ms) |"
  );
  console.log(
    "|-----------------------------------|----------|----------|----------|"
  );

  for (const r of results) {
    const name = r.name.padEnd(35);
    const avg = r.avgMs.toFixed(1).padStart(8);
    const min = r.minMs.toFixed(1).padStart(8);
    const max = r.maxMs.toFixed(1).padStart(8);
    console.log(`| ${name} | ${avg} | ${min} | ${max} |`);
  }

  console.log("=".repeat(60));

  // Performance recommendations
  console.log("\n💡 Performance Notes:");

  const individualAvg = results.find((r) =>
    r.name.includes("Individual Ticket")
  )?.avgMs;
  const groupAvg = results.find((r) => r.name.includes("Group Ticket"))?.avgMs;

  if (individualAvg && individualAvg > 500) {
    console.log(
      "   ⚠️ Individual payments are slow (>500ms). Check DB connection."
    );
  }

  if (groupAvg && groupAvg > 1000) {
    console.log(
      "   ⚠️ Group payments are slow (>1000ms). Batch operations may need optimization."
    );
  }

  const notFoundAvg = results.find((r) => r.name.includes("Not Found"))?.avgMs;
  if (notFoundAvg && notFoundAvg < 100) {
    console.log("   ✅ Fast path for not-found is working well.");
  }

  console.log("\n🎉 Benchmark complete!");
}

main();
