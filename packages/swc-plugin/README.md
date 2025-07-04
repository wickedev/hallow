# Hallow SWC Plugin

SWC 플러그인으로 `.proto` 파일에서 직접 import하여 TypeScript 스텁을 생성합니다.

## 현재 상태

- ✅ 기본 프로젝트 구조 생성
- ✅ 설정 시스템 구현
- ✅ 기본 테스트 작성
- ⏳ SWC 종속성 (Rust 1.82+ 필요)

## 요구사항

- Rust 1.82+ (현재 시스템: 1.79.0)
- SWC core dependencies

## 사용법 (예정)

```tsx
// 이 코드가 작동하도록 하는 것이 목표
import { GreetingStub } from './greeting.proto'

const client = new Client({ baseURL: "/api" })
const greeter = new GreetingStub(client)
const response = await greeter.greeting()
```

## 개발 노트

현재는 Rust 버전 제약으로 SWC 종속성을 사용할 수 없습니다. 
Rust를 1.82+로 업그레이드한 후 다음 종속성을 추가해야 합니다:

```toml
swc_core = { version = "0.80", features = ["ecma_plugin_transform"] }
```