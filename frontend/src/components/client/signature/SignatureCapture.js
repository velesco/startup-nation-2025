import React, { useRef, useState, useEffect } from 'react';
import { Trash2, Download, Save, Check, AlertCircle } from 'lucide-react';

/**
 * Component for capturing signature with canvas
 * @param {Object} props
 * @param {Function} props.onSave - Function to call with signature data when saved
 * @param {Function} props.onCancel - Function to call when capture is cancelled
 * @param {Boolean} props.required - If true, the signature is required before proceeding
 * @param {Boolean} props.clearAfterSave - If true, the signature pad will be cleared after saving
 */
const SignatureCapture = ({ onSave, onCancel, required = true, clearAfterSave = false }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [error, setError] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 200 });

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size based on container width
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const newWidth = Math.min(600, container.clientWidth - 40); // 20px padding on each side
        setCanvasSize({ width: newWidth, height: 200 });
      }
    };

    // Initial size update
    updateCanvasSize();

    // Listen for window resize
    window.addEventListener('resize', updateCanvasSize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Set canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Set canvas styling
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw signature line 
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 40);
    ctx.lineTo(canvas.width - 20, canvas.height - 40);
    ctx.strokeStyle = '#cccccc';
    ctx.stroke();
    
    // Reset to black for the signature
    ctx.strokeStyle = '#000000';
  }, [canvasSize]);

  // Handle mouse/touch down
  const startDrawing = (e) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    setError('');
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();

    // Get mouse/touch position
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0)) - rect.top;
    
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  // Handle mouse/touch move
  const draw = (e) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Get mouse/touch position
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0)) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  // Handle mouse/touch up or out
  const stopDrawing = (e) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  // Clear the canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw the signature line
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 40);
    ctx.lineTo(canvas.width - 20, canvas.height - 40);
    ctx.strokeStyle = '#cccccc';
    ctx.stroke();
    
    // Reset to black for the signature
    ctx.strokeStyle = '#000000';
    
    setHasSignature(false);
  };

  // Save the signature
  const saveSignature = () => {
    if (required && !hasSignature) {
      setError('Vă rugăm să adăugați semnătura înainte de a continua.');
      return;
    }

    // Get canvas data as base64 image
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert to base64 PNG
    const signatureData = canvas.toDataURL('image/png');
    
    // Call onSave with the signature data
    if (onSave && typeof onSave === 'function') {
      onSave(signatureData);
      
      // Clear after saving if required
      if (clearAfterSave) {
        clearCanvas();
      }
    }
  };

  // Handle component cancel
  const handleCancel = () => {
    if (onCancel && typeof onCancel === 'function') {
      onCancel();
    }
  };

  return (
    <div className="w-full">
      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mb-3 flex justify-between items-center">
        <h3 className="font-medium text-gray-700">Semnătura olografă</h3>
        
        <button
          type="button"
          onClick={clearCanvas}
          className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          <span>Șterge</span>
        </button>
      </div>

      {/* Signature canvas with border - added position relative and overflow hidden for Android fix */}
      <div className="border-2 border-gray-300 bg-white rounded-lg mb-4 p-4 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full touch-none cursor-crosshair"
          style={{ touchAction: 'none' }} /* Required CSS property to fix Android issues */
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Semnați în spațiul de mai sus folosind mouse-ul sau, dacă sunteți pe un dispozitiv mobil, cu degetul. Semnătura va fi inclusă în contract. Țineți dispozitivul în poziție fixă pentru a semna mai ușor.
      </p>

      <div className="flex space-x-3 justify-end">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Anulează
        </button>

        <button
          type="button"
          onClick={saveSignature}
          disabled={required && !hasSignature}
          className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium flex items-center ${
            hasSignature 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Check className="h-4 w-4 mr-2" />
          <span>Salvează semnătura</span>
        </button>
      </div>
    </div>
  );
};

export default SignatureCapture;