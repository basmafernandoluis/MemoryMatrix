"""
Générateur d'image de présentation pour Google Play Store
Feature Graphic: 1024x500px pour la bannière du Play Store
"""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = r"C:\MemoryMatrix\presentations\playstore"
FEATURE_SIZE = (1024, 500)

def create_feature_graphic():
    """Créer l'image de présentation (bannière Play Store)"""
    
    # Créer une image avec dégradé bleu (couleur de l'app)
    img = Image.new('RGB', FEATURE_SIZE, color='#7EC8E3')
    draw = ImageDraw.Draw(img)
    
    # Créer un dégradé
    for y in range(FEATURE_SIZE[1]):
        # Dégradé du bleu clair au bleu foncé
        r = int(126 + (50 - 126) * y / FEATURE_SIZE[1])
        g = int(200 + (100 - 200) * y / FEATURE_SIZE[1])
        b = int(227 + (200 - 227) * y / FEATURE_SIZE[1])
        draw.rectangle([(0, y), (FEATURE_SIZE[0], y + 1)], fill=(r, g, b))
    
    # Ajouter le texte "Memory Matrix"
    try:
        # Essayer d'utiliser une police système
        font_title = ImageFont.truetype("arial.ttf", 80)
        font_subtitle = ImageFont.truetype("arial.ttf", 35)
    except:
        # Fallback vers police par défaut
        font_title = ImageFont.load_default()
        font_subtitle = ImageFont.load_default()
    
    # Titre principal
    title = "MEMORY MATRIX"
    
    # Calculer position centrée
    bbox = draw.textbbox((0, 0), title, font=font_title)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (FEATURE_SIZE[0] - text_width) // 2
    y = (FEATURE_SIZE[1] - text_height) // 2 - 50
    
    # Ombre du texte
    draw.text((x + 3, y + 3), title, font=font_title, fill='#000000')
    # Texte principal
    draw.text((x, y), title, font=font_title, fill='#FFFFFF')
    
    # Sous-titre
    subtitle = "Entraînez votre mémoire 🧠"
    bbox_sub = draw.textbbox((0, 0), subtitle, font=font_subtitle)
    text_width_sub = bbox_sub[2] - bbox_sub[0]
    
    x_sub = (FEATURE_SIZE[0] - text_width_sub) // 2
    y_sub = y + text_height + 20
    
    # Ombre
    draw.text((x_sub + 2, y_sub + 2), subtitle, font=font_subtitle, fill='#000000')
    # Texte
    draw.text((x_sub, y_sub), subtitle, font=font_subtitle, fill='#FFFFFF')
    
    # Sauvegarder
    output_path = f"{OUTPUT_DIR}/feature_graphic.jpg"
    img.save(output_path, 'JPEG', quality=95)
    
    file_size = os.path.getsize(output_path) / (1024 * 1024)
    print(f"✅ Feature Graphic créée: {output_path}")
    print(f"   Dimensions: {FEATURE_SIZE[0]}x{FEATURE_SIZE[1]}")
    print(f"   Taille: {file_size:.2f} MB")
    
    return output_path

def create_promo_graphic():
    """Créer l'image promotionnelle (optionnelle)"""
    PROMO_SIZE = (180, 120)
    
    img = Image.new('RGB', PROMO_SIZE, color='#7EC8E3')
    draw = ImageDraw.Draw(img)
    
    # Dégradé
    for y in range(PROMO_SIZE[1]):
        r = int(126 + (50 - 126) * y / PROMO_SIZE[1])
        g = int(200 + (100 - 200) * y / PROMO_SIZE[1])
        b = int(227 + (200 - 227) * y / PROMO_SIZE[1])
        draw.rectangle([(0, y), (PROMO_SIZE[0], y + 1)], fill=(r, g, b))
    
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    text = "MM"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (PROMO_SIZE[0] - text_width) // 2
    y = (PROMO_SIZE[1] - text_height) // 2
    
    draw.text((x + 1, y + 1), text, font=font, fill='#000000')
    draw.text((x, y), text, font=font, fill='#FFFFFF')
    
    output_path = f"{OUTPUT_DIR}/promo_graphic.jpg"
    img.save(output_path, 'JPEG', quality=95)
    
    file_size = os.path.getsize(output_path) / (1024 * 1024)
    print(f"✅ Promo Graphic créée: {output_path}")
    print(f"   Dimensions: {PROMO_SIZE[0]}x{PROMO_SIZE[1]}")
    print(f"   Taille: {file_size:.2f} MB")

if __name__ == "__main__":
    print("=" * 70)
    print("🎨 GÉNÉRATION DES ASSETS GRAPHIQUES PLAY STORE")
    print("=" * 70)
    print()
    
    create_feature_graphic()
    print()
    create_promo_graphic()
    
    print()
    print("=" * 70)
    print("✅ TERMINÉ !")
    print("=" * 70)
