import React, { useEffect } from 'react';
import { Camera, Calendar, CheckCircle, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ClientIDUploadStep from './steps/ClientIDUploadStep';
import ClientCourseSelectStep from './steps/ClientCourseSelectStep';
import ClientAppDownloadStep from './steps/ClientAppDownloadStep';

const ClientStepContent = ({ step, updateUserData, userDocuments }) => {
  // Log pentru debugging
  useEffect(() => {
    console.log('=== ClientStepContent ===');
    console.log('Step curent:', step);
    console.log('User Documents:', userDocuments);
    console.log('UpdateUserData func:', !!updateUserData);
  }, [step, userDocuments, updateUserData]);

  // Funcție pentru gestionarea completării unui pas
  const handleStepComplete = async (stepType) => {
    console.log(`Pas completat: ${stepType}`);
    
    // Actualizare date utilizator în funcție de pasul completat
    if (updateUserData && typeof updateUserData === 'function') {
      try {
        console.log(`Se actualizează datele utilizatorului pentru pasul: ${stepType}`);
        console.log('Date utilizator înainte de actualizare:', userDocuments);
        
        let updatedDocs = {};
        
        switch (stepType) {
          case 'id_card':
            updatedDocs = { ...userDocuments, id_cardUploaded: true };
            console.log('Documente actualizate (ID Card):', updatedDocs);
            await updateUserData({ documents: updatedDocs });
            break;
          case 'course_select':
            updatedDocs = { ...userDocuments, courseSelected: true };
            console.log('Documente actualizate (Curs):', updatedDocs);
            await updateUserData({ documents: updatedDocs });
            break;
          case 'app_download':
            updatedDocs = { ...userDocuments, appDownloaded: true };
            console.log('Documente actualizate (App):', updatedDocs);
            await updateUserData({ documents: updatedDocs });
            break;
          default:
            console.warn(`Tip de pas necunoscut: ${stepType}`);
            break;
        }
        
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
      return <ClientCourseSelectStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
    case 3:
      return <ClientAppDownloadStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
    default:
      return <ClientIDUploadStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
  }
};

export default ClientStepContent;