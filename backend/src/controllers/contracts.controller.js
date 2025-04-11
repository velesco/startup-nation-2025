const User = require('../models/User');
const Client = require('../models/Client');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

/**
 * Funcție helper pentru verificarea tuturor posibilelor locații ale unui contract
 * @param {string} userId - ID-ul utilizatorului
 * @param {string} type - Tipul contractului ('standard' sau 'consultanta')
 * @returns {Object} - Informații despre contract (exists, path, format)
 */
const findContractFile = async (userId, type = 'standard') => {
  const prefix = type === 'consultanta' ? 'contract_consultanta_' : 'contract_';
  
  // Lista de posibile locații pentru contract
  const possiblePaths = [
    // Locații în directorul uploads/contracts
    path.join(__dirname, `../../../uploads/contracts/${prefix}${userId}.pdf`),
    path.join(__dirname, `../../../uploads/contracts/${prefix}${userId}.docx`),
    
    // Locații în directorul public/contracts
    path.join(__dirname, `../../../public/contracts/${prefix}${userId}.pdf`),
    path.join(__dirname, `../../../public/contracts/${prefix}${userId}.docx`),
    
    // Locații în directorul specific utilizatorului
    path.join(__dirname, `../../../uploads/users/${userId}/${prefix}${userId}.pdf`),
    path.join(__dirname, `../../../uploads/users/${userId}/${prefix}${userId}.docx`)
  ];

  // Verificăm fiecare locație
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      console.log(`Contract ${type} găsit pentru user ${userId} la calea: ${filePath}`);
      
      // Determinăm formatul
      const format = filePath.toLowerCase().endsWith('.docx') ? 'docx' : 'pdf';
      
      // Construim calea relativă pentru a o stoca în baza de date
      let relativePath;
      if (filePath.includes('/uploads/contracts/')) {
        relativePath = `/uploads/contracts/${prefix}${userId}.${format}`;
      } else if (filePath.includes('/public/contracts/')) {
        relativePath = `/public/contracts/${prefix}${userId}.${format}`;
      } else {
        relativePath = `/uploads/users/${userId}/${prefix}${userId}.${format}`;
      }
      
      return {
        exists: true,
        path: filePath,
        relativePath: relativePath,
        format: format
      };
    }
  }

  return { exists: false };
};

/**
 * Actualizează starea documententelor unui utilizator pe baza fișierelor existente
 * @param {Object} user - Utilizatorul ce va fi actualizat
 * @returns {boolean} - True dacă s-au făcut actualizări, false în caz contrar
 */
const updateUserDocumentStatus = async (user) => {
  if (!user) return false;
  
  let needsUpdate = false;
  
  // Inițializăm obiectul documents dacă nu există
  if (!user.documents) {
    user.documents = {};
  }
  
  // Verificăm contractul standard
  const contractResult = await findContractFile(user._id, 'standard');
  if (contractResult.exists && !user.documents.contractGenerated) {
    console.log(`Utilizatorul ${user._id} are contract standard, actualizăm starea`);
    user.documents.contractGenerated = true;
    user.documents.contractPath = contractResult.relativePath;
    user.documents.contractFormat = contractResult.format;
    needsUpdate = true;
  }
  
  // Verificăm contractul de consultanță
  const consultingContractResult = await findContractFile(user._id, 'consultanta');
  if (consultingContractResult.exists && !user.documents.consultingContractGenerated) {
    console.log(`Utilizatorul ${user._id} are contract de consultanță, actualizăm starea`);
    user.documents.consultingContractGenerated = true;
    user.documents.consultingContractPath = consultingContractResult.relativePath;
    user.documents.consultingContractFormat = consultingContractResult.format;
    needsUpdate = true;
  }
  
  // Salvăm modificările dacă au existat
  if (needsUpdate) {
    await user.save();
    return true;
  }
  
  return false;
};

// @desc    Update contract status for all users
// @route   POST /api/admin/update-contracts
// @access  Private (Admin, Super Admin)
exports.updateAllContracts = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea de a executa această acțiune'
      });
    }
    
    console.log('Începerea procesului de actualizare a contractelor...');
    
    // Procesăm toți utilizatorii
    const users = await User.find({});
    console.log(`Verificăm contractele pentru ${users.length} utilizatori...`);
    
    let updatedCount = 0;
    let updatedUsers = [];
    
    for (const user of users) {
      const updated = await updateUserDocumentStatus(user);
      
      if (updated) {
        updatedCount++;
        updatedUsers.push({
          id: user._id,
          name: user.name || 'N/A',
          email: user.email,
          contractGenerated: user.documents?.contractGenerated || false,
          consultingContractGenerated: user.documents?.consultingContractGenerated || false
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Actualizare finalizată cu succes. S-au actualizat ${updatedCount} utilizatori.`,
      data: {
        updatedCount,
        updatedUsers
      }
    });
  } catch (error) {
    logger.error(`Eroare la actualizarea contractelor: ${error.message}`);
    next(error);
  }
};

// @desc    Get contract info
// @route   GET /api/admin/users/:id/contract-info
// @access  Private (Admin, Super Admin)
exports.getContractInfo = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Găsim utilizatorul
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    // Inițializăm obiectul documents dacă nu există
    if (!user.documents) {
      user.documents = {};
    }
    
    // Verificăm contractele utilizatorului și actualizăm statusul
    await updateUserDocumentStatus(user);
    
    // Pregătim informațiile despre contracte
    const contractInfo = {
      standard: {
        generated: user.documents.contractGenerated || false,
        signed: user.contractSigned || false,
        format: user.documents.contractFormat,
        path: user.documents.contractPath
      },
      consulting: {
        generated: user.documents.consultingContractGenerated || false,
        signed: user.documents.consultingContractSigned || false,
        format: user.documents.consultingContractFormat,
        path: user.documents.consultingContractPath
      }
    };
    
    return res.status(200).json({
      success: true,
      data: contractInfo
    });
  } catch (error) {
    logger.error(`Eroare la obținerea informațiilor despre contracte: ${error.message}`);
    next(error);
  }
};

// Export utilitarul pentru a fi folosit și în alte controllere
exports.findContractFile = findContractFile;
exports.updateUserDocumentStatus = updateUserDocumentStatus;