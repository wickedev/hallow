# Architecture

- Unplugin을 사용하여 Vite, Webpack, ESBuild 와 같이 다양한 빌드 시스템에 통합 가능합니다.
- `import { GreetingStub } from './greeting.proto'` 와 같은 모듈 import를 typescript 모듈처럼 간주하기 위해 `greeting.proto` 파일을 읽고 generator에 내용을 전달해 타입 세이프한 typescript 코드 생성 및 반환합니다.

# Components

## Parser (Protobuf 3)

- Protobuf 파싱을 위해 antlr4ts를 사용
- https://github.com/antlr/grammars-v4/blob/master/protobuf3/Protobuf3.g4 사용

## Generator

- parser 컴포넌트를 사용하여 `.proto` 파일을 순회하며 gRPC Stub에 해당하는 코드를 생성
- `google-protobuf` 라이브러리를 사용하여 런타임 protobuf 바이너리 직렬화/역직렬화를 수행

## Client (gRPC Web)

- `import { Client } from "@hallow/grpc-web"` 와 같이 실제 요청을 보내는 gRPC 클라이언트
- `@improbable-eng/grpc-web`를 사용하여 서버와 grpc-web 요청/응답을 수행

## React (Core)

- React Hook, Suspense 통합을 위해 필요한 공통 코드들
- Generator에서 생성된 코드 중 반복적으로 사용되지만 재사용 가능한 부분들

## Unplugin

- 사용자 빌드 시스템에 통합되기 위한 Unplugin 플러그인

## Example

- README.md에 적힌대로 실제 동작하는 예시를 보여주기 위한 프로젝트
- gRPC Web 프로토콜을 지원하는 예제 서버 포함

# Tools

- yarn workspace를 사용하여 모노레포를 구성
- 테스트를 위해 jest, ts-morph를 사용
- rollup을 사용해 빌드
