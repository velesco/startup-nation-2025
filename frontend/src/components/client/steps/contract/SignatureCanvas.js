import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RefreshCw, Download } from 'lucide-react';

const SignatureCanvas = ({ onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [ctx, setCtx] = useState(null);

  // Inițializare canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas to be 2x size for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 2;
    context.strokeStyle = '#000000';
    
    setCtx(context);
    
    // Clear canvas
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    return () => {
      // Cleanup
    };
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      ctx.closePath();
      setIsDrawing(false);
    }
  };

  // Handle touch events
  const handleTouchStart = (e) => {
    e.preventDefault(); // Prevent scrolling
    if (!e.touches || !e.touches[0]) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scrolling
    if (!isDrawing || !e.touches || !e.touches[0]) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault(); // Prevent scrolling
    if (isDrawing) {
      ctx.closePath();
      setIsDrawing(false);
    }
  };
  
  // Add touch cancel handler
  const handleTouchCancel = (e) => {
    e.preventDefault();
    if (isDrawing) {
      ctx.closePath();
      setIsDrawing(false);
    }
  };

  // Clear signature
  const clearSignature = () => {
    const canvas = canvasRef.current;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Save signature
  const saveSignature = () => {
    if (!hasSignature) return;
    
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md border rounded-lg border-gray-300 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-40 cursor-crosshair touch-none"
          style={{ touchAction: 'none' }} /* Required CSS property to fix Android issues */
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        ></canvas>
        
        {/* Placeholder text */}
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400">
            Semnează aici...
          </div>
        )}
      </div>
      
      <div className="flex mt-4 space-x-4 w-full max-w-md justify-between">
        <button 
          onClick={clearSignature}
          className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Resetează
        </button>
        
        <div className="flex space-x-2">
          <button 
            onClick={onCancel}
            className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
          >
            <X className="w-4 h-4 mr-2" />
            Anulează
          </button>
          
          <button 
            onClick={saveSignature}
            disabled={!hasSignature}
            className={`flex items-center px-4 py-2 text-sm rounded-md text-white ${
              hasSignature 
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-300 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4 mr-2" />
            Salvează
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureCanvas;