/**
 * Script pentru actualizarea flag-urilor de documente pentru utilizatorii existenți
 * Acest script va verifica toate documentele existente și va actualiza flag-urile
 * din modelele User și Client în consecință.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Client = require('../models/Client');
const Document = require('../models/Document');
const dotenv = require('dotenv');

// Încărcăm variabilele de mediu
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Funcție pentru conectarea la baza de date
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Funcție pentru verificarea existenței fișierelor de contract
const checkContractFile = async (userId) => {
  // Verificăm dacă există contract în diverse locații posibile
  const possiblePaths = [
    path.join(__dirname, `../../../uploads/contracts/contract_${userId}.pdf`),
    path.join(__dirname, `../../../uploads/contracts/contract_${userId}.docx`),
    path.join(__dirname, `../../../public/contracts/contract_${userId}.pdf`),
    path.join(__dirname, `../../../public/contracts/contract_${userId}.docx`)
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      console.log(`Contract găsit pentru user ${userId} la calea: ${filePath}`);
      return {
        exists: true,
        path: filePath,
        format: filePath.endsWith('.docx') ? 'docx' : 'pdf'
      };
    }
  }

  return { exists: false };
};

// Funcția principală pentru actualizarea flag-urilor
const updateDocumentFlags = async () => {
  try {
    console.log('Începerea procesului de actualizare a flag-urilor de documente...');
    
    // 1. Actualizăm utilizatorii
    const users = await User.find({});
    console.log(`Verificăm ${users.length} utilizatori...`);
    
    let updatedUsersCount = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      
      // Verificăm dacă utilizatorul are documente
      const userDocuments = await Document.find({ uploadedBy: user._id });
      
      // Verificăm dacă există documente de identitate
      const idDocuments = userDocuments.filter(doc => 
        doc.type === 'identity' || doc.name.toLowerCase().includes('buletin') || 
        doc.name.toLowerCase().includes('card') || doc.name.toLowerCase().includes('identitate')
      );
      
      if (idDocuments.length > 0 && !user.documents.id_cardUploaded) {
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
      }
    }
    
    console.log(`S-au actualizat ${updatedUsersCount} utilizatori.`);
    
    // 2. Actualizăm clienții
    const clients = await Client.find({});
    console.log(`Verificăm ${clients.length} clienți...`);
    
    let updatedClientsCount = 0;
    
    for (const client of clients) {
      let needsUpdate = false;
      
      // Verificăm dacă clientul are documente
      const clientDocuments = await Document.find({ clientId: client._id });
      
      // Verificăm dacă există documente de identitate
      const idDocuments = clientDocuments.filter(doc => 
        doc.type === 'identity' || doc.name.toLowerCase().includes('buletin') || 
        doc.name.toLowerCase().includes('card') || doc.name.toLowerCase().includes('identitate')
      );
      
      if (idDocuments.length > 0) {
        console.log(`Clientul ${client.name} (${client._id}) are documente de identitate încărcate`);
        client.documentsVerified = true;
        needsUpdate = true;
      }
      
      // Verificăm utilizatorul asociat clientului
      if (client.userId) {
        const associatedUser = await User.findById(client.userId);
        
        if (associatedUser) {
          if (associatedUser.documents && associatedUser.documents.contractGenerated && !client.contractSigned) {
            console.log(`Clientul ${client.name} (${client._id}) are contract generat prin utilizatorul asociat`);
            // Nu setăm contractSigned = true, deoarece contractul ar putea să nu fie semnat încă
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
      }
    }
    
    console.log(`S-au actualizat ${updatedClientsCount} clienți.`);
    
    console.log('Procesul de actualizare s-a încheiat cu succes!');
    
  } catch (error) {
    console.error(`Eroare în procesul de actualizare: ${error.message}`);
    console.error(error.stack);
  } finally {
    // Deconectare de la baza de date
    mongoose.disconnect();
    console.log('Deconectat de la baza de date.');
  }
};

// Inițiere proces
connectDB().then(() => {
  updateDocumentFlags();
});
