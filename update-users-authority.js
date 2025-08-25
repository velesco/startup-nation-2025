const fs = require('fs');
const path = require('path');

// Scriptul va rula prin backend-ul de admin pentru a actualiza utilizatorii
const updateUsersWithAuthorityFlags = async () => {
  console.log('Începem actualizarea utilizatorilor cu flag-urile pentru imputerniciri...');
  
  // Verificăm dacă există fișiere de imputernicire generate în folderele de upload
  const possibleDirectories = [
    '/Users/vasilevelesco/Documents/startup-nation-2025/uploads/authorization',
    '/Users/vasilevelesco/Documents/startup-nation-2025/uploads/contracts'
  ];
  
  const foundFiles = [];
  
  for (const dir of possibleDirectories) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const authorityFiles = files.filter(file => 
        file.startsWith('imputernicire_') && 
        (file.endsWith('.pdf') || file.endsWith('.docx'))
      );
      
      for (const file of authorityFiles) {
        const match = file.match(/imputernicire_([a-f0-9]{24})\.(pdf|docx)/);
        if (match) {
          const userId = match[1];
          const format = match[2];
          const fullPath = path.join(dir, file);
          
          foundFiles.push({
            userId,
            format,
            path: fullPath,
            relativePath: fullPath.replace('/Users/vasilevelesco/Documents/startup-nation-2025', '')
          });
        }
      }
    }
  }
  
  console.log(`Găsite ${foundFiles.length} fișiere de imputernicire:`);
  foundFiles.forEach(file => {
    console.log(`- User ${file.userId}: ${file.format} la ${file.path}`);
  });
  
  // Generăm scriptul de actualizare pentru MongoDB
  const mongoUpdates = foundFiles.map(file => ({
    userId: file.userId,
    updateData: {
      'documents.authorityDocumentGenerated': true,
      'documents.authorityDocumentPath': file.relativePath,
      'documents.authorityDocumentFormat': file.format
    }
  }));
  
  console.log('Script de actualizare MongoDB:');
  mongoUpdates.forEach(update => {
    console.log(`db.users.updateOne(
      { _id: ObjectId("${update.userId}") },
      { $set: ${JSON.stringify(update.updateData, null, 2)} }
    );`);
  });
  
  return foundFiles;
};

updateUsersWithAuthorityFlags();
