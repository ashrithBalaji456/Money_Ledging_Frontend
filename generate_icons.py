import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_app_icon(size=1024, is_foreground_only=False):
    # Create RGBA canvas
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    center_x = size / 2
    center_y = size / 2

    if not is_foreground_only:
        # Background: Rich dark slate & deep navy gradient with ambient gold glow
        bg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        bg_draw = ImageDraw.Draw(bg)
        
        # Radial gradient
        max_r = size * 0.72
        for r in range(int(max_r), 0, -3):
            ratio = r / max_r
            # Interpolate from center (deep indigo #1a1b3a) to edges (#070a13)
            r_col = int(26 * (1 - ratio) + 7 * ratio)
            g_col = int(27 * (1 - ratio) + 10 * ratio)
            b_col = int(58 * (1 - ratio) + 19 * ratio)
            alpha = 255
            bg_draw.ellipse(
                [center_x - r, center_y - r, center_x + r, center_y + r],
                fill=(r_col, g_col, b_col, alpha)
            )

        # Subtle ambient gold glow behind center
        glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow)
        glow_r = int(size * 0.38)
        for r in range(glow_r, 0, -4):
            ratio = r / glow_r
            alpha = int(45 * (1 - ratio * ratio))
            glow_draw.ellipse(
                [center_x - r, center_y + int(size * 0.04) - r, center_x + r, center_y + int(size * 0.04) + r],
                fill=(245, 158, 11, alpha)
            )
        glow = glow.filter(ImageFilter.GaussianBlur(size * 0.03))
        bg = Image.alpha_composite(bg, glow)
        img = Image.alpha_composite(img, bg)
        draw = ImageDraw.Draw(img)

    # Scale factors: if foreground only, keep strictly within 66% safe zone (radius = size * 0.33)
    # Foreground safe zone scale:
    scale = 0.58 if is_foreground_only else 0.85

    # Book / Ledger Dimensions
    book_w = int(size * 0.62 * scale)
    book_h = int(size * 0.48 * scale)
    book_top = int(center_y - book_h * 0.58)
    book_bottom = book_top + book_h
    book_left = int(center_x - book_w / 2)
    book_right = book_left + book_w
    spine_x = int(center_x)

    # 1. Book Outer Cover / Drop Shadow
    shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    cover_pad = int(size * 0.03 * scale)
    s_draw.rounded_rectangle(
        [book_left - cover_pad + int(size * 0.02 * scale), 
         book_top - cover_pad + int(size * 0.03 * scale), 
         book_right + cover_pad + int(size * 0.02 * scale), 
         book_bottom + cover_pad + int(size * 0.04 * scale)],
        radius=int(size * 0.04 * scale),
        fill=(0, 0, 0, 160)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(size * 0.025))
    img = Image.alpha_composite(img, shadow)
    draw = ImageDraw.Draw(img)

    # 2. Book Leather Cover (Rich Dark Amber & Bronze)
    cover_rect = [book_left - cover_pad, book_top - cover_pad, book_right + cover_pad, book_bottom + cover_pad]
    draw.rounded_rectangle(cover_rect, radius=int(size * 0.04 * scale), fill=(30, 41, 59, 255), outline=(245, 158, 11, 220), width=int(size * 0.008 * scale))

    # 3. Open Book Pages (Left & Right Pages with 3D Depth)
    # Left page
    left_page = [book_left + int(size * 0.015 * scale), book_top + int(size * 0.015 * scale),
                 spine_x - int(size * 0.008 * scale), book_bottom - int(size * 0.015 * scale)]
    draw.rounded_rectangle(left_page, radius=int(size * 0.02 * scale), fill=(241, 245, 249, 255))
    
    # Left page inner shadow near spine
    draw.rectangle([spine_x - int(size * 0.035 * scale), left_page[1], spine_x - int(size * 0.008 * scale), left_page[3]], fill=(203, 213, 225, 160))

    # Right page
    right_page = [spine_x + int(size * 0.008 * scale), book_top + int(size * 0.015 * scale),
                  book_right - int(size * 0.015 * scale), book_bottom - int(size * 0.015 * scale)]
    draw.rounded_rectangle(right_page, radius=int(size * 0.02 * scale), fill=(248, 250, 252, 255))
    
    # Right page inner shadow near spine
    draw.rectangle([spine_x + int(size * 0.008 * scale), right_page[1], spine_x + int(size * 0.035 * scale), right_page[3]], fill=(203, 213, 225, 160))

    # Golden bookmark ribbon hanging down from spine
    ribbon_w = int(size * 0.03 * scale)
    ribbon_y1 = book_top - cover_pad
    ribbon_y2 = book_bottom + int(size * 0.06 * scale)
    draw.polygon([
        (spine_x - ribbon_w // 2, ribbon_y1),
        (spine_x + ribbon_w // 2, ribbon_y1),
        (spine_x + ribbon_w // 2, ribbon_y2),
        (spine_x, ribbon_y2 - int(size * 0.02 * scale)),
        (spine_x - ribbon_w // 2, ribbon_y2)
    ], fill=(234, 88, 12, 255))

    # 4. Ledger Ruled Lines on Left & Right Pages
    line_color = (148, 163, 184, 180) # slate-400
    gold_line = (245, 158, 11, 200)
    num_lines = 5
    line_spacing = (book_h - int(size * 0.1 * scale)) // (num_lines + 1)
    
    # Left page lines
    for i in range(1, num_lines + 1):
        ly = book_top + int(size * 0.05 * scale) + i * line_spacing
        col = gold_line if i == 1 else line_color
        th = int(size * 0.006 * scale) if i == 1 else int(size * 0.004 * scale)
        draw.line([left_page[0] + int(size * 0.03 * scale), ly, left_page[2] - int(size * 0.04 * scale), ly], fill=col, width=th)
        # Small ledger checkbox / bullet
        cb_size = int(size * 0.015 * scale)
        cb_x = left_page[0] + int(size * 0.015 * scale)
        draw.ellipse([cb_x, ly - cb_size//2, cb_x + cb_size, ly + cb_size//2], fill=(16, 185, 129, 220))

    # Right page lines
    for i in range(1, num_lines + 1):
        ly = book_top + int(size * 0.05 * scale) + i * line_spacing
        draw.line([right_page[0] + int(size * 0.04 * scale), ly, right_page[1] + int(size * 0.28 * scale), ly], fill=line_color, width=int(size * 0.004 * scale))

    # 5. Prominent Glowing Golden Rupee (₹) Coin
    # Place coin slightly to the bottom-right overlapping the ledger
    coin_r = int(size * 0.23 * scale)
    coin_cx = int(center_x + size * 0.13 * scale)
    coin_cy = int(center_y + size * 0.11 * scale)

    # Coin drop shadow
    coin_shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    cs_draw = ImageDraw.Draw(coin_shadow)
    cs_draw.ellipse(
        [coin_cx - coin_r + int(size * 0.015 * scale), 
         coin_cy - coin_r + int(size * 0.02 * scale), 
         coin_cx + coin_r + int(size * 0.015 * scale), 
         coin_cy + coin_r + int(size * 0.02 * scale)],
        fill=(0, 0, 0, 180)
    )
    coin_shadow = coin_shadow.filter(ImageFilter.GaussianBlur(size * 0.02))
    img = Image.alpha_composite(img, coin_shadow)
    draw = ImageDraw.Draw(img)

    # Outer Coin Rim (Dark Amber Border with Highlight)
    draw.ellipse([coin_cx - coin_r, coin_cy - coin_r, coin_cx + coin_r, coin_cy + coin_r], fill=(180, 83, 9, 255))
    
    # Coin Face - Gradient fill from #FDE047 (light gold) to #D97706 (deep warm gold)
    for cr in range(coin_r - int(size * 0.015 * scale), 0, -2):
        t = cr / coin_r
        # Interpolate golden color
        r_c = int(251 * t + 217 * (1 - t))
        g_c = int(191 * t + 119 * (1 - t))
        b_c = int(36 * t + 6 * (1 - t))
        draw.ellipse([coin_cx - cr, coin_cy - cr, coin_cx + cr, coin_cy + cr], fill=(r_c, g_c, b_c, 255))

    # Coin Beveled Inner Rim
    inner_rim_r = int(coin_r * 0.84)
    draw.ellipse(
        [coin_cx - inner_rim_r, coin_cy - inner_rim_r, coin_cx + inner_rim_r, coin_cy + inner_rim_r],
        outline=(254, 240, 138, 220),
        width=int(size * 0.008 * scale)
    )

    # 6. Beautiful Bold Rupee Symbol '₹'
    font_path = "C:/Windows/Fonts/seguisb.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/arial.ttf"
    
    font_size = int(coin_r * 1.35)
    font = ImageFont.truetype(font_path, font_size)

    text = "₹"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]

    tx = coin_cx - tw / 2 - bbox[0]
    ty = coin_cy - th / 2 - bbox[1] - int(size * 0.01 * scale)

    # Embossed 3D Rupee Shadow
    draw.text((tx + int(size * 0.008 * scale), ty + int(size * 0.008 * scale)), text, font=font, fill=(146, 64, 14, 255))
    # Rupee Symbol Highlight
    draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

    # 7. Emerald Green Success / Cleared Repayment Badge (Small Spark)
    spark_r = int(size * 0.075 * scale)
    spark_cx = int(coin_cx - coin_r * 0.85)
    spark_cy = int(coin_cy - coin_r * 0.85)

    # Spark shadow
    draw.ellipse([spark_cx - spark_r + 3, spark_cy - spark_r + 3, spark_cx + spark_r + 3, spark_cy + spark_r + 3], fill=(0, 0, 0, 120))
    # Emerald circle
    draw.ellipse([spark_cx - spark_r, spark_cy - spark_r, spark_cx + spark_r, spark_cy + spark_r], fill=(16, 185, 129, 255), outline=(255, 255, 255, 240), width=int(size * 0.008 * scale))

    # Checkmark inside emerald badge
    chk_w = int(size * 0.008 * scale)
    chk_p1 = (spark_cx - int(spark_r * 0.45), spark_cy - int(spark_r * 0.05))
    chk_p2 = (spark_cx - int(spark_r * 0.1), spark_cy + int(spark_r * 0.35))
    chk_p3 = (spark_cx + int(spark_r * 0.45), spark_cy - int(spark_r * 0.35))
    draw.line([chk_p1, chk_p2, chk_p3], fill=(255, 255, 255, 255), width=chk_w, joint='curve')

    return img

def create_round_icon(img):
    size = img.size[0]
    mask = Image.new('L', (size, size), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.ellipse([0, 0, size, size], fill=255)
    
    round_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    round_img.paste(img, (0, 0), mask=mask)
    return round_img

def main():
    print("Generating Master App Icon (1024x1024)...")
    master = create_app_icon(1024, is_foreground_only=False)
    master_round = create_round_icon(master)
    master_fg = create_app_icon(1024, is_foreground_only=True)

    res_dir = r"C:\Users\ashri\SpringNew\Money_Lending_App\Frontend\android\app\src\main\res"
    densities = {
        'mipmap-mdpi': (48, 108),
        'mipmap-hdpi': (72, 162),
        'mipmap-xhdpi': (96, 216),
        'mipmap-xxhdpi': (144, 324),
        'mipmap-xxxhdpi': (192, 432)
    }

    for folder, (icon_s, fg_s) in densities.items():
        target_dir = os.path.join(res_dir, folder)
        os.makedirs(target_dir, exist_ok=True)

        # 1. ic_launcher.png
        icon = master.resize((icon_s, icon_s), Image.Resampling.LANCZOS)
        icon.save(os.path.join(target_dir, 'ic_launcher.png'), 'PNG')

        # 2. ic_launcher_round.png
        icon_rnd = master_round.resize((icon_s, icon_s), Image.Resampling.LANCZOS)
        icon_rnd.save(os.path.join(target_dir, 'ic_launcher_round.png'), 'PNG')

        # 3. ic_launcher_foreground.png
        fg = master_fg.resize((fg_s, fg_s), Image.Resampling.LANCZOS)
        fg.save(os.path.join(target_dir, 'ic_launcher_foreground.png'), 'PNG')

        print(f"Generated icons in {folder} (Launcher: {icon_s}x{icon_s}, Foreground: {fg_s}x{fg_s})")

    # Also update Frontend public favicon
    public_dir = r"C:\Users\ashri\SpringNew\Money_Lending_App\Frontend\public"
    favicon = master_round.resize((64, 64), Image.Resampling.LANCZOS)
    favicon.save(os.path.join(public_dir, 'favicon.png'), 'PNG')
    print("Saved public favicon.png")

if __name__ == '__main__':
    main()
