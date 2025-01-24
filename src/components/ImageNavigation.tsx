import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NavigationArrowProps {
  direction: 'left' | 'right';
  onClick: () => void;
  className?: string;
  isVisible?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-1/12',
  md: 'w-1/3',
  lg: 'w-1/2'
}

export const NavigationArrow = ({ direction, onClick, className = '', isVisible = true, size = 'md' }: NavigationArrowProps) => (
  <Button
    variant="ghost"
    size="icon"
    className={`absolute top-0 bottom-0 z-10 ${direction === 'left' ? 'left-0' : 'right-0'} 
      ${sizeClasses[size]} h-full flex items-center ${direction === 'left' ? 'justify-start pl-4' : 'justify-end pr-4'}
      ${isVisible ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity duration-300 hover:bg-transparent ${className}`}
    onClick={onClick}
  >
    <div className="bg-white/70 p-1 rounded-full hover:bg-white">
      {direction === 'left' ? (
        <ChevronLeft className="w-5 h-5" />
      ) : (
        <ChevronRight className="w-5 h-5" />
      )}
    </div>
  </Button>
);

interface NavigationDotsProps {
  total: number;
  current: number;
  onClick: (index: number) => void;
  className?: string;
}

export const NavigationDots = ({ total, current, onClick, className = '' }: NavigationDotsProps) => (
  <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 z-10 ${className}`}>
    {Array.from({ length: total }, (_, index) => (
      <button
        key={index}
        onClick={() => onClick(index)}
        className={`p-2 -m-2 flex items-center justify-center`}
      >
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            index === current 
              ? 'w-4 bg-white scale-110' 
              : 'bg-white/50 hover:bg-white/70'
          }`}
        />
      </button>
    ))}
  </div>
);

interface ImageNavigationProps {
  total: number;
  current: number;
  onNext: () => void;
  onPrev: () => void;
  onDotClick: (index: number) => void;
  arrowVisible?: boolean;
  arrowSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ImageNavigation = ({ 
  total, 
  current, 
  onNext, 
  onPrev, 
  onDotClick,
  className = '',
  arrowVisible = true,
  arrowSize = 'md'
}: ImageNavigationProps) => {
  if (total <= 1) return null;
  
  return (
    <div className={`group ${className} h-full`}>
      <NavigationArrow direction="left" onClick={onPrev} isVisible={arrowVisible} size={arrowSize} />
      <NavigationArrow direction="right" onClick={onNext} isVisible={arrowVisible} size={arrowSize} />
      <NavigationDots
        total={total}
        current={current}
        onClick={onDotClick}
      />
    </div>
  );
};

export default ImageNavigation;