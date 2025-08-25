# Diagnostic și Soluții pentru Eroarea 502 Bad Gateway

## 🔍 **Problemă Identificată:**
- Eroare 502 Bad Gateway la login
- Frontend: `aplica-startup.ro` încearcă să comunice cu backend-ul
- Backend nu răspunde sau nu funcționează

## 🚨 **Cauze Posibile:**

### 1. **Backend Node.js nu rulează**
```bash
# Verifică statusul PM2
pm2 status

# Verifică logurile PM2
pm2 logs

# Restart backend dacă este necesar
pm2 restart all
```

### 2. **Port-ul greșit în configurația nginx**
```bash
# Verifică configurația nginx
sudo nginx -t

# Verifică logurile nginx
sudo tail -f /var/log/nginx/error.log

# Verifică ce port folosește aplicația Node.js
sudo netstat -tlnp | grep node
```

### 3. **Backend a crăpat din cauza unei erori**
```bash
# Verifică logurile aplicației
tail -f /home/ubuntu/startup-nation-2025/backend/logs/combined.log
tail -f ~/.pm2/logs/startup-nation-backend-error.log
```

### 4. **Dependența OpenAI lipsă**
Noul cod adăugat necesită `openai` package:
```bash
cd /home/ubuntu/startup-nation-2025/backend
npm install openai
```

## 🛠️ **Pași de Rezolvare:**

### **Pasul 1: Verifică Backend-ul**
```bash
# SSH pe server
ssh ubuntu@your-server

# Verifică statusul serviciilor
pm2 status
pm2 logs --lines 50

# Dacă backend nu rulează:
cd /home/ubuntu/startup-nation-2025/backend
pm2 restart all
```

### **Pasul 2: Instalează Dependențele Noi**
```bash
cd /home/ubuntu/startup-nation-2025/backend
npm install openai
pm2 restart all
```

### **Pasul 3: Configurează OpenAI API Key**
```bash
# Editează fișierul .env
nano /home/ubuntu/startup-nation-2025/backend/.env

# Adaugă linia:
OPENAI_API_KEY=your-openai-api-key-here
```

### **Pasul 4: Verifică Nginx**
```bash
# Testează configurația nginx
sudo nginx -t

# Restartează nginx
sudo systemctl reload nginx

# Verifică statusul nginx
sudo systemctl status nginx
```

### **Pasul 5: Verifică Porturile**
```bash
# Verifică ce servicii rulează pe porturile folosite
sudo netstat -tlnp | grep :5003  # Backend port
sudo netstat -tlnp | grep :80    # Nginx port
sudo netstat -tlnp | grep :443   # HTTPS port
```

## 🔧 **Comenzi de Urgență:**

### **Quick Fix - Restart Totală:**
```bash
cd /home/ubuntu/startup-nation-2025/backend
npm install openai
pm2 restart all
sudo systemctl reload nginx
```

### **Verifică Logurile în Timp Real:**
```bash
# Terminal 1: Backend logs
pm2 logs

# Terminal 2: Nginx logs
sudo tail -f /var/log/nginx/error.log

# Terminal 3: System logs
sudo journalctl -f
```

## 📋 **Verificări Post-Fix:**

1. **Testează Backend Direct:**
```bash
curl http://localhost:5003/health
```

2. **Testează prin Nginx:**
```bash
curl http://aplica-startup.ro/api/health
```

3. **Testează Login-ul:**
```bash
curl -X POST http://aplica-startup.ro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## 🚨 **Dacă Problema Persistă:**

1. **Rollback la versiunea anterioară:**
```bash
cd /home/ubuntu/startup-nation-2025
git log --oneline
git reset --hard [previous-commit-hash]
pm2 restart all
```

2. **Verifică spațiul pe disk:**
```bash
df -h
```

3. **Verifică memoria:**
```bash
free -h
top
```

## ✅ **Status Expected După Fix:**
- `pm2 status` -> toate procesele "online"  
- `curl http://localhost:5003/health` -> răspuns JSON
- Login frontend -> funcțional fără eroare 502

## 🎯 **Prioritate:**
1. Instalează dependența `openai`: `npm install openai`
2. Restart backend: `pm2 restart all` 
3. Verifică logurile: `pm2 logs`
