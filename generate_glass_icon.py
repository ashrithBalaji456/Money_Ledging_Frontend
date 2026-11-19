import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_lending_exchange_icon(size=1024, is_foreground_only=False):
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    center_x = size / 2.0
    center_y = size / 2.0
    
    # Scale: for adaptive foreground, elements must fit inside 66% (diameter ~ 675px out of 1024px)
    scale = 0.58 if is_foreground_only else 0.86

    # ----------------------------------------------------
    # 1. Background: Deep Obsidian + Aurora Mesh
    # ----------------------------------------------------
    if not is_foreground_only:
        bg = Image.new('RGBA', (size, size), (6, 9, 18, 255))

        # Aurora Glow 1: Electric Sapphire (Top-Left)
        o1 = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        ImageDraw.Draw(o1).ellipse([size*0.05, size*0.06, size*0.75, size*0.72], fill=(14, 165, 233, 140))
        o1 = o1.filter(ImageFilter.GaussianBlur(size * 0.12))
        bg = Image.alpha_composite(bg, o1)

        # Aurora Glow 2: Emerald Green (Bottom-Left)
        o2 = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        ImageDraw.Draw(o2).ellipse([size*0.04, size*0.46, size*0.68, size*0.96], fill=(16, 185, 129, 150))
        o2 = o2.filter(ImageFilter.GaussianBlur(size * 0.12))
        bg = Image.alpha_composite(bg, o2)

        # Aurora Glow 3: Radiant Amber / Gold (Center-Right)
        o3 = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        ImageDraw.Draw(o3).ellipse([size*0.35, size*0.35, size*0.96, size*0.96], fill=(245, 158, 11, 130))
        o3 = o3.filter(ImageFilter.GaussianBlur(size * 0.11))
        bg = Image.alpha_composite(bg, o3)

        # Aurora Glow 4: Royal Violet (Top-Right)
        o4 = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        ImageDraw.Draw(o4).ellipse([size*0.48, size*0.04, size*0.96, size*0.56], fill=(139, 92, 246, 110))
        o4 = o4.filter(ImageFilter.GaussianBlur(size * 0.13))
        bg = Image.alpha_composite(bg, o4)

        canvas = Image.alpha_composite(canvas, bg)

    # ----------------------------------------------------
    # 2. Glassmorphism Squircle Card
    # ----------------------------------------------------
    card_w = int(size * 0.74 * scale)
    card_h = int(size * 0.74 * scale)
    corner_r = int(card_w * 0.28)

    x0 = int(center_x - card_w / 2.0)
    y0 = int(center_y - card_h / 2.0)
    x1 = x0 + card_w
    y1 = y0 + card_h

    # Card Deep Ambient 3D Shadow
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

    # Translucent Ice & Slate Gradient Fill
    grad = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    for y in range(y0, y1 + 1):
        ratio = (y - y0) / float(card_h)
        r_c = int(210 * (1 - ratio)**2 + 25 * 2 * ratio * (1 - ratio) + 12 * ratio**2)
        g_c = int(235 * (1 - ratio)**2 + 40 * 2 * ratio * (1 - ratio) + 20 * ratio**2)
        b_c = int(255 * (1 - ratio)**2 + 65 * 2 * ratio * (1 - ratio) + 40 * ratio**2)
        alpha = int(75 * (1 - ratio) + 145 * ratio)
        line = Image.new('RGBA', (size, 1), (r_c, g_c, b_c, alpha))
        grad.paste(line, (0, y))

    glass.paste(grad, (0, 0), mask=mask_card)

    # Diagonal Gloss Specular Glare (Apple Glass Sheen)
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
    # 3. Two People Avatars (Lender on Left, Borrower on Right)
    # ----------------------------------------------------
    def draw_person(img, cx, cy, person_scale, base_color, outline_color):
        layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        
        # Head
        head_r = int(28 * person_scale)
        head_cy = cy - int(38 * person_scale)
        d.ellipse([cx - head_r, head_cy - head_r, cx + head_r, head_cy + head_r], fill=base_color, outline=outline_color, width=max(2, int(3 * person_scale)))
        
        # Shoulders / Torso (curved arch)
        torso_w = int(46 * person_scale)
        torso_h = int(36 * person_scale)
        torso_top = cy - int(4 * person_scale)
        d.pieslice([cx - torso_w, torso_top - torso_h, cx + torso_w, torso_top + torso_h], start=0, end=180, fill=base_color, outline=outline_color, width=max(2, int(3 * person_scale)))
        
        # Specular highlight on head
        d.ellipse([cx - head_r * 0.6, head_cy - head_r * 0.6, cx - head_r * 0.1, head_cy - head_r * 0.1], fill=(255, 255, 255, 180))
        return Image.alpha_composite(img, layer)

    p_scale = (card_w / 380.0)
    person_y = int(center_y + card_h * 0.04)
    p1_x = int(center_x - card_w * 0.28) # Person 1 (Lender)
    p2_x = int(center_x + card_w * 0.28) # Person 2 (Borrower)

    # Ambient glow under people
    p_glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    pg_draw = ImageDraw.Draw(p_glow)
    pg_draw.ellipse([p1_x - 60*p_scale, person_y - 70*p_scale, p1_x + 60*p_scale, person_y + 50*p_scale], fill=(14, 165, 233, 110))
    pg_draw.ellipse([p2_x - 60*p_scale, person_y - 70*p_scale, p2_x + 60*p_scale, person_y + 50*p_scale], fill=(16, 185, 129, 110))
    p_glow = p_glow.filter(ImageFilter.GaussianBlur(15))
    canvas = Image.alpha_composite(canvas, p_glow)

    # Draw Person 1 (Sapphire Cyan - The Lender)
    canvas = draw_person(canvas, p1_x, person_y, p_scale, base_color=(14, 165, 233, 230), outline_color=(255, 255, 255, 220))
    
    # Draw Person 2 (Emerald Mint - The Borrower)
    canvas = draw_person(canvas, p2_x, person_y, p_scale, base_color=(16, 185, 129, 230), outline_color=(255, 255, 255, 220))

    # ----------------------------------------------------
    # 4. Exchange Flow Arcs / Arrows (Money Transfer Animation Look)
    # ----------------------------------------------------
    arrow_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ad = ImageDraw.Draw(arrow_layer)

    # Top Arc: Lending Arrow (Left to Center-Right)
    top_arc_box = [p1_x + 10*p_scale, person_y - int(78*p_scale), p2_x - 10*p_scale, person_y - int(12*p_scale)]
    arc_w = max(3, int(6 * p_scale))
    ad.arc(top_arc_box, start=200, end=340, fill=(245, 158, 11, 230), width=arc_w)
    
    # Arrow head pointing right towards center
    arrow_tip_x = int(center_x + card_w * 0.14)
    arrow_tip_y = int(person_y - 45 * p_scale)
    ad.polygon([
        (arrow_tip_x, arrow_tip_y),
        (arrow_tip_x - int(12*p_scale), arrow_tip_y - int(8*p_scale)),
        (arrow_tip_x - int(12*p_scale), arrow_tip_y + int(8*p_scale)),
    ], fill=(245, 158, 11, 255))

    # Bottom Arc: Repayment Arrow (Right to Center-Left)
    bot_arc_box = [p1_x + 10*p_scale, person_y + int(12*p_scale), p2_x - 10*p_scale, person_y + int(78*p_scale)]
    ad.arc(bot_arc_box, start=20, end=160, fill=(16, 185, 129, 230), width=arc_w)
    
    # Arrow head pointing left towards lender
    arrow_tip_x2 = int(center_x - card_w * 0.14)
    arrow_tip_y2 = int(person_y + 45 * p_scale)
    ad.polygon([
        (arrow_tip_x2, arrow_tip_y2),
        (arrow_tip_x2 + int(12*p_scale), arrow_tip_y2 - int(8*p_scale)),
        (arrow_tip_x2 + int(12*p_scale), arrow_tip_y2 + int(8*p_scale)),
    ], fill=(16, 185, 129, 255))

    canvas = Image.alpha_composite(canvas, arrow_layer)

    # ----------------------------------------------------
    # 5. Glowing 3D Golden Rupee (₹) Coin in Center of Exchange
    # ----------------------------------------------------
    coin_cx = int(center_x)
    coin_cy = int(person_y - 2 * p_scale)
    coin_r = int(card_w * 0.18)

    # Coin drop shadow
    coin_sh = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(coin_sh).ellipse(
        [coin_cx - coin_r, coin_cy - coin_r + int(10*scale), coin_cx + coin_r, coin_cy + coin_r + int(10*scale)],
        fill=(0, 0, 0, 210)
    )
    coin_sh = coin_sh.filter(ImageFilter.GaussianBlur(int(14*scale)))
    canvas = Image.alpha_composite(canvas, coin_sh)

    # Coin golden halo glow
    coin_gl = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(coin_gl).ellipse(
        [coin_cx - coin_r*1.5, coin_cy - coin_r*1.5, coin_cx + coin_r*1.5, coin_cy + coin_r*1.5],
        fill=(245, 158, 11, 150)
    )
    coin_gl = coin_gl.filter(ImageFilter.GaussianBlur(int(18*scale)))
    canvas = Image.alpha_composite(canvas, coin_gl)

    # Coin 3D Body
    coin_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    # Beveled Outer Rim
    ImageDraw.Draw(coin_img).ellipse([coin_cx - coin_r, coin_cy - coin_r, coin_cx + coin_r, coin_cy + coin_r], fill=(180, 83, 9, 255))
    
    # Gold Gradient Face
    coin_face_mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(coin_face_mask).ellipse([coin_cx - coin_r + 3, coin_cy - coin_r + 3, coin_cx + coin_r - 3, coin_cy + coin_r - 3], fill=255)
    
    gold_coin = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    for y in range(coin_cy - coin_r, coin_cy + coin_r + 1):
        ratio = (y - (coin_cy - coin_r)) / float(max(1, 2 * coin_r))
        ratio = max(0.0, min(1.0, ratio))
        if ratio < 0.35:
            t = ratio / 0.35
            r_c = int(255*(1-t) + 250*t)
            g_c = int(251*(1-t) + 204*t)
            b_c = int(195*(1-t) + 21*t)
        else:
            t = (ratio - 0.35) / 0.65
            r_c = int(250*(1-t) + 217*t)
            g_c = int(204*(1-t) + 119*t)
            b_c = int(21*(1-t) + 6*t)
        ImageDraw.Draw(gold_coin).line([(coin_cx - coin_r, y), (coin_cx + coin_r, y)], fill=(r_c, g_c, b_c, 255))
    coin_img.paste(gold_coin, (0, 0), mask=coin_face_mask)

    # Inner concentric beveled ring
    inner_ring_r = int(coin_r * 0.82)
    ImageDraw.Draw(coin_img).ellipse(
        [coin_cx - inner_ring_r, coin_cy - inner_ring_r, coin_cx + inner_ring_r, coin_cy + inner_ring_r],
        outline=(254, 240, 138, 220),
        width=max(2, int(size * 0.005 * scale))
    )

    # Rupee Symbol '₹' on Coin
    font_path = "C:/Windows/Fonts/seguisb.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/arialbd.ttf"
    r_font_size = int(coin_r * 1.25)
    r_font = ImageFont.truetype(font_path, r_font_size)

    temp_d = ImageDraw.Draw(coin_img)
    r_bbox = temp_d.textbbox((0, 0), "₹", font=r_font)
    r_tw = r_bbox[2] - r_bbox[0]
    r_th = r_bbox[3] - r_bbox[1]
    r_tx = int(coin_cx - r_tw / 2.0 - r_bbox[0])
    r_ty = int(coin_cy - r_th / 2.0 - r_bbox[1] - coin_r * 0.05)

    # Rupee shadow on coin
    temp_d.text((r_tx + 2, r_ty + 3), "₹", font=r_font, fill=(146, 64, 14, 230))
    # Rupee crisp white-gold text
    temp_d.text((r_tx, r_ty), "₹", font=r_font, fill=(255, 255, 255, 255))

    canvas = Image.alpha_composite(canvas, coin_img)

    # ----------------------------------------------------
    # 6. Crystal Diamond Lens-Flare Sparkles
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
    canvas = add_crystal_sparkle(canvas, int(x0 + card_w * 0.16), int(y0 + card_h * 0.16), int(size * 0.038 * scale))
    # Coin sparkle
    canvas = add_crystal_sparkle(canvas, int(coin_cx + coin_r * 0.72), int(coin_cy - coin_r * 0.72), int(size * 0.026 * scale), color=(254, 240, 138, 230))

    return canvas

def create_round_icon(img):
    size = img.size[0]
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size, size], fill=255)
    round_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    round_img.paste(img, (0, 0), mask=mask)
    return round_img

def main():
    print("Generating Two People Money Exchange Glassmorphism Icons...")
    master = create_lending_exchange_icon(1024, is_foreground_only=False)
    master_round = create_round_icon(master)
    master_fg = create_lending_exchange_icon(1024, is_foreground_only=True)

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
    print("All Android and Web icons updated successfully!")

if __name__ == '__main__':
    main()
