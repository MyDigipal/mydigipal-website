/**
 * Les vidéos facecam de Paul, une par service et par notion, en français et en anglais.
 *
 * Scripts : docs/calculator/refonte-2026-09/scripts-videos.html
 * Tournage : Recordly, 16:9, 1080p, un fichier par clé et par langue (`seo-fr.mp4`, `seo-en.mp4`...).
 *
 * Tant qu'un `src` vaut null, l'emplacement s'affiche vide sur la page de test et
 * disparaît en production (voir la propriété `showEmptyVideoSlots` du calculateur).
 * Les durées sont celles estimées sur les scripts, à remplacer par les vraies.
 */
import type { Lang, Txt } from './engine';

export interface VideoSlot { title: Txt; seconds: Record<Lang, number>; src: Record<Lang, string | null>; poster?: Record<Lang, string | null> }

const slot = (fr: string, en: string, sFr: number, sEn: number): VideoSlot => ({
  title: { fr, en }, seconds: { fr: sFr, en: sEn }, src: { fr: null, en: null }
});

export const VIDEOS: Record<string, VideoSlot> = {
  'seo': slot('SEO', 'SEO', 64, 58),
  'google-ads': slot('Google Ads', 'Google Ads', 60, 57),
  'paid-social': slot('Paid Social', 'Paid Social', 60, 52),
  'ai-training': slot('Formation IA', 'AI Training', 56, 54),
  'emailing': slot('Email Marketing', 'Email Marketing', 54, 51),
  'ai-solutions': slot('Solutions IA', 'AI Solutions', 62, 61),
  'ai-content': slot('Contenu IA', 'AI Content', 58, 49),
  'tracking-reporting': slot('Tracking & Reporting', 'Tracking & Reporting', 59, 54),
  'media': slot('Budget média et honoraires', 'Media budget and fees', 32, 33),
  'trk-first': slot('Le tracking avant la publicité', 'Tracking before advertising', 23, 21),
  'duration': slot('La durée d’engagement', 'The commitment period', 25, 24)
};
