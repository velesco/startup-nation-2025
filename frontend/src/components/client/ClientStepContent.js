import React, { useEffect } from 'react';
import { Camera, Calendar, CheckCircle, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ClientIDUploadStep from './steps/ClientIDUploadStep';
import ClientCourseSelectStep from './steps/ClientCourseSelectStep';
import ClientAppDownloadStep from './steps/ClientAppDownloadStep';
import ClientContractStep from './steps/ClientContractStep';

const ClientStepContent = ({ step, updateUserData, userDocuments }) => {
  // Log pentru debugging
  useEffect(() => {
    console.log('=== ClientStepContent ===');
    console.log('Step curent:', step);
    console.log('User Documents:', userDocuments);
    console.log('UpdateUserData func:', !!updateUserData);
  }, [step, userDocuments, updateUserData]);

  // Funcție pentru gestionarea completării unui pas
  const handleStepComplete = async (stepType, updatedDocs) => {
    console.log(`Pas completat: ${stepType}`);
    
    // Actualizare date utilizator în funcție de pasul completat
    if (updateUserData && typeof updateUserData === 'function') {
      try {
        console.log(`Se actualizează datele utilizatorului pentru pasul: ${stepType}`);
        console.log('Date utilizator înainte de actualizare:', userDocuments);
        
        let docsToUpdate = updatedDocs || {};
        
        if (!updatedDocs) {
          // Dacă nu avem documente actualizate, construim în funcție de tipul pasului
          switch (stepType) {
            case 'id_card':
              docsToUpdate = { ...userDocuments, id_cardUploaded: true };
              break;
            case 'course_select':
              docsToUpdate = { ...userDocuments, courseSelected: true };
              break;
            case 'app_download':
              docsToUpdate = { ...userDocuments, appDownloaded: true };
              break;
            case 'contract_generate':
              docsToUpdate = { ...userDocuments, contractGenerated: true };
              break;
            case 'contract_sign':
              docsToUpdate = { ...userDocuments, contractGenerated: true, contractSigned: true };
              break;
            case 'contract_complete':
              docsToUpdate = { ...userDocuments, contractComplete: true };
              break;
            default:
              console.warn(`Tip de pas necunoscut: ${stepType}`);
              break;
          }
        }
        
        console.log('Documente actualizate:', docsToUpdate);
        await updateUserData({ documents: docsToUpdate });
        console.log('Actualizare date utilizator reușită!');
      } catch (error) {
        console.error('Eroare la actualizarea datelor utilizatorului:', error);
      }
    } else {
      console.error('Funcția updateUserData nu este disponibilă sau nu este o funcție validă!');
    }
  };

  switch (step) {
    case 1:
      return <ClientIDUploadStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
    case 2:
      return <ClientContractStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
    case 3:
      return <ClientCourseSelectStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
    case 4:
      return <ClientAppDownloadStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
    default:
      return <ClientIDUploadStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
  }
};

export default ClientStepContent;