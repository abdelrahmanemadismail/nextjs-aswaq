"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
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

interface CategoriesBarProps {
  categories: Category[];
  selectedCategoryId?: string | number;
}

export default function CategoriesBar({ categories, selectedCategoryId }: CategoriesBarProps) {
  const categoriesBarRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [cardWidth, setCardWidth] = useState(152); // default: 120 + 2*16
  const [containerPadding, setContainerPadding] = useState(0);
  const selectedRef = useRef<HTMLAnchorElement>(null);
  const { locale } = useTranslation();
  const isArabic = locale === Languages.ARABIC;

  // Revert to previous card width: min-w-[120px] with px-4
  const CARD_GAP = 16; // gap-4 = 1rem = 16px

  useEffect(() => {
    const el = categoriesBarRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    el.addEventListener("scroll", update);
    update();
    return () => el.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (cardRef.current) {
      setCardWidth(cardRef.current.offsetWidth + CARD_GAP);
    }
  }, [categories.length]);

  // Responsive: recalculate how many cards fit and set side padding
  useEffect(() => {
    const handleResize = () => {
      const container = categoriesBarRef.current;
      if (!container || !cardRef.current) return;
      const containerWidth = container.offsetWidth;
      const cardsFit = Math.floor((containerWidth + CARD_GAP) / cardWidth);
      const totalCardsWidth = cardsFit * cardWidth - CARD_GAP;
      const padding = Math.max(0, Math.floor((containerWidth - totalCardsWidth) / 2));
      setContainerPadding(padding);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [cardWidth]);

  // Auto-scroll selected category into view
  useEffect(() => {
    if (selectedRef.current && categoriesBarRef.current) {
      const container = categoriesBarRef.current;
      const card = selectedRef.current;
      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      // Center the selected card
      const offset = cardRect.left - containerRect.left - (containerRect.width / 2) + (cardRect.width / 2);
      container.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }, [selectedCategoryId]);

  // Scroll by the actual card width
  const scrollLeft = useCallback(() => {
    const el = categoriesBarRef.current;
    if (!el) return;
    el.scrollBy({ left: -cardWidth, behavior: "smooth" });
  }, [cardWidth]);
  const scrollRight = useCallback(() => {
    const el = categoriesBarRef.current;
    if (!el) return;
    el.scrollBy({ left: cardWidth, behavior: "smooth" });
  }, [cardWidth]);

  // Keyboard navigation
  useEffect(() => {
    const el = categoriesBarRef.current;
    if (!el) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        scrollLeft();
      } else if (e.key === "ArrowRight") {
        scrollRight();
      }
    };
    el.addEventListener("keydown", handleKey);
    return () => el.removeEventListener("keydown", handleKey);
  }, [scrollLeft, scrollRight]);

  return (
    <section className="w-full rounded-3xl py-4 px-2 flex flex-col items-center">
      <div className="relative w-full flex items-center justify-center gap-4">
        {/* Left Button OUTSIDE - hidden on mobile */}
        <button
          onClick={scrollLeft}
          className={clsx(
            "hidden md:flex h-14 w-14 rounded-full bg-white shadow-lg border-2 border-orange-200 items-center justify-center text-3xl text-orange-500 hover:bg-orange-100 hover:text-white hover:bg-gradient-to-br hover:from-orange-400 hover:to-orange-300 transition disabled:opacity-30 disabled:cursor-not-allowed",
            isArabic ? "-ml-2" : "-mr-2"
          )}
          style={{ zIndex: 20 }}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          {isArabic ? (
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          ) : (
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          )}
        </button>
        {/* Categories Bar */}
        <div
          ref={categoriesBarRef}
          className={clsx(
            "flex gap-4 overflow-x-auto w-full rounded-2xl bg-white/90 shadow-lg p-4 scrollbar-hide scroll-smooth snap-x relative",
            isArabic ? "flex-row-reverse" : "flex-row"
          )}
          tabIndex={0}
          style={{ paddingLeft: containerPadding, paddingRight: containerPadding }}
          role="tablist"
          dir={isArabic ? "rtl" : "ltr"}
        >
          {/* Extra left padding at the start for the first card */}
          <div className="shrink-0" style={{ width: 16 }} />
          {/* Fade left */}
          {canScrollLeft && (
            <div className={clsx(
              "pointer-events-none absolute top-0 h-full w-8 z-10",
              isArabic ? "right-0 bg-gradient-to-l from-white/90 to-transparent" : "left-0 bg-gradient-to-r from-white/90 to-transparent"
            )} />
          )}
          {/* Fade right */}
          {canScrollRight && (
            <div className={clsx(
              "pointer-events-none absolute top-0 h-full w-8 z-10",
              isArabic ? "left-0 bg-gradient-to-r from-white/90 to-transparent" : "right-0 bg-gradient-to-l from-white/90 to-transparent"
            )} />
          )}
          {categories.map((category, idx) => {
            const isSelected = selectedCategoryId === category.id;
            const displayName = isArabic && category.name_ar ? category.name_ar : category.name;
            return (
              <Link
                key={category.id}
                href={`/listings/${category.slug}`}
                className={clsx(
                  "group flex flex-col items-center min-w-[120px] px-4 py-2 rounded-xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-primary snap-start",
                  isSelected
                    ? "bg-orange-50 border-orange-400 ring-2 ring-orange-300 animate-pulse"
                    : "bg-white border-gray-200 hover:bg-orange-50"
                )}
                style={{ textDecoration: 'none' }}
                tabIndex={0}
                ref={
                  idx === 0
                    ? cardRef
                    : isSelected
                    ? selectedRef
                    : undefined
                }
                role="tab"
                aria-selected={isSelected}
                aria-label={displayName}
              >
                <div className="w-16 h-16 flex items-center justify-center mb-2 rounded-full bg-gray-50 group-hover:bg-orange-100 transition">
                  <Image
                    src={category.hero_image || '/default.svg'}
                    alt={displayName}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <span className="text-base font-medium text-gray-900 text-center">{displayName}</span>
              </Link>
            );
          })}
        </div>
        {/* Right Button OUTSIDE - hidden on mobile */}
        <button
          onClick={scrollRight}
          className={clsx(
            "hidden md:flex h-14 w-14 rounded-full bg-white shadow-lg border-2 border-orange-200 items-center justify-center text-3xl text-orange-500 hover:bg-orange-100 hover:text-white hover:bg-gradient-to-br hover:from-orange-400 hover:to-orange-300 transition disabled:opacity-30 disabled:cursor-not-allowed",
            isArabic ? "-mr-2" : "-ml-2"
          )}
          style={{ zIndex: 20 }}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          {isArabic ? (
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          ) : (
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          )}
        </button>
      </div>
      <div className="md:hidden mt-2 text-xs text-gray-400">← {isArabic ? 'مرر لرؤية المزيد من الفئات' : 'Scroll for more categories'} →</div>
    </section>
  );
} 