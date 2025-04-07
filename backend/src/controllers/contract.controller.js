const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { convertToPdf } = require('../utils/documentConverter');
const User = require('../models/User');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

// Funcție pentru înlocuirea diacriticelor cu caracterele fără diacritice
const removeDiacritics = (str) => {
  if (!str) return str;
  return str
    .replace(/[ăâ]/g, 'a')
    .replace(/[î]/g, 'i')
    .replace(/[șş]/g, 's')
    .replace(/[țţ]/g, 't')
    .replace(/[ĂÂ]/g, 'A')
    .replace(/[Î]/g, 'I')
    .replace(/[ȘŞ]/g, 'S')
    .replace(/[ȚŢ]/g, 'T');
};

// Utility function to send email with attachment
const sendContractEmail = async (user, attachmentPath, attachmentName, isDocx = false) => {
  try {
    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };
    
    // Log email configuration (without password)
    logger.info(`Attempting to send email with SMTP: ${config.host}:${config.port}, user: ${config.auth.user}`);
    
    if (!config.auth.user || !config.auth.pass) {
      logger.warn('Email sending skipped: SMTP credentials not properly configured');
      return { success: false, error: 'SMTP credentials not configured' };
    }

    const transporter = nodemailer.createTransport(config);
    
    // Read file for attachment
    const attachment = fs.readFileSync(attachmentPath);
    
    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || `\"Start-Up Nation 2025\" <${config.auth.user}>`,
      to: [user.email, 'contact@aplica-startup.ro'],
      subject: 'Contract Start-Up Nation 2025',
      text: `Bună ziua, ${user.name || 'utilizator Start-Up Nation'},\n\nAtașat veți găsi contractul generat pentru programul Start-Up Nation 2025.\n\nCu stimă,\nEchipa Start-Up Nation 2025`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #4F46E5, #7C3AED); padding: 20px; text-align: center; color: white;">
            <h2>Start-Up Nation 2025</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Bună ziua, <strong>${user.name || 'utilizator Start-Up Nation'}</strong>,</p>
            <p>Atașat veți găsi contractul generat pentru programul Start-Up Nation 2025.</p>
            <p>Pentru orice întrebări suplimentare, nu ezitați să ne contactați.</p>
            <p style="margin-top: 30px;">Cu stimă,<br>Echipa Start-Up Nation 2025</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>&copy; 2025 Start-Up Nation. Toate drepturile rezervate.</p>
          </div>
        </div>
      `,
      attachments: [{
        filename: attachmentName,
        content: attachment,
        contentType: isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf'
      }]
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Contract email sent to ${user.email} and contact@aplica-startup.ro: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Error sending contract email: ${error.message}`);
    return { success: false, error: error.message };
  }
};

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

exports.saveSignature = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilizator negăsit' });

    const { signatureData } = req.body;
    if (!signatureData) return res.status(400).json({ success: false, message: 'Nu a fost furnizată nicio semnătură' });

    // Curățăm semnătura de eventuale newline-uri și spații suplimentare
    user.signature = signatureData.replace(/\s+/g, '');
    await user.save();
    return res.status(200).json({ success: true, message: 'Semnătura a fost salvată cu succes' });
  } catch (error) {
    logger.error(`Signature save error: ${error.message}`);
    next(error);
  }
};

exports.generateContract = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilizator negăsit' });

    const validationResult = validateIdCardData(user.idCard);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: `Datele din buletin nu sunt complete. Lipsesc: ${validationResult.missingFields.join(', ')}`,
        missingFields: validationResult.missingFields
      });
    }

    if (!user.documents) user.documents = {};
    user.documents.contractGenerated = true;
    await user.save();

    // Pregătim datele pentru a le trimite la API
    const formData = new FormData();
    
    // Adăugăm datele utilizatorului
    formData.append('userId', userId);
    formData.append('fullName', user.idCard.fullName);
    formData.append('address', user.idCard.address || '');
    formData.append('idSeries', user.idCard.series);
    formData.append('idNumber', user.idCard.number);
    formData.append('birthDate', user.idCard.birthDate ? new Date(user.idCard.birthDate).toLocaleDateString('ro-RO') : '');
    
    // Adăugăm IP-ul utilizatorului
    const userIp = req.ip || req.connection.remoteAddress || "IP necunoscut";
    formData.append('ipAddress', userIp);
    
    // Adăugăm semnătura
    if (user.signature) {
      const cleanSignature = user.signature.replace(/\s+/g, '');
      formData.append('signature', cleanSignature);
    }
    
    // Adăugăm orice alte date necesare
    // [adăugați mai multe câmpuri după nevoie]
    
    console.log('Trimitem datele la API extern...');
    
    // Apelăm API-ul extern pentru a genera documentul DOCX
    const apiResponse = await axios.post('https://pnrr.digitalizarefirme.com/api/startup/documente', formData, {
      headers: {
        ...formData.getHeaders(), 
        'Accept': 'application/json'
      },
      responseType: 'arraybuffer'  // Important pentru a primi fișierul binar
    });
    
    if (apiResponse.status !== 200) {
      throw new Error(`API extern a răspuns cu status: ${apiResponse.status}`);
    }
    
    console.log('Document DOCX primit de la API extern');
    
    // Salvăm documentul DOCX primit
    const uploadsDir = path.join(__dirname, '../../../uploads/contracts');
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    
    const docxFilename = `contract_${userId}.docx`;
    const docxPath = path.join(uploadsDir, docxFilename);
    
    // Salvăm documentul DOCX primit
    fs.writeFileSync(docxPath, apiResponse.data);
    console.log(`Document DOCX salvat la: ${docxPath}`);
    
    // Actualizăm informațiile în baza de date
    user.documents.contractFormat = 'docx';
    user.documents.contractPath = `/uploads/contracts/${docxFilename}`;
    await user.save();
    
    // Convertim documentul DOCX la PDF
    let pdfBuffer;
    let conversionSuccessful = false;
    try {
      pdfBuffer = await convertToPdf(apiResponse.data);
      console.log('Conversie la PDF reușită');
      
      // Salvăm PDF-ul
      const contractFilename = `contract_${userId}.pdf`;
      const contractPath = path.join(uploadsDir, contractFilename);
      fs.writeFileSync(contractPath, pdfBuffer);
      
      // Actualizăm calea în baza de date
      user.documents.contractFormat = 'pdf';
      user.documents.contractPath = `/uploads/contracts/${contractFilename}`;
      await user.save();
      
      // Trimitem email cu contractul PDF
      let displayName = user.idCard.fullName || user.name || userId;
      displayName = removeDiacritics(displayName).replace(/\s+/g, '_');
      logger.info(`Sending contract email to ${user.email} and contact@aplica-startup.ro`);
      const emailResult = await sendContractEmail(
        user, 
        contractPath, 
        `contract_${displayName}.pdf`, 
        false
      );
      
      if (!emailResult.success) {
        logger.warn(`Contract generated but email failed: ${emailResult.error}`);
      }
      
      conversionSuccessful = true;
      
      // Trimitem PDF-ul ca răspuns
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=contract_${displayName}.pdf`);
      return res.send(pdfBuffer);
    } catch (conversionError) {
      console.error('Eroare la conversia în PDF:', conversionError);
      logger.error(`PDF conversion error: ${conversionError.message}`);
      
      // Loggăm ca eroare dar continuăm cu DOCX
      conversionSuccessful = false;
    }
    
    // Dacă am ajuns aici, conversia la PDF a eșuat, deci trimitem DOCX-ul
    
    // Trimitem email cu contractul DOCX
    let displayName = user.idCard.fullName || user.name || userId;
    displayName = removeDiacritics(displayName).replace(/\s+/g, '_');
    
    logger.info(`Sending DOCX contract email to ${user.email} and contact@aplica-startup.ro`);
    const emailResult = await sendContractEmail(
      user, 
      docxPath, 
      `contract_${displayName}.docx`, 
      true
    );
    
    if (!emailResult.success) {
      logger.warn(`Contract generated but email failed: ${emailResult.error}`);
    }
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=contract_${displayName}.docx`);
    return res.send(apiResponse.data);
  } catch (error) {
    console.error('Eroare la generarea contractului:', error);
    logger.error(`Contract generation error: ${error.message}`);
    next(error);
  }
};

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
          // Check for DOCX as well
          const docxAlternativeFilename = `contract_${userId}.docx`;
          const docxAlternativePath = path.join(__dirname, `../../../uploads/contracts/${docxAlternativeFilename}`);
          console.log(`Checking DOCX alternative path: ${docxAlternativePath}`);
          
          if (fs.existsSync(docxAlternativePath)) {
            console.log(`Found DOCX contract at alternative path: ${docxAlternativePath}`);
            contractFullPath = docxAlternativePath;
            
            user.documents.contractPath = `/uploads/contracts/${docxAlternativeFilename}`;
            user.documents.contractFormat = 'docx';
            await user.save();
          } else {
            console.error(`No contract file found for user at any path`);
            contractFullPath = null;
          }
        }
      } else {
        console.log(`Contract file exists at path: ${contractFullPath}`);
      }
    } else {
      console.log(`No contract path set for user: ${userId}`);
      
      // Try both PDF and DOCX
      const defaultPdfFilename = `contract_${userId}.pdf`;
      const defaultPdfPath = path.join(__dirname, `../../../uploads/contracts/${defaultPdfFilename}`);
      console.log(`Checking default PDF path: ${defaultPdfPath}`);
      
      if (fs.existsSync(defaultPdfPath)) {
        console.log(`Found contract at default PDF path: ${defaultPdfPath}`);
        contractFullPath = defaultPdfPath;
        
        user.documents.contractPath = `/uploads/contracts/${defaultPdfFilename}`;
        user.documents.contractFormat = 'pdf';
        await user.save();
      } else {
        // Check for DOCX
        const defaultDocxFilename = `contract_${userId}.docx`;
        const defaultDocxPath = path.join(__dirname, `../../../uploads/contracts/${defaultDocxFilename}`);
        console.log(`Checking default DOCX path: ${defaultDocxPath}`);
        
        if (fs.existsSync(defaultDocxPath)) {
          console.log(`Found contract at default DOCX path: ${defaultDocxPath}`);
          contractFullPath = defaultDocxPath;
          
          user.documents.contractPath = `/uploads/contracts/${defaultDocxFilename}`;
          user.documents.contractFormat = 'docx';
          await user.save();
        }
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
      displayName = removeDiacritics(displayName).replace(/\s+/g, '_');
      const fileName = `contract_${displayName}${isDocx ? '.docx' : '.pdf'}`;
      
      console.log(`Using display name for contract: ${displayName}`);
      
      if (isDocx) {
        console.log(`Sending a DOCX file: ${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } else {
        console.log(`Sending a PDF file: ${fileName}`);
        res.setHeader('Content-Type', 'application/pdf');
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
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
      user.signature = signatureData.replace(/\s+/g, '');
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
        // Try DOCX as well
        const docxFilename = `contract_${userId}.docx`;
        const docxPath = path.join(__dirname, `../../../uploads/contracts/${docxFilename}`);
        
        if (fs.existsSync(docxPath)) {
          user.documents.contractPath = `/uploads/contracts/${docxFilename}`;
          user.documents.contractFormat = 'docx';
          console.log(`Am găsit și am setat calea contractului DOCX la: ${user.documents.contractPath}`);
        } else {
          logger.warn(`Nu am găsit un contract existent pentru utilizatorul ${userId} la semnare`);
          return res.status(400).json({
            success: false,
            message: 'Contractul nu a fost găsit. Te rugăm să generezi mai întâi contractul.',
            error: 'contract_not_found'
          });
        }
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