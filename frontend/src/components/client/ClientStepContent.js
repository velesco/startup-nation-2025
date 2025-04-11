import React, { useEffect } from 'react';
import { Camera, Calendar, CheckCircle, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ClientIDUploadStep from './steps/ClientIDUploadStep';
import ClientCourseSelectStep from './steps/ClientCourseSelectStep';
import ClientAppDownloadStep from './steps/ClientAppDownloadStep';
import ClientContractStep from './steps/ClientContractStep';
import ClientConsultingContractStep from './steps/ClientConsultingContractStep';

const ClientStepContent = ({ step, updateUserData, userDocuments }) => {
  // Funcție pentru gestionarea completării unui pas
  const handleStepComplete = async (stepType, updatedDocs) => {
    console.log(`Pas completat: ${stepType}`);
    
    // Actualizare date utilizator în funcție de pasul completat
    if (updateUserData && typeof updateUserData === 'function') {
      try {
        console.log(`Se actualizează datele utilizatorului pentru pasul: ${stepType}`);
        console.log('Date utilizator înainte de actualizare:', userDocuments);
        
        let docsToUpdate = updatedDocs || {};
        let forceNextStep = null;
        
        if (!updatedDocs) {
          // Dacă nu avem documente actualizate, construim în funcție de tipul pasului
          switch (stepType) {
            case 'id_card':
              docsToUpdate = { 
                ...userDocuments, 
                id_cardUploaded: true 
              };
              forceNextStep = 2;
              break;
            case 'course_select':
              docsToUpdate = { 
                ...userDocuments, 
                courseSelected: true 
              };
              break;
            case 'app_download':
              docsToUpdate = { 
                ...userDocuments, 
                appDownloaded: true 
              };
              break;
            case 'contract_generate':
              docsToUpdate = { 
                ...userDocuments, 
                contractGenerated: true 
              };
              break;
            case 'contract_sign':
              docsToUpdate = { 
                ...userDocuments, 
                contractGenerated: true, 
                contractSigned: true 
              };
              forceNextStep = 3;
              break;
            case 'contract_complete':
              docsToUpdate = { 
                ...userDocuments, 
                contractComplete: true,
                contractGenerated: true, 
                contractSigned: true
              };
              forceNextStep = 3; // Forțăm trecerea la pasul de contract consultanță
              break;
            case 'consulting_contract_generate':
              docsToUpdate = { 
                ...userDocuments, 
                consultingContractGenerated: true,
                contractSigned: true, // Marcăm automat și contractul de participare ca semnat
                contractGenerated: true
              };
              break;
            case 'consulting_contract_sign':
              docsToUpdate = { 
                ...userDocuments, 
                consultingContractGenerated: true, 
                consultingContractSigned: true,
                contractSigned: true, // Marcăm automat și contractul de participare ca semnat
                contractGenerated: true 
              };
              forceNextStep = 4;
              break;
            case 'consulting_contract_complete':
              docsToUpdate = { 
                ...userDocuments, 
                consultingContractComplete: true,
                consultingContractGenerated: true,
                consultingContractSigned: true,
                contractSigned: true, // Marcăm automat și contractul de participare ca semnat
                contractGenerated: true,
                contractComplete: true
              };
              forceNextStep = 4; // Forțăm trecerea la pasul următor după consultanță
              break;
            case 'consulting_contract_reset':
              docsToUpdate = { ...userDocuments, consultingContractGenerated: false, consultingContractSigned: false };
              break;
            default:
              console.warn(`Tip de pas necunoscut: ${stepType}`);
              break;
          }
        }
        
        console.log('Documente actualizate:', docsToUpdate);
        
        // Asigură-te că toate flag-urile necesare sunt setate pentru pașii anteriori
        if (step >= 2 && !docsToUpdate.id_cardUploaded) {
          console.log('Se forțează setarea flag-ului id_cardUploaded pentru a asigura integritatea datelor');
          docsToUpdate.id_cardUploaded = true;
        }
        
        if (step >= 3 && !docsToUpdate.contractSigned) {
          console.log('Se forțează setarea flag-urilor contractGenerated și contractSigned pentru a asigura integritatea datelor');
          docsToUpdate.contractGenerated = true;
          docsToUpdate.contractSigned = true;
        }
        
        // Dacă avem un pas forțat, îl includem în actualizare
        if (forceNextStep !== null) {
          console.log(`Forțăm trecerea la pasul: ${forceNextStep}`);
          console.log('Datele trimise pentru actualizare:', { documents: docsToUpdate, nextStep: forceNextStep });
          const result = await updateUserData({ documents: docsToUpdate, nextStep: forceNextStep });
          console.log('Rezultat actualizare cu pas forțat:', result);
          
          // Notificăm că pasul a fost actualizat cu succes
          console.log(`Pas actualizat cu succes la: ${forceNextStep}`);
        } else {
          console.log('Datele trimise pentru actualizare (fără pas forțat):', { documents: docsToUpdate });
          const result = await updateUserData({ documents: docsToUpdate });
          console.log('Rezultat actualizare normală:', result);
        }
        console.log('Actualizare date utilizator reușită!');
      } catch (error) {
        console.error('Eroare la actualizarea datelor utilizatorului:', error);
      }
    } else {
      console.error('Funcția updateUserData nu este disponibilă sau nu este o funcție validă!');
    }
  };

  // Log pentru debugging
  useEffect(() => {
    console.log('=== ClientStepContent ===');
    console.log('Step curent:', step);
    console.log('User Documents:', userDocuments);
    console.log('UpdateUserData func:', !!updateUserData);

    // Dacă suntem pe pasul Contract Consultanță dar Contract Participare nu e marcat ca finalizat
    if (step === 3 && userDocuments && !userDocuments.contractSigned) {
      console.log('Corecție automată: Suntem pe pasul Contract Consultanță dar Contract Curs Antreprenoriat nu e marcat ca semnat');
      // Marcăm automat contractul de participare ca fiind semnat
      handleStepComplete('contract_sign', {
        ...userDocuments,
        contractGenerated: true,
        contractSigned: true
      });
      console.log('Corecție aplicată: Contract Curs Antreprenoriat marcat ca semnat');
    }
    
    // Verificăm dacă utilizatorul ajunge la pasul 3 (contract consultanță) și nu are contractul de consultanță marcat ca generat
    if (step === 3 && userDocuments && !userDocuments.consultingContractGenerated && userDocuments.contractSigned) {
      console.log('Pasul 3 (Contract Consultanță) este activ și utilizatorul are dreptul să genereze contractul de consultanță');
    }
  }, [step, userDocuments, updateUserData]);

  switch (step) {
    case 1:
      return <ClientIDUploadStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
    case 2:
      return <ClientContractStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
    case 3:
      return <ClientConsultingContractStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
    case 4:
      return <ClientConsultingContractStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
      // return <ClientAppDownloadStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
    default:
      return <ClientIDUploadStep onStepComplete={handleStepComplete} userDocuments={userDocuments} />;
  }
};

export default ClientStepContent;