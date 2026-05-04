import "server-only";
import { sanityClient, cmsEnabled } from "./client";

export interface CmsHero {
  eyebrow?: string;
  headline: string;
  subline?: string;
  primaryCta?: { label?: string; href?: string };
  secondaryCta?: { label?: string; href?: string };
}

export interface CmsTestimonial {
  _id: string;
  name: string;
  area?: string;
  rating: number;
  quote: string;
}

export interface CmsFaqEntry {
  _id: string;
  question: string;
  // Sanity portable text — rendered with @portabletext/react when needed.
  // For simple display we extract plain text via the helper below.
  answer: unknown;
  category: string;
}

const HERO_QUERY = `*[_type == "hero"][0]{eyebrow, headline, subline, primaryCta, secondaryCta}`;
const TESTIMONIALS_QUERY = `*[_type == "testimonial"] | order(order asc, _createdAt desc){_id, name, area, rating, quote}`;
const FAQ_QUERY = `*[_type == "faq"] | order(category asc, order asc){_id, question, answer, category}`;

export async function fetchCmsHero(): Promise<CmsHero | null> {
  if (!cmsEnabled || !sanityClient) return null;
  try {
    return (await sanityClient.fetch<CmsHero | null>(HERO_QUERY, {}, { next: { revalidate: 60 } })) ?? null;
  } catch (err) {
    console.error("[cms.hero] failed:", (err as Error).message);
    return null;
  }
}

export async function fetchCmsTestimonials(): Promise<CmsTestimonial[]> {
  if (!cmsEnabled || !sanityClient) return [];
  try {
    return (await sanityClient.fetch<CmsTestimonial[]>(TESTIMONIALS_QUERY, {}, { next: { revalidate: 60 } })) ?? [];
  } catch (err) {
    console.error("[cms.testimonials] failed:", (err as Error).message);
    return [];
  }
}

export async function fetchCmsFaqs(): Promise<CmsFaqEntry[]> {
  if (!cmsEnabled || !sanityClient) return [];
  try {
    return (await sanityClient.fetch<CmsFaqEntry[]>(FAQ_QUERY, {}, { next: { revalidate: 60 } })) ?? [];
  } catch (err) {
    console.error("[cms.faqs] failed:", (err as Error).message);
    return [];
  }
}
