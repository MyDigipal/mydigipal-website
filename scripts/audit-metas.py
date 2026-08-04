"""Audit des <title> et meta description de toutes les pages generees.

Regles MyDigipal (CLAUDE.md) :
- title complet (suffixe " | MyDigipal" inclus) : 50-60 caracteres
- meta description : 145-160 caracteres

On lit le dist/ plutot que les sources : c'est ce que Google voit reellement,
suffixe et fallbacks compris.
"""
import re
import json
from pathlib import Path
from html import unescape

DIST = Path(r"C:\Users\paula\AppData\Roaming\Claude\.claude\projects\MyDigipal Website\dist")

RE_TITLE = re.compile(r"<title>(.*?)</title>", re.S)
RE_DESC = re.compile(r'<meta name="description" content="(.*?)"', re.S)
RE_CANON = re.compile(r'<link rel="canonical" href="(.*?)"')
RE_H1 = re.compile(r"<h1[^>]*>(.*?)</h1>", re.S)
RE_TAGS = re.compile(r"<[^>]+>")

TITLE_MIN, TITLE_MAX = 50, 60
DESC_MIN, DESC_MAX = 145, 160


def clean(s: str) -> str:
    return unescape(RE_TAGS.sub("", s)).strip()


def audit():
    rows = []
    for f in DIST.rglob("index.html"):
        html = f.read_text(encoding="utf-8", errors="ignore")
        url = "/" + str(f.relative_to(DIST).parent).replace("\\", "/")
        if url == "/.":
            url = "/"
        t = RE_TITLE.search(html)
        d = RE_DESC.search(html)
        h1 = RE_H1.search(html)
        title = clean(t.group(1)) if t else ""
        desc = clean(d.group(1)) if d else ""
        rows.append({
            "url": url,
            "title": title,
            "len_title": len(title),
            "desc": desc,
            "len_desc": len(desc),
            "h1": clean(h1.group(1))[:80] if h1 else "",
        })
    return rows


def classify(rows):
    problems = {
        "title_manquant": [],
        "title_trop_long": [],
        "title_trop_court": [],
        "desc_manquante": [],
        "desc_trop_longue": [],
        "desc_trop_courte": [],
        "title_duplique": [],
        "desc_dupliquee": [],
        "h1_absent": [],
    }
    seen_t, seen_d = {}, {}
    for r in rows:
        if not r["title"]:
            problems["title_manquant"].append(r)
        elif r["len_title"] > TITLE_MAX:
            problems["title_trop_long"].append(r)
        elif r["len_title"] < TITLE_MIN:
            problems["title_trop_court"].append(r)

        if not r["desc"]:
            problems["desc_manquante"].append(r)
        elif r["len_desc"] > DESC_MAX:
            problems["desc_trop_longue"].append(r)
        elif r["len_desc"] < DESC_MIN:
            problems["desc_trop_courte"].append(r)

        if not r["h1"]:
            problems["h1_absent"].append(r)

        seen_t.setdefault(r["title"], []).append(r["url"])
        seen_d.setdefault(r["desc"], []).append(r["url"])

    for t, urls in seen_t.items():
        if len(urls) > 1 and t:
            problems["title_duplique"].append({"valeur": t, "urls": urls})
    for d, urls in seen_d.items():
        if len(urls) > 1 and d:
            problems["desc_dupliquee"].append({"valeur": d, "urls": urls})
    return problems


if __name__ == "__main__":
    rows = audit()
    pb = classify(rows)
    out = Path(__file__).parent / "audit_metas.json"
    out.write_text(json.dumps({"rows": rows, "problems": pb}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(rows)} pages analysees\n")
    for k, v in pb.items():
        print(f"{k:20s} : {len(v)}")
    print(f"\ndetail -> {out}")
