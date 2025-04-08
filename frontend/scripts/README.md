# Generator de Favicon-uri pentru Startup Nation 2025

Acest script convertește fișierele SVG în favicon-uri PNG de diferite dimensiuni pentru website-ul Startup Nation 2025.

## Instalare

```bash
cd scripts
npm install
```

## Utilizare

```bash
npm run generate
```

## Ce face scriptul

Scriptul va converti fișierul SVG de bază (`favicon.svg`) în următoarele formate:

- favicon-16x16.png (16x16 pixeli)
- favicon-32x32.png (32x32 pixeli)
- apple-touch-icon.png (180x180 pixeli)
- logo192.png (192x192 pixeli)
- logo512.png (512x512 pixeli)

Toate fișierele vor fi generate în directorul `/public`.

## Dependințe

- Node.js
- sharp (pentru procesarea imaginilor)

## Troubleshooting

Dacă întâmpini probleme, asigură-te că ai instalat toate dependințele cu `npm install`.