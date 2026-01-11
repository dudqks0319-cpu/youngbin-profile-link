import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  profiles, 
  InsertProfile,
  links,
  InsertLink,
  linkClicks,
  InsertLinkClick,
  carouselImages,
  InsertCarouselImage,
  products,
  InsertProduct,
  subscribers,
  InsertSubscriber
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Profile queries
export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertProfile(profile: InsertProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getProfileByUserId(profile.userId);
  
  if (existing) {
    await db.update(profiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(profiles.userId, profile.userId));
    return { ...existing, ...profile };
  } else {
    await db.insert(profiles).values(profile);
    return profile;
  }
}

// Link queries
export async function getLinksByUserId(userId: number, activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = activeOnly 
    ? and(eq(links.userId, userId), eq(links.isActive, true))
    : eq(links.userId, userId);
  
  return await db.select().from(links)
    .where(conditions)
    .orderBy(desc(links.isPriority), links.sortOrder);
}

export async function getLinkById(linkId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(links).where(eq(links.id, linkId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLink(link: InsertLink) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(links).values(link);
  return result;
}

export async function updateLink(linkId: number, updates: Partial<InsertLink>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(links)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(links.id, linkId));
}

export async function deleteLink(linkId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(links).where(eq(links.id, linkId));
}

// Link click tracking
export async function trackLinkClick(click: InsertLinkClick) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(linkClicks).values(click);
}

export async function getLinkClickStats(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      linkId: links.id,
      linkTitle: links.title,
      clickCount: sql<number>`COUNT(${linkClicks.id})`.as('clickCount'),
    })
    .from(links)
    .leftJoin(linkClicks, eq(links.id, linkClicks.linkId))
    .where(eq(links.userId, userId))
    .groupBy(links.id, links.title);
  
  return result;
}

// Carousel queries
export async function getCarouselImagesByUserId(userId: number, activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = activeOnly 
    ? and(eq(carouselImages.userId, userId), eq(carouselImages.isActive, true))
    : eq(carouselImages.userId, userId);
  
  return await db.select().from(carouselImages)
    .where(conditions)
    .orderBy(carouselImages.sortOrder);
}

export async function createCarouselImage(image: InsertCarouselImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(carouselImages).values(image);
}

export async function updateCarouselImage(imageId: number, updates: Partial<InsertCarouselImage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(carouselImages)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(carouselImages.id, imageId));
}

export async function deleteCarouselImage(imageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(carouselImages).where(eq(carouselImages.id, imageId));
}

// Product queries
export async function getProductsByUserId(userId: number, activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = activeOnly 
    ? and(eq(products.userId, userId), eq(products.isActive, true))
    : eq(products.userId, userId);
  
  return await db.select().from(products)
    .where(conditions)
    .orderBy(products.sortOrder);
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(products).values(product);
}

export async function updateProduct(productId: number, updates: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(products)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(products.id, productId));
}

export async function deleteProduct(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(products).where(eq(products.id, productId));
}

// Subscriber queries
export async function getAllSubscribers(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = activeOnly ? eq(subscribers.isActive, true) : undefined;
  
  return await db.select().from(subscribers)
    .where(conditions)
    .orderBy(desc(subscribers.subscribedAt));
}

export async function createSubscriber(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.insert(subscribers).values({ email });
    return { success: true };
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error("이미 구독 중인 이메일입니다.");
    }
    throw error;
  }
}
