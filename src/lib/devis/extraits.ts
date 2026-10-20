/**
 * Les extraits du calculateur posés sur les pages (20/10/2026) : pour chaque page, les services
 * dont le devis commence, les réponses posées d'avance, et le nom de la page tel que Paul le lit
 * dans son mail (« Devis demandé depuis la page Dynamic Ads »).
 *
 * La clé est aussi l'origine du devis dans GA4 (`calculator_origin`). AI Training et Creative
 * design n'y sont pas : leurs simulateurs écrivent dans le même devis (`formation`, `creative`).
 */
import type { ServiceDomain } from '@/components/calculator/types';
import type { Answers } from '@/components/calculator-v6/engine';

export interface Extrait {
  focus: ServiceDomain[];
  preset?: Answers;
  /** Le nom du service dans le titre de la section (« Chiffrez Google Ads pour votre cas »). */
  nom: { fr: string; en: string };
  /** La page, pour le mail de Paul et la bulle Chat. */
  page: { fr: string; en: string };
}

export const EXTRAITS: Record<string, Extrait> = {
  'service:google-ads': { focus: ['google-ads'], nom: { fr: 'Google Ads', en: 'Google Ads' }, page: { fr: 'la page Google Ads', en: 'the Google Ads page' } },
  'service:paid-social': { focus: ['paid-social'], nom: { fr: 'vos campagnes sur les réseaux sociaux', en: 'your social media campaigns' }, page: { fr: 'la page Paid Social', en: 'the Paid Social page' } },
  'service:seo': { focus: ['seo'], nom: { fr: 'votre SEO', en: 'your SEO' }, page: { fr: 'la page SEO', en: 'the SEO page' } },
  'service:emailing': { focus: ['emailing'], nom: { fr: 'vos campagnes email', en: 'your email campaigns' }, page: { fr: 'la page Emailing', en: 'the Emailing page' } },
  'service:tracking-reporting': { focus: ['tracking-reporting'], nom: { fr: 'votre tracking', en: 'your tracking' }, page: { fr: 'la page Tracking et reporting', en: 'the Tracking and reporting page' } },
  'service:ai-solutions': { focus: ['ai-solutions'], nom: { fr: 'vos automatisations', en: 'your automations' }, page: { fr: 'la page AI Solutions', en: 'the AI Solutions page' } },
  'service:ai-content': { focus: ['ai-content'], nom: { fr: 'votre contenu IA', en: 'your AI content' }, page: { fr: 'la page AI Content', en: 'the AI Content page' } },
  // L'ABM se mène surtout sur LinkedIn : le devis part de la publicité sociale, LinkedIn coché.
  'service:b2b-abm': { focus: ['paid-social'], preset: { 'ps-channels': ['linkedin'] }, nom: { fr: 'votre programme ABM', en: 'your ABM programme' }, page: { fr: 'la page B2B et ABM', en: 'the B2B and ABM page' } },
  'automotive:google-ads': { focus: ['google-ads'], nom: { fr: 'Google Ads pour vos concessions', en: 'Google Ads for your dealerships' }, page: { fr: 'la page automobile Google Ads', en: 'the automotive Google Ads page' } },
  'automotive:paid-social': { focus: ['paid-social'], preset: { 'ps-channels': ['meta'] }, nom: { fr: 'vos campagnes Facebook et Instagram', en: 'your Facebook and Instagram campaigns' }, page: { fr: 'la page automobile Paid Social', en: 'the automotive Paid Social page' } },
  // Les Dynamic Ads : la publicité Meta, plus la mise en place du catalogue de véhicules.
  'automotive:dynamic-ads': { focus: ['paid-social'], preset: { 'ps-channels': ['meta'], 'social-feed-catalogue': 0 }, nom: { fr: 'vos Dynamic Ads', en: 'your Dynamic Ads' }, page: { fr: 'la page Dynamic Ads', en: 'the Dynamic Ads page' } }
};
