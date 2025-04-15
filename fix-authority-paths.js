/**
 * fix-authority-paths.js
 * 
 * Script pentru corectarea căilor documentelor de împuternicire în baza de date
 * Acesta caută toate fișierele de împuternicire existente în folderul uploads/authorization
 * și actualizează căile corespunzătoare în documentele utilizatorilor din baza de date.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Definirea modelului User similar cu cel din aplicație
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  documents: {
    authorityDocumentGenerated: Boolean,
    authorityDocumentPath: String,
    authorityDocumentFormat: {
      type: String,
      enum: ['pdf', 'docx', null],
      default: 'pdf'
    }
  }
}, { strict: false });

// Conectarea la baza de date
async function main() {
  try {
    console.log('Conectare la baza de date MongoDB...');
    
    // Utilizează variabila de mediu MONGO_URI sau o conexiune implicită
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/startup-nation';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Conectat cu succes la MongoDB!');
    
    // Înregistrăm modelul
    const User = mongoose.model('User', UserSchema);
    
    // Calea către directorul cu documentele de împuternicire
    const authDir = path.join(__dirname, 'uploads/authorization');
    
    // Verificăm dacă directorul există
    if (!fs.existsSync(authDir)) {
      console.error(`Directorul ${authDir} nu există!`);
      process.exit(1);
    }
    
    console.log(`Scanare director: ${authDir}`);
    
    // Citim toate fișierele din director
    const files = fs.readdirSync(authDir);
    console.log(`Am găsit ${files.length} fișiere în total.`);
    
    // Contoare pentru statistici
    let updatedUsers = 0;
    let skippedUsers = 0;
    let notFoundUsers = 0;
    
    // Procesăm fiecare fișier
    for (const file of files) {
      // Verificăm dacă fișierul este o împuternicire
      if (file.startsWith('imputernicire_')) {
        // Extragem ID-ul utilizatorului și formatul
        const format = file.endsWith('.pdf') ? 'pdf' : 'docx';
        const userId = file.replace('imputernicire_', '').replace(`.${format}`, '');
        
        console.log(`Procesare fișier: ${file} (userId: ${userId}, format: ${format})`);
        
        try {
          // Căutăm utilizatorul în baza de date
          const user = await User.findById(userId);
          
          if (!user) {
            console.log(`⚠️ Utilizatorul cu ID-ul ${userId} nu a fost găsit în baza de date.`);
            notFoundUsers++;
            continue;
          }
          
          // Inițializare documents dacă nu există
          if (!user.documents) {
            user.documents = {};
          }
          
          // Actualizăm informațiile documentului
          const currentPath = user.documents.authorityDocumentPath;
          const needsUpdate = 
            !user.documents.authorityDocumentGenerated ||
            !currentPath || 
            !currentPath.includes(file);
          
          if (needsUpdate) {
            user.documents.authorityDocumentGenerated = true;
            user.documents.authorityDocumentPath = `/uploads/authorization/${file}`;
            user.documents.authorityDocumentFormat = format;
            
            // Salvăm modificările
            await user.save();
            console.log(`✅ Utilizator actualizat: ${user.name || userId}`);
            updatedUsers++;
          } else {
            console.log(`ℹ️ Utilizator deja actualizat: ${user.name || userId}`);
            skippedUsers++;
          }
        } catch (err) {
          console.error(`❌ Eroare la procesarea utilizatorului ${userId}: ${err.message}`);
        }
      }
    }
    
    // Verificăm și actualizăm calea pentru contracts/
    console.log('\nVerificare documente în folderul contracts...');
    const contractsDir = path.join(__dirname, 'uploads/contracts');
    
    if (fs.existsSync(contractsDir)) {
      const contractFiles = fs.readdirSync(contractsDir);
      console.log(`Am găsit ${contractFiles.length} fișiere în folderul contracts.`);
      
      // Procesăm fișierele de împuternicire din contracts/
      for (const file of contractFiles) {
        if (file.startsWith('imputernicire_')) {
          const format = file.endsWith('.pdf') ? 'pdf' : 'docx';
          const userId = file.replace('imputernicire_', '').replace(`.${format}`, '');
          
          console.log(`Procesare fișier din contracts/: ${file} (userId: ${userId})`);
          
          try {
            const user = await User.findById(userId);
            
            if (!user) {
              console.log(`⚠️ Utilizatorul cu ID-ul ${userId} nu a fost găsit în baza de date.`);
              notFoundUsers++;
              continue;
            }
            
            if (!user.documents) {
              user.documents = {};
            }
            
            user.documents.authorityDocumentGenerated = true;
            user.documents.authorityDocumentPath = `/uploads/contracts/${file}`;
            user.documents.authorityDocumentFormat = format;
            
            await user.save();
            console.log(`✅ Utilizator actualizat cu calea din contracts/: ${user.name || userId}`);
            updatedUsers++;
          } catch (err) {
            console.error(`❌ Eroare la procesarea utilizatorului ${userId}: ${err.message}`);
          }
        }
      }
    } else {
      console.log('Directorul contracts/ nu există.');
    }
    
    // Afișam statisticile
    console.log('\n===== REZUMAT =====');
    console.log(`Utilizatori actualizați: ${updatedUsers}`);
    console.log(`Utilizatori fără modificări: ${skippedUsers}`);
    console.log(`Utilizatori negăsiți: ${notFoundUsers}`);
    
    // Deconectăm de la baza de date
    await mongoose.connection.close();
    console.log('Conexiunea la baza de date a fost închisă.');
    
  } catch (error) {
    console.error(`❌ Eroare globală: ${error.message}`);
    process.exit(1);
  }
}

// Executăm script-ul
main().then(() => {
  console.log('Script executat cu succes!');
}).catch(err => {
  console.error('Eroare la execuția script-ului:', err);
});
