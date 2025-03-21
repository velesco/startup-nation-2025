# Plan de Backup și Recuperare - Startup Nation 2025

## Strategia de Backup

### Obiective
- Asigurarea integrității și disponibilității datelor
- Minimizarea timpului de nefuncționare în caz de dezastru
- Protejarea datelor sensibile ale clienților
- Conformarea cu cerințele legale privind păstrarea datelor

### Tipuri de Backup

#### 1. Backup-uri Automate ale Bazei de Date MongoDB
- **Frecvență**: Orară
- **Metodă**: mongodump cu compresie (gzip)
- **Conținut**: Bază de date completă
- **Destinație**: Stocare locală în directorul `/backups`
- **Retenție**: 7 zile (168 de backup-uri orare)

#### 2. Backup-uri Fișiere și Documente
- **Frecvență**: Zilnică (la miezul nopții)
- **Metodă**: Arhivare incrementală
- **Conținut**: Toate documentele încărcate în sistem
- **Destinație**: Stocare secundară
- **Retenție**: 30 de zile

#### 3. Backup-uri Complete Sistem
- **Frecvență**: Săptămânală (duminică, ora 2:00 AM)
- **Metodă**: Snapshot complet
- **Conținut**: Întregul sistem - baza de date, fișiere, configurări
- **Destinație**: Stocare externă
- **Retenție**: 3 luni

## Implementare Tehnică

### Backup-uri MongoDB
```javascript
// Utilizarea MongoDB Backup Tool (mongodump)
const { exec } = require('child_process');
const backupPath = `/backups/mongo_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.gz`;
const cmd = `mongodump --uri=${process.env.MONGODB_URI} --archive=${backupPath} --gzip`;

// Execută comanda de backup
exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`Eroare la backup: ${error.message}`);
    return;
  }
  console.log(`Backup creat cu succes la: ${backupPath}`);
});
```

### Backup-uri Fișiere
```javascript
// Utilizarea rsync pentru backup-uri incrementale de fișiere
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const backupDestination = process.env.BACKUP_DESTINATION || '/backups/files';
const timestamp = new Date().toISOString().slice(0, 10);
const cmd = `rsync -avz --delete ${uploadDir}/ ${backupDestination}/${timestamp}/`;

exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`Eroare la backup fișiere: ${error.message}`);
    return;
  }
  console.log(`Backup fișiere creat cu succes la: ${backupDestination}/${timestamp}/`);
});
```

### Planificare și Automatizare
- Utilizarea node-cron pentru planificarea backup-urilor:

```javascript
const cron = require('node-cron');

// Backup de bază de date orar
cron.schedule('0 * * * *', runDatabaseBackup);

// Backup de fișiere zilnic
cron.schedule('0 0 * * *', runFileBackup);

// Backup complet săptămânal
cron.schedule('0 2 * * 0', runFullSystemBackup);
```

### Rotație și Management Backup-uri
```javascript
// Exemplu de funcție pentru ștergerea backup-urilor vechi
function cleanupOldBackups() {
  const backupDir = '/backups';
  const retentionDays = 7;
  const cmd = `find ${backupDir}/mongo_* -type f -mtime +${retentionDays} -delete`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Eroare la curățare backup-uri: ${error.message}`);
      return;
    }
    console.log('Backup-uri vechi eliminate cu succes');
  });
}
```

## Procedura de Restaurare

### Restaurare Bază de Date
1. Oprește serviciile aplicației
2. Selectează fișierul de backup corespunzător
3. Execută comanda `mongorestore`:
   ```bash
   mongorestore --uri=mongodb://username:password@host:port/database --archive=/path/to/backup.gz --gzip
   ```
4. Verifică integritatea datelor
5. Repornește serviciile aplicației

### Restaurare Fișiere
1. Identifică directorul de backup corespunzător datei necesare
2. Copiază fișierele în locația originală:
   ```bash
   rsync -avz /backups/files/YYYY-MM-DD/ /path/to/uploads/
   ```
3. Verifică permisiunile fișierelor restaurate

### Restaurare Completă Sistem
1. Oprește toate serviciile
2. Restaurează baza de date din backup
3. Restaurează fișierele din backup
4. Verifică și restaurează configurările
5. Repornește serviciile în ordinea corectă:
   - Baza de date
   - Backend API
   - Frontend

## Testare și Validare

### Program de Testare
- **Frecvență**: Lunar
- **Procedură**:
  1. Restaurare de test într-un mediu izolat
  2. Verificarea integrității datelor
  3. Măsurarea timpului de restaurare
  4. Testarea funcționalității aplicației

### Documentare
- Documentează fiecare test de restaurare
- Notează orice probleme întâlnite
- Actualizează procedurile în funcție de rezultate

## Monitorizare și Alertare

### Monitorizare
- Verificare automată a succesului fiecărui backup
- Monitorizarea spațiului de stocare disponibil
- Verificarea integrității fișierelor de backup

### Alertare
- Alerte email pentru administratori în caz de eșec
- Integrare cu sistemul de monitorizare pentru notificări în timp real
- Raport săptămânal de status al backup-urilor

## Recomandări Suplimentare

1. **Backup-uri Off-site**
   - Configurează replicarea backup-urilor într-o locație geografică diferită
   - Consideră servicii cloud pentru stocare redundantă

2. **Criptare**
   - Criptează toate backup-urile care conțin date sensibile
   - Stochează cheile de criptare separat de backup-uri

3. **Documentație**
   - Menține documentația actualizată cu toate procedurile
   - Asigură-te că mai mulți membri ai echipei cunosc procedurile

4. **Audit Regular**
   - Efectuează audituri periodice ale sistemului de backup
   - Adaptează strategia în funcție de creșterea volumului de date

## Persoane Responsabile

- **Administrator Sistem**: Responsabil pentru configurarea și monitorizarea sistemului de backup
- **DevOps**: Responsabil pentru automatizarea și optimizarea proceselor
- **Administrator Bază de Date**: Responsabil pentru integritatea datelor și procedurile de restaurare

## Plan de Acțiune în Caz de Dezastru

1. **Evaluare**
   - Identifică natura și amploarea incidentului
   - Evaluează impactul asupra datelor și serviciilor

2. **Comunicare**
   - Notifică echipa tehnică conform planului de escaladare
   - Informează stakeholderii despre situație și timpul estimat de rezolvare

3. **Restaurare**
   - Urmează procedurile documentate pentru restaurarea sistemelor afectate
   - Prioritizează componentele critice ale aplicației

4. **Verificare**
   - Efectuează teste comprehensive pentru a confirma funcționalitatea
   - Verifică integritatea datelor post-restaurare

5. **Raportare**
   - Documentează incidentul și pașii de restaurare
   - Propune îmbunătățiri pentru prevenirea unor incidente similare
