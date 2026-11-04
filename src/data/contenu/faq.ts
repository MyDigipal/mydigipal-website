/**
 * La FAQ de la page GEO / AEO (adresse ai-content, 04/11/2026). Les trois premières questions
 * portent sur le GEO ; les suivantes sont celles de notre offre blog. Elle reprend les « questions
 * à poser à une autre offre » de notre offre blog, rendues génériques. Les montants viennent de la
 * grille du calculateur (`calculator/data/ai-content-services.ts`) : une FAQ ne contredit jamais
 * le devis. Euros sur la page française, dollars sur l'anglaise, comme Creative design.
 */
import { aiContentServices } from '@/components/calculator/data/ai-content-services';
import { money } from '@/components/calculator-v6/engine';

type Lang = 'fr' | 'en';

/** Les deux premiers niveaux de l'offre blog : 4 articles, puis 8 articles par mois. */
export function prixBlog(lang: Lang): { quatre: string; huit: string } {
  const blog = aiContentServices.find((s) => s.id === 'ai-content-blog');
  const niveaux = blog?.levels ?? [];
  const dv = lang === 'fr' ? 'EUR' : 'USD';
  const p = (i: number) => {
    const v = niveaux[i]?.price;
    if (typeof v !== 'number') throw new Error(`ai-content-blog : niveau ${i} sans prix`);
    return money(v, dv, lang);
  };
  return { quatre: p(0), huit: p(1) };
}

export function faqContenu(lang: Lang) {
  const { quatre, huit } = prixBlog(lang);
  if (lang === 'fr') {
    return {
      title: 'Les questions à poser avant de choisir',
      subtitle: 'Deux offres peuvent avoir le même prix et ne rien avoir en commun. Voici nos réponses.',
      faqs: [
        { question: 'Le GEO et l’AEO, c’est quoi ?', answer: 'Le GEO (Generative Engine Optimization) et l’AEO (Answer Engine Optimization) désignent la même idée : être la source que ChatGPT, Claude, Perplexity ou les résumés de Google citent quand vos clients leur posent une question. Cela passe par des contenus qui répondent clairement, et par un site que ces outils peuvent lire.' },
        { question: 'Pouvez-vous garantir que ChatGPT nous citera ?', answer: 'Non, et personne ne le peut : aucune agence ne décide de ce qu’une IA répond. Nous mettons toutes les chances de votre côté, avec des réponses dès la première phrase, des faits sourcés, des FAQ balisées et un site ouvert à leurs robots, puis nous mesurons le trafic qui en vient.' },
        { question: 'Le SEO classique sert-il encore ?', answer: 'Oui. Les assistants IA s’appuient en grande partie sur les pages qui se classent déjà bien dans les moteurs de recherche. Un bon référencement et le GEO vont ensemble : nos articles visent les deux.' },
        { question: 'Combien ça coûte ?', answer: `${quatre} par mois pour quatre articles, de la recherche des sujets à la publication, vidéo et vignette comprises. ${huit} par mois pour huit articles. Le calculateur plus haut chiffre votre cas en une minute.` },
        { question: 'Qui choisit les sujets, et à partir de quoi ?', answer: 'Nous les proposons à partir d’Ahrefs, de la Search Console de votre site, de l’actualité de votre marché et des réponses des IA. Vous choisissez, d’un clic dans le Hub ; les autres restent en réserve pour les mois suivants.' },
        { question: 'L’IA écrit-elle seule ?', answer: 'Non. Nos outils d’IA nous font gagner des heures : ils croisent les sources, écrivent à partir du dossier de faits et montent la vidéo. L’équipe vérifie chaque fait, chaque lien et vos règles de rédaction, puis relit l’article avant de vous l’envoyer.' },
        { question: 'Les faits sont-ils vérifiés et sourcés ?', answer: 'Oui. Chaque article a son dossier de faits, chaque chiffre est rapproché de sa source, et les sources sont citées en fin d’article. Rien n’est inventé, ni chiffre ni citation.' },
        { question: 'Combien de relectures, et où ?', answer: 'Notre relecture d’abord, puis un tour de votre part dans le Hub, directement sur le texte. Un seul tour suffit, parce que le travail en amont est fait. Chacune de vos remarques devient une règle pour les articles suivants.' },
        { question: 'Qui publie ?', answer: 'Nous, avec un accès à votre site : mise en page, vidéo, vignette, liens, titre, description et données structurées. Vous n’avez rien à copier ni à coller.' },
        { question: 'Les résultats sont-ils suivis ?', answer: 'Oui : positions et clics de chaque article, dans Ahrefs et la Search Console. Ce suivi oriente les sujets du mois suivant.' },
        { question: 'Écrivez-vous en anglais ?', answer: 'Oui, en français et en anglais, chaque langue écrite pour son marché et non traduite mot à mot.' },
      ],
    };
  }
  return {
    title: 'The questions to ask before you choose',
    subtitle: 'Two offers can cost the same and have nothing in common. Here are our answers.',
    faqs: [
      { question: 'What are GEO and AEO?', answer: 'GEO (Generative Engine Optimization) and AEO (Answer Engine Optimization) are two names for the same idea: being the source that ChatGPT, Claude, Perplexity or Google’s AI summaries cite when your customers ask them a question. It takes content that answers clearly, and a site those tools can read.' },
      { question: 'Can you guarantee ChatGPT will cite us?', answer: 'No, and nobody can: no agency decides what an AI answers. We put the odds on your side, with answers in the first sentence, sourced facts, marked-up FAQs and a site open to their crawlers, then we measure the traffic that comes from them.' },
      { question: 'Does classic SEO still matter?', answer: 'Yes. AI assistants lean heavily on pages that already rank well in search engines. Good SEO and GEO go together, and our articles aim for both.' },
      { question: 'How much does it cost?', answer: `${quatre} a month for four articles, from topic research to publishing, video and thumbnail included. ${huit} a month for eight articles. The calculator above prices your case in a minute.` },
      { question: 'Who picks the topics, and from what?', answer: 'We suggest them from Ahrefs, your site’s Search Console, the news in your market and what AI answers say. You choose, in one click in the Hub; the others are saved for the following months.' },
      { question: 'Does AI write on its own?', answer: 'No. Our AI tools save us hours: they cross the sources, write from the fact file and make the video. The team checks every fact, every link and your writing rules, then reads the article before sending it to you.' },
      { question: 'Are the facts checked and sourced?', answer: 'Yes. Each article has its fact file, every number is matched to its source, and the sources are listed at the end of the article. Nothing is made up, no number and no quote.' },
      { question: 'How many reviews, and where?', answer: 'Our review first, then one round from you in the Hub, right on the text. One round is enough because the groundwork is done. Each of your notes becomes a rule for the articles that follow.' },
      { question: 'Who publishes?', answer: 'We do, with access to your site: layout, video, thumbnail, links, title, description and structured data. Nothing for you to copy and paste.' },
      { question: 'Are the results tracked?', answer: 'Yes: rankings and clicks for every article, in Ahrefs and Search Console. That tracking shapes the next month’s topics.' },
      { question: 'Do you write in French too?', answer: 'Yes, in English and French, each language written for its own market rather than translated word for word.' },
    ],
  };
}
