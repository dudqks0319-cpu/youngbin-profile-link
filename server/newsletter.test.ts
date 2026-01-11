import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("newsletter", () => {
  it("should allow public users to subscribe", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const testEmail = `test-${Date.now()}@example.com`;

    const result = await caller.newsletter.subscribe({
      email: testEmail,
    });

    expect(result).toEqual({ success: true });
  });

  it("should reject duplicate email subscriptions", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const testEmail = `duplicate-${Date.now()}@example.com`;

    // First subscription should succeed
    await caller.newsletter.subscribe({ email: testEmail });

    // Second subscription should fail
    await expect(
      caller.newsletter.subscribe({ email: testEmail })
    ).rejects.toThrow();
  });

  it("should validate email format", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.newsletter.subscribe({ email: "invalid-email" })
    ).rejects.toThrow();
  });
});
