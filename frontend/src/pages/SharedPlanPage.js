import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/common/Footer';
import { processHtmlContent } from '../utils/linkModifier';

const SharedPlanPage = () => {
  const { type, id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentContainerRef = useRef(null);

  useEffect(() => {
    const fetchSharedPlan = async () => {
      try {
        setLoading(true);
        // Determine the API endpoint based on the plan type
        const endpoint = type === 'premium-plan' 
          ? `https://startup.area4u.ro/api/plan/${id}`
          : `https://startup.area4u.ro/api/plan/${id}`;
        
        const response = await axios.get(endpoint);
        // Make sure to handle different response formats
        if (response.data && typeof response.data === 'object') {
          // If it's an object with content property
          if (response.data.content) {
            setPlan(response.data);
          } else {
            // If it's an object but doesn't have content property
            setPlan({
              name: type === 'premium-plan' ? 'Plan de afaceri premium' : 'Plan de afaceri',
              content: JSON.stringify(response.data)
            });
          }
        } else if (response.data) {
          // Handle case where API returns the content directly as string
          setPlan({
            name: type === 'premium-plan' ? 'Plan de afaceri premium' : 'Plan de afaceri',
            content: response.data
          });
        } else {
          throw new Error('Răspunsul API-ului nu conține date valide.');
        }
      } catch (error) {
        console.error('Error fetching shared plan:', error);
        setError('Planul de afaceri nu a putut fi încărcat sau nu există.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPlan();
  }, [type, id]);

  useEffect(() => {
    // Function to optimize iframe content if present
    const optimizeContent = () => {
      if (!loading && plan && contentContainerRef.current) {
        const container = contentContainerRef.current;
        
        // Handle iframe if present
        const iframe = container.querySelector('iframe');
        if (iframe) {
          // Style the iframe
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.position = 'absolute';
          iframe.style.top = '0';
          iframe.style.left = '0';
          iframe.style.border = 'none';
          
          // Add event listener for when iframe loads to modify its links
          iframe.onload = () => {
            try {
              const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
              
              // Find all links in the iframe
              const links = iframeDocument.querySelectorAll('a');
              
              // Modify each link to open in a new tab
              links.forEach(link => {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                
                // Add click event to force open in new tab
                link.addEventListener('click', function(e) {
                  e.preventDefault();
                  window.open(this.href, '_blank');
                });
              });
              
              console.log(`Modified ${links.length} links to open in new tabs`);
              
              // Also handle buttons that might act as links
              const buttons = iframeDocument.querySelectorAll('button');
              buttons.forEach(button => {
                if (button.onclick) {
                  const originalOnClick = button.onclick;
                  button.onclick = function(e) {
                    e.preventDefault();
                    originalOnClick.call(this, e);
                    return false;
                  };
                }
              });
              
              // Handle form submissions
              const forms = iframeDocument.querySelectorAll('form');
              forms.forEach(form => {
                form.setAttribute('target', '_blank');
              });
              
            } catch (e) {
              // Handle cross-origin errors
              console.error('Could not modify iframe links due to cross-origin restrictions', e);
            }
          };
          
          // Force reload iframe to apply changes
          if (iframe.src) {
            const currentSrc = iframe.src;
            setTimeout(() => {
              iframe.src = currentSrc;
            }, 100);
          }
        }
      }
    };

    // Apply optimizations when content changes
    if (!loading && plan) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(optimizeContent, 200);
    }

    // Add resize event listener
    window.addEventListener('resize', optimizeContent);
    
    return () => {
      window.removeEventListener('resize', optimizeContent);
    };
  }, [loading, plan]);

  // Function to determine if content is an iframe or HTML content
  const isIframeContent = (str) => {
    return str && typeof str === 'string' && (str.includes('<iframe') || str.includes('<html') || str.includes('<!DOCTYPE') || str.includes('<head'));
  };

  // Function to modify iframe content to allow links to open in new tab
  const modifyIframeContent = (content) => {
    return processHtmlContent(content);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation Bar */}
      <Navbar />
      
      <div className="container mx-auto px-6 py-16 mt-24">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl text-red-600 font-bold mb-4">Eroare</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <Link 
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm inline-block"
            >
              Înapoi la pagina principală
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6">
              <h1 className="text-2xl font-bold">{plan.name || (type === 'premium-plan' ? 'Plan de afaceri premium' : 'Plan de afaceri')}</h1>
              <p className="mt-2">Plan de afaceri {type === 'premium-plan' ? 'premium' : 'standard'}</p>
            </div>
            
            {/* Share Buttons */}
            <div className="bg-gray-100 p-4 border-b flex items-center justify-between">
              <p className="text-sm text-gray-600">Distribuie acest plan:</p>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    const shareUrl = window.location.href;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Planul de afaceri: ${plan.name} ${shareUrl}`)}`, '_blank');
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  
                </button>
                <button 
                  onClick={() => {
                    const shareUrl = window.location.href;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  
                </button>
              </div>
            </div>
            
            {/* Content Area */}
            <div 
              className={`relative ${isIframeContent(plan.content) ? 'h-screen md:h-[80vh]' : 'min-h-[50vh] p-8'}`}
            >
              <div 
                ref={contentContainerRef} 
                dangerouslySetInnerHTML={{ __html: modifyIframeContent(plan.content) }} 
                className={`w-full h-full relative ${!isIframeContent(plan.content) ? 'prose prose-lg max-w-none' : ''}`}
              />
            </div>
            
            {/* Call to Action */}
            <div className="p-6 bg-gray-50 border-t">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Vrei să-ți dezvolți propria afacere?</h3>
                <p className="text-gray-700 mb-6">
                  Înscrie-te în programul Startup Nation 2025 și obține finanțare pentru ideea ta de afacere.
                </p>
                <Link 
                  to="/#apply-section"
                  className="bg-gradient-orange-pink animate-pulse-attention text-white px-6 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Înscrie-te acum
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default SharedPlanPage;