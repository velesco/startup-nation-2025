const User = require('../models/User');
const Client = require('../models/Client');
const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// @desc    Run document flags update for existing users
// @route   POST /api/document-flags/update
// @access  Private (Admin, Super Admin)
exports.updateDocumentFlags = async (req, res) => {
  try {
    // Această rută este limitată doar la super-admin și admin (verificat prin middleware în rute)
    console.log('Începerea procesului de actualizare a flag-urilor de documente...');
    
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
          email: user.email,
          documents: user.documents
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
          email: client.email,
          documentsVerified: client.documentsVerified,
          contractSigned: client.contractSigned
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Actualizare finalizată cu succes. S-au actualizat ${updatedUsersCount} utilizatori și ${updatedClientsCount} clienți.`,
      data: {
        updatedUsersCount,
        updatedClientsCount,
        updatedUsers,
        updatedClients
      }
    });
    
  } catch (error) {
    logger.error(`Eroare la actualizarea flag-urilor de documente: ${error.message}`);
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea flag-urilor de documente',
      error: error.message
    });
  }
};