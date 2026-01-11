import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Profile routes
  profile: router({
    get: publicProcedure.query(async () => {
      // Get the first admin user's profile
      const profile = await db.getProfileByUserId(1);
      return profile;
    }),
    
    update: protectedProcedure
      .input(z.object({
        displayName: z.string().min(1).max(100),
        bio: z.string().optional(),
        instagramHandle: z.string().optional(),
        profileImageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertProfile({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  // Link routes
  links: router({
    list: publicProcedure.query(async () => {
      // Get links for the first admin user (public view)
      return await db.getLinksByUserId(1, true);
    }),
    
    listAll: protectedProcedure.query(async ({ ctx }) => {
      return await db.getLinksByUserId(ctx.user.id, false);
    }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(200),
        url: z.string().url(),
        description: z.string().optional(),
        isPriority: z.boolean().default(false),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createLink({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(200).optional(),
        url: z.string().url().optional(),
        description: z.string().optional(),
        isPriority: z.boolean().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateLink(id, updates);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLink(input.id);
        return { success: true };
      }),
    
    trackClick: publicProcedure
      .input(z.object({
        linkId: z.number(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.trackLinkClick(input);
        return { success: true };
      }),
    
    stats: protectedProcedure.query(async ({ ctx }) => {
      return await db.getLinkClickStats(ctx.user.id);
    }),
  }),

  // Carousel routes
  carousel: router({
    list: publicProcedure.query(async () => {
      return await db.getCarouselImagesByUserId(1, true);
    }),
    
    listAll: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCarouselImagesByUserId(ctx.user.id, false);
    }),
    
    create: protectedProcedure
      .input(z.object({
        imageUrl: z.string().url(),
        title: z.string().max(200).optional(),
        linkUrl: z.string().url().optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createCarouselImage({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        imageUrl: z.string().url().optional(),
        title: z.string().max(200).optional(),
        linkUrl: z.string().url().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateCarouselImage(id, updates);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCarouselImage(input.id);
        return { success: true };
      }),
  }),

  // Product routes
  products: router({
    list: publicProcedure.query(async () => {
      return await db.getProductsByUserId(1, true);
    }),
    
    listAll: protectedProcedure.query(async ({ ctx }) => {
      return await db.getProductsByUserId(ctx.user.id, false);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        imageUrl: z.string().url(),
        affiliateUrl: z.string().url(),
        price: z.string().max(50).optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createProduct({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
        affiliateUrl: z.string().url().optional(),
        price: z.string().max(50).optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateProduct(id, updates);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // Newsletter routes
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        try {
          await db.createSubscriber(input.email);
          return { success: true };
        } catch (error: any) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
      }),
    
    list: protectedProcedure.query(async () => {
      return await db.getAllSubscribers(true);
    }),
  }),
});

export type AppRouter = typeof appRouter;
