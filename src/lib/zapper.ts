// src/lib/zapper.ts

export interface ZapperTokenNode {
  tokenAddress: string;
  symbol: string;
  name: string;
  balance: number;
  balanceUSD: number;
  price: number;
  imgUrlV2: string;
  network: { name: string };
}

export interface TokenPriceData {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  imageUrlV2: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
}

export interface DefiInfo {
  displayName: string;
  logoUrl: string;
  network: string;
  balanceUSD: number;
  positions: Array<{
    type: string;
    groupLabel: string | null;
    tokens: Array<{
      symbol: string;
      price: number;
    }>;
  }>;
}

// 공통 GraphQL 엔드포인트
const API_URL = 'https://public.zapper.xyz/graphql';

/**
 * 지갑의 포트폴리오(토큰 잔고) 조회
 */
export async function fetchZapperPortfolio(
  address: string,
  first: number = 50
): Promise<ZapperTokenNode[]> {
  const apiKey = process.env.NEXT_PUBLIC_ZAPPER_API_KEY;
  if (!apiKey) throw new Error('Zapper API 키가 없습니다.');

  const query = `
    query PortfolioV2($addresses: [Address!]!, $networks: [Network!]!, $first: Int!) {
      portfolioV2(addresses: $addresses, networks: $networks) {
        tokenBalances {
          byToken(first: $first) {
            edges { node {
              tokenAddress symbol name balance balanceUSD price imgUrlV2
              network { name }
            } }
          }
        }
      }
    }
  `;

  const variables = {
    addresses: [address],
    networks: ['BERACHAIN_MAINNET'],
    first,
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-zapper-api-key': apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Zapper Portfolio 오류:', text);
    throw new Error(`Zapper API 오류: ${res.statusText}`);
  }

  const { data, errors } = await res.json();
  if (errors) {
    console.error('GraphQL Portfolio 오류:', errors);
    throw new Error('Zapper Portfolio 조회 중 GraphQL 오류 발생');
  }

  return data.portfolioV2.tokenBalances.byToken.edges.map((e: any) => e.node);
}

/**
 * 단일 토큰의 온체인 가격 정보 조회
 */
export async function fetchTokenPrice(
  tokenAddress: string,
  chainId: number
): Promise<TokenPriceData> {
  const apiKey = process.env.NEXT_PUBLIC_ZAPPER_API_KEY;
  if (!apiKey) throw new Error('Zapper API 키가 없습니다.');

  const query = `
    query TokenPriceData($address: Address!, $chainId: Int!) {
      fungibleTokenV2(address: $address, chainId: $chainId) {
        address symbol name decimals imageUrlV2
        priceData { price priceChange24h marketCap volume24h }
      }
    }
  `;

  const variables = { address: tokenAddress, chainId };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-zapper-api-key': apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Zapper Price 오류:', text);
    throw new Error(`Zapper API 오류: ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    console.error('GraphQL Price 오류:', json.errors);
    throw new Error('Zapper 가격 조회 중 GraphQL 오류 발생');
  }

  const node = json.data.fungibleTokenV2;
  return {
    address: node.address,
    symbol: node.symbol,
    name: node.name,
    decimals: node.decimals,
    imageUrlV2: node.imageUrlV2,
    price: node.priceData.price,
    priceChange24h: node.priceData.priceChange24h,
    marketCap: node.priceData.marketCap,
    volume24h: node.priceData.volume24h,
  };
}

/**
 * DeFi 앱 포지션(App Balance) 조회
 */
// src/lib/zapper.ts — 변경된 부분만 발췌
export async function fetchZapperAppBalances(
  address: string,
  first: number = 20
): Promise<DefiInfo[]> {
  const apiKey = process.env.NEXT_PUBLIC_ZAPPER_API_KEY;
  if (!apiKey) throw new Error('Zapper API 키가 없습니다.');

  const query = `
    query AppBalances($addresses: [Address!]!, $first: Int = 10) {
      portfolioV2(addresses: $addresses) {
        appBalances {
          byApp(first: $first) {
            edges {
              node {
                balanceUSD
                app { displayName imgUrl }
                network { name }
                positionBalances(first: $first) {
                  edges {
                    node {
                      ... on AppTokenPositionBalance {
                        type
                        groupLabel
                        balanceUSD
                        price
                        tokens {
                          ... on BaseTokenPositionBalance { symbol price }
                          ... on AppTokenPositionBalance     { symbol price }
                        }
                      }
                      ... on ContractPositionBalance {
                        type
                        groupLabel
                        balanceUSD
                        tokens {
                          token { symbol price }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const variables = {
    addresses: [address],
    first,  // 'networks' 제거 :contentReference[oaicite:7]{index=7}
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-zapper-api-key': apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Zapper AppBalances 오류:', text);
    throw new Error(`Zapper API 오류: ${res.statusText}`);
  }
  const { data, errors } = await res.json();
  if (errors) {
    console.error('GraphQL AppBalances 오류:', errors);
    throw new Error('Zapper AppBalances 조회 중 GraphQL 오류 발생');
  }

  return data.portfolioV2.appBalances.byApp.edges.map((e: any) => {
    const node = e.node;
    return {
      displayName: node.app.displayName,
      logoUrl: node.app.imgUrl,
      network:   node.network.name,
      balanceUSD: node.balanceUSD,
      positions: node.positionBalances.edges.map((p: any) => ({
        type: p.node.type,
        groupLabel: p.node.groupLabel,
        tokens: p.node.tokens.map((t: any) => ({
          symbol: t.symbol     || t.token.symbol,
          price:  t.price      || t.token.price,
        })),
      })),
    };
  });
}
