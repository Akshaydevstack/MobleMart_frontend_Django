import React from 'react'

export default function BannerOfferslider() {
  return (
    <div className="bg-yellow-400 sticky top-16 z-[100] overflow-hidden">
      <div className="animate-marquee whitespace-nowrap py-2 text-black font-semibold text-xs sm:text-sm">
        🎉 <span className="text-red-500">Special Offer!</span> Get{" "}
        <span className="underline">10% OFF</span> on all smartphones 📱 +{" "}
        <span className="text-green-600">Free Shipping</span>
        &nbsp;&nbsp;&nbsp; 🎉{" "}
        <span className="text-red-500">Special Offer!</span> Get{" "}
        <span className="underline">10% OFF</span> on all smartphones 📱 +{" "}
        <span className="text-green-600">Free Shipping</span>
        &nbsp;&nbsp;&nbsp; 🎉{" "}
        <span className="text-red-500">Special Offer!</span> Get{" "}
        <span className="underline">10% OFF</span> on all smartphones 📱 +{" "}
        <span className="text-green-600">Free Shipping</span>
      </div>
    </div>
  )
}