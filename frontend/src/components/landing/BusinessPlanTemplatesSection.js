import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// PDF Modal component with support for both iframe and HTML content
const ContentModal = ({ open, handleClose, content }) => {
  const contentContainerRef = useRef(null);
  
  useEffect(() => {
    // Function to resize iframe to fill container if present
    const optimizeContent = () => {
      if (open && contentContainerRef.current) {
        const container = contentContainerRef.current;
        
        // Handle iframe if present
        const iframe = container.querySelector('iframe');
        if (iframe) {
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.position = 'absolute';
          iframe.style.top = '0';
          iframe.style.left = '0';
          iframe.style.border = 'none';
        }
        
        // Add scrolling to container for HTML content without iframe
        if (!iframe && container.innerHTML) {
          container.style.overflowY = 'auto';
          container.style.padding = '2rem';
        }
      }
    };

    // Apply optimizations when content changes or modal opens
    if (open && content) {
      // Use setTimeout to ensure DOM is updated with the new content
      setTimeout(optimizeContent, 100);
    }

    // Add resize event listener
    window.addEventListener('resize', optimizeContent);
    
    // Disable body scroll when modal is open
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      window.removeEventListener('resize', optimizeContent);
      document.body.style.overflow = '';
    };
  }, [open, content]);

  if (!open) return null;
  
  // Function to determine if content is an iframe
  const isIframeContent = (str) => {
    return str && typeof str === 'string' && str.includes('<iframe');
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ marginTop: '0', paddingTop: '80px' }}>
      <div className="relative w-full max-w-5xl h-[80vh] bg-white rounded-xl overflow-hidden shadow-2xl">
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 z-50 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Render the content differently based on whether it's an iframe or HTML */}
        <div 
          ref={contentContainerRef} 
          dangerouslySetInnerHTML={{ __html: content }} 
          className={`w-full h-full relative ${!isIframeContent(content) ? 'overflow-y-auto p-8' : ''}`}
        />
      </div>
    </div>
  );
};

const BusinessPlanTemplatesSection = () => {
  const [businessPlans, setBusinessPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    const fetchBusinessPlans = async () => {
      try {
        setLoading(true);
        // Fetch data from the API
        const response = await axios.get('https://startup.area4u.ro/api/projects');
        
        // Transform the API data to match the component's expected format
        const formattedPlans = response.data.map(project => ({
          id: project.id,
          pdf: project.pdf,
          title: project.name,
          imageUrl: `https://startup.area4u.ro/storage/images/${project.image}`,
          content: project.content // This is the HTML or iframe content
        }));
        
        setBusinessPlans(formattedPlans);
      } catch (error) {
        console.error('Error fetching business plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessPlans();
  }, []);

  // Open content modal
  const handleOpenContent = (content) => {
    setSelectedContent(content);
    setOpenModal(true);
  };

  // Close content modal
  const handleCloseModal = () => {
    setOpenModal(false);
    // Delay clearing the content to prevent visual flicker during close animation
    setTimeout(() => {
      setSelectedContent(null);
    }, 200);
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gradient-gray text-center mb-2">
          Modele de planuri de afaceri
        </h2>
        <p className="text-gray-600 text-center mb-12">
          Descarcă și consultă modele de planuri de afaceri pentru diverse domenii de activitate.
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businessPlans.map((plan) => (
              <div 
                key={plan.id} 
                className="glassmorphism-darker rounded-xl overflow-hidden shadow-md hover-scale cursor-pointer"
                onClick={() => handleOpenContent(plan.content)}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={plan.imageUrl} 
                    alt={plan.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span 
                      className="text-blue-600 text-sm flex items-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenContent(plan.content);
                      }}
                    >
                      Vizualizează
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <a 
                      href={`https://startup.area4u.ro/storage/pdfs/${plan.pdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-red"
                      download
                      onClick={(e) => e.stopPropagation()}
                    >
                      Descarca
                    </a>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const shareUrl = `https://aplica-startup.ro/share/plan/${plan.id}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Planul de afaceri: ${plan.title} ${shareUrl}`)}`, '_blank');
                      }}
                      className="btn btn-sm btn-green"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const shareUrl = `https://aplica-startup.ro/share/plan/${plan.id}`;
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
                      }}
                      className="btn btn-sm btn-blue"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Viewer Modal */}
      <ContentModal 
        open={openModal} 
        handleClose={handleCloseModal} 
        content={selectedContent} 
      />
    </div>
  );
};

export default BusinessPlanTemplatesSection;