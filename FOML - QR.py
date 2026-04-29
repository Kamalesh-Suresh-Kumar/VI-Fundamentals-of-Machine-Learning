import qrcode
from PIL import Image, ImageDraw, ImageFont

# --- INPUT ---
github_url = "https://github.com/Kamalesh-Suresh-Kumar/VI-Fundamentals-of-Machine-Learning.git"

# --- GENERATE QR ---
qr = qrcode.QRCode(
    version=1,
    box_size=10,
    border=4
)
qr.add_data(github_url)
qr.make(fit=True)

qr_img = qr.make_image(fill_color="black", back_color="white").convert('RGB')

# --- ADD TEXT BELOW ---
width, height = qr_img.size
new_height = height + 60  # space for text

new_img = Image.new("RGB", (width, new_height), "white")
new_img.paste(qr_img, (0, 0))

draw = ImageDraw.Draw(new_img)

# Load default font (or specify a .ttf file for better styling)
try:
    font = ImageFont.truetype("arial.ttf", 30)
except:
    font = ImageFont.load_default()

text = "230701138 - SCAN ME"
text_width, text_height = draw.textbbox((0, 0), text, font=font)[2:]

# Center text
text_x = (width - text_width) // 2
text_y = height + (60 - text_height) // 2

draw.text((text_x, text_y), text, fill="black", font=font)

# --- SAVE ---
new_img.save("github_qr.png")

print("QR Code saved as github_qr.png")