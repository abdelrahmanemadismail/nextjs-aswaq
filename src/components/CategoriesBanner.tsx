"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import clsx from "clsx";
import { useTranslation } from "@/hooks/use-translation";
import { Languages } from "@/constants/enums";

interface Category {
  id: string | number;
  name: string;
  slug: string;
  hero_image?: string | null;
  name_ar?: string | null;
}

interface CategoriesBannerProps {
  categories: Category[];
  selectedCategoryId?: string | number;
  onCategorySelect?: (categoryId: string | number) => void;
  className?: string;
  showScrollHint?: boolean;
}

// Constants
const CARD_GAP = 16; // gap-4 = 1rem = 16px
const DEFAULT_CARD_WIDTH = 152; // 120 + 2*16 padding
const SCROLL_THRESHOLD = 1; // Threshold for scroll detection
const BASE_PADDING = 40; // Base padding for the container
const EDGE_OFFSET = 20; // Small offset from the container edges

// Custom hook for scroll detection
const useScrollDetection = (ref: React.RefObject<HTMLDivElement | null>) => {
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: true,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateScrollState = () => {
      const { scrollLeft, clientWidth, scrollWidth } = element;
      setScrollState({
        canScrollLeft: scrollLeft > SCROLL_THRESHOLD,
        canScrollRight: scrollLeft + clientWidth < scrollWidth - SCROLL_THRESHOLD,
      });
    };

    const handleScroll = () => {
      requestAnimationFrame(updateScrollState);
    };

    element.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollState(); // Initial check

    return () => element.removeEventListener("scroll", handleScroll);
  }, [ref]);

  return scrollState;
};

// Custom hook for responsive layout
const useResponsiveLayout = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  cardRef: React.RefObject<HTMLAnchorElement | null>,
  categoriesLength: number
) => {
  const [layoutState, setLayoutState] = useState({
    cardWidth: DEFAULT_CARD_WIDTH,
    containerPadding: BASE_PADDING,
    needsScroll: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const card = cardRef.current;
      if (!container || !card) return;

      const containerWidth = container.offsetWidth;
      const cardWidth = card.offsetWidth + CARD_GAP;
      const totalContentWidth = categoriesLength * cardWidth - CARD_GAP;
      
      // Calculate if content needs to scroll
      const availableWidthWithBasePadding = containerWidth - (2 * BASE_PADDING);
      const needsScroll = totalContentWidth > availableWidthWithBasePadding;
      
      // Calculate appropriate padding 
      let containerPadding = BASE_PADDING;
      if (!needsScroll) {
        // If content fits, center it with equal padding
        const extraSpace = availableWidthWithBasePadding - totalContentWidth;
        containerPadding = Math.max(BASE_PADDING, BASE_PADDING + (extraSpace / 2));
      }
      // When scrolling is needed, we use CSS class px-5 (20px) for consistent edge spacing

      setLayoutState({
        cardWidth,
        containerPadding,
        needsScroll,
      });
    };

    const resizeObserver = new ResizeObserver(handleResize);
    const container = containerRef.current;
    if (container) {
      resizeObserver.observe(container);
    }

    handleResize(); // Initial calculation

    return () => resizeObserver.disconnect();
  }, [containerRef, cardRef, categoriesLength]);

  return layoutState;
};

// Arrow icon component for better maintainability
const ArrowIcon = ({ direction, className }: { direction: 'left' | 'right'; className?: string }) => (
  <svg 
    width="28" 
    height="28" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d={direction === 'left' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} 
    />
  </svg>
);

export default function CategoriesBanner({ 
  categories, 
  selectedCategoryId, 
  onCategorySelect,
  className,
  showScrollHint = true 
}: CategoriesBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const selectedRef = useRef<HTMLAnchorElement>(null);
  
  const { locale } = useTranslation();
  const isArabic = locale === Languages.ARABIC;
  
  // Custom hooks
  const { canScrollLeft, canScrollRight } = useScrollDetection(containerRef);
  const { cardWidth, containerPadding, needsScroll } = useResponsiveLayout(containerRef, cardRef, categories.length);

  // Memoized values
  const scrollHintText = useMemo(() => 
    isArabic ? 'مرر لرؤية المزيد من الفئات' : 'Scroll for more categories',
    [isArabic]
  );

  // Auto-scroll selected category into view
  useEffect(() => {
    if (!selectedRef.current || !containerRef.current || !selectedCategoryId) return;

    const container = containerRef.current;
    const card = selectedRef.current;
    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    
    // Calculate offset to center the selected card
    const containerCenter = containerRect.width / 2;
    const cardCenter = cardRect.left - containerRect.left + (cardRect.width / 2);
    const offset = cardCenter - containerCenter;
    
    container.scrollBy({ left: offset, behavior: 'smooth' });
  }, [selectedCategoryId]);

  // Reset scroll position when categories change to maintain edge offset
  useEffect(() => {
    if (!containerRef.current || !needsScroll) return;
    
    // Reset to start position to ensure proper edge offset
    const container = containerRef.current;
    if (container.scrollLeft === 0) {
      // Force a small scroll to ensure proper positioning
      container.scrollLeft = 0;
    }
  }, [categories, needsScroll]);

  // Scroll functions with improved logic
  const scrollLeft = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    
    const scrollAmount = Math.min(cardWidth * 2, element.clientWidth * 0.8);
    element.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  }, [cardWidth]);

  const scrollRight = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    
    const scrollAmount = Math.min(cardWidth * 2, element.clientWidth * 0.8);
    element.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }, [cardWidth]);

  // Keyboard navigation
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isArabic) {
          scrollRight();
        } else {
          scrollLeft();
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isArabic) {
          scrollLeft();
        } else {
          scrollRight();
        }
      }
    };

    element.addEventListener("keydown", handleKeyDown);
    return () => element.removeEventListener("keydown", handleKeyDown);
  }, [scrollLeft, scrollRight, isArabic]);

  // Handle category selection
  const handleCategoryClick = useCallback((categoryId: string | number) => {
    onCategorySelect?.(categoryId);
  }, [onCategorySelect]);

  // Render scroll button
  const renderScrollButton = (direction: 'left' | 'right', onClick: () => void, disabled: boolean) => {
    const isLeft = direction === 'left';
    const shouldShowLeft = isArabic ? !isLeft : isLeft;
    
    return (
      <button
        onClick={onClick}
        className={clsx(
          "hidden md:flex h-12 w-12 rounded-full bg-white shadow-lg border border-gray-200 items-center justify-center text-gray-600 transition-all duration-200",
          "hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 hover:shadow-xl hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg disabled:hover:bg-white",
          "flex-shrink-0", // Prevent button from shrinking
          shouldShowLeft ? "order-first" : "order-last"
        )}
        style={{ zIndex: 20 }}
        disabled={disabled}
        aria-label={`Scroll ${direction}`}
        type="button"
      >
        <ArrowIcon direction={shouldShowLeft ? 'left' : 'right'} className="w-5 h-5" />
      </button>
    );
  };

  // Render fade overlay - simplified version
  const renderFadeOverlay = (side: 'left' | 'right', show: boolean) => {
    if (!show || !needsScroll) return null;
    
    const isLeft = side === 'left';
    const shouldShowLeft = isArabic ? !isLeft : isLeft;
    
    return (
      <div 
        className={clsx(
          "pointer-events-none absolute top-0 h-full z-10 w-8",
          shouldShowLeft 
            ? (isArabic ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r") 
            : (isArabic ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l"),
          "from-white/80 to-transparent"
        )}
        aria-hidden="true"
      />
    );
  };

  if (!categories.length) {
    return null;
  }

  return (
    <section className={clsx("w-full py-6", className)}>
      <div className="relative w-full flex items-center justify-center gap-4 px-4">
        {/* Left Scroll Button */}
        {needsScroll && renderScrollButton('left', scrollLeft, !canScrollLeft)}
        
        {/* Categories Container */}
        <div
          ref={containerRef}
          className={clsx(
            "flex gap-4 overflow-x-auto w-full rounded-xl bg-white shadow-sm border border-gray-100 scrollbar-hide scroll-smooth snap-x relative",
            "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2",
            isArabic ? "flex-row-reverse" : "flex-row",
            "py-5",
            // Always use fixed padding to ensure consistent edge spacing
            needsScroll ? "px-5" : ""
          )}
          style={!needsScroll ? {
            paddingLeft: `${containerPadding}px`,
            paddingRight: `${containerPadding}px`,
          } : undefined}
          tabIndex={0}
          role="tablist"
          dir={isArabic ? "rtl" : "ltr"}
          aria-label="Category navigation"
        >
          {/* Fade Overlays */}
          {renderFadeOverlay('left', canScrollLeft)}
          {renderFadeOverlay('right', canScrollRight)}
          
          {/* Category Items */}
          {categories.map((category, index) => {
            const isSelected = selectedCategoryId === category.id;
            const displayName = isArabic && category.name_ar ? category.name_ar : category.name;
            
            return (
              <Link
                key={category.id}
                href={`/${locale}/listings?category=${category.slug}`}
                onClick={() => handleCategoryClick(category.id)}
                className={clsx(
                  "group flex flex-col items-center justify-center min-w-[120px] max-w-[140px] p-4 rounded-lg border transition-all duration-200 snap-start flex-shrink-0",
                  "hover:shadow-md hover:-translate-y-0.5 hover:scale-102",
                  "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2",
                  isSelected
                    ? "bg-orange-50 border-orange-300 shadow-md ring-1 ring-orange-200"
                    : "bg-white border-gray-200 hover:bg-orange-50 hover:border-orange-200"
                )}
                ref={
                  index === 0 
                    ? cardRef 
                    : isSelected 
                    ? selectedRef 
                    : undefined
                }
                role="tab"
                aria-selected={isSelected}
                aria-label={displayName}
                tabIndex={0}
              >
                {/* Icon Container */}
                <div className="w-14 h-14 flex items-center justify-center mb-3 rounded-full bg-gray-50 group-hover:bg-orange-100 transition-colors duration-200 overflow-hidden flex-shrink-0">
                  <Image
                    src={category.hero_image || '/default.svg'}
                    alt=""
                    width={32}
                    height={32}
                    className="object-contain w-8 h-8"
                    loading="lazy"
                  />
                </div>
                
                {/* Category Name */}
                <span className="text-sm font-medium text-gray-900 text-center leading-tight line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                  {displayName}
                </span>
              </Link>
            );
          })}
          
          {/* End Spacer - only when scrolling is needed */}
          {needsScroll && (
            <div 
              className="flex-shrink-0" 
              style={{ width: `${EDGE_OFFSET}px` }}
              aria-hidden="true"
            />
          )}
        </div>
        
        {/* Right Scroll Button */}
        {needsScroll && renderScrollButton('right', scrollRight, !canScrollRight)}
      </div>
      
      {/* Mobile Scroll Hint */}
      {showScrollHint && needsScroll && (
        <div className="md:hidden mt-3 text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <span>←</span>
          <span>{scrollHintText}</span>
          <span>→</span>
        </div>
      )}
    </section>
  );
}