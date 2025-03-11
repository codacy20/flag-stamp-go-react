import { useState, useRef } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import './App.css'
import FlagSelector from './components/FlagSelector'
import ImageEditor, { ImageEditorHandle } from './components/ImageEditor'

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const editorRef = useRef<ImageEditorHandle>(null);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFlagSelect = (flagUrl: string) => {
    setSelectedFlag(flagUrl);
  };
  
  const handleSaveImage = () => {
    if (editorRef.current) {
      editorRef.current.handleSave();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Check if a flag was dragged over the editor area
    if (active && active.id.toString().startsWith('flag-item-') && over) {
      // Extract the flag data from the drag event
      const flagData = active.data.current?.flag;
      if (flagData && flagData.url) {
        // Set the selected flag
        setSelectedFlag(flagData.url);
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="container">
        <h1 className="title">Flag Stamp</h1>
        <div className="card">
          {selectedImage ? (
            <ImageEditor 
              imageUrl={selectedImage} 
              selectedFlag={selectedFlag}
              ref={editorRef}
            />
          ) : (
            <div className="empty-state">
              Upload an image to get started
            </div>
          )}
          
          <div className="thumbnail-container">
            <div className="thumbnail">
              <img src="https://placehold.co/120x80/e2e3e7/1a1f36" alt="Thumbnail 1" />
            </div>
            <div className="thumbnail">
              <img src="https://placehold.co/120x80/e2e3e7/1a1f36" alt="Thumbnail 2" />
            </div>
            <div className="thumbnail">
              <img src="https://placehold.co/120x80/e2e3e7/1a1f36" alt="Thumbnail 3" />
            </div>
          </div>
          
          <div className="category-row">
            <div className="category">People</div>
            <div className="count">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              144
            </div>
          </div>
          
          {selectedImage && (
            <>
              <div className="divider"></div>
              <FlagSelector onSelectFlag={handleFlagSelect} />
            </>
          )}
        </div>
        
        <div className="button-container">
          <label htmlFor="upload-input">
            <div className="button">
              {selectedImage ? 'Change Image' : 'Upload Image'}
            </div>
          </label>
          <input
            id="upload-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
        
        {selectedImage && (
          <div className="button-container">
            <button className="button" onClick={handleSaveImage}>
              Save Image
            </button>
          </div>
        )}
        
        <footer className="footer">
          © {new Date().getFullYear()} Flag Stamp - Add country flags to your images
        </footer>
      </div>
    </DndContext>
  )
}

export default App
