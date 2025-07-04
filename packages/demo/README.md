# Hallow gRPC Demo

이 데모 프로젝트는 Hallow gRPC 라이브러리의 기능을 시연합니다.

## 주요 기능

- **직접 .proto 파일 import**: TypeScript에서 `.proto` 파일을 직접 import할 수 있습니다
- **Promise API**: 기존 gRPC 클라이언트와 호환되는 Promise 기반 API
- **React Hooks**: Suspense를 지원하는 React Hooks API
- **실시간 스트리밍**: 단방향 및 양방향 스트리밍 지원

## 사용법

### 개발 서버 실행

```bash
pnpm dev
```

### 빌드

```bash
pnpm build
```

### 타입 검사

```bash
pnpm typecheck
```

### 린트

```bash
pnpm lint
```

## 데모 컴포넌트

### 1. GreetingDemo
기본적인 요청/응답 패턴을 보여주는 컴포넌트입니다.

### 2. UserDemo
CRUD 작업과 서버 스트리밍을 보여주는 컴포넌트입니다.

### 3. ChatDemo
실시간 메시징과 양방향 스트리밍을 보여주는 컴포넌트입니다.

## 아키텍처

```
src/
├── components/          # React 컴포넌트
│   ├── GreetingDemo.tsx
│   ├── UserDemo.tsx
│   ├── ChatDemo.tsx
│   └── ErrorBoundary.tsx
├── protos/             # Protocol Buffer 정의
│   ├── greeting.proto
│   ├── user.proto
│   └── chat.proto
├── generated/          # SWC 플러그인 생성 파일 (자동 생성)
└── App.tsx
```

## SWC 플러그인 통합

현재 구현된 컴포넌트들은 모두 mock 데이터를 사용하며, TODO 주석으로 SWC 플러그인 통합 지점을 표시했습니다.

SWC 플러그인이 구현되면 다음과 같이 작동합니다:

```tsx
// 이 import가 SWC 플러그인에 의해 변환됩니다
import { GreetingStub } from './protos/greeting.proto';

// 생성된 스텁 클래스 사용
const client = new Client({ baseURL: '/api' });
const greeter = new GreetingStub(client);

// Promise API
const response = await greeter.greeting({ name: 'World' });

// React Hooks API
const hooks = greeter.createHooks();
const data = hooks.useGreeting({ name: 'World' });
```