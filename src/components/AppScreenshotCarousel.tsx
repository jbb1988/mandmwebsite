'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const screenshots = [
  {
    src: '/assets/screenshots/Screenshot 2025-10-09 at 5.21.19 PM-portrait.png',
    alt: 'Mind & Muscle App Screenshot 1',
  },
  {
    src: '/assets/screenshots/Screenshot 2025-10-09 at 5.21.44 PM-left.png',
    alt: 'Mind & Muscle App Screenshot 2',
  },
  {
    src: '/assets/screenshots/Screenshot 2025-10-09 at 5.21.44 PM-portrait.png',
    alt: 'Mind & Muscle App Screenshot 3',
  },
  {
    src: '/assets/screenshots/Screenshot 2025-10-09 at 5.22.06 PM-left.png',
    alt: 'Mind & Muscle App Screenshot 4',
  },
  {
    src: '/assets/screenshots/Screenshot 2025-10-09 at 5.22.32 PM-portrait.png',
    alt: 'Mind & Muscle App Screenshot 5',
  },
  {
    src: '/assets/screenshots/Screenshot 2025-10-09 at 5.26.40 PM-right.png',
    alt: 'Mind & Muscle App Screenshot 6',
  },
];

export function AppScreenshotCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Auto-play functionality
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {screenshots.map((screenshot, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 px-2"
            >
              {/* iPhone Frame */}
              <motion.div
                className="relative mx-auto"
                style={{ maxWidth: '320px' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Phone Bezel */}
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-gray-900 bg-gray-900">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gray-900 rounded-b-3xl z-10" />

                  {/* Screenshot */}
                  <div className="relative aspect-[9/19.5] bg-black">
                    <Image
                      src={screenshot.src}
                      alt={screenshot.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-neon-cortex-blue/20 to-solar-surge-orange/20 blur-2xl -z-10" />
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 z-20
                   bg-gradient-to-r from-neon-cortex-blue to-mind-primary p-3 rounded-full
                   shadow-lg disabled:opacity-30 disabled:cursor-not-allowed
                   hover:scale-110 transition-transform duration-200
                   border border-white/20"
        aria-label="Previous screenshot"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 z-20
                   bg-gradient-to-r from-solar-surge-orange to-muscle-primary p-3 rounded-full
                   shadow-lg disabled:opacity-30 disabled:cursor-not-allowed
                   hover:scale-110 transition-transform duration-200
                   border border-white/20"
        aria-label="Next screenshot"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {screenshots.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? 'bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange w-8'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to screenshot ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
