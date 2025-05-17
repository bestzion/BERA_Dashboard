// src/pages/index.tsx
import React from "react";
import DashboardLanding from "../components/DashboardLanding";
import DashboardConnected from "../components/DashboardConnected";
import { useWallet } from "../hooks/useWallet";

export default function HomePage() {
  const { account, ethBalance, connect, disconnect } = useWallet();

  // account가 없으면 Landing, 있으면 Connected
  if (!account) {
    return <DashboardLanding onConnect={connect} />;
  }

  return (
    <DashboardConnected
      account={account}
      ethBalance={ethBalance}
      onDisconnect={disconnect}
    />
  );
}
