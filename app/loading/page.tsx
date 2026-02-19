'use client';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#2d3f47] to-[#1a2c36]">
      <div className="flex flex-col items-center gap-8">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-2">SkillSwap</h1>
          <p className="text-sm text-gray-300">Learn, Teach, and Exchange Skills</p>
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#5fa4c3] animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-[#5fa4c3] animate-pulse delay-100" />
          <div className="w-3 h-3 rounded-full bg-[#5fa4c3] animate-pulse delay-200" />
        </div>
      </div>
    </div>
  );
}
