#!/usr/bin/env python3
"""Generate blog thumbnails as HTML -> PNG via Playwright.

Clean, minimalist design per category - no AI-generated stock images.
Style: gradient background + title text + category icon + MyDigipal branding.

Usage:
    cd "MyDigipal Website"
    python scripts/generate-blog-thumbnails.py
    # Generates PNGs in public/images/Blog Thumbnails/generated/
"""

import sys
import os
import time
import json
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Erreur : pip install playwright && playwright install chromium")
    sys.exit(1)

# -- Paths --
PROJECT_ROOT = Path(__file__).parent.parent
CONTENT_DIR = PROJECT_ROOT / "src" / "content" / "blog"
OUTPUT_DIR = PROJECT_ROOT / "public" / "images" / "Blog Thumbnails" / "generated"
TEMPLATE_DIR = PROJECT_ROOT / "scripts"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# -- Category design tokens --
CATEGORIES = {
    "seo": {
        "label": "SEO",
        "gradient": "linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)",
        "accent": "#10b981",
        "icon": "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z",
    },
    "ai": {
        "label": "AI",
        "gradient": "linear-gradient(135deg, #0891b2 0%, #6366f1 50%, #8b5cf6 100%)",
        "accent": "#06b6d4",
        "icon": "M4 4h16v16H4zM9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
    },
    "paid-ads": {
        "label": "Paid Ads",
        "gradient": "linear-gradient(135deg, #d97706 0%, #ea580c 50%, #dc2626 100%)",
        "accent": "#f59e0b",
        "icon": "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    },
    "abm": {
        "label": "ABM",
        "gradient": "linear-gradient(135deg, #db2777 0%, #9333ea 50%, #6366f1 100%)",
        "accent": "#ec4899",
        "icon": "M12 12a10 10 0 100-8 10 10 0 000 8zM12 12a6 6 0 100-4 6 6 0 000 4zM12 12a2 2 0 100-1 2 2 0 000 1z",
    },
    "marketing-ops": {
        "label": "Marketing Ops",
        "gradient": "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)",
        "accent": "#8b5cf6",
        "icon": "M12 20V10M18 20V4M6 20v-4",
    },
    "strategy": {
        "label": "Strategy",
        "gradient": "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
        "accent": "#3b82f6",
        "icon": "M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2z",
    },
    "company-news": {
        "label": "News",
        "gradient": "linear-gradient(135deg, #334155 0%, #475569 50%, #64748b 100%)",
        "accent": "#64748b",
        "icon": "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2",
    },
}


def generate_thumbnail_html(title: str, category: str, slug: str) -> str:
    """Generate a visually rich HTML thumbnail - dark, layered, Framer-style."""
    cat = CATEGORIES.get(category, CATEGORIES["strategy"])
    accent = cat["accent"]

    # Truncate title if too long
    display_title = title if len(title) <= 80 else title[:77] + "..."

    # Use slug hash to create variation in decorative elements
    h = hash(slug) % 1000
    blob_x = 650 + (h % 200)
    blob_y = 50 + (h % 150)
    blob2_x = 800 + (h % 150)
    blob2_y = 300 + (h % 100)
    line_angle = 10 + (h % 30)
    ring_x = 750 + (h % 250)
    ring_y = 100 + (h % 200)

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

  * {{ margin: 0; padding: 0; box-sizing: border-box; }}

  .thumbnail {{
    width: 1200px;
    height: 630px;
    background: #0a0d1a;
    position: relative;
    overflow: hidden;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  }}

  /* Subtle noise texture */
  .thumbnail::after {{
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    opacity: 0.4;
    z-index: 1;
  }}

  /* Gradient blobs */
  .blob-1 {{
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: {accent};
    opacity: 0.08;
    filter: blur(100px);
    left: {blob_x}px;
    top: {blob_y}px;
  }}

  .blob-2 {{
    position: absolute;
    width: 350px;
    height: 350px;
    border-radius: 50%;
    background: {cat['gradient']};
    opacity: 0.12;
    filter: blur(80px);
    left: {blob2_x}px;
    top: {blob2_y}px;
  }}

  /* Decorative grid lines */
  .grid-overlay {{
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    z-index: 2;
  }}

  /* Decorative diagonal line */
  .diag-line {{
    position: absolute;
    width: 2px;
    height: 800px;
    background: linear-gradient(to bottom, transparent, {accent}22, transparent);
    top: -100px;
    right: 350px;
    transform: rotate({line_angle}deg);
    z-index: 2;
  }}

  .diag-line-2 {{
    position: absolute;
    width: 1px;
    height: 600px;
    background: linear-gradient(to bottom, transparent, {accent}15, transparent);
    top: -50px;
    right: 280px;
    transform: rotate({line_angle + 5}deg);
    z-index: 2;
  }}

  /* Decorative ring */
  .ring {{
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 1px solid {accent}18;
    left: {ring_x}px;
    top: {ring_y}px;
    z-index: 2;
  }}

  .ring-inner {{
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 1px solid {accent}10;
    left: {ring_x + 40}px;
    top: {ring_y + 40}px;
    z-index: 2;
  }}

  /* Small floating dots */
  .dot {{
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: {accent};
    z-index: 3;
  }}

  .dot-1 {{ left: 900px; top: 120px; opacity: 0.5; }}
  .dot-2 {{ left: 1050px; top: 280px; opacity: 0.3; }}
  .dot-3 {{ left: 780px; top: 450px; opacity: 0.4; }}
  .dot-4 {{ left: 1100px; top: 500px; opacity: 0.2; }}

  /* Glass card (decorative) */
  .glass-card {{
    position: absolute;
    right: 60px;
    top: 180px;
    width: 220px;
    padding: 20px;
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    z-index: 5;
  }}

  .glass-bar {{
    height: 6px;
    border-radius: 3px;
    margin-bottom: 8px;
    opacity: 0.6;
  }}

  .glass-bar-1 {{ width: 80%; background: {accent}; }}
  .glass-bar-2 {{ width: 55%; background: {accent}88; }}
  .glass-bar-3 {{ width: 70%; background: {accent}55; }}
  .glass-bar-4 {{ width: 40%; background: {accent}33; }}

  .glass-label {{
    color: rgba(255,255,255,0.3);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 12px;
  }}

  /* Second glass element */
  .glass-mini {{
    position: absolute;
    right: 180px;
    top: 400px;
    width: 140px;
    padding: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
    z-index: 5;
  }}

  .glass-number {{
    font-size: 24px;
    font-weight: 800;
    color: {accent};
    opacity: 0.7;
  }}

  .glass-sublabel {{
    font-size: 9px;
    color: rgba(255,255,255,0.25);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 4px;
  }}

  /* Content */
  /* No text content - image shared across EN/FR */
  .brand-watermark {{
    position: absolute;
    bottom: 24px;
    left: 32px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
  }}

  .brand-mark {{
    width: 24px;
    height: 24px;
    border-radius: 5px;
    background: {accent}20;
    border: 1px solid {accent}30;
    display: flex;
    align-items: center;
    justify-content: center;
  }}

  .brand-letter {{
    color: {accent}90;
    font-size: 12px;
    font-weight: 800;
  }}

  .brand-text {{
    color: rgba(255,255,255,0.2);
    font-size: 12px;
    font-weight: 500;
  }}

  .cat-badge {{
    position: absolute;
    top: 24px;
    left: 32px;
    z-index: 10;
    padding: 5px 12px;
    background: {accent}15;
    border: 1px solid {accent}25;
    border-radius: 5px;
    color: {accent}90;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }}
</style>
</head>
<body>
<div class="thumbnail">
  <div class="blob-1"></div>
  <div class="blob-2"></div>
  <div class="grid-overlay"></div>
  <div class="diag-line"></div>
  <div class="diag-line-2"></div>
  <div class="ring"></div>
  <div class="ring-inner"></div>
  <div class="dot dot-1"></div>
  <div class="dot dot-2"></div>
  <div class="dot dot-3"></div>
  <div class="dot dot-4"></div>

  <!-- Decorative glass elements -->
  <div class="glass-card">
    <div class="glass-label">Performance</div>
    <div class="glass-bar glass-bar-1"></div>
    <div class="glass-bar glass-bar-2"></div>
    <div class="glass-bar glass-bar-3"></div>
    <div class="glass-bar glass-bar-4"></div>
  </div>

  <div class="glass-mini">
    <div class="glass-number">+42%</div>
    <div class="glass-sublabel">Growth rate</div>
  </div>

  <div class="cat-badge">{cat['label']}</div>
  <div class="brand-watermark">
    <div class="brand-mark"><span class="brand-letter">M</span></div>
    <div class="brand-text">mydigipal.com</div>
  </div>
</div>
</body>
</html>"""


def get_blog_posts():
    """Read all blog post frontmatter to get titles, categories, slugs."""
    import yaml

    posts = []
    for lang_dir in ["en", "fr"]:
        content_path = CONTENT_DIR / lang_dir
        if not content_path.exists():
            continue

        for mdx_file in sorted(content_path.glob("*.mdx")):
            with open(mdx_file, encoding="utf-8") as f:
                content = f.read()

            # Extract frontmatter
            if content.startswith("---"):
                end = content.index("---", 3)
                frontmatter = yaml.safe_load(content[3:end])
            else:
                continue

            slug = mdx_file.stem
            image_path = frontmatter.get("image", "")
            category = frontmatter.get("category", "strategy")
            title = frontmatter.get("title", slug)

            # Check if current image exists
            if image_path:
                full_path = PROJECT_ROOT / "public" / image_path.lstrip("/")
                image_exists = full_path.exists()
            else:
                image_exists = False

            posts.append({
                "slug": slug,
                "title": title,
                "category": category,
                "image": image_path,
                "image_exists": image_exists,
                "lang": lang_dir,
                "mdx_path": str(mdx_file),
            })

    return posts


def main():
    try:
        import yaml
    except ImportError:
        print("Erreur : pip install pyyaml")
        sys.exit(1)

    posts = get_blog_posts()
    print(f"Found {len(posts)} blog posts")

    # Find posts with missing images
    missing = [p for p in posts if not p["image_exists"]]
    # Deduplicate by slug (EN and FR share the same image)
    seen_slugs = set()
    unique_missing = []
    for p in missing:
        if p["slug"] not in seen_slugs:
            seen_slugs.add(p["slug"])
            unique_missing.append(p)

    print(f"Posts with missing thumbnails: {len(unique_missing)}")

    if not unique_missing:
        print("All thumbnails exist! Nothing to generate.")
        return

    # Generate HTML + render PNG
    with sync_playwright() as pw:
        browser = pw.chromium.launch()

        for i, post in enumerate(unique_missing):
            slug = post["slug"]
            html_content = generate_thumbnail_html(post["title"], post["category"], slug)

            # Write temporary HTML
            html_path = OUTPUT_DIR / f"{slug}.html"
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html_content)

            # Render to PNG
            png_path = OUTPUT_DIR / f"{slug}.png"
            page = browser.new_page(viewport={"width": 1200, "height": 630})
            page.goto(f"file:///{str(html_path).replace(os.sep, '/')}", wait_until="networkidle")
            time.sleep(0.5)  # Wait for fonts

            thumbnail = page.query_selector(".thumbnail")
            if thumbnail:
                thumbnail.screenshot(path=str(png_path))
            else:
                page.screenshot(path=str(png_path))

            page.close()

            # Clean up HTML
            html_path.unlink()

            print(f"  [{i+1}/{len(unique_missing)}] {slug}.png ({post['category']})")

        browser.close()

    print(f"\nGenerated {len(unique_missing)} thumbnails in {OUTPUT_DIR}")
    print("\nNext step: update frontmatter image paths to point to generated thumbnails.")
    print("Run with --update-frontmatter to automatically update MDX files.")


if __name__ == "__main__":
    main()
