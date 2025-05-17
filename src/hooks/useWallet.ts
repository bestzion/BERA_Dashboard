// src/hooks/useWallet.ts
import Web3 from "web3";
import { useState, useCallback, useRef, useEffect } from "react";  // ← useEffect 추가

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string>("0");
  const web3Ref = useRef<Web3 | null>(null);

  const disconnect = useCallback(() => {
    setAccount(null);
    setEthBalance("0");
    web3Ref.current = null;
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("Rabby Wallet 또는 MetaMask를 설치해주세요.");
      return;
    }
    // 1) 완전 권한 철회 → 반드시 호출
    try {
      await window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch {
      // 지원 안 하거나 거부해도 무시
    }
    // 2) 이전 상태 초기화
    disconnect();

    // 3) 계정 선택 팝업 띄우기
    let accounts: string[];
    try {
      accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
    } catch (err) {
      console.warn("🛑 User rejected account request", err);
      return;
    }
    if (accounts.length === 0) return;

    // 4) 연결 성공 시만 상태 세팅
    const acct = accounts[0]!;
    const web3 = new Web3(window.ethereum);
    web3Ref.current = web3;
    setAccount(acct);

    const raw = await web3.eth.getBalance(acct);
    setEthBalance(web3.utils.fromWei(raw, "ether"));
  }, [disconnect]);

  // accountsChanged 이벤트로 확장 연결 해제/계정 전환 감지
  useEffect(() => {
    if (!window.ethereum) return;
    const handler = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]!);
      }
    };
    window.ethereum.on("accountsChanged", handler);
    return () => {
      window.ethereum.removeListener("accountsChanged", handler);
    };
  }, [disconnect]);

  return { account, ethBalance, connect, disconnect };
}
