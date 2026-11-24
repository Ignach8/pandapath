# PandaPath 🐼

App Android (Expo / React Native) para aprender **chino mandarín (HSK 1–9, estándar HSK 3.0)** y **TOEFL iBT**, con una ruta gamificada guiada por el panda Bambú. Interfaz en **español, inglés y 中文**.

## Qué incluye

- **Ruta de aprendizaje** por unidades (vidas, gemas, XP, racha, misiones diarias, estrellas por lección).
- **Guía por unidad** (explicaciones, vocabulario y frases con audio) y **mapa de contenidos** de todos los cursos, con "saltar a esta unidad".
- **Ejercicios**: tarjetas de palabra nueva, selección múltiple, escucha, tonos, emparejar, armar frases/pinyin/hanzi, completar, **trazo de caracteres** (orden de trazos), **pronunciación** (micrófono), **escritura** (email/discusión/entrevista TOEFL con lista de verificación y modelo) y **conversaciones guiadas**.
- **Práctica inteligente**: repaso espaciado (cajas Leitner) y drills de escucha, tonos, pronunciación y escritura.
- **Audio**: voz del dispositivo (TTS) en zh-CN / en-US / es-ES con velocidad normal y lenta, más efectos de sonido.

## Contenido y alcance

| Curso | Unidades | Detalle |
|---|---|---|
| HSK 1 | 35 | 8 unidades temáticas curadas (guía, frases, diálogos) + resto de vocabulario |
| HSK 2–6, 7–9 | 25–610 | Vocabulario oficial HSK 3.0 en unidades de 8 palabras (sin frases de ejemplo) |
| TOEFL iBT | 10 | Vocabulario académico, lectura, escucha, escritura y habla (formatos 2026) |

Glosas en español para HSK 1–2; en inglés para el resto. Trazos offline para los 653 caracteres de HSK 1–3.

## Ejecutar en desarrollo

```bash
npm install
npx expo start          # Expo Go sirve para casi todo
```

El reconocimiento de voz (`expo-speech-recognition`) requiere el APK / development build; en Expo Go la app cae a autoevaluación.

## Generar el APK

**Opción A – EAS (recomendada)**

```bash
npm i -g eas-cli
eas login
eas build -p android --profile preview   # genera un .apk instalable
```

**Opción B – GitHub Actions**: sube el repo y ejecuta el workflow *Build APK* (pestaña Actions). El `.apk` queda como artefacto.

## Audio en chino

La voz proviene del motor TTS del teléfono. Si la app muestra "No se detectó voz en chino", instala los datos de voz en *Ajustes → Texto a voz → Google → Instalar datos de voz → Chino*.

## Regenerar el contenido

```bash
python3 scripts/build-content.py <ruta/complete-hsk-vocabulary> <ruta/node_modules>
python3 scripts/make-assets.py     # íconos y efectos de sonido
```

## Licencias y atribuciones

- Lista de palabras: [complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) (MIT); definiciones de [CC-CEDICT](https://cc-cedict.org) (CC BY-SA 4.0).
- Orden de trazos: [hanzi-writer](https://hanziwriter.org) (MIT) y datos de [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) (Arphic Public License).
- TOEFL® es marca registrada de ETS. PandaPath no está afiliada ni avalada por ETS ni por Chinese Testing International. El contenido de práctica es original.
- Mascota, íconos y sonidos: originales (generados en `scripts/make-assets.py`).
