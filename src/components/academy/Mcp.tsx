import { useCallback, useEffect, useRef, useState } from 'react';
import { jour30Copy } from './copy';
import type { Locale } from './data';
import { ease, onEnter, pointeurGrossier, probeClock, reducedMotion } from './motion';

/**
 * Le MCP, expliqué : le moment fort de la page, et la seule section didactique.
 *
 * C'est la deuxième FEUILLE CLAIRE de la page (Paul, 25/08 : « rajouter
 * quelques trucs en fond blanc »), avec « qui enseigne » : la démonstration
 * reste dans la nuit du produit parce qu'elle montre ses vrais écrans, le
 * schéma, lui, se lit sur papier.
 *
 * D'abord ce qu'on saura construire en sortant (Paul, 25/08 : la section
 * arrivait sans introduction), puis la prise : trois assistants en haut, votre
 * serveur au milieu, huit outils en bas. Les fils du haut se tirent un par un,
 * la prise s'allume, les fils du bas partent. Au survol d'un outil, son fil
 * passe à l'or, une impulsion le parcourt, et le panneau joue ce que ça donne :
 * vous demandez, le serveur fait, voilà le résultat, en trois temps qui
 * apparaissent l'un après l'autre. Les droits déclarés ne sont plus sous le
 * nom de l'outil, ils sont dans le panneau.
 *
 * Les tracés ne sont pas dessinés à la main : ils sont RECALCULÉS depuis la
 * position réelle des nœuds. ÉTAT DE REPOS = TRACÉ VISIBLE : on ne cache un
 * fil qu'à l'instant où son tirage commence ; si le tirage n'aboutit pas en
 * 3,5 s, la figure se montre entière.
 */
const NS = 'http://www.w3.org/2000/svg';
/** Les fils sur la feuille claire : lin foncé au repos, or lisible quand le fil est actif. */
const FIL = '#d3ccbe';
const FIL_OR = '#a8862f';

export default function Mcp({ locale }: { locale: Locale }) {
  const c = jour30Copy(locale).mcp;
  const [actif, setActif] = useState(c.outils[0].id);
  // « Survolez un outil » est un ordre impossible au doigt. Le verbe se relève
  // dans un effet : le serveur ne sait pas avec quoi on désignera.
  const [tactile, setTactile] = useState(false);
  useEffect(() => setTactile(pointeurGrossier()), []);
  const [visibles, setVisibles] = useState(3);
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const hub = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLSpanElement>(null);
  const paths = useRef<SVGPathElement[]>([]);
  const wired = useRef(false);
  const reduce = useRef(false);
  const dot = useRef<SVGCircleElement | null>(null);
  const pulseRaf = useRef(0);
  const actifRef = useRef(actif);
  actifRef.current = actif;
  const premier = useRef(true);

  const outil = c.outils.find((o) => o.id === actif) || c.outils[0];

  const highlight = useCallback((id: string) => {
    paths.current.forEach((p) => {
      const on = p.dataset.tool === id;
      p.setAttribute('stroke', on ? FIL_OR : FIL);
      p.setAttribute('stroke-width', on ? '1.75' : '1.25');
    });
  }, []);

  /** Une impulsion parcourt le fil de l'outil actif : elle dit le sens de la circulation. */
  const pulse = useCallback(() => {
    cancelAnimationFrame(pulseRaf.current);
    dot.current?.remove();
    dot.current = null;
    if (reduce.current || !svg.current) return;
    const path = paths.current.find((p) => p.dataset.tool === actifRef.current);
    if (!path) return;
    const len = path.getTotalLength();
    const d = document.createElementNS(NS, 'circle');
    d.setAttribute('r', '3');
    d.setAttribute('fill', FIL_OR);
    svg.current.appendChild(d);
    dot.current = d;
    const cycle = 1500 + 500;
    let t0 = 0;
    const step = (now: number) => {
      if (!t0) t0 = now;
      const raw = ((now - t0) % cycle) / 1500;
      const t = raw > 1 ? 1 : ease.power1InOut(raw);
      const q = path.getPointAtLength(len * t);
      d.setAttribute('cx', String(q.x));
      d.setAttribute('cy', String(q.y));
      d.setAttribute('opacity', raw > 1 ? '0' : t < 0.1 ? String(t * 10) : t > 0.9 ? String((1 - t) * 10) : '1');
      pulseRaf.current = requestAnimationFrame(step);
    };
    pulseRaf.current = requestAnimationFrame(step);
  }, []);

  const wire = useCallback(() => {
    const st = stage.current;
    const s = svg.current;
    const h = hub.current;
    if (!st || !s || !h) return;
    const box = st.getBoundingClientRect();
    const pt = (el: Element, edge: 'top' | 'bottom') => {
      const r = el.getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: (edge === 'top' ? r.top : r.bottom) - box.top };
    };
    const hubTop = pt(h, 'top');
    const hubBot = pt(h, 'bottom');
    const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      const m = Math.abs(b.y - a.y) * 0.45;
      return `M ${a.x} ${a.y} C ${a.x} ${a.y + m}, ${b.x} ${b.y - m}, ${b.x} ${b.y}`;
    };
    s.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    s.innerHTML = '';
    dot.current = null;
    paths.current = [];
    const add = (d: string, role: 'in' | 'out', id?: string) => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', FIL);
      p.setAttribute('stroke-width', '1.25');
      p.setAttribute('stroke-linecap', 'round');
      p.dataset.role = role;
      if (id) p.dataset.tool = id;
      s.appendChild(p);
      paths.current.push(p);
    };
    st.querySelectorAll('.j30-ai').forEach((el) => add(curve(pt(el, 'bottom'), hubTop), 'in'));
    st.querySelectorAll('.j30-tool').forEach((el, i) => add(curve(hubBot, pt(el, 'top')), 'out', c.outils[i]?.id));
    paths.current.forEach((p) => {
      p.style.strokeDasharray = String(p.getTotalLength());
      p.style.strokeDashoffset = '0';
    });
    highlight(actifRef.current);
    if (wired.current) pulse();
  }, [c.outils, highlight, pulse]);

  const showWires = useCallback(() => {
    paths.current.forEach((p) => {
      p.getAnimations().forEach((a) => a.cancel());
      p.style.strokeDashoffset = '0';
    });
    if (halo.current) halo.current.style.opacity = '0';
  }, []);

  /** Le branchement : le seul moment de la page où le mouvement EXPLIQUE au lieu d'accompagner. */
  const connect = useCallback(() => {
    if (wired.current) return;
    wired.current = true;
    if (reduce.current || !paths.current.length) {
      showWires();
      return;
    }
    const ins = paths.current.filter((p) => p.dataset.role === 'in');
    const outs = paths.current.filter((p) => p.dataset.role === 'out');
    paths.current.forEach((p) => (p.style.strokeDashoffset = String(p.getTotalLength())));
    const finDesEntrees = 700 + (ins.length - 1) * 120;
    const haloOn = finDesEntrees - 150;
    const sortiesA = haloOn + 220 + 500 - 550;
    const fin = sortiesA + 650 + (outs.length - 1) * 70;
    const trace = (p: SVGPathElement, duration: number, delay: number, easing: string) => {
      const len = p.getTotalLength();
      const a = p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration, delay, easing, fill: 'forwards' });
      a.onfinish = () => {
        p.style.strokeDashoffset = '0';
        a.cancel();
      };
    };
    ins.forEach((p, i) => trace(p, 700, i * 120, 'cubic-bezier(0.455, 0.03, 0.515, 0.955)'));
    if (halo.current) {
      halo.current.animate([{ opacity: 0 }, { opacity: 1, offset: 220 / 720 }, { opacity: 0 }], { duration: 720, delay: haloOn, fill: 'forwards' });
    }
    outs.forEach((p, i) => trace(p, 650, sortiesA + i * 70, 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'));
    const pulseTimer = setTimeout(pulse, fin);
    const guard = setTimeout(() => {
      if (paths.current.some((p) => parseFloat(p.style.strokeDashoffset || '0') > 0.5)) showWires();
    }, 3500);
    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(guard);
    };
  }, [pulse, showWires]);

  useEffect(() => {
    wire();
    const st = stage.current;
    let arrets: Array<() => void> = [];
    if (st && 'ResizeObserver' in window) {
      const ro = new ResizeObserver(() => wire());
      ro.observe(st);
      arrets.push(() => ro.disconnect());
    }
    if (document.fonts?.ready) document.fonts.ready.then(() => wire());
    probeClock((alive) => {
      reduce.current = !alive || reducedMotion();
      if (!st || reduce.current) return;
      arrets.push(
        onEnter(
          st,
          () => {
            const off = connect();
            if (off) arrets.push(off);
          },
          '-25%'
        )
      );
    });
    return () => {
      arrets.forEach((a) => a());
      arrets = [];
      cancelAnimationFrame(pulseRaf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Le panneau joue le flux en trois temps quand l'outil change. Au premier
  // rendu, tout est visible : l'état de repos est l'état visible.
  useEffect(() => {
    highlight(actif);
    if (wired.current) pulse();
    if (premier.current) {
      premier.current = false;
      return;
    }
    if (reduce.current) {
      setVisibles(3);
      return;
    }
    setVisibles(0);
    const t1 = setTimeout(() => setVisibles(1), 90);
    const t2 = setTimeout(() => setVisibles(2), 560);
    const t3 = setTimeout(() => setVisibles(3), 1120);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [actif, highlight, pulse]);

  const noeud = 'rounded-[12px] border px-4 py-3 text-center min-w-[104px]';
  const quiCouleur: Record<string, string> = { vous: 'text-encre', serveur: 'text-or-grave', resultat: 'text-sauge' };

  return (
    <section className="border-t border-lin bg-craie px-4 py-[84px] text-mine sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="m-0 max-w-[20ch] text-balance text-[clamp(28px,4.4vw,46px)] font-medium leading-[1.1] tracking-[-0.025em] text-encre">{c.intro.titre}</h2>
        <p className="mt-5 max-w-[60ch] text-[17px] leading-[1.65] text-mine">{c.intro.texte}</p>

        {/* Le titre « Un MCP, c'est une prise » et son chapeau vivaient ici. Ils
            redisaient l'introduction juste au-dessus, en moins bien : le schéma
            explique déjà ce qu'est une prise, et il l'explique mieux qu'un
            paragraphe (Paul, 29/08/2026). */}

        <div ref={stage} className="relative mt-12">
          <svg ref={svg} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" />

          <div className="relative flex flex-wrap justify-center gap-3">
            {c.assistants.map((a) => (
              <div key={a.nom} className={`j30-ai ${noeud} border-lin bg-papier px-[22px] py-3.5`}>
                <span className="block text-[16px] font-medium tracking-[-0.01em] text-encre">{a.nom}</span>
                <span className="mt-[3px] block font-ac-mono text-[10px] uppercase tracking-[0.14em] text-brume">{a.editeur}</span>
              </div>
            ))}
          </div>
          <p className="m-0 mt-3.5 text-center font-ac-mono text-[11px] text-brume">{c.memeServeur}</p>

          <div className="my-[70px] flex justify-center">
            <div ref={hub} className="relative max-w-[340px] rounded-carte border border-renard/60 bg-papier px-7 py-5 text-center">
              <span ref={halo} className="pointer-events-none absolute -inset-px rounded-carte border border-renard opacity-0" />
              <p className="m-0 font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-renard">{c.hub.kicker}</p>
              <p className="m-0 mt-[9px] text-[16px] leading-[1.45] text-encre">{c.hub.ligne}</p>
              <p className="m-0 mt-[9px] min-h-[2.9em] font-ac-mono text-[11px] leading-[1.5] text-brume">
                {premier.current ? c.hub.defaut(c.outils.length) : `${outil.label} · ${outil.droits}`}
              </p>
            </div>
          </div>

          <div className="relative flex flex-wrap justify-center gap-2.5">
            {c.outils.map((o) => {
              const on = o.id === actif;
              return (
                <button
                  key={o.id}
                  type="button"
                  className={`j30-tool ${noeud} cursor-pointer transition-[background,border-color,color] duration-[180ms] ${
                    on ? 'border-or-grave/60 bg-or/15 text-encre' : 'border-lin bg-papier text-mine hover:border-brume'
                  }`}
                  onMouseEnter={() => setActif(o.id)}
                  onFocus={() => setActif(o.id)}
                  onClick={() => setActif(o.id)}
                >
                  <span className="block text-[15px]">{o.label}</span>
                </button>
              );
            })}
          </div>
          <p className="m-0 mt-3 text-center font-ac-mono text-[10.5px] uppercase tracking-[0.14em] text-brume">{tactile ? c.touchez : c.survolez}</p>
        </div>

        {/* Le panneau : ce que ça donne, en trois temps. */}
        <div className="mt-[34px] grid grid-cols-[minmax(0,1fr)] gap-6 rounded-carte border border-lin bg-papier px-6 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:px-7">
          <div>
            <p className="m-0 font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-or-grave">{outil.label}</p>
            <p className="m-0 mt-2 text-[20px] font-medium leading-[1.25] text-encre">{outil.titre}</p>
            <p className="m-0 mt-3 max-w-[40ch] text-[14.5px] leading-[1.6] text-mine">{outil.corps}</p>
            <p className="m-0 mt-4 font-ac-mono text-[11px] text-brume">
              <span className="uppercase tracking-[0.12em]">{c.droits}</span> · {outil.droits}
            </p>
          </div>
          <ol className="m-0 grid list-none gap-3 border-t border-lin p-0 pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0">
            {outil.flux.map((e, i) => (
              <li
                key={`${outil.id}-${e.qui}`}
                className="grid grid-cols-[86px_1fr] items-baseline gap-3 transition-[opacity,transform] duration-300"
                style={{ opacity: i < visibles ? 1 : 0, transform: i < visibles ? 'none' : 'translateY(6px)' }}
              >
                <span className={`font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.12em] ${quiCouleur[e.qui] || 'text-brume'}`}>
                  {c.qui[e.qui as keyof typeof c.qui]}
                </span>
                <span className={`text-[14.5px] leading-[1.55] ${e.qui === 'resultat' ? 'text-encre' : 'text-mine'}`}>{e.texte}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="m-0 mt-8 max-w-[60ch] text-[15px] leading-[1.65] text-brume">{c.pied}</p>
      </div>
    </section>
  );
}
