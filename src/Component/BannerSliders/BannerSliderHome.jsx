import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sliderimage } from "../../Data/Sliderimage";

export default function BannerSlider() {
  const navigate=useNavigate()
  
const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === sliderimage.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [sliderimage.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? sliderimage.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === sliderimage.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full h-[75vh] overflow-hidden">
      {/* Image Slider */}
      {sliderimage.map((slide, index) => (
        <a
          key={index}
          href={slide.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        </a>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 md:px-8">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 animate-fade-in">
          Discover the Latest Smartphones
        </h1>
        <p className="text-lg md:text-xl text-gray-200 max-w-3xl mb-6 animate-slide-up">
          Unleash the power of cutting-edge technology with top brands and
          exclusive deals.
        </p>
        <button onClick={()=>navigate("/shop")} className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition">
          Shop Now
        </button>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 text-white p-3 rounded-full hover:bg-white/50 transition"
      >
        ❮
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 text-white p-3 rounded-full hover:bg-white/50 transition"
      >
        ❯
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {sliderimage.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? "bg-white" : "bg-gray-400"
            } hover:bg-white/80 transition`}
          ></button>
        ))}
      </div>
    </div>
  );
}
