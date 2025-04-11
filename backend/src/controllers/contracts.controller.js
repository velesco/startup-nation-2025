const User = require('../models/User');
const Client = require('../models/Client');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

/**
 * Verifică și numără contractele de consultanță direct din directorul de fișiere
 * @returns {Object} - Informații despre contractele găsite
 */
const countConsultingContracts = async () => {
  try {
    const contractsDir = path.join(__dirname, '../../../uploads/contracts');
    
    if (!fs.existsSync(contractsDir)) {
      return { count: 0, files: [] };
    }
    
    const files = fs.readdirSync(contractsDir);
    const consultingContractFiles = files.filter(file => 
      file.toLowerCase().includes('consultanta') || 
      file.toLowerCase().includes('consultant')
    );
    
    console.log(`Găsite ${consultingContractFiles.length} fișiere de contract de consultanță:`);
    consultingContractFiles.forEach(file => console.log(` - ${file}`));
    
    return {
      count: consultingContractFiles.length,
      files: consultingContractFiles
    };
  } catch (error) {
    console.error(`Eroare la numărarea contractelor de consultanță: ${error.message}`);
    return { count: 0, files: [] };
  }
};

/**
 * Funcție helper pentru verificarea tuturor posibilelor locații ale unui contract
 * @param {string} userId - ID-ul utilizatorului
 * @param {string} type - Tipul contractului ('standard' sau 'consultanta')
 * @returns {Object} - Informații despre contract (exists, path, format)
 */
const findContractFile = async (userId, type = 'standard') => {
  // Verificăm mai multe formate posibile pentru identificarea contractelor
  let prefixOptions = [];
  
  if (type === 'consultanta') {
    prefixOptions = [
      'contract_consultanta_', // Formatul standard
      `contract_consultanta_${userId}`, // Format cu ID
      'contract_consultanta' // Format fără underscore
    ];
  } else { // 'standard'
    prefixOptions = [
      'contract_', // Formatul standard
      `contract_${userId}`, // Format cu ID
      'contract' // Format fără underscore
    ];
  }
  
  // Verificăm fiecare prefix în toate locațiile posibile
  for (const prefix of prefixOptions) {
    // Lista de posibile locații pentru contract
    const possiblePaths = [
      // Locații în directorul uploads/contracts
      path.join(__dirname, `../../../uploads/contracts/${prefix}${prefix.endsWith('_') ? userId : ''}.pdf`),
      path.join(__dirname, `../../../uploads/contracts/${prefix}${prefix.endsWith('_') ? userId : ''}.docx`),
      
      // Locații în directorul public/contracts
      path.join(__dirname, `../../../public/contracts/${prefix}${prefix.endsWith('_') ? userId : ''}.pdf`),
      path.join(__dirname, `../../../public/contracts/${prefix}${prefix.endsWith('_') ? userId : ''}.docx`),
      
      // Locații în directorul specific utilizatorului
      path.join(__dirname, `../../../uploads/users/${userId}/${prefix}${prefix.endsWith('_') ? userId : ''}.pdf`),
      path.join(__dirname, `../../../uploads/users/${userId}/${prefix}${prefix.endsWith('_') ? userId : ''}.docx`)
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
          relativePath = `/uploads/contracts/${path.basename(filePath)}`;
        } else if (filePath.includes('/public/contracts/')) {
          relativePath = `/public/contracts/${path.basename(filePath)}`;
        } else {
          relativePath = `/uploads/users/${userId}/${path.basename(filePath)}`;
        }
        
        return {
          exists: true,
          path: filePath,
          relativePath: relativePath,
          format: format
        };
      }
    }
  }
  
  // Dacă nu am găsit nimic, căutăm toate fișierele care încep cu prefixul în directorul uploads/contracts
  try {
    const contractsDir = path.join(__dirname, '../../../uploads/contracts');
    if (fs.existsSync(contractsDir)) {
      const files = fs.readdirSync(contractsDir);
      const searchPrefix = type === 'consultanta' ? 'contract_consultanta_' : 'contract_';
      
      // Căutăm orice fișier care conține ID-ul utilizatorului sau care conține ID-ul în nume
      for (const file of files) {
        if ((file.startsWith(searchPrefix) && file.includes(userId)) || 
            (type === 'consultanta' && file.startsWith('contract_consultanta_') && file.includes(userId))) {
          const filePath = path.join(contractsDir, file);
          console.log(`Contract ${type} găsit pentru user ${userId} prin căutare avansată: ${filePath}`);
          
          const format = file.toLowerCase().endsWith('.docx') ? 'docx' : 'pdf';
          const relativePath = `/uploads/contracts/${file}`;
          
          return {
            exists: true,
            path: filePath,
            relativePath: relativePath,
            format: format
          };
        }
      }
      
      // Dacă este contract de consultanță, verificăm orice fișier care conține "consultanta" și ID-ul utilizatorului
      if (type === 'consultanta') {
        for (const file of files) {
          if (file.toLowerCase().includes('consultanta') && file.includes(userId)) {
            const filePath = path.join(contractsDir, file);
            console.log(`Contract consultanta găsit pentru ${userId}: ${filePath}`);
            
            const format = file.toLowerCase().endsWith('.docx') ? 'docx' : 'pdf';
            const relativePath = `/uploads/contracts/${file}`;
            
            return {
              exists: true,
              path: filePath,
              relativePath: relativePath,
              format: format
            };
          }
        }
      }
    }
  } catch (error) {
    console.error(`Eroare la căutarea avansată a contractelor: ${error.message}`);
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
  
  // Inițializăm formatele de contract dacă nu există
  if (user.documents.contractFormat === undefined) {
    user.documents.contractFormat = 'pdf';
    needsUpdate = true;
  }
  
  if (user.documents.consultingContractFormat === undefined) {
    user.documents.consultingContractFormat = 'pdf';
    needsUpdate = true;
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

// @desc    Get count of all consulting contracts in the system
// @route   GET /api/admin/contracts/counts
// @access  Private (Admin, Super Admin)
exports.getContractsCounts = async (req, res, next) => {
  try {
    // Actualizăm toate contractele pentru a avea date corecte
    // Nu afișăm mesajul pentru administrator, folosim doar pentru a actualiza datele
    await exports.updateAllContracts(req, res, next, true);
    
    // După actualizare, numărăm contractele standard din baza de date
    const standardContractsInDb = await User.countDocuments({
      $or: [
        { 'documents.contractGenerated': true },
        { 'documents.contractPath': { $exists: true, $ne: null } }
      ]
    });
    
    // Numără contractele de consultanță din baza de date
    const consultingContractsInDb = await User.countDocuments({
      $or: [
        { 'documents.consultingContractGenerated': true },
        { 'documents.consultingContractPath': { $exists: true, $ne: null } }
      ]
    });
    
    // Numără contractele semnate
    const signedContractsInDb = await User.countDocuments({
      contractSigned: true
    });
    
    // Numără contractele de consultanță semnate
    const signedConsultingContractsInDb = await User.countDocuments({
      'documents.consultingContractSigned': true
    });
    
    // Numără utilizatorii cu buletine încărcate
    const usersWithIdCards = await User.countDocuments({
      $or: [
        { 'documents.id_cardUploaded': true },
        { 'idCard.verified': true },
        { 'idCard.CNP': { $exists: true, $ne: null } }
      ]
    });
    
    // Numără contractele din directorul de fișiere
    const consultingContractsOnDisk = await countConsultingContracts();
    
    // Numără total utilizatori activi pentru procente
    const totalActiveUsers = await User.countDocuments({ isActive: true });
    
    return res.status(200).json({
      success: true,
      data: {
        standardContracts: standardContractsInDb,
        signedContracts: signedContractsInDb,
        consultingContracts: consultingContractsInDb,
        signedConsultingContracts: signedConsultingContractsInDb,
        usersWithIdCards: usersWithIdCards,
        totalUsers: totalActiveUsers,
        consultingContractsOnDisk: consultingContractsOnDisk.count,
        updated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error(`Eroare la obținerea numărului de contracte: ${error.message}`);
    next(error);
  }
};

// @desc    Update contract status for all users
// @route   POST /api/admin/update-contracts
// @access  Private (Admin, Super Admin)
exports.updateAllContracts = async (req, res, next, skipResponse = false) => {
  try {
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      if (!skipResponse) {
        return res.status(403).json({
          success: false,
          message: 'Nu aveți permisiunea de a executa această acțiune'
        });
      } else {
        return { 
          success: false, 
          message: 'Permisiune insuficientă', 
          status: 403 
        };
      }
    }
    
    console.log('Începerea procesului de actualizare a contractelor...');
    
    // Resetăm flagurile pentru contractele de consultanță, pentru toți utilizatorii
    // Vom marca doar utilizatorii pentru care găsim fișierele fizic în sistem
    console.log('Resetăm flagurile pentru contractele de consultanță...');
    await User.updateMany(
      {}, 
      { 
        'documents.consultingContractGenerated': false,
        'documents.consultingContractPath': null,
        'documents.consultingContractFormat': null 
      }
    );
    
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
    
    // Verificăm și fișierele consultanta pentru care nu avem asociere clară
    const contractsDir = path.join(__dirname, '../../../uploads/contracts');
    if (fs.existsSync(contractsDir)) {
      console.log('Verificăm contractele de consultanță fără asociere...');
      
      const files = fs.readdirSync(contractsDir);
      const consultingContractFiles = files.filter(file => 
        file.toLowerCase().includes('consultanta') || 
        file.toLowerCase().includes('consultant')
      );
      
      console.log(`Găsite ${consultingContractFiles.length} fișiere de contract de consultanță`);
    }
    
    const result = {
      success: true,
      message: `Actualizare finalizată cu succes. S-au actualizat ${updatedCount} utilizatori.`,
      updatedCount,
      updatedUsers
    };
    
    if (!skipResponse) {
      return res.status(200).json(result);
    } else {
      return result;
    }
  } catch (error) {
    logger.error(`Eroare la actualizarea contractelor: ${error.message}`);
    if (!skipResponse) {
      next(error);
    } else {
      return { 
        success: false, 
        message: `Eroare la actualizarea contractelor: ${error.message}`,
        error: error
      };
    }
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
        path: user.documents.contractPath,
        downloadUrl: user.documents.contractPath ? `/api/admin/users/${userId}/download-contract` : null
      },
      consulting: {
        generated: user.documents.consultingContractGenerated || false,
        signed: user.documents.consultingContractSigned || false,
        format: user.documents.consultingContractFormat,
        path: user.documents.consultingContractPath,
        downloadUrl: user.documents.consultingContractPath ? `/api/admin/users/${userId}/download-consulting-contract` : null
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
exports.countConsultingContracts = countConsultingContracts;