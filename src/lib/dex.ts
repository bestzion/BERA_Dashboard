// src/lib/dex.ts
export async function fetchDexPrice(
    sellToken: string,      // 조회할 토큰 컨트랙트 주소
    buyToken = "USDT",      // 기준으로 삼을 토큰
    sellDecimals = 18       // sellToken의 소수점 자리
  ): Promise<number> {
    // 1 sellToken 단위(=1 * 10^decimals)
    const amount = BigInt(10) ** BigInt(sellDecimals);
    const url = new URL("https://api.0x.org/swap/v1/quote");
    url.searchParams.set("sellToken", sellToken);
    url.searchParams.set("buyToken", buyToken);
    url.searchParams.set("sellAmount", amount.toString());
    // (BeraChain용으로 체인 ID 추가)
    url.searchParams.set("chainId", "80094");
  
    const res = await fetch(url.toString());
    const json = await res.json();
    // buyAmount 는 USDT 기준 6 decimals
    return Number(json.buyAmount) / 1e6;
  }
  