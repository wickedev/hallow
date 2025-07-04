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
  /core           # TypeScript - 런타임 라이브러리 (기존)
  /swc-plugin     # Rust crate - SWC 플러그인 (기존)
  /demo           # Demo 프로젝트 - 실제 사용 예시
  /codegen        # TypeScript - 코드 생성 유틸리티
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

### Phase 1: 기본 인프라 구축 ✅
- [x] Rust SWC 플러그인 스켈레톤 생성
- [x] TypeScript 런타임 라이브러리 기본 구조 설정
- [x] 프로토콜 버퍼 파서 (기본적인 service 정의 읽기)
- [x] 모노레포 구조 설정 (pnpm workspace)
- [x] 기본 빌드 및 테스트 환경 구성

### Phase 2: Demo 프로젝트 및 코드 생성 🚀
- [ ] Demo 프로젝트 구조 설정
- [ ] 샘플 .proto 파일 작성
- [ ] 코드 생성 CLI 도구 개발
- [ ] TypeScript 스텁 클래스 생성 로직
- [ ] Promise 기반 API 구현
- [ ] 기본 빌드 파이프라인 연동
- [ ] 수동 코드 생성으로 동작 검증

### Phase 3: SWC 플러그인 통합
- [ ] SWC 플러그인에서 .proto import 감지
- [ ] 런타임에 코드 생성 호출
- [ ] AST 변환으로 import 구문 교체
- [ ] 타입 정의 생성 및 통합
- [ ] 에러 처리 강화

### Phase 4: React 통합
- [ ] React hooks 생성 로직
- [ ] Suspense 지원 구현
- [ ] 캐싱 메커니즘
- [ ] 에러 바운더리 지원
- [ ] 중복 요청 방지

### Phase 5: 최적화 및 완성
- [ ] 성능 최적화
- [ ] 타입 안정성 강화
- [ ] 종합 테스트 스위트
- [ ] 문서화 (API 문서, 예제)
- [ ] 패키지 배포 준비

## Demo 프로젝트 계획

### 구조
```
/packages/demo
├── src/
│   ├── protos/
│   │   ├── greeting.proto      # 샘플 gRPC 서비스 정의
│   │   └── user.proto          # 추가 서비스 예시
│   ├── components/
│   │   ├── GreetingDemo.tsx    # Promise API 사용 예시
│   │   ├── UserDemo.tsx        # React Hooks API 사용 예시
│   │   └── App.tsx             # 메인 앱
│   ├── generated/              # 생성된 스텁 클래스들
│   │   ├── greeting.ts
│   │   └── user.ts
│   └── main.tsx                # 앱 엔트리포인트
├── package.json
├── vite.config.ts              # Vite 설정
└── tsconfig.json
```

### 개발 워크플로우
1. **수동 코드 생성**: CLI 도구로 .proto → TypeScript 스텁 생성
2. **빌드 통합**: Vite/SWC 플러그인으로 자동 변환
3. **실시간 개발**: 파일 변경시 자동 재생성

### 샘플 서비스들
- **GreetingService**: 기본 요청/응답 패턴
- **UserService**: CRUD 패턴, 스트리밍 지원
- **ChatService**: 실시간 메시징 (양방향 스트리밍)

## 기술 스택

- **SWC 플러그인**: Rust
- **런타임**: TypeScript
- **gRPC-web**: @improbable-eng/grpc-web
- **Protobuf**: google-protobuf
- **React**: React 18+ (Suspense 지원)
- **빌드 도구**: SWC, TypeScript, Vite
- **테스트**: Jest, React Testing Library, Playwright
- **Demo**: Vite + React + TypeScript

## 주요 도전 과제

1. **코드 생성 파이프라인**: .proto → TypeScript 변환의 신뢰성
2. **SWC 플러그인 복잡성**: AST 변환 및 코드 생성의 복잡성
3. **프로토콜 버퍼 파싱**: 완전한 .proto 파일 지원
4. **React Suspense 통합**: 올바른 데이터 페칭 패턴 구현
5. **타입 안정성**: 생성된 코드의 TypeScript 타입 정확성
6. **개발자 경험**: 빌드 도구 통합 및 핫 리로드 지원

## 성공 지표

- [ ] Demo 프로젝트에서 .proto 파일에서 직접 import 가능
- [ ] Promise와 React Hooks API 모두 정상 동작
- [ ] Suspense와 에러 바운더리 완전 지원
- [ ] 타입 안정성 보장 (TypeScript 오류 없음)
- [ ] 개발 시 핫 리로드 지원
- [ ] 성능 최적화 (캐싱, 중복 요청 방지)

## 다음 단계

**Phase 2 우선 작업:**
1. `packages/demo` 프로젝트 설정
2. 샘플 .proto 파일 작성
3. 코드 생성 CLI 도구 개발
4. 수동 워크플로우로 동작 검증
5. Vite 빌드 파이프라인 통합