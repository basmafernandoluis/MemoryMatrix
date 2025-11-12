#!/usr/bin/env python3
"""
Script pour synchroniser toutes les traductions manquantes des fichiers de locale
depuis fr.json et en.json vers les autres langues (es, de, pt, ja, zh, ar)
"""

import json
import os
from pathlib import Path

# Traductions manuelles pour les sections manquantes
TRANSLATIONS = {
    "es": {
        "common": {"easy": "Fácil", "medium": "Medio", "hard": "Difícil"},
        "login": {
            "title": "Memory Matrix",
            "subtitle": "Desafío",
            "tagline": "¡Prueba tu memoria, mejora tu puntuación! 🧠",
            "features": {
                "gameplay": "Jugabilidad adictiva",
                "dailyChallenges": "Desafíos diarios",
                "achievements": "Logros para desbloquear",
                "savedProgress": "Progreso guardado"
            },
            "guestButton": "👤 COMENZAR",
            "guestSubtext": "Jugar en modo invitado",
            "disclaimer": "Tu progreso se guardará automáticamente",
            "connecting": "Conectando..."
        },
        "modes": {
            "classicDesc": "10 niveles, 5 vidas. ¡El modo original!",
            "survivalDesc": "Vida infinita, dificultad creciente. ¿Hasta dónde llegarás?",
            "timeAttackDesc": "¡120 segundos para obtener la máxima puntuación!",
            "zenDesc": "Sin presión. Tómate tu tiempo, relájate.",
            "custom": "Personalizado",
            "customDesc": "¡Crea tu propio desafío!",
            "unlockInfo": "¡Completa los niveles para desbloquear los modos!",
            "unlockLevel": "Nivel {{level}}",
            "unlockFriendWins": "{{count}} victorias contra amigos ({{current}}/{{count}})"
        },
        "challenges": {
            "loading": "Cargando desafíos...",
            "timeFormat": "{{hours}}h {{minutes}}m restantes",
            "infoBanner": "💡 Completa los desafíos jugando partidas normales. ¡Los desafíos se renuevan cada día!",
            "types": {
                "score": "Puntuación total",
                "speed": "Rapidez",
                "precision": "Precisión",
                "endurance": "Resistencia"
            },
            "descriptions": {
                "scoreGoal": "Alcanza {{goal}} puntos",
                "speedGoal": "Completa {{goal}} niveles en menos de {{time}}s",
                "precisionGoal": "{{goal}} respuestas correctas seguidas",
                "enduranceGoal": "Sobrevive {{goal}} niveles sin error"
            },
            "speed": {
                "lightningSpeed": {
                    "title": "Velocidad relámpago",
                    "description": "Alcanzar el nivel 5 en menos de 2 minutos"
                },
                "mentalSprinter": {
                    "title": "Velocista mental",
                    "description": "Alcanzar el nivel 8 en menos de 3 minutos"
                },
                "memoryFlash": {
                    "title": "Flash de memoria",
                    "description": "Alcanzar el nivel 10 en menos de 4 minutos"
                }
            },
            "accuracy": {
                "perfectionist": {
                    "title": "Perfeccionista",
                    "description": "Completar 5 secuencias sin error"
                },
                "absolutePrecision": {
                    "title": "Precisión absoluta",
                    "description": "Completar 10 secuencias perfectas seguidas"
                },
                "precisionMaster": {
                    "title": "Maestro de la precisión",
                    "description": "Completar 15 secuencias sin ningún error"
                }
            },
            "endurance": {
                "mentalMarathon": {
                    "title": "Maratón mental",
                    "description": "Jugar 5 partidas en la misma sesión"
                },
                "enduring": {
                    "title": "Resistente",
                    "description": "Jugar 10 partidas en el mismo día"
                },
                "indestructible": {
                    "title": "Indestructible",
                    "description": "Jugar 15 partidas sin abandonar"
                }
            },
            "score": {
                "pointHunter": {
                    "title": "Cazador de puntos",
                    "description": "Alcanzar una puntuación de 3000 puntos"
                },
                "collector": {
                    "title": "Coleccionista",
                    "description": "Alcanzar una puntuación de 5000 puntos"
                },
                "scoreLegend": {
                    "title": "Leyenda de puntuación",
                    "description": "Alcanzar una puntuación de 10000 puntos"
                }
            },
            "perfect": {
                "flawless": {
                    "title": "Sin fallas",
                    "description": "Completar una partida sin ningún error hasta el nivel 8"
                },
                "absolutePerfection": {
                    "title": "Perfección absoluta",
                    "description": "Terminar una partida perfecta hasta el nivel 8"
                }
            }
        }
    }
}

def load_json(filepath):
    """Charger un fichier JSON"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    """Sauvegarder un fichier JSON avec indentation"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_missing_keys(source, target, path=""):
    """Trouver les clés manquantes récursivement"""
    missing = {}
    
    for key, value in source.items():
        current_path = f"{path}.{key}" if path else key
        
        if key not in target:
            missing[key] = value
        elif isinstance(value, dict) and isinstance(target.get(key), dict):
            nested_missing = get_missing_keys(value, target[key], current_path)
            if nested_missing:
                missing[key] = nested_missing
    
    return missing

def merge_dicts(target, source):
    """Fusionner deux dictionnaires récursivement"""
    for key, value in source.items():
        if key in target and isinstance(target[key], dict) and isinstance(value, dict):
            merge_dicts(target[key], value)
        else:
            target[key] = value
    
    return target

def main():
    locales_dir = Path("src/services/locales")
    
    # Charger les fichiers de référence
    fr_data = load_json(locales_dir / "fr.json")
    en_data = load_json(locales_dir / "en.json")
    
    # Langues à mettre à jour
    languages = ["es", "de", "pt", "ja", "zh", "ar"]
    
    for lang in languages:
        print(f"\n=== Processing {lang}.json ===")
        lang_file = locales_dir / f"{lang}.json"
        lang_data = load_json(lang_file)
        
        # Trouver les clés manquantes
        missing_from_fr = get_missing_keys(fr_data, lang_data)
        
        if missing_from_fr:
            print(f"Found {len(missing_from_fr)} top-level missing keys from FR")
            
            # Fusionner avec les traductions personnalisées si disponibles
            if lang in TRANSLATIONS:
                print(f"Applying custom translations for {lang}")
                lang_data = merge_dicts(lang_data, TRANSLATIONS[lang])
            
            # Pour les clés restantes manquantes, utiliser les valeurs anglaises comme fallback
            # (dans un cas réel, il faudrait les traduire)
            for key in missing_from_fr:
                if key not in lang_data:
                    print(f"  - Adding {key} from EN (fallback)")
                    lang_data[key] = en_data.get(key, missing_from_fr[key])
        
        # Sauvegarder
        save_json(lang_file, lang_data)
        print(f"✓ {lang}.json updated")
    
    print("\n=== All translations synchronized! ===")

if __name__ == "__main__":
    main()
