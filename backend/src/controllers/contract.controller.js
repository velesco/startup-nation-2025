const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { convertWordBufferToPdf } = require('../utils/pdfConverter');
const User = require('../models/User');
const logger = require('../utils/logger');

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
    if (!user.idCard || !user.idCard.CNP || !user.idCard.fullName) {
      return res.status(400).json({
        success: false,
        message: 'Datele din buletin nu sunt complete. Te rugăm să completezi datele din buletin înainte de a genera contractul.'
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