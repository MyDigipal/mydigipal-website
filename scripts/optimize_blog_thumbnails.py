"""Optimize blog thumbnails: resize to 1200x630 max + convert PNG to JPEG quality 85.

Saves ~95% on blog thumbnail weight (148MB → ~10MB).
Keeps .jpg for blog thumbs (photo content), preserves .png for logos with alpha.
"""
import os
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
THUMBS_DIR = ROOT / "public" / "images" / "Blog Thumbnails"
MAX_WIDTH = 1200
MAX_HEIGHT = 630
JPEG_QUALITY = 85
MIN_SIZE_BYTES = 200 * 1024  # only optimize if > 200 KB

renames = {}  # old_relpath -> new_relpath (relative to public/), used to fix MDX after

def is_photo_like(image: Image.Image) -> bool:
    """Photo-like images convert well to JPEG. Skip if alpha is meaningful."""
    if image.mode == "RGBA":
        # If alpha channel is mostly opaque (>99%), treat as photo
        alpha = image.getchannel("A")
        opaque_ratio = sum(1 for px in alpha.getdata() if px > 250) / (image.width * image.height)
        return opaque_ratio > 0.95
    return True

def optimize(path: Path) -> tuple[Path, int, int] | None:
    """Returns (new_path, before_bytes, after_bytes) or None if skipped."""
    before = path.stat().st_size
    if before < MIN_SIZE_BYTES:
        return None

    img = Image.open(path)
    is_png = path.suffix.lower() == ".png"
    photo = is_photo_like(img)

    # Convert RGBA -> RGB on white background if photo (drops alpha)
    if photo and img.mode in ("RGBA", "P"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        bg.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = bg

    if img.mode not in ("RGB", "RGBA", "L"):
        img = img.convert("RGB")

    # Resize if too large
    if img.width > MAX_WIDTH or img.height > MAX_HEIGHT:
        img.thumbnail((MAX_WIDTH * 2, MAX_HEIGHT * 2), Image.LANCZOS)
        img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.LANCZOS)

    if is_png and photo:
        # Convert PNG to JPEG (95% smaller for photo content)
        new_path = path.with_suffix(".jpg")
        img.save(new_path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        path.unlink()
        renames[str(path.relative_to(ROOT / "public")).replace("\\", "/")] = (
            str(new_path.relative_to(ROOT / "public")).replace("\\", "/")
        )
        after = new_path.stat().st_size
        return (new_path, before, after)

    if path.suffix.lower() in (".jpg", ".jpeg"):
        # Re-save JPEG with quality 85 + resize
        img.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        after = path.stat().st_size
        return (path, before, after)

    if is_png and not photo:
        # PNG with real alpha: keep PNG but optimize + quantize
        img = img.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
        img.save(path, "PNG", optimize=True)
        after = path.stat().st_size
        return (path, before, after)

    return None


def main():
    total_before = 0
    total_after = 0
    count = 0
    for ext in ("*.png", "*.jpg", "*.jpeg"):
        for path in THUMBS_DIR.rglob(ext):
            try:
                result = optimize(path)
                if result:
                    new_path, before, after = result
                    total_before += before
                    total_after += after
                    count += 1
                    saved_pct = 100 * (1 - after / before)
                    print(f"  {path.name}: {before//1024}KB -> {after//1024}KB ({saved_pct:.0f}% saved)")
            except Exception as e:
                print(f"  ERROR on {path.name}: {e}")

    if total_before:
        saved = total_before - total_after
        print(f"\n=== {count} files optimized ===")
        print(f"Before: {total_before // (1024*1024)} MB")
        print(f"After:  {total_after // (1024*1024)} MB")
        print(f"Saved:  {saved // (1024*1024)} MB ({100*saved/total_before:.0f}%)")

    if renames:
        # Write the renames map to a JSON file so we can update MDX frontmatter
        import json
        out = ROOT / "scripts" / "blog_thumbnail_renames.json"
        out.write_text(json.dumps(renames, indent=2), encoding="utf-8")
        print(f"\n{len(renames)} PNG -> JPG renames written to {out}")


if __name__ == "__main__":
    main()
