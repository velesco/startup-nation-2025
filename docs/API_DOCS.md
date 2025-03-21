# API Documentation - Startup Nation 2025

## Prezentare Generală

API-ul Startup Nation 2025 este construit pe arhitectură RESTful și oferă acces la toate funcționalitățile platformei. API-ul este protejat prin autentificare JWT și include rate limiting pentru a preveni abuzurile.

**URL de Bază**: `https://api.startupnation2025.ro/api/v1`

## Autentificare

### Obținere Token

```
POST /auth/login
```

**Parametri de Request**:
```json
{
  "email": "utilizator@exemplu.ro",
  "password": "parola123"
}
```

**Răspuns de Succes**:
```json
{
  "success": true,
  "message": "Autentificare reușită",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "Nume Utilizator",
    "email": "utilizator@exemplu.ro",
    "role": "partner"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Reînnoire Token

```
POST /auth/refresh-token
```

**Parametri de Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Răspuns de Succes**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Deconectare

```
POST /auth/logout
```

**Parametri de Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Răspuns de Succes**:
```json
{
  "success": true,
  "message": "Deconectare reușită"
}
```

## Gestionare Clienți

### Listare Clienți

```
GET /clients
```

**Parametri Query**:
- `page`: Numărul paginii (default: 1)
- `limit`: Numărul de rezultate pe pagină (default: 10)
- `search`: Termen de căutare
- `status`: Filtrare după status (Nou, În progres, Complet, Anulat)
- `group`: Filtrare după ID-ul grupei
- `sortBy`: Câmpul după care se sortează (default: createdAt)
- `sortOrder`: Ordinea sortării (asc, desc - default: desc)

**Răspuns de Succes**:
```json
{
  "success": true,
  "data": [
    {
      "id": "60d21b4667d0d8992e610c85",
      "name": "Popescu Maria",
      "email": "maria.popescu@exemplu.ro",
      "phone": "0722123456",
      "status": "Complet",
      "registrationDate": "2025-02-15T00:00:00.000Z",
      "group": "Grupa 1 - Martie",
      "initials": "PM"
    },
    // ... alte înregistrări
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Obținere Client după ID

```
GET /clients/:id
```

**Răspuns de Succes**:
```json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "Popescu Maria",
    "email": "maria.popescu@exemplu.ro",
    "phone": "0722123456",
    "status": "Complet",
    "registrationDate": "2025-02-15T00:00:00.000Z",
    "groupId": {
      "_id": "60d21b4667d0d8992e610c90",
      "name": "Grupa 1 - Martie"
    },
    "businessDetails": {
      "companyName": "Popescu SRL",
      "cui": "12345678",
      "registrationNumber": "J40/123/2025",
      "address": "Str. Exemplu nr. 10, București",
      "activityDomain": "IT"
    },
    "applicationDetails": {
      "projectValue": 250000,
      "fundingAmount": 200000,
      "ownContribution": 50000,
      "expectedJobsCreated": 3,
      "region": "București-Ilfov"
    }
  }
}
```

### Creare Client Nou

```
POST /clients
```

**Parametri de Request**:
```json
{
  "name": "Ionescu Dan",
  "email": "dan.ionescu@exemplu.ro",
  "phone": "0733987654",
  "businessDetails": {
    "companyName": "Ionescu SRL",
    "cui": "87654321",
    "registrationNumber": "J40/321/2025",
    "address": "Str. Exemplu nr. 20, București",
    "activityDomain": "E-commerce"
  },
  "applicationDetails": {
    "projectValue": 220000,
    "fundingAmount": 180000,
    "ownContribution": 40000,
    "expectedJobsCreated": 2,
    "region": "București-Ilfov"
  }
}
```

**Răspuns de Succes**:
```json
{
  "success": true,
  "message": "Client creat cu succes",
  "data": {
    "id": "60d21b4667d0d8992e610c86",
    "name": "Ionescu Dan",
    "email": "dan.ionescu@exemplu.ro",
    "phone": "0733987654",
    "status": "Nou",
    "registrationDate": "2025-03-20T14:30:45.123Z",
    "businessDetails": {
      "companyName": "Ionescu SRL",
      "cui": "87654321",
      "registrationNumber": "J40/321/2025",
      "address": "Str. Exemplu nr. 20, București",
      "activityDomain": "E-commerce"
    },
    "applicationDetails": {
      "projectValue": 220000,
      "fundingAmount": 180000,
      "ownContribution": 40000,
      "expectedJobsCreated": 2,
      "region": "București-Ilfov"
    }
  }
}
```

### Actualizare Client

```
PUT /clients/:id
```

**Parametri de Request**: Aceiași ca la creare client.

**Răspuns de Succes**:
```json
{
  "success": true,
  "message": "Client actualizat cu succes",
  "data": {
    // Datele actualizate ale clientului
  }
}
```

### Ștergere Client

```
DELETE /clients/:id
```

**Răspuns de Succes**:
```json
{
  "success": true,
  "message": "Client șters cu succes"
}
```

### Actualizare Status Client

```
PUT /clients/:id/status
```

**Parametri de Request**:
```json
{
  "status": "În progres"
}
```

**Răspuns de Succes**:
```json
{
  "success": true,
  "message": "Status actualizat cu succes",
  "data": {
    // Datele clientului cu statusul actualizat
  }
}
```

## Gestionare Documente

### Încărcare Document

```
POST /clients/:id/documents
```

**Parametri de Request**: Form Data
- `document`: Fișierul care trebuie încărcat
- `name`: Numele documentului
- `type`: Tipul documentului (Plan de afaceri, Act identitate, etc.)

**Răspuns de Succes**:
```json
{
  "success": true,
  "message": "Document încărcat cu succes",
  "data": {
    "id": "60d21b4667d0d8992e610c87",
    "name": "Plan de afaceri Ionescu SRL",
    "type": "Plan de afaceri",
    "filePath": "uploads/documents/plan-afaceri-1615123456789.pdf",
    "fileSize": 1234567,
    "mimeType": "application/pdf",
    "status": "Nou",
    "uploadedBy": "60d21b4667d0d8992e610c88",
    "createdAt": "2025-03-20T15:30:45.123Z"
  }
}
```

### Listare Documente pentru Client

```
GET /clients/:id/documents
```

**Răspuns de Succes**:
```json
{
  "success": true,
  "data": [
    {
      "id": "60d21b4667d0d8992e610c87",
      "name": "Plan de afaceri Ionescu SRL",
      "type": "Plan de afaceri",
      "filePath": "uploads/documents/plan-afaceri-1615123456789.pdf",
      "fileSize": 1234567,
      "mimeType": "application/pdf",
      "status": "Nou",
      "uploadedBy": {
        "_id": "60d21b4667d0d8992e610c88",
        "name": "Admin Utilizator"
      },
      "createdAt": "2025-03-20T15:30:45.123Z"
    },
    // ... alte documente
  ]
}
```

## Gestionare Grupe

### Listare Grupe

```
GET /groups
```

**Parametri Query**:
- `status`: Filtrare după status (Activ, Inactiv, Arhivat)

**Răspuns de Succes**:
```json
{
  "success": true,
  "data": [
    {
      "id": "60d21b4667d0d8992e610c90",
      "name": "Grupa 1 - Martie",
      "description": "Grupa pentru luna martie 2025",
      "startDate": "2025-03-01T00:00:00.000Z",
      "endDate": "2025-03-31T00:00:00.000Z",
      "maxClients": 20,
      "status": "Activ",
      "clientCount": 15
    },
    // ... alte grupe
  ]
}
```

### Creare Grupă Nouă

```
POST /groups
```

**Parametri de Request**:
```json
{
  "name": "Grupa 2 - Aprilie",
  "description": "Grupa pentru luna aprilie 2025",
  "startDate": "2025-04-01T00:00:00.000Z",
  "endDate": "2025-04-30T00:00:00.000Z",
  "maxClients": 20
}
```

**Răspuns de Succes**:
```json
{
  "success": true,
  "message": "Grupă creată cu succes",
  "data": {
    "id": "60d21b4667d0d8992e610c91",
    "name": "Grupa 2 - Aprilie",
    "description": "Grupa pentru luna aprilie 2025",
    "startDate": "2025-04-01T00:00:00.000Z",
    "endDate": "2025-04-30T00:00:00.000Z",
    "maxClients": 20,
    "status": "Activ",
    "partnerId": "60d21b4667d0d8992e610c92",
    "createdAt": "2025-03-20T16:30:45.123Z"
  }
}
```

### Atribuire Client la Grupă

```
PUT /clients/:id/group
```

**Parametri de Request**:
```json
{
  "groupId": "60d21b4667d0d8992e610c90"
}
```

**Răspuns de Succes**:
```json
{
  "success": true,
  "message": "Client atribuit grupei cu succes",
  "data": {
    // Datele clientului actualizate
  }
}
```

## Coduri de Eroare

- `400 Bad Request`: Datele trimise sunt invalide sau incomplete
- `401 Unauthorized`: Autentificare necesară sau token invalid/expirat
- `403 Forbidden`: Utilizatorul nu are permisiunea necesară
- `404 Not Found`: Resursa solicitată nu a fost găsită
- `409 Conflict`: Conflict cu starea curentă a resursei (ex: email deja utilizat)
- `429 Too Many Requests`: Prea multe cereri într-un interval de timp
- `500 Internal Server Error`: Eroare internă a serverului

## Limite și Restricții

- **Rate Limiting**: Maximum 100 de cereri pe minut per IP
- **Dimensiune Fișiere**: Maximum 10MB per fișier încărcat
- **Tipuri de Fișiere Acceptate**: PDF, Word, Excel, PowerPoint, imagini (JPEG, PNG, GIF), text

## Exemple de Utilizare

### Autentificare și Obținere Clienți (cURL)

```bash
# Autentificare
curl -X POST https://api.startupnation2025.ro/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"utilizator@exemplu.ro","password":"parola123"}'

# Obținere clienți cu token
curl -X GET https://api.startupnation2025.ro/api/v1/clients \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Autentificare și Obținere Clienți (JavaScript)

```javascript
// Autentificare
async function login() {
  const response = await fetch('https://api.startupnation2025.ro/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'utilizator@exemplu.ro',
      password: 'parola123'
    })
  });
  
  const data = await response.json();
  return data.token;
}

// Obținere clienți
async function getClients(token) {
  const response = await fetch('https://api.startupnation2025.ro/api/v1/clients', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}

// Utilizare
async function main() {
  const token = await login();
  const clients = await getClients(token);
  console.log(clients.data);
}
```

## Suport și Contact

Pentru asistență tehnică sau întrebări legate de API, vă rugăm să contactați:

- Email: api-support@startupnation2025.ro
- Telefon: 0800 123 456 (Luni-Vineri, 9:00-17:00)

## Actualizări și Versiuni

API-ul urmează principiile de versionare semantică. Versiunea curentă este v1.

### Istoricul Versiunilor

#### v1.0.0 (20 Martie 2025)
- Lansarea inițială a API-ului
- Endpoint-uri pentru autentificare, clienți, documente și grupe

#### v1.1.0 (Planificat: Aprilie 2025)
- Endpoint-uri pentru rapoarte avansate
- Îmbunătățiri pentru căutare și filtrare

## Politici și Termeni

### Politica de Utilizare Acceptabilă
- API-ul trebuie utilizat exclusiv pentru scopuri legitime legate de programul Startup Nation 2025
- Utilizarea abuzivă poate duce la restricționarea sau blocarea accesului
- Datele obținute prin API trebuie tratate conform legislației privind protecția datelor

### SLA (Service Level Agreement)
- Disponibilitate garantată: 99.9%
- Timp de răspuns mediu: <200ms
- Notificare în avans pentru întreținere planificată: minim 48 ore

## Webhoooks

API-ul oferă suport pentru webhooks pentru a notifica aplicațiile terțe despre evenimente importante.

### Înregistrare Webhook

```
POST /webhooks
```

**Parametri de Request**:
```json
{
  "url": "https://exemplu.ro/webhook-receiver",
  "events": ["client.created", "client.updated", "document.uploaded"],
  "secret": "your_webhook_secret"
}
```

### Evenimente Disponibile
- `client.created`: Un client nou a fost creat
- `client.updated`: Datele unui client au fost actualizate
- `client.deleted`: Un client a fost șters
- `client.status_changed`: Statusul unui client a fost schimbat
- `document.uploaded`: Un document nou a fost încărcat
- `group.created`: O grupă nouă a fost creată
- `group.updated`: O grupă a fost actualizată

### Format Payload Webhook
```json
{
  "event": "client.created",
  "timestamp": "2025-03-20T16:45:32.123Z",
  "data": {
    // Datele specifice evenimentului
  }
}
```

## Integrări cu Servicii Terțe

API-ul poate fi integrat cu:

- Sisteme CRM
- Platforme de contabilitate
- Sisteme de management documente
- Aplicații mobile personalizate
- Platforme de raportare și analitică

## Optimizări și Recomandări

1. **Utilizarea Pagination**:
   - Folosiți parametrii `page` și `limit` pentru a optimiza încărcarea datelor

2. **Reducerea Numărului de Cereri**:
   - Utilizați parametrii de filtrare pentru a obține doar datele necesare
   - Implementați cache local pentru datele care nu se schimbă frecvent

3. **Gestionarea Token-urilor**:
   - Reînnoiți token-ul înainte de expirare pentru a evita întreruperile
   - Stocați refresh token-ul în mod securizat
   
4. **Optimizare Upload Fișiere**:
   - Comprimați fișierele mari înainte de încărcare
   - Verificați tipul și dimensiunea fișierului înainte de trimitere
