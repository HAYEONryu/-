"""800×400 og_opening.png: 높이 400 기준 비율 유지, 잘라내기 없음. 가로 부족 시 양옆 흰 배경, 가로 초과 시 가로 800 맞춤 후 상하 흰 배경."""
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC_NAME = "opening - 복사본.png"
OUT_SIZE = (800, 400)
WHITE = (255, 255, 255)

src = ROOT / "public" / "img" / SRC_NAME
out = ROOT / "public" / "img" / "og_opening.png"


def main() -> None:
    if not src.is_file():
        raise SystemExit(f"missing source: {src}")

    im = Image.open(src)
    im = ImageOps.exif_transpose(im)
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA")

    tw, th = OUT_SIZE
    ow, oh = im.size

    # 1) 높이 400 기준 확대/축소
    nw = max(1, round(ow * th / oh))
    nh = th

    # 2) 가로가 800을 넘으면 가로 800에 맞추고(비율 유지) → 세로는 400 미만 → 이후 상하 패딩
    if nw > tw:
        nw = tw
        nh = max(1, round(oh * tw / ow))

    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGB", OUT_SIZE, WHITE)
    x = (tw - nw) // 2
    y = (th - nh) // 2

    if resized.mode == "RGBA":
        canvas.paste(resized, (x, y), resized)
    else:
        canvas.paste(resized, (x, y))

    canvas.save(out, "PNG", optimize=True)
    print(out.relative_to(ROOT), canvas.size)


if __name__ == "__main__":
    main()
