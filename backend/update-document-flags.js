/**
 * Script pentru actualizarea flag-urilor de documente
 * Acest script poate fi rulat direct din linia de comandă
 * 
 * Utilizare: 
 * 1. Navighează la directorul backend
 * 2. Rulează: node update-document-flags.js
 */

// Configurăm variabilele de mediu
require('dotenv').config();

// Verificăm dacă MONGO_URI există
if (!process.env.MONGO_URI) {
  console.warn('Variabila de mediu MONGO_URI nu este definită în fișierul .env');
  console.log('Introdu URI-ul pentru MongoDB manual (ex: mongodb://username:password@host:port/database):');
  
  // Setare manuală a MONGO_URI (pentru debugging)
  // PENTRU PRODUCȚIE: ACEASTĂ VARIABILĂ TREBUIE STOCATĂ ÎN FIȘIERUL .env!
  const MONGO_URI = 'mongodb://localhost:27017/startup-nation-2025';
  
  console.log(`Folosim URI-ul implicit: ${MONGO_URI}`);
  process.env.MONGO_URI = MONGO_URI;
}
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Încarcă modelele
const User = require('./src/models/User');
const Client = require('./src/models/Client');
const Document = require('./src/models/Document');

// Configurare logger
const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`)
};

// Funcție pentru conectarea la baza de date
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Funcție pentru verificarea existenței fișierelor de contract
const checkContractFile = async (userId) => {
  // Verificăm dacă există contract în diverse locații posibile
  const possiblePaths = [
    path.join(__dirname, `uploads/contracts/contract_${userId}.pdf`),
    path.join(__dirname, `uploads/contracts/contract_${userId}.docx`),
    path.join(__dirname, `../uploads/contracts/contract_${userId}.pdf`),
    path.join(__dirname, `../uploads/contracts/contract_${userId}.docx`),
    path.join(__dirname, `public/contracts/contract_${userId}.pdf`),
    path.join(__dirname, `public/contracts/contract_${userId}.docx`),
    path.join(__dirname, `../public/contracts/contract_${userId}.pdf`),
    path.join(__dirname, `../public/contracts/contract_${userId}.docx`)
  ];

  console.log(`Căutăm contractul pentru user ${userId} în ${possiblePaths.length} locații posibile...`);

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        console.log(`Contract găsit pentru user ${userId} la calea: ${filePath}`);
        return {
          exists: true,
          path: filePath,
          format: filePath.endsWith('.docx') ? 'docx' : 'pdf'
        };
      }
    } catch (err) {
      console.warn(`Eroare la verificarea căii ${filePath}: ${err.message}`);
      // Continuăm cu următoarea cale
    }
  }

  console.log(`Nu s-a găsit contract pentru user ${userId}`);
  return { exists: false };
};

// Funcția principală pentru actualizarea flag-urilor
const updateDocumentFlags = async () => {
  try {
    console.log('Începerea procesului de actualizare a flag-urilor de documente...');
    console.log(`Directorul curent: ${__dirname}`);
    
    // Verificăm dacă există directoarele necesare
    const contractsDir = path.join(__dirname, 'uploads/contracts');
    const uploadsDir = path.join(__dirname, 'uploads');
    const publicDir = path.join(__dirname, 'public');
    
    console.log(`Verificăm existența directoarelor:`);
    console.log(`- Uploads: ${fs.existsSync(uploadsDir) ? 'Există' : 'Nu există'}`);
    console.log(`- Contracts: ${fs.existsSync(contractsDir) ? 'Există' : 'Nu există'}`);
    console.log(`- Public: ${fs.existsSync(publicDir) ? 'Există' : 'Nu există'}`);
    
    // Verificăm directorele părinte
    const parentUploadsDir = path.join(__dirname, '../uploads');
    const parentContractsDir = path.join(__dirname, '../uploads/contracts');
    
    console.log(`- Parent Uploads: ${fs.existsSync(parentUploadsDir) ? 'Există' : 'Nu există'}`);
    console.log(`- Parent Contracts: ${fs.existsSync(parentContractsDir) ? 'Există' : 'Nu există'}`);
    
    
    // 1. Actualizăm utilizatorii
    const users = await User.find({});
    console.log(`Verificăm ${users.length} utilizatori...`);
    
    let updatedUsersCount = 0;
    let updatedUsers = [];
    
    for (const user of users) {
      let needsUpdate = false;
      
      // Verificăm dacă utilizatorul are documente
      const userDocuments = await Document.find({ uploadedBy: user._id });
      
      // Verificăm dacă există documente de identitate
      const idDocuments = userDocuments.filter(doc => 
        doc.type === 'identity' || 
        (doc.name && doc.name.toLowerCase().includes('buletin')) || 
        (doc.name && doc.name.toLowerCase().includes('card')) || 
        (doc.name && doc.name.toLowerCase().includes('identitate'))
      );
      
      if (idDocuments.length > 0 && (!user.documents || !user.documents.id_cardUploaded)) {
        console.log(`Utilizatorul ${user.name} (${user._id}) are documente de identitate încărcate, dar flag-ul nu este setat`);
        if (!user.documents) {
          user.documents = {};
        }
        user.documents.id_cardUploaded = true;
        needsUpdate = true;
      }
      
      // Verificăm existența contractului
      const contractResult = await checkContractFile(user._id);
      if (contractResult.exists && (!user.documents || !user.documents.contractGenerated)) {
        console.log(`Utilizatorul ${user.name} (${user._id}) are contract generat, dar flag-ul nu este setat`);
        if (!user.documents) {
          user.documents = {};
        }
        user.documents.contractGenerated = true;
        user.documents.contractPath = `/uploads/contracts/contract_${user._id}.${contractResult.format}`;
        user.documents.contractFormat = contractResult.format;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
        updatedUsersCount++;
        updatedUsers.push({
          id: user._id,
          name: user.name,
          email: user.email
        });
      }
    }
    
    // 2. Actualizăm clienții
    const clients = await Client.find({});
    console.log(`Verificăm ${clients.length} clienți...`);
    
    let updatedClientsCount = 0;
    let updatedClients = [];
    
    for (const client of clients) {
      let needsUpdate = false;
      
      // Verificăm dacă clientul are documente
      const clientDocuments = await Document.find({ clientId: client._id });
      
      // Verificăm dacă există documente de identitate
      const idDocuments = clientDocuments.filter(doc => 
        doc.type === 'identity' || 
        (doc.name && doc.name.toLowerCase().includes('buletin')) || 
        (doc.name && doc.name.toLowerCase().includes('card')) || 
        (doc.name && doc.name.toLowerCase().includes('identitate'))
      );
      
      if (idDocuments.length > 0 && !client.documentsVerified) {
        console.log(`Clientul ${client.name} (${client._id}) are documente de identitate încărcate`);
        client.documentsVerified = true;
        needsUpdate = true;
      }
      
      // Verificăm utilizatorul asociat clientului
      if (client.userId) {
        const associatedUser = await User.findById(client.userId);
        
        if (associatedUser) {
          if (associatedUser.documents && associatedUser.documents.contractGenerated) {
            console.log(`Clientul ${client.name} (${client._id}) are contract generat prin utilizatorul asociat`);
            needsUpdate = true;
          }
          
          if (associatedUser.contractSigned && !client.contractSigned) {
            console.log(`Clientul ${client.name} (${client._id}) are contract semnat prin utilizatorul asociat`);
            client.contractSigned = true;
            client.contractSignedAt = associatedUser.contractSignedAt;
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        await client.save();
        updatedClientsCount++;
        updatedClients.push({
          id: client._id,
          name: client.name,
          email: client.email
        });
      }
    }
    
    console.log(`Actualizare finalizată cu succes!`);
    console.log(`S-au actualizat ${updatedUsersCount} utilizatori și ${updatedClientsCount} clienți.`);
    
    // Afișăm detaliile
    console.log('Utilizatori actualizați:', updatedUsers);
    console.log('Clienți actualizați:', updatedClients);
    
  } catch (error) {
    console.error(`Eroare la actualizarea flag-urilor de documente: ${error.message}`);
    console.error(error);
  } finally {
    // Deconectare de la baza de date
    await mongoose.disconnect();
    console.log('Deconectat de la baza de date.');
  }
};

// Rulează scriptul
connectDB()
  .then(() => {
    updateDocumentFlags()
      .catch(err => {
        console.error('Eroare în timpul actualizării:', err);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('Eroare la conectarea la baza de date:', err);
    process.exit(1);
  });
