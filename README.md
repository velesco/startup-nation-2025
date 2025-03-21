# Startup Nation 2025 - Portal de Management

Această platformă oferă o soluție completă pentru gestionarea clienților și procesul de aplicare în cadrul programului Startup Nation 2025.

## Funcționalități Principale

### Portal Public
- Landing page informativ despre program
- Formular de aplicare pentru potențiali clienți
- Modele de planuri de afaceri disponibile

### Portal Parteneri
- Dashboard cu statistici și activități recente
- Gestionare completă a clienților (adăugare, editare, ștergere)
- Sistem de organizare pe grupe
- Upload și management documente
- Comunicare cu clienții prin note și actualizări de status

### Backend & Infrastructură
- Autentificare securizată cu JWT
- API RESTful
- Bază de date MongoDB cu backup-uri orare
- Notificări prin email

## Structura Proiectului

```
startup-nation-2025/
├── frontend/               # Aplicația React
│   ├── public/             # Fișiere statice
│   └── src/                # Cod sursă React
│       ├── components/     # Componente reutilizabile
│       ├── contexts/       # Context providers
│       ├── pages/          # Pagini principale
│       └── services/       # Servicii API
├── backend/                # API Node.js
│   ├── src/                # Cod sursă Node.js
│   │   ├── config/         # Configurări
│   │   ├── controllers/    # Controllere API
│   │   ├── models/         # Modele MongoDB
│   │   ├── routes/         # Rute API
│   │   ├── middlewares/    # Middleware-uri
│   │   └── utils/          # Utilități
│   └── uploads/            # Fișiere încărcate
└── docs/                   # Documentație
```

## Tehnologii Utilizate

### Frontend
- React.js
- Material-UI
- React Router
- Context API
- Formik & Yup
- Axios
- Recharts

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT
- Multer
- Nodemailer
- Node-cron

## Instalare și Rulare

### Cerințe
- Node.js v16+
- MongoDB v5+
- npm sau yarn

### Pași de Instalare

1. Clonează repository-ul
```bash
git clone https://github.com/yourusername/startup-nation-2025.git
cd startup-nation-2025
```

2. Instalează dependențele pentru backend
```bash
cd backend
npm install
```

3. Configurează variabilele de mediu
```bash
cp .env.example .env
# Editează fișierul .env cu setările tale
```

4. Instalează dependențele pentru frontend
```bash
cd ../frontend
npm install
```

### Rulare în dezvoltare

1. Pornește serverul backend
```bash
cd backend
npm run dev
```

2. În alt terminal, pornește aplicația frontend
```bash
cd frontend
npm start
```

3. Accesează aplicația în browser la adresa `http://localhost:3000`

## Backup și Recuperare

Sistemul realizează automat backup-uri orare ale bazei de date MongoDB. Backup-urile sunt stocate în directorul `/backend/backups` și sunt păstrate pentru 7 zile.

Pentru a restaura un backup:
```bash
cd backend
npm run restore -- --file=backups/backup_yyyy-mm-dd_hh-mm.gz
```

## Deployment

### Producție cu Docker

1. Construiește imaginile Docker
```bash
docker-compose build
```

2. Rulează containerele
```bash
docker-compose up -d
```

3. Oprește containerele
```bash
docker-compose down
```

## Licență

Acest proiect este proprietatea Tech Partners SRL.
