/**
 * Standalone unit tests for the COD provider's lifecycle guards.
 * Run: pnpm exec medusa exec ./src/modules/cod-payment/__tests__/service.test.ts
 *
 * Direct method calls — no Medusa runtime needed.
 */
import CashOnDeliveryProviderService from "../service";

const TESTS: Array<[string, () => Promise<void>]> = [];
const test = (name: string, fn: () => Promise<void>) => TESTS.push([name, fn]);

const expect = <T>(actual: T) => ({
  toEqual(expected: T) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
  },
  toBe(expected: T) {
    if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
  },
  toThrow: async (matcher: RegExp | string) => {
    try {
      await (actual as unknown as () => Promise<unknown>)();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (typeof matcher === "string" ? !msg.includes(matcher) : !matcher.test(msg)) {
        throw new Error(`Threw, but message "${msg}" didn't match ${matcher}`);
      }
      return;
    }
    throw new Error(`Expected to throw matching ${matcher}, but did not throw`);
  },
});

const provider = new CashOnDeliveryProviderService(
  // logger / container (unused by COD methods)
  {} as never,
  {}
);

// ── initiatePayment ─────────────────────────────────────────────────────────
test("initiatePayment returns pending status with new id", async () => {
  const out = await provider.initiatePayment({
    amount: 1000,
    currency_code: "jmd",
    data: {},
    context: {} as never,
  } as never);
  expect(out.data?.status).toBe("pending");
  expect(typeof out.id).toBe("string");
  expect(((out.id as string).startsWith("cod_"))).toBe(true);
  expect(out.data?.captured_amount).toBe(0);
  expect(out.data?.refunded_amount).toBe(0);
});

test("initiatePayment reuses idempotency_key when provided", async () => {
  const a = await provider.initiatePayment({
    amount: 1000,
    currency_code: "jmd",
    data: {},
    context: { idempotency_key: "abc-123" } as never,
  } as never);
  const b = await provider.initiatePayment({
    amount: 1000,
    currency_code: "jmd",
    data: {},
    context: { idempotency_key: "abc-123" } as never,
  } as never);
  expect(a.id).toBe(b.id);
  expect(a.id).toBe("cod_abc-123");
});

// ── authorize → capture flow ────────────────────────────────────────────────
test("authorize moves status to authorized", async () => {
  const out = await provider.authorizePayment({
    data: { status: "pending", amount: 1000 },
    context: {} as never,
  } as never);
  expect(out.status).toBe("authorized");
  expect(out.data?.status).toBe("authorized");
});

test("capture works after authorize", async () => {
  const out = await provider.capturePayment({
    data: { status: "authorized", amount: 1000 },
    amount: 1000,
    context: {} as never,
  } as never);
  expect(out.data?.status).toBe("captured");
  expect(out.data?.captured_amount).toBe(1000);
});

// ── capture-before-authorize guard ──────────────────────────────────────────
test("capture rejects when state is pending (rider not dispatched yet)", async () => {
  await expect(() =>
    provider.capturePayment({
      data: { status: "pending", amount: 1000 },
      amount: 1000,
      context: {} as never,
    } as never)
  ).toThrow(/Cannot capture from state "pending"/);
});

test("capture is idempotent when already captured", async () => {
  // Re-running capture on an already-captured payment should not throw.
  const out = await provider.capturePayment({
    data: { status: "captured", amount: 1000, captured_amount: 1000 },
    amount: 1000,
    context: {} as never,
  } as never);
  expect(out.data?.status).toBe("captured");
});

// ── refund cap ──────────────────────────────────────────────────────────────
test("refund rejects non-positive amount", async () => {
  await expect(() =>
    provider.refundPayment({
      data: { captured_amount: 1000, refunded_amount: 0 },
      amount: 0,
      context: {} as never,
    } as never)
  ).toThrow(/must be positive/);
  await expect(() =>
    provider.refundPayment({
      data: { captured_amount: 1000, refunded_amount: 0 },
      amount: -50,
      context: {} as never,
    } as never)
  ).toThrow(/must be positive/);
});

test("refund rejects when cumulative > captured", async () => {
  await expect(() =>
    provider.refundPayment({
      data: { captured_amount: 1000, refunded_amount: 700 },
      amount: 400,
      context: {} as never,
    } as never)
  ).toThrow(/exceeds remaining captured amount/);
});

test("refund up to captured amount succeeds and marks canceled when fully refunded", async () => {
  const partial = await provider.refundPayment({
    data: { captured_amount: 1000, refunded_amount: 0 },
    amount: 300,
    context: {} as never,
  } as never);
  expect(partial.data?.refunded_amount).toBe(300);
  expect(partial.data?.status).toBe("captured");

  const full = await provider.refundPayment({
    data: { captured_amount: 1000, refunded_amount: 700 },
    amount: 300,
    context: {} as never,
  } as never);
  expect(full.data?.refunded_amount).toBe(1000);
  expect(full.data?.status).toBe("canceled");
});

// ── runner ──────────────────────────────────────────────────────────────────
const jestTest = (globalThis as unknown as { test?: (name: string, fn: () => Promise<void>) => void }).test;
if (jestTest) {
  for (const [name, fn] of TESTS) {
    jestTest(name, fn);
  }
}

export default async function runTests() {
  let passed = 0;
  let failed = 0;
  for (const [name, fn] of TESTS) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${name}: ${msg}`);
      failed++;
    }
  }
  console.log(`\n${passed}/${passed + failed} COD provider unit tests passed`);
  if (failed > 0) {
    throw new Error(`${failed} test(s) failed`);
  }
}
