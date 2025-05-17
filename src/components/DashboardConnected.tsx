// src/components/DashboardConnected.tsx
import React, { useEffect, useState } from "react";

interface TokenInfo {
  symbol: string;       // ex. "ETH"
  name: string;         // ex. "Ethereum"
  price: number;        // ex. 1875.23
  change24h: number;    // ex. +1.23  (%)
  balance: number;      // ex. 0.5
}

interface Props {
  account: string;
  ethBalance: string;
  onDisconnect: () => void;
}

const DashboardConnected: React.FC<Props> = ({
  account,
  ethBalance,
  onDisconnect,
}) => {
  const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-3)}`;

  // 더미 토큰 데이터 (나중에 API 호출로 교체)
  const [tokens, setTokens] = useState<TokenInfo[]>([]);

  useEffect(() => {
    // TODO: 실제론 Coingecko / On-Chain API로 불러오기
    setTokens([
      {
        symbol: "ETH",
        name: "Ethereum",
        price: 1875.23,
        change24h: +1.23,
        balance: 0.5,
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        price: 1.00,
        change24h: -0.02,
        balance: 123.45,
      },
      // … 다른 토큰 …
    ]);
  }, []);

  return (
    <main className="bg-white min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] h-screen relative px-[60px] pt-[50px]">
        {/* 헤더 */}
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-hepta font-normal text-black">
            Ignight Dashboard
          </h1>
          <button
            onClick={onDisconnect}
            className="h-[40px] w-52 bg-[#b2d5ff] text-black hover:bg-[#a0c9f8]
                       rounded-2xl flex items-center justify-center
                       shadow-md transition"
            style={{ paddingTop: 0, paddingBottom: 0 }}
          >
            <span className="text-lg font-hepta font-normal">
              {short(account)}
            </span>
          </button>
        </header>

        {/* Assets */}
        <h2 className="mt-8 text-xl font-hepta">Assets</h2>
        <div className="mt-4 border rounded-xl overflow-y-auto max-h-[60vh]">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Ticker</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">24h %</th>
                <th className="px-4 py-3 text-right">Balance</th>
                <th className="px-4 py-3 text-right">Value ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tokens.map((t) => {
                const value = (t.price * t.balance).toFixed(2);
                const changeClass =
                  t.change24h > 0 ? "text-green-600" : "text-red-600";
                return (
                  <tr key={t.symbol}>
                    <td className="px-4 py-3 flex items-center">
                      {/* 기호 아이콘 넣고 싶으면 여기에 <img> */}
                      <span className="font-semibold">{t.symbol}</span>
                    </td>
                    <td className="px-4 py-3">{t.name}</td>
                    <td className="px-4 py-3 text-right">
                      ${t.price.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 text-right ${changeClass}`}>
                      {t.change24h > 0 && "+"}
                      {t.change24h.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.balance}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${value}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default DashboardConnected;
