import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_glassy_luxury_icon(size=1024, is_foreground_only=False):
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    center_x = size / 2.0
    center_y = size / 2.0
    
    # Scale: for adaptive foreground, icon elements must fit inside 66% (diameter ~ 675px out of 1024px)
    scale = 0.58 if is_foreground_only else 0.86

    # ----------------------------------------------------
    # 1. Background (Full App Icon): Deep Obsidian + Aurora Glow
    # ----------------------------------------------------
    if not is_foreground_only:
        bg = Image.new('RGBA', (size, size), (6, 9, 18, 255)) # Deep Obsidian #060912

        # Aurora 1: Electric Cyan & Sapphire (Top-Left)
        o1 = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        ImageDraw.Draw(o1).ellipse([size*0.06, size*0.06, size*0.75, size*0.72], fill=(14, 165, 233, 140))
        o1 = o1.filter(ImageFilter.GaussianBlur(size * 0.12))
        bg = Image.alpha_composite(bg, o1)

        # Aurora 2: Emerald Green Growth Glow (Bottom-Left)
        o2 = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        ImageDraw.Draw(o2).ellipse([size*0.04, size*0.46, size*0.68, size*0.96], fill=(16, 185, 129, 150))
        o2 = o2.filter(ImageFilter.GaussianBlur(size * 0.12))
        bg = Image.alpha_composite(bg, o2)

        # Aurora 3: Radiant Amber & Gold Wealth Glow (Bottom-Right)
        o3 = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        ImageDraw.Draw(o3).ellipse([size*0.38, size*0.38, size*0.96, size*0.96], fill=(245, 158, 11, 130))
        o3 = o3.filter(ImageFilter.GaussianBlur(size * 0.11))
        bg = Image.alpha_composite(bg, o3)

        # Aurora 4: Royal Violet (Top-Right)
        o4 = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        ImageDraw.Draw(o4).ellipse([size*0.46, size*0.04, size*0.96, size*0.56], fill=(139, 92, 246, 110))
        o4 = o4.filter(ImageFilter.GaussianBlur(size * 0.13))
        bg = Image.alpha_composite(bg, o4)

        canvas = Image.alpha_composite(canvas, bg)

    # ----------------------------------------------------
    # 2. Glassmorphism Floating Squircle Card
    # ----------------------------------------------------
    card_w = int(size * 0.74 * scale)
    card_h = int(size * 0.74 * scale)
    corner_r = int(card_w * 0.28)

    x0 = int(center_x - card_w / 2.0)
    y0 = int(center_y - card_h / 2.0)
    x1 = x0 + card_w
    y1 = y0 + card_h

    # Deep 3D Drop Shadow behind the Glass Plate
    shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    s_offset = int(size * 0.042 * scale)
    ImageDraw.Draw(shadow).rounded_rectangle(
        [x0, y0 + s_offset, x1, y1 + s_offset],
        radius=corner_r,
        fill=(0, 0, 0, 200)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(size * 0.045 * scale))
    canvas = Image.alpha_composite(canvas, shadow)

    # Frosted Glass Base Plate
    glass = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    mask_card = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask_card).rounded_rectangle([x0, y0, x1, y1], radius=corner_r, fill=255)

    # Frosted Glass Gradient Fill (Icy translucent sheen -> Deep midnight glass)
    grad = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    for y in range(y0, y1 + 1):
        ratio = (y - y0) / float(card_h)
        # Top: Ice highlight tint
        # Bottom: Deep smoky translucent tint
        r_c = int(210 * (1 - ratio)**2 + 25 * 2 * ratio * (1 - ratio) + 12 * ratio**2)
        g_c = int(235 * (1 - ratio)**2 + 40 * 2 * ratio * (1 - ratio) + 20 * ratio**2)
        b_c = int(255 * (1 - ratio)**2 + 65 * 2 * ratio * (1 - ratio) + 40 * ratio**2)
        alpha = int(70 * (1 - ratio) + 140 * ratio)
        line = Image.new('RGBA', (size, 1), (r_c, g_c, b_c, alpha))
        grad.paste(line, (0, y))

    glass.paste(grad, (0, 0), mask=mask_card)

    # Diagonal Gloss Specular Glare (Signature iOS/visionOS Glass Sheen)
    glare = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glare)
    glare_poly = [
        (x0 + int(card_w * 0.04), y0),
        (x0 + int(card_w * 0.58), y0),
        (x0, y0 + int(card_h * 0.58)),
        (x0, y0 + int(card_h * 0.04))
    ]
    g_draw.polygon(glare_poly, fill=(255, 255, 255, 52))
    glare_poly2 = [
        (x0 + int(card_w * 0.16), y0),
        (x0 + int(card_w * 0.36), y0),
        (x0, y0 + int(card_h * 0.36)),
        (x0, y0 + int(card_h * 0.16))
    ]
    g_draw.polygon(glare_poly2, fill=(255, 255, 255, 75))
    glare = glare.filter(ImageFilter.GaussianBlur(size * 0.016 * scale))
    glass = Image.alpha_composite(glass, Image.composite(glare, Image.new('RGBA', (size, size), (0,0,0,0)), mask_card))

    # Inner Glass Refraction Rim
    inner_glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ig_pad = int(size * 0.012 * scale)
    ImageDraw.Draw(inner_glow).rounded_rectangle(
        [x0 + ig_pad, y0 + ig_pad, x1 - ig_pad, y1 - ig_pad],
        radius=max(1, corner_r - ig_pad),
        outline=(56, 189, 248, 55),
        width=int(size * 0.007 * scale)
    )
    glass = Image.alpha_composite(glass, inner_glow)

    # Crisp Crystalline Glass Outer Border
    border_w = max(2, int(size * 0.007 * scale))
    rim = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(rim).rounded_rectangle([x0, y0, x1, y1], radius=corner_r, outline=(255, 255, 255, 185), width=border_w)
    glass = Image.alpha_composite(glass, rim)
    canvas = Image.alpha_composite(canvas, glass)

    # ----------------------------------------------------
    # 3. Subtle Frosted Ledger Lines (Money Lending Identity)
    # ----------------------------------------------------
    ledger_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ll_draw = ImageDraw.Draw(ledger_layer)
    line_y_start = int(y1 - card_h * 0.22)
    line_spacing = int(card_h * 0.055)
    for i in range(2):
        ly = line_y_start + i * line_spacing
        lx_start = int(x0 + card_w * 0.25)
        lx_end = int(x1 - card_w * 0.25)
        # Frosted line
        ll_draw.rounded_rectangle([lx_start, ly, lx_end, ly + max(2, int(size * 0.004 * scale))], radius=2, fill=(255, 255, 255, 45))
        # Bullet dot
        dot_col = (16, 185, 129, 200) if i == 0 else (245, 158, 11, 200)
        ll_draw.ellipse([lx_start - int(card_w * 0.06), ly - 1, lx_start - int(card_w * 0.06) + int(card_w * 0.03), ly - 1 + int(card_w * 0.03)], fill=dot_col)
    canvas = Image.alpha_composite(canvas, ledger_layer)

    # ----------------------------------------------------
    # 4. Hero 3D Luminous Golden Rupee Symbol (₹)
    # ----------------------------------------------------
    font_path = "C:/Windows/Fonts/seguisb.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/arialbd.ttf"
    
    font_size = int(card_h * 0.58)
    font = ImageFont.truetype(font_path, font_size)

    text = "₹"
    temp_draw = ImageDraw.Draw(canvas)
    bbox = temp_draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]

    # Perfect centering considering actual glyph bounding box
    tx = int(center_x - tw / 2.0 - bbox[0])
    ty = int(center_y - th / 2.0 - bbox[1] - card_h * 0.045)

    # Exact bounding box on canvas
    actual_top = ty + bbox[1]
    actual_bottom = ty + bbox[3]

    # 3D Drop Shadow of Rupee onto Glass Plate
    r_shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    rs_offset = int(size * 0.024 * scale)
    ImageDraw.Draw(r_shadow).text((tx, ty + rs_offset), text, font=font, fill=(0, 0, 0, 215))
    r_shadow = r_shadow.filter(ImageFilter.GaussianBlur(size * 0.022 * scale))
    canvas = Image.alpha_composite(canvas, r_shadow)

    # Ambient Radiant Golden Glow behind Rupee
    r_glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(r_glow).text((tx, ty), text, font=font, fill=(245, 158, 11, 160))
    r_glow = r_glow.filter(ImageFilter.GaussianBlur(size * 0.036 * scale))
    canvas = Image.alpha_composite(canvas, r_glow)

    # Rupee Mask
    r_mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(r_mask).text((tx, ty), text, font=font, fill=255)

    # Complete 3D Metallic Golden Gradient (across the full actual height of glyph)
    gold_fill = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    for y in range(max(0, actual_top - 5), min(size, actual_bottom + 5)):
        ratio = (y - actual_top) / float(max(1, actual_bottom - actual_top))
        ratio = max(0.0, min(1.0, ratio))
        # Smooth luxury gold gradient:
        # 0.0 -> 0.25: Champagne Gold (#FFFBEB -> #FDE047)
        # 0.25 -> 0.65: Rich Amber Gold (#FDE047 -> #F59E0B)
        # 0.65 -> 1.0: Deep Burnished Warm Gold (#F59E0B -> #B45309)
        if ratio < 0.25:
            t = ratio / 0.25
            r_c = int(255 * (1 - t) + 253 * t)
            g_c = int(251 * (1 - t) + 224 * t)
            b_c = int(235 * (1 - t) + 71 * t)
        elif ratio < 0.65:
            t = (ratio - 0.25) / 0.40
            r_c = int(253 * (1 - t) + 245 * t)
            g_c = int(224 * (1 - t) + 158 * t)
            b_c = int(71 * (1 - t) + 11 * t)
        else:
            t = (ratio - 0.65) / 0.35
            r_c = int(245 * (1 - t) + 180 * t)
            g_c = int(158 * (1 - t) + 83 * t)
            b_c = int(11 * (1 - t) + 9 * t)
        line = Image.new('RGBA', (size, 1), (r_c, g_c, b_c, 255))
        gold_fill.paste(line, (0, y))

    rupee_composite = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    rupee_composite.paste(gold_fill, (0, 0), mask=r_mask)

    # Chiseled Specular Highlight on Rupee Edge
    r_highlight = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(r_highlight).text((tx - 1, ty - 2), text, font=font, fill=(255, 255, 255, 140))
    rupee_bevel = Image.composite(r_highlight, Image.new('RGBA', (size, size), (0,0,0,0)), r_mask)
    rupee_composite = Image.alpha_composite(rupee_composite, rupee_bevel)
    canvas = Image.alpha_composite(canvas, rupee_composite)

    # ----------------------------------------------------
    # 5. Emerald Growth Gemstone Badge (Top-Right of Glass Card)
    # ----------------------------------------------------
    badge_cx = int(x1 - card_w * 0.16)
    badge_cy = int(y0 + card_h * 0.16)
    badge_r = int(card_w * 0.08)

    # Neon Emerald Halo
    halo = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(halo).ellipse(
        [badge_cx - badge_r*2, badge_cy - badge_r*2, badge_cx + badge_r*2, badge_cy + badge_r*2],
        fill=(16, 185, 129, 170)
    )
    halo = halo.filter(ImageFilter.GaussianBlur(size * 0.02 * scale))
    canvas = Image.alpha_composite(canvas, halo)

    # 3D Emerald Gemstone Badge
    c_draw = ImageDraw.Draw(canvas)
    c_draw.ellipse(
        [badge_cx - badge_r, badge_cy - badge_r, badge_cx + badge_r, badge_cy + badge_r],
        fill=(5, 150, 105, 245),
        outline=(255, 255, 255, 235),
        width=max(2, int(size * 0.005 * scale))
    )

    # Sleek Upward Financial Growth Arrow inside Badge
    arrow_w = int(badge_r * 0.48)
    arrow_pts = [
        (badge_cx, badge_cy - int(badge_r * 0.52)),
        (badge_cx + arrow_w, badge_cy + int(badge_r * 0.18)),
        (badge_cx + int(arrow_w * 0.42), badge_cy + int(badge_r * 0.18)),
        (badge_cx + int(arrow_w * 0.42), badge_cy + int(badge_r * 0.58)),
        (badge_cx - int(arrow_w * 0.42), badge_cy + int(badge_r * 0.58)),
        (badge_cx - int(arrow_w * 0.42), badge_cy + int(badge_r * 0.18)),
        (badge_cx - arrow_w, badge_cy + int(badge_r * 0.18)),
    ]
    c_draw.polygon(arrow_pts, fill=(255, 255, 255, 255))

    # ----------------------------------------------------
    # 6. Crystal Lens Flare / Diamond Sparkles
    # ----------------------------------------------------
    def add_crystal_sparkle(img, sx, sy, radius, color=(255, 255, 255, 240)):
        sp = Image.new('RGBA', img.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(sp)
        w = max(2, int(radius * 0.2))
        d.line([sx, sy - radius, sx, sy + radius], fill=color, width=w)
        d.line([sx - radius, sy, sx + radius, sy], fill=color, width=w)
        diag_r = int(radius * 0.52)
        d.line([sx - diag_r, sy - diag_r, sx + diag_r, sy + diag_r], fill=color, width=max(1, w-1))
        d.line([sx - diag_r, sy + diag_r, sx + diag_r, sy - diag_r], fill=color, width=max(1, w-1))
        dot_r = max(2, int(radius * 0.28))
        d.ellipse([sx - dot_r, sy - dot_r, sx + dot_r, sy + dot_r], fill=(255, 255, 255, 255))
        sp = sp.filter(ImageFilter.GaussianBlur(1))
        return Image.alpha_composite(img, sp)

    # Top-left sparkle on glass card corner
    canvas = add_crystal_sparkle(canvas, int(x0 + card_w * 0.18), int(y0 + card_h * 0.18), int(size * 0.038 * scale))
    # Bottom-right subtle warm sparkle
    canvas = add_crystal_sparkle(canvas, int(x1 - card_w * 0.18), int(y1 - card_h * 0.16), int(size * 0.024 * scale), color=(254, 240, 138, 210))

    return canvas

def create_round_icon(img):
    size = img.size[0]
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size, size], fill=255)
    round_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    round_img.paste(img, (0, 0), mask=mask)
    return round_img

def main():
    print("Generating Master Glassmorphism Icons...")
    master = create_glassy_luxury_icon(1024, is_foreground_only=False)
    master_round = create_round_icon(master)
    master_fg = create_glassy_luxury_icon(1024, is_foreground_only=True)

    preview_path = r"C:\Users\ashri\SpringNew\Money_Lending_App\Frontend\glass_icon_preview.png"
    master.save(preview_path)
    print(f"Saved preview to {preview_path}")

    res_dir = r"C:\Users\ashri\SpringNew\Money_Lending_App\Frontend\android\app\src\main\res"
    densities = {
        'mipmap-mdpi': (48, 108),
        'mipmap-hdpi': (72, 162),
        'mipmap-xhdpi': (96, 216),
        'mipmap-xxhdpi': (144, 324),
        'mipmap-xxxhdpi': (192, 432),
    }

    for folder, (std_size, fg_size) in densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        std_img = master.resize((std_size, std_size), Image.Resampling.LANCZOS)
        std_img.save(os.path.join(folder_path, 'ic_launcher.png'))

        round_img = master_round.resize((std_size, std_size), Image.Resampling.LANCZOS)
        round_img.save(os.path.join(folder_path, 'ic_launcher_round.png'))

        fg_img = master_fg.resize((fg_size, fg_size), Image.Resampling.LANCZOS)
        fg_img.save(os.path.join(folder_path, 'ic_launcher_foreground.png'))
        print(f"Updated {folder}: standard={std_size}x{std_size}, fg={fg_size}x{fg_size}")

    # Also update Web favicons
    public_dir = r"C:\Users\ashri\SpringNew\Money_Lending_App\Frontend\public"
    master.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'favicon.png'))
    master.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'icon-192.png'))
    master.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'icon-512.png'))
    print("Web favicons updated successfully!")

if __name__ == '__main__':
    main()
