# grpcurl Hang 문제 해결

## 문제 설명
`grpcurl -plaintext localhost:50051 list` 명령 실행 시 정상적으로 결과를 출력하지만 프로세스가 종료되지 않고 hang되는 현상

## 원인
- NestJS gRPC Reflection API와 grpcurl 간의 스트림 종료 시그널 처리 문제
- `nestjs-grpc-reflection` 패키지가 reflection 응답 후 스트림을 올바르게 종료하지 않음

## ✅ 해결됨: @grpc/reflection 패키지 사용
Option 2를 통해 문제를 완전히 해결했습니다. `@grpc/reflection` 패키지를 사용하여 grpcurl이 정상적으로 종료되도록 수정했습니다.

## 임시 해결책

### 1. Timeout과 함께 사용
```bash
# macOS (gtimeout 설치 필요: brew install coreutils)
gtimeout 2 grpcurl -plaintext localhost:50051 list

# Linux
timeout 2 grpcurl -plaintext localhost:50051 list
```

### 2. 백그라운드 실행 후 종료
```bash
grpcurl -plaintext localhost:50051 list &
PID=$!
sleep 1
kill $PID 2>/dev/null
```

### 3. 파이프와 함께 사용
```bash
echo "" | grpcurl -plaintext localhost:50051 list
```

### 4. 스크립트에서 사용
```bash
#!/bin/bash
grpcurl -plaintext localhost:50051 list &
GRPC_PID=$!
sleep 1
kill $GRPC_PID 2>/dev/null
wait $GRPC_PID 2>/dev/null
```

## 영구 해결책 (서버 수정) - ✅ 해결됨!

### ~~Option 1: 커스텀 Reflection 구현~~
~~reflection을 직접 구현하여 스트림 종료를 올바르게 처리~~

### ✅ Option 2: 다른 Reflection 패키지 사용 (성공적으로 구현됨)
- `@grpc/reflection` 직접 사용으로 해결
- 수동으로 reflection 서비스 구현

#### 구현 방법:

1. **패키지 설치:**
```bash
yarn add @grpc/reflection
yarn remove nestjs-grpc-reflection
```

2. **main.ts 수정:**
```typescript
import { ReflectionService } from '@grpc/reflection';

const grpcOptionsWithReflection: MicroserviceOptions = {
  ...grpcClientOptions,
  options: {
    ...grpcClientOptions.options,
    onLoadPackageDefinition: (pkg, server) => {
      // Add reflection service to the gRPC server
      new ReflectionService(pkg).addToServer(server);
    },
  },
};

app.connectMicroservice<MicroserviceOptions>(grpcOptionsWithReflection);
```

3. **app.module.ts 정리:**
- nestjs-grpc-reflection 관련 코드 제거
- GrpcReflectionModule 임포트 제거

#### 테스트 결과:
```bash
# 모든 명령이 정상적으로 종료됨 (exit code 0)
grpcurl -plaintext localhost:50051 list
grpcurl -plaintext localhost:50051 describe test.services.UserService
grpcurl -plaintext -d '{"user_id": "user-1"}' localhost:50051 test.services.UserService/GetUser
```

### Option 3: grpcurl 대안 사용
- `evans`: 인터랙티브 gRPC 클라이언트
- `grpc_cli`: Google의 공식 gRPC CLI
- `bloomrpc`: GUI 기반 gRPC 클라이언트

## 테스트 방법

### 서비스 목록 확인 (timeout 사용)
```bash
gtimeout 2 grpcurl -plaintext localhost:50051 list
```

### 서비스 설명 확인
```bash
gtimeout 2 grpcurl -plaintext localhost:50051 describe test.services.UserService
```

### RPC 호출 (정상 동작)
```bash
# Unary RPC는 정상적으로 종료됨
grpcurl -plaintext -d '{"id": "123"}' localhost:50051 test.services.UserService/GetUser
```

## 참고사항
- 이 문제는 reflection API의 `list` 명령에서만 발생
- 일반적인 RPC 호출은 정상적으로 종료됨
- 실제 gRPC 통신에는 영향 없음
- 개발 환경에서의 불편함만 존재

## 관련 이슈
- https://github.com/fullstorydev/grpcurl/issues
- https://github.com/nestjs/nest/issues