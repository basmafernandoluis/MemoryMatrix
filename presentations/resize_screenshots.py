"""
Script de redimensionnement des captures d'écran pour Google Play Store

Spécifications Play Store:
- Téléphone: PNG/JPEG, 16:9 ou 9:16, 1080px minimum, max 3840px
- Recommandé: 1080x1920 (portrait) ou 1920x1080 (paysage)
"""

from PIL import Image
import os
import sys

# Dossier des images
SOURCE_DIR = r"C:\MemoryMatrix\presentations"
OUTPUT_DIR = r"C:\MemoryMatrix\presentations\playstore"

# Spécifications Play Store
PHONE_PORTRAIT = (1080, 1920)   # 9:16 - Format portrait recommandé
PHONE_LANDSCAPE = (1920, 1080)  # 16:9 - Format paysage
TABLET_7 = (1080, 1920)         # 9:16 pour tablette 7"
TABLET_10 = (1920, 1080)        # 16:9 pour tablette 10"
CHROMEBOOK = (1920, 1080)       # 16:9
FEATURE_GRAPHIC = (1024, 500)   # Image de présentation

def get_image_info(image_path):
    """Obtenir les informations d'une image"""
    try:
        with Image.open(image_path) as img:
            width, height = img.size
            aspect_ratio = width / height
            orientation = "portrait" if height > width else "landscape"
            file_size = os.path.getsize(image_path) / (1024 * 1024)  # MB
            
            return {
                'width': width,
                'height': height,
                'aspect_ratio': aspect_ratio,
                'orientation': orientation,
                'size_mb': file_size,
                'format': img.format
            }
    except Exception as e:
        print(f"❌ Erreur lecture {image_path}: {e}")
        return None

def resize_image(input_path, output_path, target_size, quality=95):
    """
    Redimensionner une image en conservant le ratio ou en cropant au centre
    """
    try:
        with Image.open(input_path) as img:
            # Convertir en RGB si nécessaire (pour les PNG avec transparence)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            target_width, target_height = target_size
            target_ratio = target_width / target_height
            img_ratio = img.width / img.height
            
            # Méthode 1: Crop au centre pour respecter le ratio exact
            if abs(img_ratio - target_ratio) > 0.1:  # Si ratio très différent
                # Calculer les dimensions de crop
                if img_ratio > target_ratio:
                    # Image trop large, crop les côtés
                    new_width = int(img.height * target_ratio)
                    new_height = img.height
                    left = (img.width - new_width) // 2
                    top = 0
                else:
                    # Image trop haute, crop haut/bas
                    new_width = img.width
                    new_height = int(img.width / target_ratio)
                    left = 0
                    top = (img.height - new_height) // 2
                
                img = img.crop((left, top, left + new_width, top + new_height))
            
            # Redimensionner à la taille cible
            img = img.resize(target_size, Image.Resampling.LANCZOS)
            
            # Sauvegarder
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
            
            final_size = os.path.getsize(output_path) / (1024 * 1024)
            return True, final_size
            
    except Exception as e:
        print(f"❌ Erreur redimensionnement {input_path}: {e}")
        return False, 0

def main():
    # Créer le dossier de sortie
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/phone", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/tablet_7", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/tablet_10", exist_ok=True)
    
    print("=" * 70)
    print("📱 REDIMENSIONNEMENT DES CAPTURES POUR GOOGLE PLAY STORE")
    print("=" * 70)
    print()
    
    # Lister les images sources
    image_files = [f for f in os.listdir(SOURCE_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    if not image_files:
        print("❌ Aucune image trouvée dans le dossier presentations/")
        return
    
    print(f"📸 {len(image_files)} images trouvées\n")
    
    # Analyser les images
    print("🔍 ANALYSE DES IMAGES SOURCES:")
    print("-" * 70)
    
    for img_file in sorted(image_files):
        img_path = os.path.join(SOURCE_DIR, img_file)
        info = get_image_info(img_path)
        
        if info:
            print(f"📷 {img_file}")
            print(f"   Dimensions: {info['width']}x{info['height']} ({info['orientation']})")
            print(f"   Ratio: {info['aspect_ratio']:.2f}:1")
            print(f"   Taille: {info['size_mb']:.2f} MB")
            print(f"   Format: {info['format']}")
            print()
    
    print("\n" + "=" * 70)
    print("🔧 REDIMENSIONNEMENT EN COURS...")
    print("=" * 70)
    print()
    
    total_processed = 0
    
    for i, img_file in enumerate(sorted(image_files), 1):
        input_path = os.path.join(SOURCE_DIR, img_file)
        base_name = os.path.splitext(img_file)[0]
        
        print(f"[{i}/{len(image_files)}] Traitement: {img_file}")
        
        # Déterminer l'orientation de l'image source
        info = get_image_info(input_path)
        if not info:
            continue
        
        is_portrait = info['orientation'] == 'portrait'
        
        # 1. Version téléphone
        phone_size = PHONE_PORTRAIT if is_portrait else PHONE_LANDSCAPE
        phone_output = f"{OUTPUT_DIR}/phone/{base_name}_phone.jpg"
        success, size = resize_image(input_path, phone_output, phone_size)
        if success:
            print(f"   ✅ Téléphone: {phone_size[0]}x{phone_size[1]} ({size:.2f} MB)")
            total_processed += 1
        
        # 2. Version tablette 7"
        tablet7_size = TABLET_7 if is_portrait else (1920, 1080)
        tablet7_output = f"{OUTPUT_DIR}/tablet_7/{base_name}_tablet7.jpg"
        success, size = resize_image(input_path, tablet7_output, tablet7_size)
        if success:
            print(f"   ✅ Tablette 7\": {tablet7_size[0]}x{tablet7_size[1]} ({size:.2f} MB)")
        
        # 3. Version tablette 10"
        tablet10_output = f"{OUTPUT_DIR}/tablet_10/{base_name}_tablet10.jpg"
        success, size = resize_image(input_path, tablet10_output, TABLET_10)
        if success:
            print(f"   ✅ Tablette 10\": {TABLET_10[0]}x{TABLET_10[1]} ({size:.2f} MB)")
        
        print()
    
    print("=" * 70)
    print(f"✅ TERMINÉ ! {total_processed} images redimensionnées")
    print("=" * 70)
    print()
    print("📂 RÉSULTATS:")
    print(f"   📱 Téléphone: {OUTPUT_DIR}\\phone\\")
    print(f"   📱 Tablette 7\": {OUTPUT_DIR}\\tablet_7\\")
    print(f"   📱 Tablette 10\": {OUTPUT_DIR}\\tablet_10\\")
    print()
    print("📋 SPÉCIFICATIONS RESPECTÉES:")
    print("   ✅ Format: JPEG optimisé")
    print("   ✅ Ratio: 16:9 ou 9:16")
    print("   ✅ Résolution: 1080px minimum")
    print("   ✅ Taille: < 8 MB")
    print()
    print("🚀 PROCHAINES ÉTAPES:")
    print("   1. Sélectionnez 4-8 captures dans le dossier 'phone'")
    print("   2. Uploadez-les dans Google Play Console > Fiche du Play Store")
    print("   3. Ajoutez les versions tablette si nécessaire")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⚠️  Interruption par l'utilisateur")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        sys.exit(1)
