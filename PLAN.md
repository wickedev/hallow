# Hallow GRPC 라이브러리 개발 계획

## 목표

README.md에 있는 코드처럼 `.proto` 파일에서 직접 import하고 Promise/React Hooks API를 사용할 수 있는 라이브러리 개발

```tsx
import { GreetingStub } from './greeting.proto'

const client = new Client({ baseURL: "/api" })
const greeter = new GreetingStub(client)

// Promise API
const res = await greeter.greeting()

// React Hooks API
const hooks = greeter.createHooks()
const res = hooks.useGreeting()
```

## 아키텍처

### 1. SWC 플러그인 (Rust)
- `.proto` 파일에서 import하는 구문 감지
- 프로토콜 버퍼 파일 파싱
- TypeScript 스텁 클래스 자동 생성 및 AST 변환

### 2. 런타임 라이브러리 (TypeScript)
- gRPC-web 클라이언트 래퍼
- React hooks 생성 유틸리티  
- Suspense 지원 및 캐싱
- 에러 처리

### 3. 프로토콜 버퍼 파서
- `.proto` 파일 읽기 및 파싱
- 서비스 정의 추출
- 메시지 타입 정의 추출

## 프로젝트 구조

```
/packages
  /swc-plugin     # Rust crate - SWC 플러그인
  /runtime        # TypeScript - 런타임 라이브러리
  /proto-parser   # TypeScript/Rust - 프로토콜 버퍼 파서
```

## 핵심 변환 예시

### 입력 코드
```tsx
import { GreetingStub } from './greeting.proto'
```

### 변환 후 코드
```tsx
import { Client } from "@hallow/grpc-web"

class GreetingStub {
  constructor(private client: Client) {}
  
  async greeting(request?: GreetingRequest): Promise<GreetingResponse> {
    return this.client.call('/greeting.Greeter/Greeting', request)
  }
  
  createHooks() {
    return {
      useGreeting: () => this.client.createHook('/greeting.Greeter/Greeting')
    }
  }
}
```

## 개발 로드맵

### Phase 1: 기본 인프라 구축
- [x] Rust SWC 플러그인 스켈레톤 생성
- [ ] TypeScript 런타임 라이브러리 기본 구조 설정
- [ ] 프로토콜 버퍼 파서 (기본적인 service 정의 읽기)
- [ ] 모노레포 구조 설정 (pnpm workspace)
- [ ] 기본 빌드 및 테스트 환경 구성

### Phase 2: 코드 생성 구현
- [ ] Proto 파일에서 service 정의 추출
- [ ] TypeScript 스텁 클래스 생성 로직
- [ ] Promise 기반 API 구현
- [ ] 타입 정의 생성
- [ ] 기본 에러 처리

### Phase 3: React 통합
- [ ] React hooks 생성 로직
- [ ] Suspense 지원 구현
- [ ] 캐싱 메커니즘
- [ ] 에러 바운더리 지원
- [ ] 중복 요청 방지

### Phase 4: 최적화 및 완성
- [ ] 성능 최적화
- [ ] 타입 안정성 강화
- [ ] 종합 테스트 스위트
- [ ] 문서화 (API 문서, 예제)
- [ ] 패키지 배포 준비

## 기술 스택

- **SWC 플러그인**: Rust
- **런타임**: TypeScript
- **gRPC-web**: @improbable-eng/grpc-web
- **Protobuf**: google-protobuf
- **React**: React 18+ (Suspense 지원)
- **빌드 도구**: SWC, TypeScript
- **테스트**: Jest, React Testing Library

## 주요 도전 과제

1. **SWC 플러그인 복잡성**: AST 변환 및 코드 생성의 복잡성
2. **프로토콜 버퍼 파싱**: 완전한 .proto 파일 지원
3. **React Suspense 통합**: 올바른 데이터 페칭 패턴 구현
4. **타입 안정성**: 생성된 코드의 TypeScript 타입 정확성
5. **에러 처리**: gRPC 에러를 React 에러 바운더리로 적절히 전파

## 성공 지표

- [ ] `.proto` 파일에서 직접 import 가능
- [ ] Promise와 React Hooks API 모두 지원
- [ ] Suspense와 에러 바운더리 완전 지원
- [ ] 타입 안정성 보장
- [ ] 성능 최적화 (캐싱, 중복 요청 방지)
