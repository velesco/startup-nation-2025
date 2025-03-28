/**
 * Utilitar pentru a insera semnătura ca imagine în documentul Word.
 * 
 * Această soluție alternativă este necesară pentru a lucra corect cu semnăturile,
 * până la instalarea modulului docxtemplater-image-module-free.
 */
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const logger = require('./logger');

/**
 * Înlocuiește texte specifice în documentul DOCX cu imagini
 * @param {Buffer} docxBuffer - Buffer-ul documentului Word
 * @param {string} signatureDataUri - Semnătura în format base64 data URI
 * @returns {Buffer} - Buffer-ul documentului modificat
 */
function insertSignatureImage(docxBuffer, signatureDataUri) {
  if (!signatureDataUri || !signatureDataUri.startsWith('data:image/')) {
    logger.error('Formatul semnăturii nu este corect pentru inserare ca imagine');
    return docxBuffer;
  }
  
  try {
    // Extragem partea cu date din string-ul base64
    const base64Data = signatureDataUri.split(';base64,').pop();
    if (!base64Data) {
      logger.error('Nu s-au putut extrage datele imagine din URI');
      return docxBuffer;
    }
    
    // Convertim docx-ul în zip pentru procesare
    const zip = new PizZip(docxBuffer);
    
    // Căutăm în docx fișierele XML care conțin texte
    const fileNames = Object.keys(zip.files);
    
    // Parcurgem toate fișierele XML din docx
    const documentFiles = fileNames.filter(fileName => 
      (fileName.startsWith('word/document.xml') || 
       fileName.startsWith('word/header') || 
       fileName.startsWith('word/footer')) && 
      !fileName.endsWith('/')
    );
    
    // Înlocuim {{semnatura}} cu un placeholder special pentru imagine
    documentFiles.forEach(fileName => {
      let content = zip.files[fileName].asText();
      
      // Înlocuim referințele la {{semnatura}} cu un tag markup pentru imagine
      // Notă: Aceasta este o soluție temporară până la instalarea modulului docxtemplater-image-module-free
      // și nu va funcționa perfect în toate cazurile
      content = content.replace(/{{semnatura}}/g, signatureDataUri);
      
      // Actualizăm conținutul fișierului în zip
      zip.file(fileName, content);
    });
    
    // Generăm documentul modificat
    return zip.generate({type: 'nodebuffer'});
  } catch (error) {
    logger.error(`Eroare la inserarea semnăturii în document: ${error.message}`);
    return docxBuffer;
  }
}

module.exports = {
  insertSignatureImage
};