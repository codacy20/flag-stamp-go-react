import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DndContext, useDraggable, DragEndEvent, DragStartEvent, DragMoveEvent, useDroppable } from '@dnd-kit/core';
import './ImageEditor.css';

interface FlagElement {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl: string | null;
}

interface ImageEditorProps {
  imageUrl: string | null;
  selectedFlag: string | null;
}

export interface ImageEditorHandle {
  handleSave: () => void;
}

// Draggable Flag component
const DraggableFlag = ({ flag }: { flag: FlagElement }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `flag-${flag.id}`,
  });
  
  const style = transform ? {
    left: `${flag.x}px`,
    top: `${flag.y}px`,
    width: `${flag.width}px`,
    height: `${flag.height}px`,
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : {
    left: `${flag.x}px`,
    top: `${flag.y}px`,
    width: `${flag.width}px`,
    height: `${flag.height}px`,
  };

  return (
    <div
      ref={setNodeRef}
      className="draggable-flag"
      style={style}
      {...listeners}
      {...attributes}
    >
      {flag.imageUrl && (
        <img 
          src={flag.imageUrl} 
          alt="Flag" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      )}
    </div>
  );
};

// Droppable Canvas Area
const DroppableCanvas = ({ children, onDrop }: { 
  children: React.ReactNode, 
  onDrop: (id: string) => void 
}) => {
  const { setNodeRef } = useDroppable({
    id: 'canvas-drop-area',
  });

  return (
    <div ref={setNodeRef} className="canvas-drop-area">
      {children}
    </div>
  );
};

const ImageEditor = forwardRef<ImageEditorHandle, ImageEditorProps>(({ imageUrl, selectedFlag }, ref) => {
  const [flag, setFlag] = useState<FlagElement>({
    id: 1,
    x: 50,
    y: 50,
    width: 100,
    height: 60,
    imageUrl: null
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Update flag image when selectedFlag changes
  useEffect(() => {
    if (selectedFlag) {
      setFlag(prev => ({
        ...prev,
        imageUrl: selectedFlag
      }));
    }
  }, [selectedFlag]);
  
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
  
  // Handle drag events
  const handleDragStart = (event: DragStartEvent) => {
    // Add any logic needed when drag starts
    console.log('Drag started:', event);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    // Optional: Add any logic needed during drag
    console.log('Drag move:', event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('Drag ended:', event);
    const { delta } = event;
    
    // Update the flag position based on the delta
    setFlag(prev => ({
      ...prev,
      x: prev.x + delta.x,
      y: prev.y + delta.y
    }));
  };
  
  const handleCanvasDrop = (id: string) => {
    console.log('Flag dropped on canvas:', id);
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
    
    // Draw the flag onto the canvas if it exists
    if (flag.imageUrl) {
      const flagImg = new Image();
      flagImg.onload = () => {
        finalCtx.drawImage(flagImg, flag.x, flag.y, flag.width, flag.height);
        
        // Add a border around the flag
        finalCtx.strokeStyle = '#2980b9';
        finalCtx.lineWidth = 2;
        finalCtx.strokeRect(flag.x, flag.y, flag.width, flag.height);
        
        // Convert canvas to data URL
        const dataUrl = finalCanvas.toDataURL('image/png');
        
        // Create a download link
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = dataUrl;
        link.click();
      };
      flagImg.src = flag.imageUrl;
    } else {
      // If no flag, just save the image as is
      const dataUrl = finalCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'edited-image.png';
      link.href = dataUrl;
      link.click();
    }
  };
  
  return (
    <div className="editor-container" ref={containerRef}>
      <DroppableCanvas onDrop={handleCanvasDrop}>
        <canvas className="canvas" ref={canvasRef} />
        
        <DndContext
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          {flag.imageUrl && <DraggableFlag flag={flag} />}
        </DndContext>
      </DroppableCanvas>
    </div>
  );
});

export default ImageEditor; 