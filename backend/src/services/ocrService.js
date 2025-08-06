const OpenAI = require('openai');
const fs = require('fs');
const logger = require('../utils/logger');

class OCRService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for OCR functionality');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async extractIDCardData(imagePath) {
    try {
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error('Image file not found');
      }

      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // More cost-effective model with vision capabilities
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analizează această imagine a unui buletin de identitate românesc și extrage următoarele informații în format JSON strict. Dacă o informație nu este vizibilă sau nu poate fi citită, folosește null pentru acea valoare.

Format JSON cerut:
{
  "CNP": "string - codul numeric personal (13 cifre)",
  "fullName": "string - nume complet (prenume și nume de familie)",
  "address": "string - adresa completă",
  "series": "string - seria buletinului (ex: RR, BV, etc.)",
  "number": "string - numărul buletinului (6 cifre)",
  "issuedBy": "string - emis de (ex: SPCLEP SECTOR 1)",
  "birthDate": "string - data nașterii în format YYYY-MM-DD",
  "issueDate": "string - data eliberării în format YYYY-MM-DD", 
  "expiryDate": "string - data expirării în format YYYY-MM-DD"
}

Returnează DOAR JSON-ul, fără text suplimentar.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      });

      const extractedText = response.choices[0]?.message?.content?.trim();
      
      if (!extractedText) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      let extractedData;
      try {
        extractedData = JSON.parse(extractedText);
      } catch (parseError) {
        logger.error('Failed to parse OpenAI JSON response:', parseError);
        throw new Error('Invalid JSON response from OCR service');
      }

      // Validate that we have at least some required fields
      if (!extractedData.CNP && !extractedData.fullName) {
        throw new Error('Could not extract essential information from ID card');
      }

      // Convert date strings to Date objects if they exist and are valid
      const dateFields = ['birthDate', 'issueDate', 'expiryDate'];
      dateFields.forEach(field => {
        if (extractedData[field] && extractedData[field] !== null) {
          const date = new Date(extractedData[field]);
          if (!isNaN(date.getTime())) {
            extractedData[field] = date;
          } else {
            extractedData[field] = null;
          }
        }
      });

      logger.info(`Successfully extracted ID card data for: ${extractedData.fullName}`);
      return extractedData;

    } catch (error) {
      logger.error('OCR Service Error:', error);
      throw new Error(`Failed to extract ID card data: ${error.message}`);
    }
  }

  async validateIDCardImage(imagePath) {
    try {
      // Check if file exists and is readable
      if (!fs.existsSync(imagePath)) {
        return { isValid: false, error: 'Image file not found' };
      }

      const stats = fs.statSync(imagePath);
      
      // Check file size (max 10MB)
      if (stats.size > 10 * 1024 * 1024) {
        return { isValid: false, error: 'Image file too large (max 10MB)' };
      }

      // Check if it's actually an image by checking extension
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const extension = imagePath.toLowerCase().substring(imagePath.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(extension)) {
        return { isValid: false, error: 'Invalid image format. Allowed: JPG, PNG, GIF, WebP' };
      }

      return { isValid: true };
    } catch (error) {
      logger.error('Image validation error:', error);
      return { isValid: false, error: 'Failed to validate image' };
    }
  }
}

module.exports = new OCRService();
