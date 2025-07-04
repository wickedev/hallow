# Hallow SWC Plugin

SWC 플러그인으로 `.proto` 파일을 직접 import할 수 있게 해주는 TypeScript 변환 도구입니다.

## 현재 상태

**⚠️ Rust 버전 호환성 문제**

현재 SWC 플러그인 개발에는 Rust 1.82+ 버전이 필요하지만, 시스템에 설치된 Rust 버전은 1.79.0입니다.

### 구현 완료된 기능

1. **기본 SWC 플러그인 구조** ✅
   - Plugin transform 매크로 설정
   - Config 구조체 및 deserialization
   - VisitMut 트레이트 구현

2. **Proto Import 감지 로직** ✅
   - `.proto` 파일 import 구문 감지
   - Import specifier 파싱
   - 변환 대상 선별

3. **Protocol Buffer 파서** ✅
   - 정규식 기반 .proto 파일 파싱
   - Service 및 Method 정의 추출
   - Message 및 Field 정의 추출
   - 스트리밍 타입 지원

4. **TypeScript 코드 생성기** ✅
   - SWC AST 기반 클래스 생성
   - Service 메서드 생성
   - React Hooks 메서드 생성
   - Promise 기반 API 생성

### 다음 단계

1. **Rust 버전 업그레이드**
   ```bash
   rustup update stable
   ```

2. **의존성 호환성 해결**
   - SWC 0.80+ 버전 사용
   - protobuf 3.4+ 버전 사용

3. **빌드 테스트**
   ```bash
   cargo build --release
   ```

4. **Vite 통합**
   - Demo 프로젝트에서 플러그인 설정
   - 실제 변환 동작 검증

## 아키텍처

```rust
// 1. Import 감지
import { GreetingStub } from './greeting.proto'

// 2. Proto 파일 파싱
service GreetingService {
  rpc Greeting(GreetingRequest) returns (GreetingResponse);
}

// 3. TypeScript 클래스 생성
class GreetingStub {
  constructor(private client: Client) {}
  async greeting(request: any): Promise<any> {
    return await this.client.invoke('/Service/Greeting', request);
  }
  createHooks() {
    return {
      useGreeting: (params: any) => this.greeting(params)
    };
  }
}
```

## 파일 구조

```
src/
├── lib.rs              # 메인 플러그인 엔트리포인트
├── proto_parser.rs     # Protocol Buffer 파싱 로직
└── code_generator.rs   # TypeScript AST 생성 로직
```

## 테스트

```bash
cargo test
```

## 사용법 (예정)

Vite 설정에서 플러그인 활성화:

```javascript
// vite.config.ts
export default {
  plugins: [
    swc({
      plugins: [
        ['hallow-swc-plugin', { enabled: true }]
      ]
    })
  ]
}
```