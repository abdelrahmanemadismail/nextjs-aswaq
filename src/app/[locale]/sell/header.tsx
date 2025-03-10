import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between py-3 px-4 border-b">
      <button className="flex items-center text-foreground">
        <X className="h-6 w-6 mr-2" />
        <span className="text-base font-medium">Leave</span>
      </button>
      
      <div className="flex-1 flex justify-center">
        <Image
          src="/logo.svg"
          alt="ASWAQ Online"
          width={140}
          height={40}
          className="h-12 w-auto"
          priority
        />
      </div>
      
      {/* Empty div to balance the layout */}
      <div className="w-20"></div>
    </header>
  );
}