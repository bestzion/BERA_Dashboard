# 🧠 BERA Dashboard

Berachain 기반의 지갑 자산 및 DeFi 투자 현황을 직관적으로 보여주는 대시보드입니다.  
Zapper API를 활용하여 지갑 내 자산, 가격, 24시간 변동률 정보를 실시간으로 확인할 수 있습니다.

## 🚀 주요 기능

- 지갑 연결 후 실시간 자산 정보 조회
- 보유 토큰별 가격 및 USD 가치 확인
- DeFi 포지션 정보 시각화
- 24시간 가격 변동률 표시

## 🛠️ 사용 기술

- **Next.js** (React 기반)
- **TypeScript**
- **Tailwind CSS**
- **Zapper API**

------------------------------------------

## 📦 설치 방법

### 1. 레포지토리 클론

```bash
git clone https://github.com/bestzion/BERA_Dashboard.git
cd BERA_Dashboard
```

### 2. 의존성 설치

```
npm install
```

### 3. Zapper API 키 발급

- https://protocol.zapper.xyz/ 에 가입 후 API 키 발급
- .env.local 파일을 프로젝트 루트에 생성 후 다음 내용 추가:

```
NEXT_PUBLIC_ZAPPER_API_KEY=본인의_발급_키_입력
```

### 4. 개인 서버 실행

```
npm run dev
```
- http://localhost:3000/ 접속

### 5. 개인 지갑 연결

- Metamask 지갑 연결
<img width="1621" alt="Screenshot 2025-05-21 at 3 17 47 AM" src="https://github.com/user-attachments/assets/dbdffbfa-2ce8-4877-b5c7-1d825f862a01" />

- Connect Wallet 버튼 클릭 후 지갑 연동
- 투자 내역 확인
<img width="1638" alt="Screenshot 2025-05-21 at 3 18 34 AM" src="https://github.com/user-attachments/assets/610d0c4c-038c-44a7-ba4f-bba602572708" />



