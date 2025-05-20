// src/components/DashboardConnected.tsx
import React, { useEffect, useState } from "react";
import {
  fetchZapperPortfolio,
  fetchTokenPrice,
  fetchZapperAppBalances,
  ZapperTokenNode,
  DefiInfo
} from "../lib/zapper";

interface TokenInfo {
  symbol: string;
  name: string;
  logoUrl: string;
  balance: number;
  price: number;
  value: number;
  chain: string;
  priceChange24h: number;
}

interface DefiRow {
  network: string;
  displayName: string;
  logoUrl: string;
  balanceUSD: number;
  type: string;
  groupLabel: string | null;
  tokens: Array<{ symbol: string; price: number }>;
}

interface Props {
  account: string;
  onDisconnect: () => void;
}

const DashboardConnected: React.FC<Props> = ({ account, onDisconnect }) => {
  const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-3)}`;
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [defiRows, setDefiRows] = useState<DefiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getChainId = (networkName: string): number => {
    const key = networkName.toLowerCase();
    if (key.includes("ethereum")) return 1;
    if (key.includes("berachain")) return 80094;
    return 0;
  };

  useEffect(() => {
    if (!account) return;
    (async () => {
      setLoading(true);
      setError(null);

      // Assets 조회
      try {
        const nodes = await fetchZapperPortfolio(account, 50);
        const infos = await Promise.all(
          nodes.map(async (n) => {
            const chainId = getChainId(n.network.name);
            let change = 0;
            try {
              const pd = await fetchTokenPrice(n.tokenAddress, chainId);
              change = pd.priceChange24h ?? 0;
            } catch (e) {
              console.warn(`fetchTokenPrice failed for ${n.symbol}`, e);
            }
            return {
              symbol: n.symbol,
              name: n.name,
              logoUrl: n.imgUrlV2,
              balance: n.balance,
              price: n.price,
              value: n.balanceUSD,
              chain: n.network.name,
              priceChange24h: change,
            };
          })
        );
        setTokens(infos);
      } catch (e) {
        console.error(e);
        setError("잔고 조회 중 오류가 발생했습니다.");
      }

      // DeFi App Balance 조회
      try {
        console.log("▶ Fetching AppBalances for address:", account);
        const apps = await fetchZapperAppBalances(account, 20);
        console.log("▶ AppBalances response:", apps);
        const rows = apps.flatMap(app =>
          app.positions.map(pos => ({
            network: app.network,
            displayName: app.displayName,
            logoUrl: app.logoUrl,
            balanceUSD: app.balanceUSD,
            type: pos.type,
            groupLabel: pos.groupLabel,
            tokens: pos.tokens
          }))
        );
        setDefiRows(rows);
      } catch (e) {
        console.warn("DeFi 조회 실패:", e);
        setDefiRows([]);
      }

      setLoading(false);
    })();
  }, [account]);

  return (
    <main className="bg-white min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] px-[60px] pt-[50px]">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-serif text-black">Ignight Dashboard</h1>
          <button
            onClick={onDisconnect}
            className="h-[40px] w-52 bg-[#b2d5ff] hover:bg-[#a0c9f8] rounded-2xl flex items-center justify-center shadow-md transition"
          >
            <span className="text-lg font-serif text-black">
              {short(account)}
            </span>
          </button>
        </header>

        <h2 className="mt-8 text-xl font-serif">Assets</h2>
        <div className="mt-4 border rounded-xl overflow-y-auto max-h-[60vh]">
          {loading && <p className="p-4">데이터 로딩 중...</p>}
          {error && <p className="p-4 text-red-500">{error}</p>}
          {!loading && !error && (
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Chain</th>
                  <th className="px-6 py-3 text-left">Asset</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-right">Price (USD)</th>
                  <th className="px-6 py-3 text-right">24h Change</th>
                  <th className="px-6 py-3 text-right">Balance</th>
                  <th className="px-6 py-3 text-right">Value (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tokens.map(t => {
                  const balDisplay = t.balance < 0.01 ? "<0.01" : t.balance.toFixed(4);
                  const valDisplay = t.value < 0.01 ? "<$0.01" : `$${t.value.toFixed(2)}`;
                  const priceDisplay = `$${t.price.toFixed(4)}`;
                  const change = t.priceChange24h.toFixed(2) + "%";
                  return (
                    <tr key={t.symbol + t.chain}>
                      <td className="px-6 py-3">{t.chain}</td>
                      <td className="px-6 py-3 flex items-center">
                        <img src={t.logoUrl} alt={t.symbol} className="w-6 h-6 rounded-full mr-2" />
                        <span className="font-semibold">{t.symbol}</span>
                      </td>
                      <td className="px-6 py-3">{t.name}</td>
                      <td className="px-6 py-3 text-right">{priceDisplay}</td>
                      <td className={
                          "px-6 py-3 text-right " +
                          (t.priceChange24h >= 0 ? "text-green-600" : "text-red-600")
                        }>{change}</td>
                      <td className="px-6 py-3 text-right">{balDisplay}</td>
                      <td className="px-6 py-3 text-right">{valDisplay}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* DeFi App Balance 테이블 */}
        <h2 className="mt-8 text-xl font-serif">DeFi</h2>
        <div className="mt-4 border rounded-xl overflow-y-auto max-h-[60vh]">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Chain</th>
                <th className="px-6 py-3 text-left">App</th>
                <th className="px-6 py-3 text-right">Value (USD)</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Group</th>
                <th className="px-6 py-3 text-left">Tokens @ Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr><td colSpan={6} className="p-4 text-center">데이터 로딩 중...</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={6} className="p-4 text-center text-red-500">DeFi 데이터 로딩 중 오류</td></tr>
              )}
              {!loading && !error && defiRows.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center">데이터가 없습니다.</td></tr>
              )}
              {!loading && !error && defiRows.map((d, i) => {
                const val = d.balanceUSD < 0.01 ? "<$0.01" : `$${d.balanceUSD.toFixed(2)}`;
                return (
                  <tr key={i + d.displayName}>
                    <td className="px-6 py-3">{d.network}</td>
                    <td className="px-6 py-3 flex items-center">
                      <img src={d.logoUrl} alt={d.displayName} className="w-6 h-6 rounded-full mr-2" />
                      <span className="font-semibold">{d.displayName}</span>
                    </td>
                    <td className="px-6 py-3 text-right">{val}</td>
                    <td className="px-6 py-3">{d.type}</td>
                    <td className="px-6 py-3">{d.groupLabel || "-"}</td>
                    <td className="px-6 py-3">{d.tokens.map(t => `${t.symbol}@${t.price.toFixed(4)}`).join(", ")}</td>
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