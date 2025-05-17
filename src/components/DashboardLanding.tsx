// src/components/DashboardLanding.tsx
import React from "react";

interface Props {
  onConnect: () => void;
}

const DashboardLanding: React.FC<Props> = ({ onConnect }) => (
  <main className="bg-white min-h-screen flex flex-col items-center">
    <div className="w-full max-w-[1440px] h-screen relative px-[60px] pt-[50px]">
        {/* 헤더 */}
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-serif font-normal text-black">
            Ignight Dashboard
          </h1>
          <button
            onClick={onConnect}
            className="h-[40px] w-52 bg-[#b2d5ff] text-black hover:bg-[#a0c9f8]
                      rounded-2xl flex items-center justify-center
                      shadow-md transition"
            style={{ paddingTop: 0, paddingBottom: 0 }} // 텍스트 중앙 정렬 보장
          >
            <span className="text-lg font-normal font-serif">
              Connect Wallet
            </span>
          </button>
        </header>

        {/* 중앙 GIF */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <img
            src="/homepage_icon_1.gif"
            alt="Homepage Icon"
            className="w-[360px] h-[360px] object-contain"
          />
        </div>
      </div>
  </main>
);

export default DashboardLanding;
