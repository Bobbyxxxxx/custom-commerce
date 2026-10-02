"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { assets } from "@/public/assets/assets";

const HeaderSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderData = [
    {
      id: 1,
      title: "Next-Level Gaming Starts Here - Discover PlayStation 5 Today!",
      buttonText1: "Coming Soon",
      buttonText2: "Find more",
      imgSrc: assets.header_playstation_image || assets.header_headphone_image,
    },
    {
      id: 2,
      title: "Experience Sound Like Never Before with Premium Headphones",
      buttonText1: "Buy Now",
      buttonText2: "Learn More",
      imgSrc: assets.header_headphone_image,
    },
    {
      id: 3,
      title: "Power & Elegance Combined - Explore the Latest MacBooks",
      buttonText1: "Pre-Order",
      buttonText2: "View Specs",
      imgSrc: assets.header_macbook_image || assets.header_headphone_image,
    },
    {
      id: 4,
      title: "Stay Connected & Fit with Next-Gen Smartwatches",
      buttonText1: "Shop Collection",
      buttonText2: "Explore Features",
      imgSrc: assets.header_headphone_image,
    },
    {
      id: 5,
      title: "Capture Every Detail with Professional Camera Gear",
      buttonText1: "Explore Now",
      buttonText2: "See Gallery",
      imgSrc: assets.header_headphone_image,
    },
  ];

  // Auto-slide functionality every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [sliderData.length]);

  return (
    <div className="w-full bg-black text-white relative overflow-hidden py-12 md:py-20 px-6 sm:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto min-h-[320px] md:min-h-[400px] relative flex items-center">
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className={`w-full transition-opacity duration-700 ease-in-out absolute inset-0 flex flex-col md:flex-row items-center justify-between gap-8 ${
              index === currentSlide
                ? "opacity-100 pointer-events-auto z-10"
                : "opacity-0 pointer-events-none z-0"
            }`}
          >
            {/* Left Content */}
            <div className="max-w-xl text-center md:text-left space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
                {slide.title}
              </h1>

              <div className="flex items-center justify-center md:justify-start gap-4">
                <button className="bg-[#FFEAD0] hover:bg-[#f3d3aa] text-black font-medium px-6 py-2.5 rounded-full text-sm transition-colors shadow-sm">
                  {slide.buttonText1}
                </button>
                {slide.buttonText2 && (
                  <button className="text-zinc-400 hover:text-white font-medium text-sm transition-colors">
                    {slide.buttonText2}
                  </button>
                )}
              </div>
            </div>

            {/* Right Image Container */}
            <div className="relative w-full md:w-1/2 h-[220px] sm:h-[300px] md:h-[360px] flex items-center justify-center">
              <Image
                src={slide.imgSrc}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Slide Navigation Dots */}
      <div className="flex items-center justify-center gap-2 mt-8 md:mt-4">
        {sliderData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-6 bg-zinc-100"
                : "w-2 bg-zinc-600 hover:bg-zinc-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
