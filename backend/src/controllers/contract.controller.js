const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const ImageModule = require('docxtemplater-image-module-free');
const sizeOf = require('image-size');
const { convertToPdf } = require('../utils/documentConverter');
const User = require('../models/User');
const logger = require('../utils/logger');

// Funcție ajutătoare pentru validarea datelor din buletin
const validateIdCardData = (idCard) => {
  if (!idCard) return { valid: false, missingFields: ['toate datele din buletin'] };
  const requiredFields = [
    { field: 'CNP', label: 'CNP' },
    { field: 'fullName', label: 'nume și prenume' },
    { field: 'address', label: 'adresa' },
    { field: 'series', label: 'seria' },
    { field: 'number', label: 'numărul' }
  ];
  const missingFields = requiredFields.filter(f => !idCard[f.field]).map(f => f.label);
  return { valid: missingFields.length === 0, missingFields };
};

// Salvează semnătura în DB
exports.saveSignature = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizator negăsit' });
    }

    const { signatureData } = req.body;
    if (!signatureData) {
      return res.status(400).json({ success: false, message: 'Nu a fost furnizată nicio semnătură' });
    }

    // Salvăm semnătura în DB
    user.signature = signatureData.trim();
    await user.save();

    return res.status(200).json({ success: true, message: 'Semnătura a fost salvată cu succes' });
  } catch (error) {
    logger.error(`Signature save error: ${error.message}`);
    next(error);
  }
};

// Generează contractul
exports.generateContract = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizator negăsit' });
    }

    // Validăm datele din buletin
    const validationResult = validateIdCardData(user.idCard);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: `Datele din buletin nu sunt complete. Lipsesc: ${validationResult.missingFields.join(', ')}`,
        missingFields: validationResult.missingFields
      });
    }

    // Marcare că s-a generat contractul
    if (!user.documents) user.documents = {};
    user.documents.contractGenerated = true;
    await user.save();

    // Pregătim datele pentru template
    const contractData = {
      nume_si_prenume: user.idCard.fullName,
      domiciliul_aplicantului: user.idCard.address ?? 'test',
      identificat_cu_ci: `${user.idCard.series} ${user.idCard.number}`,
      ci_eliberat_la_data_de: user.idCard.birthDate
        ? new Date(user.idCard.birthDate).toLocaleDateString('ro-RO')
        : 'N/A',
      data_semnarii: new Date().toLocaleDateString('ro-RO'),
      // Doar atribuim semnatura dacă avem o valoare validă
      semnatura: user.signature
    };

    // Verificăm dacă semnătura este un DataURL valid
    console.log("Signature data exists:", !!user.signature);
    console.log("Signature data type:", typeof user.signature);
    if (user.signature) {
      console.log("Signature starts with image data:", user.signature.startsWith('data:image/'));
      console.log("Signature length:", user.signature.length);
    }

    // Verificăm existența template-ului
    const templatePath = path.join(__dirname, '../../templates/contract.docx');
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({
        success: false,
        message: 'Template-ul contract.docx nu a fost găsit în directorul templates.'
      });
    }

    // Citește template-ul DOCX
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);

    // Configurăm modulul de imagini
    const imageModule = new ImageModule({
      centered: false,
      fileType: "docx",
      getImage: function(tagValue, tagName) {
        console.log("Getting image for tag:", tagName, "with value:", tagValue);
        
        // Pentru tag-ul "semnatura", folosim datele user.signature
        if (tagName === "semnatura" && user.signature && user.signature.startsWith('data:image/')) {
          try {
            const base64Data = user.signature.split(';base64,').pop();
            return Buffer.from(base64Data, 'base64');
          } catch (error) {
            console.error("Error processing signature data:", error);
            return null;
          }
        }
        
        // Pentru alte taguri sau când semnătura nu este validă
        return null;
      },
      getSize: function(img, tagValue, tagName) {
        try {
          const dimensions = sizeOf(img);
          const maxWidth = 150; // lățime maximă în pixeli
          const ratio = maxWidth / dimensions.width;
          return [maxWidth, Math.round(dimensions.height * ratio)];
        } catch (e) {
          console.error("Eroare la dimensionarea imaginii:", e);
          return [150, 75]; // dimensiuni implicite
        }
      }
    });

    // Creare și configurare docxtemplater
    const doc = new Docxtemplater();
    doc.attachModule(imageModule);
    doc.loadZip(zip);
    doc.setData(contractData);

    try {
      // Renderizăm documentul
      doc.render();
      console.log("Document rendered successfully");
    } catch (error) {
      logger.error(`Eroare la renderizarea contractului: ${error.message}`);
      if (error.properties && error.properties.errors) {
        console.error("Template errors:", error.properties.errors);
      }
      return res.status(500).json({
        success: false,
        message: 'Eroare la procesarea template-ului',
        details: error.message
      });
    }

    // Generăm DOCX în memorie
    const wordBuffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });

    // Convertim DOCX -> PDF
    let pdfBuffer;
    try {
      pdfBuffer = await convertToPdf(wordBuffer);
    } catch (conversionError) {
      logger.error(`PDF conversion error: ${conversionError.message}`);
      // Salvăm cel puțin fișierul DOCX și îl returnăm ca fallback
      const uploadsDir = path.join(__dirname, '../../../uploads/contracts');
      await fs.promises.mkdir(uploadsDir, { recursive: true });
      
      const docxFilename = `contract_${userId}.docx`;
      const docxPath = path.join(uploadsDir, docxFilename);
      fs.writeFileSync(docxPath, wordBuffer);
      
      user.documents.contractPath = `/uploads/contracts/${docxFilename}`;
      user.documents.contractFormat = 'docx';
      await user.save();
      
      let displayName = user.idCard.fullName || user.name || userId;
      displayName = displayName.replace(/\s+/g, '_');
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=contract_${displayName}.docx`);
      return res.send(wordBuffer);
    }

    // Salvăm PDF-ul generat
    const uploadsDir = path.join(__dirname, '../../../uploads/contracts');
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const contractFilename = `contract_${userId}.pdf`;
    const contractPath = path.join(uploadsDir, contractFilename);
    fs.writeFileSync(contractPath, pdfBuffer);

    // Actualizăm user.documents
    user.documents.contractPath = `/uploads/contracts/${contractFilename}`;
    user.documents.contractFormat = 'pdf';
    await user.save();

    let displayName = user.idCard.fullName || user.name || userId;
    displayName = displayName.replace(/\s+/g, '_');

    // Returnăm fișierul PDF la client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contract_${displayName}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    logger.error(`Contract generation error: ${error.message}`);
    next(error);
  }
};

// Endpoint pentru descărcarea contractului
exports.downloadContract = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    if (!user.documents) {
      user.documents = {};
    }
    
    console.log(`Download contract requested for user: ${userId}`);
    console.log(`User document state: ${JSON.stringify(user.documents)}`);
    
    let contractFullPath = null;
    
    if (user.documents.contractPath) {
      const contractRelativePath = user.documents.contractPath;
      console.log(`Contract relative path from user document: ${contractRelativePath}`);
      
      contractFullPath = path.join(__dirname, `../../../${contractRelativePath.substring(1)}`);
      console.log(`Constructed full path: ${contractFullPath}`);
      
      if (!fs.existsSync(contractFullPath)) {
        logger.error(`Contract file not found at path: ${contractFullPath}`);
        console.error(`Contract file does not exist at path: ${contractFullPath}`);
        
        const alternativeFilename = `contract_${userId}.pdf`;
        const alternativePath = path.join(__dirname, `../../../uploads/contracts/${alternativeFilename}`);
        console.log(`Checking alternative path: ${alternativePath}`);
        
        if (fs.existsSync(alternativePath)) {
          console.log(`Found contract at alternative path: ${alternativePath}`);
          contractFullPath = alternativePath;
          
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
      
      const defaultFilename = `contract_${userId}.pdf`;
      const defaultPath = path.join(__dirname, `../../../uploads/contracts/${defaultFilename}`);
      console.log(`Checking default path: ${defaultPath}`);
      
      if (fs.existsSync(defaultPath)) {
        console.log(`Found contract at default path: ${defaultPath}`);
        contractFullPath = defaultPath;
        
        user.documents.contractPath = `/uploads/contracts/${defaultFilename}`;
        await user.save();
      }
    }
    
    if (!contractFullPath) {
      console.error(`Contract not found. User state: contractGenerated=${user.documents.contractGenerated}, contractPath=${user.documents.contractPath}`);
      return res.status(404).json({
        success: false,
        message: 'Contractul nu a fost găsit. Te rugăm să generezi mai întâi contractul.',
        error: 'contract_not_found',
        shouldGenerate: true
      });
    }
    
    try {
      console.log(`Reading contract file from: ${contractFullPath}`);
      const fileBuffer = fs.readFileSync(contractFullPath);
      console.log(`Successfully read contract file, size: ${fileBuffer.length} bytes`);
      
      const isDocx = user.documents.contractFormat === 'docx' || contractFullPath.toLowerCase().endsWith('.docx');
      
      let displayName = user.idCard?.fullName;
      if (!displayName || displayName === 'test') {
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
      
      if (req.files) {
        delete req.files;
      }
      
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

// Endpoint de validare a datelor din buletin
exports.validateIdCard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    const validationResult = validateIdCardData(user.idCard);
    
    if (validationResult.valid) {
      return res.status(200).json({
        success: true,
        message: 'Datele din buletin sunt complete',
        idCard: user.idCard
      });
    }
    
    const { CNP, fullName, address, series, number, issuedBy, birthDate, expiryDate } = req.body;
    
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
    
    if (!user.idCard) {
      user.idCard = {};
    }
    
    Object.keys(updatedIdCard).forEach(key => {
      if (updatedIdCard[key]) {
        user.idCard[key] = updatedIdCard[key];
      }
    });
    
    if (!user.documents) {
      user.documents = {};
    }
    user.documents.id_cardUploaded = true;
    
    await user.save();
    
    const revalidationResult = validateIdCardData(user.idCard);
    
    if (revalidationResult.valid) {
      return res.status(200).json({
        success: true,
        message: 'Datele din buletin au fost actualizate cu succes',
        idCard: user.idCard
      });
    } else {
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

// Reset contract
exports.resetContract = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    if (!user.documents) {
      user.documents = {};
    }
    
    user.documents.contractGenerated = false;
    user.documents.contractPath = null;
    
    if (user.contractSigned) {
      user.contractSigned = false;
      user.contractSignedAt = null;
      user.signature = null;
    }
    
    await user.save();
    
    const contractsDir = path.join(__dirname, '../../../uploads/contracts');
    console.log(`Verificare fișiere contract pentru ștergere din: ${contractsDir}`);
    
    if (!fs.existsSync(contractsDir)) {
      console.log(`Directorul pentru contracte nu există, se creează: ${contractsDir}`);
      await fs.promises.mkdir(contractsDir, { recursive: true });
    }
    
    const contractFilename = `contract_${userId}.pdf`;
    const contractPath = path.join(contractsDir, contractFilename);
    console.log(`Caut fișierul contract PDF: ${contractPath}`);
    
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

// Semnarea contractului
exports.signContract = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }
    
    const { signatureData } = req.body;
    
    user.contractSigned = true;
    user.contractSignedAt = new Date();
    
    if (signatureData) {
      user.signature = signatureData.trim();
      console.log('Signature data saved for user:', userId);
    }
    
    if (!user.documents) {
      user.documents = {};
    }
    
    if (!user.documents.contractPath) {
      const contractFilename = `contract_${userId}.pdf`;
      const contractPath = path.join(__dirname, `../../../uploads/contracts/${contractFilename}`);
      
      if (fs.existsSync(contractPath)) {
        user.documents.contractPath = `/uploads/contracts/${contractFilename}`;
        console.log(`Am găsit și am setat calea contractului la: ${user.documents.contractPath}`);
      } else {
        logger.warn(`Nu am găsit un contract existent pentru utilizatorul ${userId} la semnare`);
        return res.status(400).json({
          success: false,
          message: 'Contractul nu a fost găsit. Te rugăm să generezi mai întâi contractul.',
          error: 'contract_not_found'
        });
      }
    } else {
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

// Descărcare template
exports.downloadTemplate = async (req, res, next) => {
  try {
    const templatePath = path.join(__dirname, '../../templates/contract_template.docx');
    
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({
        success: false,
        message: 'Template-ul de contract nu a fost găsit'
      });
    }
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=contract_template.docx');
    
    const fileStream = fs.createReadStream(templatePath);
    fileStream.pipe(res);
  } catch (error) {
    logger.error(`Template download error: ${error.message}`);
    next(error);
  }
};