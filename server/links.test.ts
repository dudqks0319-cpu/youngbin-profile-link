import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("links", () => {
  it("should create a new link", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.links.create({
      title: "Test Link",
      url: "https://example.com",
      description: "Test description",
      isPriority: true,
      sortOrder: 1,
    });

    expect(result).toEqual({ success: true });
  });

  it("should list all links for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const links = await caller.links.listAll();
    expect(Array.isArray(links)).toBe(true);
  });

  it("should track link click", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a link
    await caller.links.create({
      title: "Trackable Link",
      url: "https://example.com/track",
      isPriority: false,
      sortOrder: 0,
    });

    const links = await caller.links.listAll();
    const testLink = links.find(l => l.title === "Trackable Link");

    if (testLink) {
      const result = await caller.links.trackClick({
        linkId: testLink.id,
        userAgent: "test-agent",
      });

      expect(result).toEqual({ success: true });
    }
  });

  it("should get link click statistics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.links.stats();
    expect(Array.isArray(stats)).toBe(true);
  });
});
