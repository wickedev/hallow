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

### Phase 2: Demo 프로젝트 및 SWC 플러그인 개발 🚀
- [x] Demo 프로젝트 구조 설정
- [x] 샘플 .proto 파일 작성 (greeting.proto, user.proto, chat.proto)
- [x] React 컴포넌트 구조 설정 (GreetingDemo, UserDemo, ChatDemo)
- [x] Vite + React + TypeScript 환경 구성
- [x] 모노레포 workspace 통합
- [ ] **현재 작업**: SWC 플러그인 프로젝트 설정 (packages/swc-plugin)
- [ ] SWC 플러그인에서 .proto import 감지 로직
- [ ] Protocol Buffer 파싱 로직을 Rust로 포팅
- [ ] TypeScript 스텁 클래스 AST 생성 및 코드 교체
- [ ] Vite와 SWC 플러그인 통합
- [ ] Demo 프로젝트에서 실제 .proto import 동작 검증

### Phase 3: React 통합 및 고급 기능
- [ ] React hooks 생성 로직 (SWC 플러그인 내)
- [ ] Suspense 지원 구현
- [ ] 캐싱 메커니즘
- [ ] 에러 바운더리 지원  
- [ ] 중복 요청 방지
- [ ] 스트리밍 지원 (Server-Sent Events)

### Phase 4: 최적화 및 완성
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
1. **개발자가 코드 작성**: `import { GreetingStub } from './greeting.proto'`
2. **SWC 플러그인 감지**: 빌드 시 .proto import 구문 탐지
3. **실시간 코드 생성**: .proto 파일 파싱 → AST 생성 → TypeScript 코드 교체
4. **타입 체크**: 생성된 코드가 TypeScript 컴파일러를 통과

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

1. **SWC 플러그인 코드 생성**: .proto → TypeScript AST 변환의 신뢰성
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

**Phase 2 현재 작업:**
1. ✅ `packages/demo` 프로젝트 설정 완료
2. ✅ 샘플 .proto 파일 작성 완료
3. ✅ React 컴포넌트 구조 설정 완료
4. **🚀 진행 중**: SWC 플러그인 프로젝트 설정 (`packages/swc-plugin`)

**다음 우선 작업:**
1. SWC 플러그인 Rust 프로젝트 초기 설정
   - Cargo.toml 의존성 설정
   - SWC visitor 패턴 기본 구조
   - .proto import 감지 로직
2. Protocol Buffer 파싱 로직을 TypeScript에서 Rust로 포팅
3. AST 변환 및 TypeScript 코드 생성 로직
4. Vite와 SWC 플러그인 통합
5. Demo 프로젝트에서 실제 동작 검증

**데모 프로젝트 현재 상태:**
- `packages/demo/src/protos/`: 3개 서비스 정의 완료
- `packages/demo/src/components/`: 모든 데모 컴포넌트 구현 완료
- TODO 주석으로 SWC 플러그인 통합 지점 표시
- Mock 데이터로 UI/UX 검증 가능한 상태