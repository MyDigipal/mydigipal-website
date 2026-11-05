import type { APIRoute } from 'astro';
import { catalogueIa } from '@/lib/devis/catalogue-ia';

/**
 * Le catalogue du calculateur, lu par le conseiller IA de l'application Academy (05/11/2026).
 * Services, questions et réponses permises, sans aucun prix : voir `lib/devis/catalogue-ia.ts`.
 */
export const GET: APIRoute = () =>
  new Response(JSON.stringify(catalogueIa()), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
