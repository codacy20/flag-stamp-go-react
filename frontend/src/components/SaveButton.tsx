import styled from 'styled-components';

const SaveButtonContainer = styled.div`
  margin-top: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Button = styled.button`
  background-color: #1a1f36;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #2d3456;
  }
`;

interface SaveButtonProps {
  onSave: () => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onSave }) => {
  return (
    <SaveButtonContainer>
      <Button onClick={onSave}>
        Save Image
      </Button>
    </SaveButtonContainer>
  );
};

export default SaveButton; 