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
  
  // 공통 GraphQL 엔드포인트 & 헤더
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
      query PortfolioV2(
        $addresses: [Address!]!
        $networks: [Network!]!
        $first: Int!
      ) {
        portfolioV2(addresses: $addresses, networks: $networks) {
          tokenBalances {
            byToken(first: $first) {
              edges {
                node {
                  tokenAddress
                  symbol
                  name
                  balance
                  balanceUSD
                  price
                  imgUrlV2
                  network { name }
                }
              }
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
      query TokenPriceData(
        $address: Address!
        $chainId: Int!
      ) {
        fungibleTokenV2(address: $address, chainId: $chainId) {
          address
          symbol
          name
          decimals
          imageUrlV2
          priceData {
            price
            priceChange24h
            marketCap
            volume24h
          }
        }
      }
    `;
  
    const variables = {
      address: tokenAddress,
      chainId
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
  