const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const ImageModule = require('docxtemplater-image-module-free');
const sizeOf = require('image-size');
const { convertToPdf } = require('../utils/documentConverter');
const User = require('../models/User');
const logger = require('../utils/logger');

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


// Soluție pentru inserarea directă a imaginii în docxtemplater
// Soluție pentru inserarea imaginii prin manipulare directă a XML-ului

exports.generateContract = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilizator negăsit' });

    // Validare și configurare inițială

    // Procesăm semnătura
    let signatureBase64 = null;
    if (user.signature) {
      const cleanSignature = user.signature.replace(/\s+/g, '');
      if (!cleanSignature.startsWith('data:image/png;base64,')) {
        throw new Error('Semnătura nu este în formatul așteptat.');
      }
      signatureBase64 = cleanSignature;
      
      // Extragem datele base64 fără prefix
      const base64Data = cleanSignature.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Obținem dimensiunile imaginii
      const dimensions = sizeOf(imageBuffer);
      console.log("Dimensiunile imaginii:", dimensions);
    }

    // Obținem IP-ul utilizatorului
    const userIp = req.ip || req.connection.remoteAddress || "IP necunoscut";

    // Pregătim datele pentru template
    const templateData = {
      nume_si_prenume: user.idCard.fullName,
      domiciliul_aplicantului: user.idCard.address ?? 'test',
      identificat_cu_ci: `${user.idCard.series} ${user.idCard.number}`,
      ci_eliberat_la_data_de: user.idCard.birthDate ? new Date(user.idCard.birthDate).toLocaleDateString('ro-RO') : 'N/A',
      data_semnarii: new Date().toLocaleDateString('ro-RO'),
      ip_aplicant: userIp
    };

    // Citim template-ul
    const templatePath = path.join(__dirname, '../../templates/contract.docx');
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);

    // Pasul 1: Procesăm textul normal cu docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' }
    });

    // Setăm datele pentru text
    doc.setData(templateData);
    doc.render();

    // Pasul 2: Manipulăm direct XML-ul pentru a insera imaginea
    if (signatureBase64) {
      // Extragem datele base64 fără prefix
      const base64Data = signatureBase64.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Obținem dimensiunile imaginii
      const dimensions = sizeOf(imageBuffer);
      const maxWidth = 150; // pixeli
      const ratio = maxWidth / dimensions.width;
      const height = Math.round(dimensions.height * ratio);
      
      // Calculăm dimensiunile în EMU (English Metric Units) pentru Word
      // 1 inch = 914400 EMU, 1 pixel ≈ 9525 EMU
      const emuWidth = Math.round(maxWidth * 9525);
      const emuHeight = Math.round(height * 9525);
      
      // Creăm un ID unic pentru imagine
      const imageId = `image_${Date.now()}`;
      const imageFileName = `image_${userId}.png`;
      
      // Adăugăm imaginea în arhiva docx
      zip.file(`word/media/${imageFileName}`, imageBuffer);
      
      // Verificăm dacă există fișierul de relații, dacă nu, îl creăm
      let relsXml = "";
      try {
        relsXml = zip.file("word/_rels/document.xml.rels").asText();
      } catch (e) {
        console.log("Fișierul de relații nu există, va fi creat");
        relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
                 '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
      }
      
      // Parseăm XML-ul relațiilor pentru a adăuga imaginea
      const parser = new DOMParser();
      const relsDoc = parser.parseFromString(relsXml, "application/xml");
      const relationships = relsDoc.getElementsByTagName("Relationships")[0];
      
      // Creăm noua relație pentru imagine
      const newRel = relsDoc.createElement("Relationship");
      newRel.setAttribute("Id", imageId);
      newRel.setAttribute("Type", "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image");
      newRel.setAttribute("Target", `media/${imageFileName}`);
      relationships.appendChild(newRel);
      
      // Serializăm relațiile înapoi în XML
      const serializer = new XMLSerializer();
      const updatedRelsXml = serializer.serializeToString(relsDoc);
      zip.file("word/_rels/document.xml.rels", updatedRelsXml);
      
      // Acum trebuie să înlocuim tag-ul {%image semnatura%} cu imaginea
      // Obținem XML-ul documentului
      const documentXml = zip.file("word/document.xml").asText();
      
      // Pattern pentru a găsi tag-ul {%image semnatura%}
      const imageTagPattern = /{%image\s+semnatura%}/;
      
      // XML pentru desenarea imaginii
      const imageXml = `<w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="${emuWidth}" cy="${emuHeight}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:docPr id="1" name="Semnătură"/>
          <wp:cNvGraphicFramePr>
            <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
          </wp:cNvGraphicFramePr>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="0" name="Semnătură"/>
                  <pic:cNvPicPr/>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="${imageId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                  <a:stretch>
                    <a:fillRect/>
                  </a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="${emuWidth}" cy="${emuHeight}"/>
                  </a:xfrm>
                  <a:prstGeom prst="rect">
                    <a:avLst/>
                  </a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>`;
      
      // Înlocuim tag-ul cu XML-ul pentru imagine
      // Dar trebuie să fim atenți la contextul XML - tag-ul este probabil înconjurat de run (<w:r>)
      
      // Căutăm un pattern mai complex care să includă contextul XML
      const runWithTagPattern = /<w:r[^>]*>.*?{%image\s+semnatura%}.*?<\/w:r>/;
      
      if (runWithTagPattern.test(documentXml)) {
        // Înlocuim întregul run cu un nou run care conține imaginea
        const modifiedXml = documentXml.replace(runWithTagPattern, `<w:r>${imageXml}</w:r>`);
        zip.file("word/document.xml", modifiedXml);
        console.log("Tag-ul de imagine a fost înlocuit cu succes în cadrul unui run");
      } else {
        // Încercăm un pattern mai simplu direct pentru tag
        if (imageTagPattern.test(documentXml)) {
          const modifiedXml = documentXml.replace(imageTagPattern, imageXml);
          zip.file("word/document.xml", modifiedXml);
          console.log("Tag-ul simplu de imagine a fost înlocuit cu succes");
        } else {
          console.error("Nu s-a găsit tag-ul de imagine în document");
        }
      }
    }
    
    // Generăm documentul final
    const wordBuffer = zip.generate({ type: 'nodebuffer' });
    
    // Salvăm documentul pentru verificare
    const uploadsDir = path.join(__dirname, '../../../uploads/contracts');
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    const docxFilename = `contract_${userId}.docx`;
    const docxPath = path.join(uploadsDir, docxFilename);
    fs.writeFileSync(docxPath, wordBuffer);
    
    // Convertim la PDF și continuăm procesul...
  } catch (error) {
    console.error("Eroare:", error);
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