import { Smartphone } from "lucide-react";

export default function LoaderPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-4 animate-fadeIn">
      <div className="relative w-20 h-20 border-4 border-yellow-400 border-dashed rounded-full animate-spin flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.4)]">
        <Smartphone className="text-yellow-400 w-8 h-8 animate-pulse" />
      </div>
      <p className="mt-5 text-yellow-400 text-base sm:text-lg text-center tracking-wide">
        Loading your mobile experience...
      </p>
    </div>
  );
}