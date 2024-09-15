import React from 'react';
import { BsArrowRepeat } from 'react-icons/bs';
import './Loading.css';

interface LoadingCircleProps {
    show: boolean;
  }
  
  const LoadingCircle: React.FC<LoadingCircleProps> = ({ show }) => {
    if (!show) {
      return null;
    }
    return (
        <>
            <div className="flex h-full align-center">
                <BsArrowRepeat className="h-full w-full" style={{ fontSize: '', animation: 'spin 1s linear infinite' }} />
            </div>
        </>
    );
};

export default LoadingCircle;