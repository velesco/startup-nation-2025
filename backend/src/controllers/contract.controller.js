const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { convertWordBufferToPdf } = require('../utils/pdfConverter');
const User = require('../models/User');
const logger = require('../utils/logger');
const mkdirp = require('mkdirp');

// Funcție ajutătoare pentru verificarea datelor din buletin
const validateIdCardData = (idCard) => {
  if (!idCard) {
    return {
      valid: false,
      missingFields: ['toate datele din buletin']
    };
  }
  
  const requiredFields = [
    { field: 'CNP', label: 'CNP' },
    { field: 'fullName', label: 'nume și prenume' },
    { field: 'address', label: 'adresa' },
    { field: 'series', label: 'seria' },
    { field: 'number', label: 'numărul' }
  ];
  
  const missingFields = [];
  
  for (const { field, label } of requiredFields) {
    if (!idCard[field]) {
      missingFields.push(label);
    }
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
};

// @desc    Generate contract based on user ID card data
// @route   GET /api/contracts/generate
// @access  Private
exports.generateContract = async (req, res, next) => {
  try {
    // Get user data from database
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    // Check if user has ID card data
    const validationResult = validateIdCardData(user.idCard);
    if (!validationResult.valid) {
      const missingFieldsText = validationResult.missingFields.join(', ');
      return res.status(400).json({
        success: false,
        message: `Datele din buletin nu sunt complete. Lipsesc: ${missingFieldsText}. Te rugăm să completezi toate datele din buletin înainte de a genera contractul.`,
        missingFields: validationResult.missingFields
      });
    }
    
    // Mark contract as generated in the user profile
    if (!user.documents) {
      user.documents = {};
    }
    user.documents.contractGenerated = true;
    await user.save();
    
    // Prepare data for contract template
    const contractData = {
      nume_si_prenume: user.idCard.fullName,
      domiciliul_aplicantului: user.idCard.address,
      identificat_cu_ci: `${user.idCard.series} ${user.idCard.number}`,
      ci_eliberat_la_data_de: user.idCard.birthDate ? new Date(user.idCard.birthDate).toLocaleDateString('ro-RO') : 'N/A',
      // Add any additional fields as needed
    };
    
    // Caută template-ul contract.docx și procesează-l
    try {
      // Caută și deschide fișierul contract.docx
      const templatePath = path.join(__dirname, '../../templates/contract.docx');
      
      // Verifică dacă template-ul există
      if (!fs.existsSync(templatePath)) {
        logger.error('Template file contract.docx not found');
        
        // Creem un fișier docx simplu cu un mesaj că trebuie înlocuit
        // Trebuie să adaugi acest fișier manual, pentru că nu putem genera docx direct în acest mediu
        return res.status(404).json({
          success: false,
          message: 'Fișierul template contract.docx nu a fost găsit. Te rugăm să adaugi un fișier docx template în directorul backend/templates/ cu variabilele {{nume_si_prenume}}, {{domiciliul_aplicantului}}, {{identificat_cu_ci}} și {{ci_eliberat_la_data_de}}.'
        });
      }
      
      // Citește conținutul template-ului docx
      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);
      
      // Creează instanța de docxtemplater
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '{{',
          end: '}}'
        }
      });
      
      // Setează variabilele template-ului
      doc.setData(contractData);
      
      // Renderează documentul și înlocuiește variabilele cu valorile reale
      try {
        doc.render();
      } catch (renderError) {
        logger.error(`Contract template rendering error: ${renderError.message}`);
        
        // Furnizăm informații mai detaliate despre eroare
        let errorMessage = `Eroare la renderizarea template-ului: ${renderError.message}`;
        
        // Dacă este o eroare de la docxtemplater, aducem mai multe detalii pentru debugging
        if (renderError.properties && renderError.properties.errors) {
          errorMessage += '\nDetalii erori:';
          const errors = renderError.properties.errors;
          Object.keys(errors).forEach(function (key) {
            errorMessage += `\n- ${key}: ${errors[key]}`;
          });
        }
        
        return res.status(500).json({
          success: false,
          message: errorMessage,
          details: renderError.stack
        });
      }
      
      // Generează documentul ca buffer
      const wordBuffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE'
      });
      
      // Convertește în PDF
      try {
        const pdfBuffer = await convertWordBufferToPdf(wordBuffer);
        
        // Salvează PDF-ul în directorul utilizatorului
        const uploadsDir = path.join(__dirname, '../../../uploads/contracts');
        await mkdirp(uploadsDir); // Asigură-te că directorul există
        
        const contractFilename = `contract_${userId}.pdf`;
        const contractPath = path.join(uploadsDir, contractFilename);
        
        fs.writeFileSync(contractPath, pdfBuffer);
        
        // Actualizează calea în documentul utilizatorului
        user.documents.contractPath = `/uploads/contracts/${contractFilename}`;
        await user.save();
        
        // Setează header-ele de răspuns
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=contract_${user.idCard.fullName.replace(/\s+/g, '_')}.pdf`);
        
        // Trimite PDF-ul
        return res.send(pdfBuffer);
      } catch (conversionError) {
        logger.error(`PDF conversion error: ${conversionError.message}`);
        
        // Trimitem un răspuns cu mai multe detalii, dar oferim și docx ca alternativă
        logger.info('Returning Word document as fallback');
        
        // Dacă conversia PDF eșuează, trimite documentul Word ca fallback
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=contract_${user.idCard.fullName.replace(/\s+/g, '_')}.docx`);
        
        return res.send(wordBuffer);
      }
    } catch (templateError) {
      logger.error(`Template processing error: ${templateError.message}`);
      
      // La eroare, trimitem un mesaj explicit de eroare
      return res.status(500).json({
        success: false,
        message: `Eroare la procesarea template-ului: ${templateError.message}`,
        details: templateError.stack
      });
    }
  } catch (error) {
    logger.error(`Contract generation error: ${error.message}`);
    next(error);
  }
};

// Funcție de utilitate pentru a genera un document PDF simplu cu text
const generateSimpleContract = async (user) => {
  try {
    // Verificăm dacă avem libreofficer pentru conversie
    const libre = require('libreoffice-convert');
    const { promisify } = require('util');
    const convertAsync = promisify(libre.convert);
    
    // Pregătim datele pentru template
    const userName = user.idCard?.fullName || user.name || 'Utilizator';
    const userAddress = user.idCard?.address || 'Adresă necunoscută';
    const userId = user._id;
    
    // Creăm un text simplu pentru contract
    const contractText = `
CONTRACT DE PARTICIPARE
Programul Startup Nation 2025

Nume și prenume: ${userName}
Domiciliul: ${userAddress}
User ID: ${userId}

Prin prezentul document, subsemnatul/subsemnata ${userName}, confirm participarea în cadrul programului Startup Nation 2025.

Mă angajez să respect termenii și condițiile programului și să furnizez toate informațiile necesare în mod corect și complet.

Data: ${new Date().toLocaleDateString('ro-RO')}

Semnătura: ______________
    `;
    
    // Creăm un document Word simplu
    const PizZip = require('pizzip');
    const Docxtemplater = require('docxtemplater');
    const fs = require('fs');
    const path = require('path');
    
    // Încercăm să folosim template-ul existent dacă există
    const templatePath = path.join(__dirname, '../../templates/contract.docx');
    let wordContent;
    
    if (fs.existsSync(templatePath)) {
      // Folosim template-ul existent
      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);
      
      // Creăm o instanță de docxtemplater
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '{{',
          end: '}}'
        }
      });
      
      // Setăm variabilele template-ului
      doc.setData({
        nume_si_prenume: userName,
        domiciliul_aplicantului: userAddress,
        identificat_cu_ci: user.idCard?.series && user.idCard?.number ? 
          `${user.idCard.series} ${user.idCard.number}` : 'Nespecificat',
        ci_eliberat_la_data_de: user.idCard?.birthDate ? 
          new Date(user.idCard.birthDate).toLocaleDateString('ro-RO') : 'N/A'
      });
      
      // Renderăm documentul
      doc.render();
      
      // Obținem buffer-ul pentru Word
      wordContent = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE'
      });
    } else {
      // Nu avem template, creăm un document Word simplu
      const tmpDir = path.join(__dirname, '../../../temp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      
      const textFilePath = path.join(tmpDir, 'contract.txt');
      fs.writeFileSync(textFilePath, contractText);
      
      // Returnează conținutul ca text, conversia va eșua
      wordContent = Buffer.from(contractText, 'utf8');
    }
    
    // Asigurăm că directorul pentru contract există
    const contractsDir = path.join(__dirname, '../../../uploads/contracts');
    if (!fs.existsSync(contractsDir)) {
    try {
        // Creăm directorul recursiv
          fs.mkdirSync(contractsDir, { recursive: true, mode: 0o755 });
          logger.info(`Created contracts directory: ${contractsDir}`);
        } catch (mkdirError) {
          logger.error(`Error creating contracts directory: ${mkdirError.message}`);
        }
      } else {
        // Verificăm permisiunile și le setăm corect dacă este necesar
        try {
          fs.chmodSync(contractsDir, 0o755);
        } catch (chmodError) {
          logger.warn(`Could not set permissions on contracts directory: ${chmodError.message}`);
        }
      }
    
    // Salvăm fișierul Word temporar
    const wordFilePath = path.join(contractsDir, `contract_${userId}.docx`);
    fs.writeFileSync(wordFilePath, wordContent);
    
    // Încercăm conversia în PDF (dacă libreoffice este disponibil)
    try {
      const pdfBuffer = await convertAsync(wordContent, '.pdf', {});
      
      // Salvăm PDF-ul
      const pdfFilePath = path.join(contractsDir, `contract_${userId}.pdf`);
      fs.writeFileSync(pdfFilePath, pdfBuffer);
      
      // Actualizăm calea în documentul utilizatorului
      user.documents.contractPath = `/uploads/contracts/contract_${userId}.pdf`;
      await user.save();
      
      return pdfFilePath;
    } catch (conversionError) {
      // Dacă conversia eșuează, folosim fișierul Word
      user.documents.contractPath = `/uploads/contracts/contract_${userId}.docx`;
      await user.save();
      
      return wordFilePath;
    }
  } catch (error) {
    logger.error(`Error generating simple contract: ${error.message}`);
    throw error;
  }
};

// @desc    Get the saved contract for current user
// @route   GET /api/contracts/download
// @access  Private
exports.downloadContract = async (req, res, next) => {
  try {
    // Get user data from database
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    // Inițializăm documetele utilizatorului dacă nu există
    if (!user.documents) {
      user.documents = {};
    }
    
    let contractFullPath = null;
    
    // Verificăm dacă utilizatorul are o cale validată spre contract
    if (user.documents.contractPath) {
      // Obținem calea completă din calea relativă
      const contractRelativePath = user.documents.contractPath;
      contractFullPath = path.join(__dirname, `../../../${contractRelativePath.substring(1)}`);
      
      // Verificăm dacă fișierul există fizic
      if (!fs.existsSync(contractFullPath)) {
        logger.error(`Contract file not found at path: ${contractFullPath}`);
        contractFullPath = null;
      }
    }
    
    // Dacă nu avem un contract valid, dar utilizatorul este marcat cu contract generat,
    // generăm un contract simplu
    if (!contractFullPath) {
      if (user.documents.contractGenerated) {
        logger.info(`Generating a replacement contract for user ${userId}`);
        try {
          // Generăm un contract simplu și primim calea către acesta
          contractFullPath = await generateSimpleContract(user);
          logger.info(`Generated replacement contract at: ${contractFullPath}`);
        } catch (genError) {
          logger.error(`Error generating replacement contract: ${genError.message}`);
          
          return res.status(500).json({
            success: false,
            message: 'Eroare la generarea contractului de înlocuire. Te rugăm să generezi contractul din nou.'
          });
        }
      } else {
        return res.status(404).json({
          success: false,
          message: 'Contractul nu a fost generat încă. Te rugăm să generezi contractul mai întâi.'
        });
      }
    }
    
    try {
      // Citim fișierul în memorie pentru a evita problemele cu middleware-ul fileUpload
      const fileBuffer = fs.readFileSync(contractFullPath);
      
      // Set headers for PDF and send file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=contract_${user.idCard?.fullName?.replace(/\s+/g, '_') || userId}.pdf`);
      
      // Important: Marchez acest request ca fiind o descărcare statică, nu un upload de fișier
      if (req.files) {
        delete req.files;
      }
      
      // Trimitem buffer-ul direct
      return res.send(fileBuffer);
    } catch (readError) {
      logger.error(`Error reading contract file: ${readError.message}`);
      return res.status(500).json({
        success: false,
        message: 'Eroare la citirea fișierului contract. Te rugăm să încerci din nou.'
      });
    }
  } catch (error) {
    logger.error(`Contract download error: ${error.message}`);
    next(error);
  }
};

// @desc    Download contract template
// @route   GET /api/contracts/template
// @access  Private
exports.downloadTemplate = async (req, res, next) => {
  try {
    const templatePath = path.join(__dirname, '../../templates/contract_template.docx');
    
    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({
        success: false,
        message: 'Template-ul de contract nu a fost găsit'
      });
    }
    
    // Set headers and send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=contract_template.docx');
    
    const fileStream = fs.createReadStream(templatePath);
    fileStream.pipe(res);
  } catch (error) {
    logger.error(`Template download error: ${error.message}`);
    next(error);
  }
};

// @desc    Mark contract as signed by user
// @route   POST /api/contracts/sign
// @access  Private
// @desc    Validate and complete missing ID card data
// @route   POST /api/contracts/validate-id-card
// @access  Private
exports.validateIdCard = async (req, res, next) => {
  try {
    // Get user data from database
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    // Verificăm datele din buletin și determinăm ce câmpuri lipsesc
    const validationResult = validateIdCardData(user.idCard);
    
    // Dacă toate datele sunt complete, returnez succes
    if (validationResult.valid) {
      return res.status(200).json({
        success: true,
        message: 'Datele din buletin sunt complete',
        idCard: user.idCard
      });
    }
    
    // Actualizăm datele lipsă cu cele furnizate în request
    const {
      CNP, 
      fullName, 
      address, 
      series, 
      number, 
      issuedBy, 
      birthDate, 
      expiryDate 
    } = req.body;
    
    // Creăm un obiect cu câmpurile noi sau cele existente
    const updatedIdCard = {
      CNP: CNP || user.idCard?.CNP,
      fullName: fullName || user.idCard?.fullName,
      address: address || user.idCard?.address,
      series: series || user.idCard?.series,
      number: number || user.idCard?.number,
      issuedBy: issuedBy || user.idCard?.issuedBy,
      birthDate: birthDate ? new Date(birthDate) : user.idCard?.birthDate,
      expiryDate: expiryDate ? new Date(expiryDate) : user.idCard?.expiryDate
    };
    
    // Actualizăm utilizatorul cu noile date
    if (!user.idCard) {
      user.idCard = {};
    }
    
    // Actualizăm fiecare câmp individual
    Object.keys(updatedIdCard).forEach(key => {
      if (updatedIdCard[key]) {
        user.idCard[key] = updatedIdCard[key];
      }
    });
    
    // Marcăm buletinul ca încărcat
    if (!user.documents) {
      user.documents = {};
    }
    user.documents.id_cardUploaded = true;
    
    // Salvăm utilizatorul
    await user.save();
    
    // Verificăm din nou validitatea
    const revalidationResult = validateIdCardData(user.idCard);
    
    if (revalidationResult.valid) {
      return res.status(200).json({
        success: true,
        message: 'Datele din buletin au fost actualizate cu succes',
        idCard: user.idCard
      });
    } else {
      // Datele încă sunt incomplete
      const missingFieldsText = revalidationResult.missingFields.join(', ');
      return res.status(400).json({
        success: false,
        message: `Datele din buletin sunt încă incomplete. Lipsesc: ${missingFieldsText}.`,
        missingFields: revalidationResult.missingFields,
        idCard: user.idCard
      });
    }
  } catch (error) {
    logger.error(`ID card validation error: ${error.message}`);
    next(error);
  }
};

// @desc    Reset contract status and allow regeneration
// @route   POST /api/contracts/reset
// @access  Private
exports.resetContract = async (req, res, next) => {
  try {
    // Get user data from database
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    // Reset contract state
    if (!user.documents) {
      user.documents = {};
    }
    
    // Reset flaguri contract
    user.documents.contractGenerated = false;
    user.documents.contractPath = null;
    
    if (user.contractSigned) {
      // Dacă era semnat, îl marcăm ca nesemnat
      user.contractSigned = false;
      user.contractSignedAt = null;
    }
    
    await user.save();
    
    // Verificăm dacă există fișiere de contract pentru acest utilizator și le ștergem
    const contractsDir = path.join(__dirname, '../../../uploads/contracts');
    const contractFilename = `contract_${userId}.pdf`;
    const contractPath = path.join(contractsDir, contractFilename);
    
    // Ștergem fișierul PDF dacă există
    if (fs.existsSync(contractPath)) {
      fs.unlinkSync(contractPath);
    }
    
    // Verificăm și fișierul docx
    const docxPath = path.join(contractsDir, `contract_${userId}.docx`);
    if (fs.existsSync(docxPath)) {
      fs.unlinkSync(docxPath);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Status contract resetat cu succes. Poți genera acum un nou contract.'
    });
  } catch (error) {
    logger.error(`Contract reset error: ${error.message}`);
    next(error);
  }
};

// @desc    Mark contract as signed by user
// @route   POST /api/contracts/sign
// @access  Private
exports.signContract = async (req, res, next) => {
  try {
    // Get user data from database
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    // Update user document to mark contract as signed
    user.contractSigned = true;
    user.contractSignedAt = new Date();
    
    // Mark contract path in user document if not already set
    if (!user.documents) {
      user.documents = {};
    }
    
    // If no contract path is set but contract file exists for this user, update the path
    if (!user.documents.contractPath) {
      const contractFilename = `contract_${userId}.pdf`;
      const contractPath = path.join(__dirname, `../../../uploads/contracts/${contractFilename}`);
      
      if (fs.existsSync(contractPath)) {
        user.documents.contractPath = `/uploads/contracts/${contractFilename}`;
      }
    }
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Contractul a fost semnat cu succes',
      data: {
        contractSigned: user.contractSigned,
        contractSignedAt: user.contractSignedAt
      }
    });
  } catch (error) {
    logger.error(`Contract signing error: ${error.message}`);
    next(error);
  }
};