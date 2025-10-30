import { Smartphone, Sparkles } from "lucide-react";

export default function LoaderPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-950/95 backdrop-blur-sm px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-blue-400/5 rounded-full blur-lg animate-pulse" style={{animationDelay: '1000ms'}}></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-purple-400/5 rounded-full blur-lg animate-pulse" style={{animationDelay: '500ms'}}></div>
      </div>

      {/* Main loader */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Outer glow ring */}
        <div className="absolute w-32 h-32 bg-yellow-400/20 rounded-full blur-md animate-ping"></div>
        
        {/* Main loader circle */}
        <div className="relative w-24 h-24 border-2 border-yellow-400/30 rounded-full animate-spin flex items-center justify-center" style={{animationDuration: '3s'}}>
          {/* Inner rotating element */}
          <div className="absolute w-20 h-20 border-t-2 border-yellow-400/60 rounded-full animate-spin"></div>
          
          {/* Center icon with glow */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-12 h-12 bg-yellow-400/10 rounded-full blur-sm"></div>
            <Smartphone className="text-yellow-400/80 w-6 h-6 animate-pulse" />
            <Sparkles className="absolute -top-1 -right-1 text-yellow-300 w-3 h-3 animate-pulse" style={{animationDelay: '300ms'}} />
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex space-x-1.5 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-yellow-400/60 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>

        {/* Text with gradient */}
        <div className="mt-6 text-center">
          <p className="text-transparent bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 bg-clip-text text-sm font-light tracking-widest uppercase animate-pulse">
            Preparing Your Experience
          </p>
          <p className="text-gray-400/80 text-xs mt-2 font-light tracking-wide">
            Just a moment...
          </p>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 opacity-40">
        <div className="w-1 h-1 bg-yellow-400/30 rounded-full animate-pulse"></div>
        <div className="w-1 h-1 bg-yellow-400/30 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
        <div className="w-1 h-1 bg-yellow-400/30 rounded-full animate-pulse" style={{animationDelay: '600ms'}}></div>
      </div>
    </div>
  );
}