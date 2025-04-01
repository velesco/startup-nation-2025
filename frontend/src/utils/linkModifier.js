/**
 * Utility functions for modifying iframe and HTML links to open in new tabs
 */

/**
 * Adds target="_blank" attribute to all anchor tags in a string of HTML content
 * @param {string} htmlContent - The HTML content as a string
 * @returns {string} - Modified HTML content with target="_blank" attributes on all links
 */
export const addTargetBlankToLinks = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return htmlContent;
  }
  
  // Replace all anchor tags to include target="_blank" and rel="noopener noreferrer"
  return htmlContent.replace(/<a ([^>]*)>/gi, (match, attributes) => {
    // Skip if the link already has a target attribute
    if (attributes.includes('target=')) {
      return match;
    }
    return `<a ${attributes} target="_blank" rel="noopener noreferrer">`;
  });
};

/**
 * Modifies iframe tags to include sandbox attribute allowing popups
 * @param {string} htmlContent - The HTML content containing iframe tags
 * @returns {string} - Modified HTML content with sandboxed iframes
 */
export const sandboxIframes = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return htmlContent;
  }
  
  return htmlContent.replace(/<iframe ([^>]*)>/gi, (match, attributes) => {
    // Skip if iframe already has sandbox attributes
    if (attributes.includes('sandbox=')) {
      return match;
    }
    return `<iframe ${attributes} sandbox="allow-scripts allow-same-origin allow-popups" allow="fullscreen" referrerpolicy="no-referrer">`;
  });
};

/**
 * Creates a script that will modify all iframe links to open in new tabs
 * @returns {string} - Script HTML to inject into the page
 */
export const createIframeLinkModifierScript = () => {
  return `
    <script>
      (function() {
        // Function to set target="_blank" on all links in accessible iframes
        function setIframeLinksToBlank() {
          const iframes = document.querySelectorAll('iframe');
          
          iframes.forEach(iframe => {
            // First try: Set onload handler
            iframe.onload = function() {
              modifyIframeLinks(iframe);
            };
            
            // Second try: For already loaded iframes
            if (iframe.contentDocument) {
              modifyIframeLinks(iframe);
            }
          });
        }
        
        function modifyIframeLinks(iframe) {
          try {
            const iframeDoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
            
            if (iframeDoc) {
              const links = iframeDoc.querySelectorAll('a');
              links.forEach(link => {
                if (!link.getAttribute('target')) {
                  link.setAttribute('target', '_blank');
                  link.setAttribute('rel', 'noopener noreferrer');
                }
              });
              
              // Check for nested iframes
              const nestedIframes = iframeDoc.querySelectorAll('iframe');
              nestedIframes.forEach(nestedFrame => {
                nestedFrame.onload = function() {
                  modifyIframeLinks(nestedFrame);
                };
                
                if (nestedFrame.contentDocument) {
                  modifyIframeLinks(nestedFrame);
                }
              });
            }
          } catch(e) {
            console.log('Could not modify iframe links due to security restrictions', e);
          }
        }
        
        // Run on page load
        if (document.readyState === 'complete') {
          setIframeLinksToBlank();
        } else {
          document.addEventListener('DOMContentLoaded', setIframeLinksToBlank);
        }
        
        // Run again after a delay to catch dynamically loaded iframes
        setTimeout(setIframeLinksToBlank, 1000);
        setTimeout(setIframeLinksToBlank, 3000);
        
        // MutationObserver to detect when iframes are added to the DOM
        const observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
              mutation.addedNodes.forEach(node => {
                // Check if the added node is an iframe
                if (node.tagName === 'IFRAME') {
                  node.onload = function() {
                    modifyIframeLinks(node);
                  };
                }
                
                // Check if the added node contains iframes
                if (node.querySelectorAll) {
                  const iframes = node.querySelectorAll('iframe');
                  iframes.forEach(iframe => {
                    iframe.onload = function() {
                      modifyIframeLinks(iframe);
                    };
                  });
                }
              });
            }
          });
        });
        
        // Start observing the document with the configured parameters
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      })();
    </script>
  `;
};

/**
 * Combines multiple content modification functions for use with iframes and HTML
 * @param {string} content - The original HTML content
 * @returns {string} - Fully modified content with scripts and modifications
 */
export const processHtmlContent = (content) => {
  if (!content || typeof content !== 'string') {
    return content;
  }
  
  let processedContent = content;
  
  // Add target="_blank" to links
  processedContent = addTargetBlankToLinks(processedContent);
  
  // Sandbox iframes correctly
  processedContent = sandboxIframes(processedContent);
  
  // Add link modifier script for iframes
  if (processedContent.includes('<iframe')) {
    processedContent += createIframeLinkModifierScript();
  }
  
  return processedContent;
};