import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import './ImageEditor.css';

interface Flag {
  id: number;
  url: string;
  x: number;
  y: number;
}

interface ImageEditorProps {
  imageUrl: string | null;
  selectedFlag: string | null;
}

export interface ImageEditorHandle {
  handleSave: () => void;
}

const ImageEditor = forwardRef<ImageEditorHandle, ImageEditorProps>(({ imageUrl, selectedFlag }, ref) => {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [draggedFlag, setDraggedFlag] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Expose handleSave method to parent component
  useImperativeHandle(ref, () => ({
    handleSave: () => {
      handleSave();
    }
  }));
  
  // Draw the image on the canvas
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions to match the image aspect ratio
      const containerWidth = canvas.clientWidth;
      const containerHeight = canvas.clientHeight;
      
      // Set actual canvas dimensions for proper rendering
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate dimensions to maintain aspect ratio
      const imgAspect = img.width / img.height;
      const containerAspect = containerWidth / containerHeight;
      
      let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
      
      if (imgAspect > containerAspect) {
        // Image is wider than container
        drawWidth = containerWidth;
        drawHeight = containerWidth / imgAspect;
        offsetY = (containerHeight - drawHeight) / 2;
      } else {
        // Image is taller than container
        drawHeight = containerHeight;
        drawWidth = containerHeight * imgAspect;
        offsetX = (containerWidth - drawWidth) / 2;
      }
      
      // Draw image centered in the canvas
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };
    
    img.src = imageUrl;
  }, [imageUrl]);
  
  // Add a flag when selected
  useEffect(() => {
    if (selectedFlag && containerRef.current) {
      const container = containerRef.current;
      const newFlag: Flag = {
        id: Date.now(),
        url: selectedFlag,
        x: container.clientWidth / 2 - 30, // Center the flag
        y: container.clientHeight / 2 - 20,
      };
      
      setFlags(prev => [...prev, newFlag]);
    }
  }, [selectedFlag]);
  
  // Improved drag and drop functionality
  const handleMouseDown = (e: React.MouseEvent, flagId: number) => {
    e.stopPropagation(); // Stop event propagation
    
    // Get container bounds
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    // Find the flag being dragged
    const flag = flags.find(f => f.id === flagId);
    if (!flag) return;
    
    // Calculate the offset from the mouse position to the flag's top-left corner
    const offsetX = e.clientX - (containerRect.left + flag.x);
    const offsetY = e.clientY - (containerRect.top + flag.y);
    
    setDraggedFlag(flagId);
    setDragOffset({ x: offsetX, y: offsetY });
    
    // Add event listeners to document for smoother dragging
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (draggedFlag === null || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate new position relative to container
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    // Ensure flag stays within container bounds
    const boundedX = Math.max(0, Math.min(newX, containerRect.width - 60));
    const boundedY = Math.max(0, Math.min(newY, containerRect.height - 40));
    
    // Update the flag position
    setFlags(prev => prev.map(flag => 
      flag.id === draggedFlag 
        ? { ...flag, x: boundedX, y: boundedY } 
        : flag
    ));
  };
  
  const handleMouseUp = () => {
    setDraggedFlag(null);
    
    // Remove event listeners when done dragging
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Touch events for mobile devices
  const handleTouchStart = (e: React.TouchEvent, flagId: number) => {
    e.stopPropagation(); // Stop event propagation
    
    // Get container bounds
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect || !e.touches[0]) return;
    
    // Find the flag being dragged
    const flag = flags.find(f => f.id === flagId);
    if (!flag) return;
    
    const touch = e.touches[0];
    
    // Calculate the offset from the touch position to the flag's top-left corner
    const offsetX = touch.clientX - (containerRect.left + flag.x);
    const offsetY = touch.clientY - (containerRect.top + flag.y);
    
    setDraggedFlag(flagId);
    setDragOffset({ x: offsetX, y: offsetY });
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (draggedFlag === null || !containerRef.current || !e.touches[0]) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    
    // Calculate new position
    const newX = touch.clientX - containerRect.left - dragOffset.x;
    const newY = touch.clientY - containerRect.top - dragOffset.y;
    
    // Ensure flag stays within container bounds
    const boundedX = Math.max(0, Math.min(newX, containerRect.width - 60));
    const boundedY = Math.max(0, Math.min(newY, containerRect.height - 40));
    
    setFlags(prev => prev.map(flag => 
      flag.id === draggedFlag 
        ? { ...flag, x: boundedX, y: boundedY } 
        : flag
    ));
  };
  
  const handleTouchEnd = () => {
    setDraggedFlag(null);
    
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
  
  const handleSave = () => {
    if (!canvasRef.current || !imageUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create a new canvas for the final image
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) return;
    
    // Draw the original canvas content
    finalCtx.drawImage(canvas, 0, 0);
    
    // Draw all flags onto the canvas
    const drawFlagPromises = flags.map(flag => {
      return new Promise<void>((resolve) => {
        const flagImg = new Image();
        flagImg.onload = () => {
          finalCtx.drawImage(flagImg, flag.x, flag.y, 60, 40);
          resolve();
        };
        flagImg.src = flag.url;
      });
    });
    
    // When all flags are drawn, save the image
    Promise.all(drawFlagPromises).then(() => {
      // Convert canvas to data URL
      const dataUrl = finalCanvas.toDataURL('image/png');
      
      // Create a download link
      const link = document.createElement('a');
      link.download = 'flag-stamped-image.png';
      link.href = dataUrl;
      link.click();
    });
  };
  
  return (
    <div className="editor-container" ref={containerRef}>
      <canvas className="canvas" ref={canvasRef} />
      
      {flags.map(flag => (
        <div 
          key={flag.id}
          className={`flag-overlay ${draggedFlag === flag.id ? 'dragging' : ''}`}
          style={{ 
            left: `${flag.x}px`, 
            top: `${flag.y}px`,
            width: '60px',
            height: '40px'
          }}
          onMouseDown={(e) => handleMouseDown(e, flag.id)}
          onTouchStart={(e) => handleTouchStart(e, flag.id)}
        >
          <img src={flag.url} alt="Flag" />
        </div>
      ))}
    </div>
  );
});

export default ImageEditor; 