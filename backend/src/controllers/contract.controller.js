const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { convertToPdf } = require('../utils/documentConverter');
const User = require('../models/User');
const logger = require('../utils/logger');

// Funcție pentru inserarea semnăturii ca imagine în document
const insertSignatureAsImage = (docxBuffer, signatureData) => {
  if (!signatureData || !signatureData.startsWith('data:image/')) {
    logger.error('Formatul semnăturii nu este corect pentru inserare ca imagine');
    return docxBuffer;
  }
  
  try {
    // Extragem datele base64 din string-ul URI
    const base64Data = signatureData.split(';base64,').pop();
    if (!base64Data) {
      logger.error('Nu s-au putut extrage datele imagine din URI');
      return docxBuffer;
    }
    
    // Convertim docx-ul în zip pentru procesare
    const zip = new PizZip(docxBuffer);
    
    // Căutăm în docx fișierele XML care conțin texte
    const fileNames = Object.keys(zip.files);
    
    // Parcurgem toate fișierele XML din docx pentru a înlocui placeholderul {{semnatura}}
    const documentFiles = fileNames.filter(fileName => 
      (fileName.startsWith('word/document.xml') || 
       fileName.startsWith('word/header') || 
       fileName.startsWith('word/footer')) && 
      !fileName.endsWith('/')
    );
    
    documentFiles.forEach(fileName => {
      let content = zip.files[fileName].asText();
      
      // Înlocuim {{semnatura}} cu un element care va fi vizibil în document
      // Această metodă este o soluție de compromis până la implementarea 
      // unei soluții complete cu modul de imagini
      if (content.includes('{{semnatura}}')) {
        console.log(`Am găsit placeholder pentru semnătură în ${fileName}`);
        content = content.replace(/\{\{semnatura\}\}/g, 'Semnat electronic');
      }
      
      // Actualizăm conținutul fișierului în zip
      zip.file(fileName, content);
    });
    
    // Generăm documentul modificat
    return zip.generate({type: 'nodebuffer'});
  } catch (error) {
    logger.error(`Eroare la inserarea semnăturii în document: ${error.message}`);
    return docxBuffer;
  }
};

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

// @desc    Save signature for user
// @route   POST /api/contracts/save-signature
// @access  Private
exports.saveSignature = async (req, res, next) => {
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
    
    // Check if signature data is provided
    const { signatureData } = req.body;
    
    if (!signatureData) {
      return res.status(400).json({
        success: false,
        message: 'Nu a fost furnizată nicio semnătură'
      });
    }
    
    // Save signature to user document
    user.signature = signatureData;
    await user.save();
    
    console.log('Signature saved for user:', userId);
    
    return res.status(200).json({
      success: true,
      message: 'Semnătura a fost salvată cu succes'
    });
  } catch (error) {
    logger.error(`Signature save error: ${error.message}`);
    next(error);
  }
};

// @desc    Generate contract based on user ID card data
// @route   GET /api/contracts/generate
// @access  Private
exports.generateContract = async (req, res, next) => {
  console.log(`Contract generation requested`);
  try {
    // Get user data from database
    const userId = req.user.id;
    console.log(`Generating contract for user ID: ${userId}`);
    const user = await User.findById(userId);
    
    if (!user) {
      console.error(`User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    console.log(`User found. Name: ${user.name}, Email: ${user.email}`);
    console.log(`ID Card data: ${JSON.stringify(user.idCard || {})}`);
    console.log(`Documents state: ${JSON.stringify(user.documents || {})}`);
    
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
      domiciliul_aplicantului: user.idCard.address ?? 'test',
      identificat_cu_ci: `${user.idCard.series} ${user.idCard.number}`,
      ci_eliberat_la_data_de: user.idCard.birthDate ? new Date(user.idCard.birthDate).toLocaleDateString('ro-RO') : 'N/A',
      // Placeholder for semnătură care va fi procesat special
      semnatura: user.signature ? 'Semnat electronic' : '',
      data_semnarii: new Date().toLocaleDateString('ro-RO'),
    };
    
    // Caută template-ul contract.docx și procesează-l
    try {
      // Caută și deschide fișierul contract.docx
      const templatePath = path.join(__dirname, '../../templates/contract.docx');
      
      // Verifică dacă template-ul există
      if (!fs.existsSync(templatePath)) {
        logger.error('Template file contract.docx not found');
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
      let wordBuffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE'
      });
      
      // Procesare avansată pentru semnătură - inserare imagine
      if (user.signature && user.signature.startsWith('data:image/')) {
        try {
          console.log('Inserez semnătura ca imagine în documentul generat');
          wordBuffer = insertSignatureAsImage(wordBuffer, user.signature);
        } catch (signatureError) {
          logger.error(`Eroare la inserarea semnăturii în document: ${signatureError.message}`);
          // Continuăm cu buffer-ul original în caz de eroare
        }
      }
      
      // Convertește în PDF
      try {
        // Folosim noul convertor pentru a genera PDF
        const pdfBuffer = await convertToPdf(wordBuffer);
        
        // Salvează PDF-ul în directorul utilizatorului
        const uploadsDir = path.join(__dirname, '../../../uploads/contracts');
        console.log(`Creez directorul pentru contracte dacă nu există: ${uploadsDir}`);
        
        try {
          // Asigură-te că directorul există
          await fs.promises.mkdir(uploadsDir, { recursive: true });
          
          // Verificăm dacă directorul chiar există după creare
          if (!fs.existsSync(uploadsDir)) {
            throw new Error(`Directorul nu a putut fi creat la: ${uploadsDir}`);
          }
          
          console.log(`Directorul pentru contracte este pregătit: ${uploadsDir}`);
        } catch (dirError) {
          logger.error(`Error creating contracts directory: ${dirError.message}`);
          throw new Error(`Nu am putut crea directorul pentru contracte: ${dirError.message}`);
        }
        
        console.log(`Salvez contractul în directorul: ${uploadsDir}`);
        
        const contractFilename = `contract_${userId}.pdf`;
        const contractPath = path.join(uploadsDir, contractFilename);
        
        try {
          fs.writeFileSync(contractPath, pdfBuffer);
          console.log(`Contract salvat cu succes la: ${contractPath}`);
          
          // Verificăm dacă fișierul chiar există după scriere
          if (!fs.existsSync(contractPath)) {
            throw new Error(`Fișierul nu a fost creat la: ${contractPath}`);
          }
        } catch (writeError) {
          logger.error(`Error writing contract file: ${writeError.message}`);
          throw new Error(`Nu am putut salva contractul: ${writeError.message}`);
        }
        
        // Actualizează calea în documentul utilizatorului
        const contractRelativePath = `/uploads/contracts/${contractFilename}`;
        user.documents.contractPath = contractRelativePath;
        console.log(`Setting contract path to: ${contractRelativePath} for user: ${userId}`);
        
        // Verificăm dacă contractul există după ce a fost generat
        const uploadedContractFullPath = path.join(__dirname, `../../../${contractRelativePath.substring(1)}`);
        console.log(`Verifying contract exists at: ${uploadedContractFullPath}`);
        
        if (!fs.existsSync(uploadedContractFullPath)) {
          console.error(`WARNING: Contract file not found after generation at: ${uploadedContractFullPath}`);
        } else {
          console.log(`Contract successfully verified at: ${uploadedContractFullPath}`);
        }
        
        try {
          await user.save();
          console.log(`User ${userId} updated with contract path: ${user.documents.contractPath}`);
        } catch (saveError) {
          console.error(`Error saving user with contract path: ${saveError.message}`);
          throw saveError;
        }
        
        // Setează header-ele de răspuns
        // Make sure we have a valid name for the contract file
        let displayName = user.idCard.fullName;
        if (!displayName || displayName === 'test') {
          // Fallback to user name if idCard name is not available or is test
          displayName = user.name || userId;
        }
        
        console.log(`Using display name for contract: ${displayName}`);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=contract_${displayName.replace(/\s+/g, '_')}.pdf`);
        
        // Trimite PDF-ul
        return res.send(pdfBuffer);
      } catch (conversionError) {
        logger.error(`PDF conversion error: ${conversionError.message}`);
        console.error(`Error converting to PDF: ${conversionError.message}`);
        
        // Trimitem un răspuns cu mai multe detalii, dar oferim și docx ca alternativă
        logger.info('Returning Word document as fallback');
        
        // Salvam documentul Word ca fallback
        const uploadsDir = path.join(__dirname, '../../../uploads/contracts');
        await fs.promises.mkdir(uploadsDir, { recursive: true });
        
        // Generam si fisierul docx
        const docxFilename = `contract_${userId}.docx`;
        const docxPath = path.join(uploadsDir, docxFilename);
        
        try {
          console.log(`Saving docx as fallback at: ${docxPath}`);
          fs.writeFileSync(docxPath, wordBuffer);
          
          // Actualizăm calea în documentul utilizatorului să pointeze spre docx
          user.documents.contractPath = `/uploads/contracts/${docxFilename}`;
          user.documents.contractFormat = 'docx'; // Flag pentru format
          await user.save();
          console.log(`User updated with DOCX contract path: ${user.documents.contractPath}`);
        } catch (docxError) {
          console.error(`Failed to save docx fallback: ${docxError.message}`);
        }
        
        // Dacă conversia PDF eșuează, trimite documentul Word ca fallback
        // Make sure we have a valid name for the contract file
        let displayName = user.idCard.fullName;
        if (!displayName || displayName === 'test') {
          // Fallback to user name if idCard name is not available or is test
          displayName = user.name || userId;
        }
        
        console.log(`Using display name for docx fallback: ${displayName}`);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=contract_${displayName.replace(/\s+/g, '_')}.docx`);
        
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
    
    // Inițializăm documentele utilizatorului dacă nu există
    if (!user.documents) {
      user.documents = {};
    }
    
    console.log(`Download contract requested for user: ${userId}`);
    console.log(`User document state: ${JSON.stringify(user.documents)}`);
    
    let contractFullPath = null;
    
    // Verificăm dacă utilizatorul are o cale validată spre contract
    if (user.documents.contractPath) {
      // Obținem calea completă din calea relativă
      const contractRelativePath = user.documents.contractPath;
      console.log(`Contract relative path from user document: ${contractRelativePath}`);
      
      contractFullPath = path.join(__dirname, `../../../${contractRelativePath.substring(1)}`);
      console.log(`Constructed full path: ${contractFullPath}`);
      
      // Verificăm dacă fișierul există fizic
      if (!fs.existsSync(contractFullPath)) {
        logger.error(`Contract file not found at path: ${contractFullPath}`);
        console.error(`Contract file does not exist at path: ${contractFullPath}`);
        
        // Verificăm dacă există un alt contract pentru acest utilizator
        const alternativeFilename = `contract_${userId}.pdf`;
        const alternativePath = path.join(__dirname, `../../../uploads/contracts/${alternativeFilename}`);
        console.log(`Checking alternative path: ${alternativePath}`);
        
        if (fs.existsSync(alternativePath)) {
          console.log(`Found contract at alternative path: ${alternativePath}`);
          contractFullPath = alternativePath;
          
          // Actualizăm calea în baza de date pentru viitoare descărcări
          user.documents.contractPath = `/uploads/contracts/${alternativeFilename}`;
          await user.save();
        } else {
          console.error(`No contract file found for user at either path`);
          contractFullPath = null;
        }
      } else {
        console.log(`Contract file exists at path: ${contractFullPath}`);
      }
    } else {
      console.log(`No contract path set for user: ${userId}`);
      
      // Încercăm să găsim un contract existent
      const defaultFilename = `contract_${userId}.pdf`;
      const defaultPath = path.join(__dirname, `../../../uploads/contracts/${defaultFilename}`);
      console.log(`Checking default path: ${defaultPath}`);
      
      if (fs.existsSync(defaultPath)) {
        console.log(`Found contract at default path: ${defaultPath}`);
        contractFullPath = defaultPath;
        
        // Actualizăm calea în baza de date pentru viitoare descărcări
        user.documents.contractPath = `/uploads/contracts/${defaultFilename}`;
        await user.save();
      }
    }
    
    // Verificăm dacă avem o cale validă înainte de a încerca să citim fișierul
    if (!contractFullPath) {
      // Show a more detailed error with information about the state
      console.error(`Contract not found. User state: contractGenerated=${user.documents.contractGenerated}, contractPath=${user.documents.contractPath}`);
      return res.status(404).json({
        success: false,
        message: 'Contractul nu a fost găsit. Te rugăm să generezi mai întâi contractul.',
        error: 'contract_not_found',
        shouldGenerate: true
      });
    }
    
    try {
      // Citim fișierul în memorie pentru a evita problemele cu middleware-ul fileUpload
      console.log(`Reading contract file from: ${contractFullPath}`);
      const fileBuffer = fs.readFileSync(contractFullPath);
      console.log(`Successfully read contract file, size: ${fileBuffer.length} bytes`);
      
      // Determinam tipul de fisier dupa extensie sau flag-ul contractFormat
      const isDocx = user.documents.contractFormat === 'docx' || contractFullPath.toLowerCase().endsWith('.docx');
      
      // Set headers for correct file type and send file
      // Make sure we have a valid name for the contract file
      let displayName = user.idCard?.fullName;
      if (!displayName || displayName === 'test') {
        // Fallback to user name if idCard name is not available or is test
        displayName = user.name || userId;
      }
      const fileName = `contract_${displayName.replace(/\s+/g, '_')}${isDocx ? '.docx' : '.pdf'}`;
      
      console.log(`Using display name for contract: ${displayName}`);
      
      if (isDocx) {
        console.log(`Sending a DOCX file: ${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } else {
        console.log(`Sending a PDF file: ${fileName}`);
        res.setHeader('Content-Type', 'application/pdf');
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`);
      console.log(`Set headers for download, filename: ${fileName}`);
      
      // Important: Marchez acest request ca fiind o descărcare statică, nu un upload de fișier
      if (req.files) {
        delete req.files;
      }
      
      // Trimitem buffer-ul direct
      console.log(`Sending file to client...`);
      return res.send(fileBuffer);
    } catch (readError) {
      logger.error(`Error reading contract file: ${readError.message}`);
      console.error(`Failed to read contract file: ${readError.message}`);
      return res.status(500).json({
        success: false,
        message: 'Eroare la citirea fișierului contract. Te rugăm să încerci din nou.',
        error: readError.message
      });
    }
  } catch (error) {
    logger.error(`Contract download error: ${error.message}`);
    next(error);
  }
};

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
    const { CNP, fullName, address, series, number, issuedBy, birthDate, expiryDate } = req.body;
    
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
      // Clear signature data as well
      user.signature = null;
    }
    
    await user.save();
    
    // Verificăm dacă există fișiere de contract pentru acest utilizator și le ștergem
    const contractsDir = path.join(__dirname, '../../../uploads/contracts');
    console.log(`Verificare fișiere contract pentru ștergere din: ${contractsDir}`);
    
    // Verificăm dacă directorul există
    if (!fs.existsSync(contractsDir)) {
      console.log(`Directorul pentru contracte nu există, se creează: ${contractsDir}`);
      await fs.promises.mkdir(contractsDir, { recursive: true });
    }
    
    const contractFilename = `contract_${userId}.pdf`;
    const contractPath = path.join(contractsDir, contractFilename);
    console.log(`Caut fișierul contract PDF: ${contractPath}`);
    
    // Ștergem fișierul PDF dacă există
    try {
      if (fs.existsSync(contractPath)) {
        console.log(`Șterg fișierul contract PDF: ${contractPath}`);
        fs.unlinkSync(contractPath);
        console.log(`Fișierul PDF a fost șters`);
      } else {
        console.log(`Nu s-a găsit fișierul PDF pentru ștergere`);
      }
    } catch (deleteError) {
      console.error(`Eroare la ștergerea contractului PDF: ${deleteError.message}`);
    }
    
    // Verificăm și fișierul docx
    const docxPath = path.join(contractsDir, `contract_${userId}.docx`);
    console.log(`Caut fișierul contract DOCX: ${docxPath}`);
    
    try {
      if (fs.existsSync(docxPath)) {
        console.log(`Șterg fișierul contract DOCX: ${docxPath}`);
        fs.unlinkSync(docxPath);
        console.log(`Fișierul DOCX a fost șters`);
      } else {
        console.log(`Nu s-a găsit fișierul DOCX pentru ștergere`);
      }
    } catch (deleteError) {
      console.error(`Eroare la ștergerea contractului DOCX: ${deleteError.message}`);
    }
    
    console.log(`Resetarea contractului și a fișierelor asociate a fost finalizată.`);
    
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
    
    // Check if signature data is provided
    const { signatureData } = req.body;
    
    // Update user document to mark contract as signed and store signature
    user.contractSigned = true;
    user.contractSignedAt = new Date();
    
    // Save signature data if provided
    if (signatureData) {
      user.signature = signatureData;
      console.log('Signature data saved for user:', userId);
    }
    
    // Mark contract path in user document if not already set
    if (!user.documents) {
      user.documents = {};
    }
    
    // If no contract path is set but contract file exists for this user, update the path
    // Verificăm dacă avem un path valid pentru contract sau dacă putem recrea unul
    if (!user.documents.contractPath) {
      const contractFilename = `contract_${userId}.pdf`;
      const contractPath = path.join(__dirname, `../../../uploads/contracts/${contractFilename}`);
      
      if (fs.existsSync(contractPath)) {
        user.documents.contractPath = `/uploads/contracts/${contractFilename}`;
        console.log(`Am găsit și am setat calea contractului la: ${user.documents.contractPath}`);
      } else {
        // Nu am găsit un contract existent
        logger.warn(`Nu am găsit un contract existent pentru utilizatorul ${userId} la semnare`);
        
        // Dacă nu găsim contractul, dar utilizatorul încearcă să-l semneze, putem returna o eroare indicând că trebuie generat mai întâi
        return res.status(400).json({
          success: false,
          message: 'Contractul nu a fost găsit. Te rugăm să generezi mai întâi contractul.',
          error: 'contract_not_found'
        });
      }
    } else {
      // Verificăm dacă contractul referit de path există în realitate
      const contractFullPath = path.join(__dirname, `../../../${user.documents.contractPath.substring(1)}`);
      
      if (!fs.existsSync(contractFullPath)) {
        logger.error(`Contract file not found at path when signing: ${contractFullPath}`);
        return res.status(400).json({
          success: false,
          message: 'Contractul nu a fost găsit la adresa indicată. Te rugăm să regenerezi contractul.',
          error: 'contract_path_invalid'
        });
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