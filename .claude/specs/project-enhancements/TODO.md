# 📋 TODO List

> 코드베이스 전반의 TODO 항목, 기술 부채, 개선 계획을 추적하는 문서입니다.

**마지막 업데이트**: 2025-10-27

## 📑 목차

- [개요](#개요)
- [우선순위별 요약](#우선순위별-요약)
- [Critical TODOs](#critical-todos)
- [Feature Implementation](#feature-implementation-todos)
- [Documentation & Code Quality](#documentation--code-quality)
- [Test & Integration](#test--integration-todos)
- [Spec-Related](#spec-related-todos)
- [패키지별 요약](#패키지별-요약)
- [기여 가이드](#기여-가이드)
- [다음 단계](#다음-단계)

---

## 📊 개요

| 통계 | 개수 |
|------|------|
| 전체 TODO 항목 | 13개 |
| 우선순위: 높음 | 4개 |
| 우선순위: 중간 | 4개 |
| 우선순위: 낮음 | 5개 |
| 예상 총 작업 시간 | 60-90 시간 |

---

## 🎯 우선순위별 요약

### 🔴 High Priority (4개)

| # | 제목 | 파일 | 예상 시간 |
|---|------|------|----------|
| 1 | Version Management | `generator.ts:180` | 1시간 |
| 2 | Proto File Validation | `generator.ts:491` | 4-6시간 |
| 9 | Integration Test Requirements | `grpc-web-integration.test.ts:39` | - |
| 12 | Native gRPC Migration | `specs/TODO-native-grpc.md` | 40-60시간 |

### 🟡 Medium Priority (4개)

| # | 제목 | 파일 | 예상 시간 |
|---|------|------|----------|
| 3 | Streaming Method Implementation | `EnhancedServiceGenerator.ts:280` | 8-12시간 |
| 4 | Message/Enum Chunked Generation | `generator.ts:204` | 6-8시간 |
| 5 | Standalone Enum Generation | `generator.ts:281` | 4-6시간 |
| 13 | Remove Debug Code & TODOs | `IMPLEMENTATION_WORKFLOW.md:708` | - |

### 🟢 Low Priority (5개)

| # | 제목 | 파일 | 예상 시간 |
|---|------|------|----------|
| 6 | Type Documentation | `NameResolver.ts:8` | - |
| 7 | Import Manager Improvement | `ReactHookGenerator.ts:385` | 2-3시간 |
| 8 | Unused Import Cleanup | `MessageGenerator.ts:17` | 15분 |
| 10 | Server Behavior Documentation | `grpc-web-integration.test.ts` | - |
| 11 | Generator Processing Documentation | `complete-workflow.test.ts:879` | - |

---

## 🔴 Critical TODOs

### 1. 📦 Version Management

| | |
|---|---|
| **Priority** | 🔴 High |
| **File** | `packages/generator/src/core/generator.ts:180` |
| **Estimated** | 1 hour |

**Description**: Get generator version from package.json instead of hardcoding

```typescript
generatorVersion: '0.1.0', // TODO: Get from package.json
```

**Impact**:
- ✅ Version tracking accuracy
- ✅ Automatic version synchronization

---

### 2. ✅ Proto File Validation

| | |
|---|---|
| **Priority** | 🔴 High |
| **File** | `packages/generator/src/core/generator.ts:491` |
| **Estimated** | 4-6 hours |

**Description**: Add comprehensive validation for proto files

```typescript
private validateProtoFile(protoFile: ProtoFile): void {
  if (!protoFile) {
    throw new GenerationError('Proto file is required', GenerationErrorCode.INVALID_PROTO);
  }
  // TODO: Add more validation
}
```

**Validation needed**:
- Package name format
- Service name uniqueness
- Message field types
- Enum value uniqueness
- Import path validity
- Circular dependency detection

**Impact**:
- ✅ Code generation reliability
- ✅ Early error detection
- ✅ Better developer experience

---

## 🟡 Feature Implementation TODOs

### 3. 🌊 Streaming Method Implementation

| | |
|---|---|
| **Priority** | 🟡 Medium |
| **File** | `packages/generator/src/generators/EnhancedServiceGenerator.ts:280` |
| **Estimated** | 8-12 hours |

**Description**: Complete implementation of streaming methods

```typescript
private generateStreamingMethod(method: ProcessedMethod): string {
  // TODO: Implement streaming method ${method.camelName}
}
```

**Current Status**: Placeholder implementation exists
**Dependencies**:
- gRPC-web streaming adapter
- AsyncIterable integration
- Error handling patterns

**Impact**:
- ✅ Full streaming support for all gRPC patterns
- ✅ Unblocks advanced use cases

**Related Spec**: `.claude/specs/generator-gap/TODO-native-grpc.md`

---

### 4. 💾 Message and Enum Generation in Chunked Mode

| | |
|---|---|
| **Priority** | 🟡 Medium |
| **File** | `packages/generator/src/core/generator.ts:204` |
| **Estimated** | 6-8 hours |

**Description**: Handle messages and enums in memory-efficient chunked generation

```typescript
for await (const chunk of this.memoryEfficientGenerator.generateInChunks(
  protoFile,
  async (items, type) => {
    if (type === 'service') {
      return await this.serviceGenerator.generateStubs({...});
    }
    // TODO: Handle messages and enums
    return [];
  },
)) {
  files.push(...chunk);
}
```

**Impact**:
- ✅ Memory efficiency for large proto files
- ✅ Better performance at scale

---

### 5. 🔢 Standalone Enum Generation

| | |
|---|---|
| **Priority** | 🟡 Medium |
| **File** | `packages/generator/src/core/generator.ts:281` |
| **Estimated** | 4-6 hours |

**Description**: Generate enum types for standalone enums (not nested in messages)

```typescript
// TODO: Generate enum types (standalone enums, not nested in messages)
```

**Current Behavior**: Only nested enums are generated

**Impact**:
- ✅ Support for top-level enum definitions
- ✅ Better proto file compatibility

---

## 🟢 Documentation & Code Quality

### 6. 📝 Type Documentation

| | |
|---|---|
| **Priority** | 🟢 Low |
| **File** | `packages/generator/src/utils/NameResolver.ts:8` |
| **Estimated** | - |

**Note**: Types reserved for future use

```typescript
// Note: These types might be used in future implementations
```

**Action Required**: Document intended use cases or remove if not needed

---

### 7. 📦 Import Manager Improvement

| | |
|---|---|
| **Priority** | 🟢 Low |
| **File** | `packages/generator/src/generators/ReactHookGenerator.ts:385` |
| **Estimated** | 2-3 hours |

**Note**: Manual import building due to internal structure

```typescript
// Note: ImportManager's internal structure is not exposed, so we'll build manually
```

**Improvement**: Expose ImportManager API or refactor approach

---

### 8. 🧹 Unused Import Cleanup

| | |
|---|---|
| **Priority** | 🟢 Low |
| **File** | `packages/generator/src/generators/MessageGenerator.ts:17` |
| **Estimated** | 15 minutes |

**Note**: Remove unused imports

```typescript
// Note: GenerationError and GenerationErrorCode are imported but not used directly
```

**Impact**:
- ✅ Code cleanliness
- ✅ Reduced bundle size

---

## 🧪 Test & Integration TODOs

### 9. 🔧 Integration Test Requirements

| | |
|---|---|
| **Priority** | 🔴 High |
| **File** | `packages/generator/tests/integration/grpc-web-integration.test.ts:39` |
| **Estimated** | - |

**Description**: Document test prerequisites

```typescript
/**
 * Note: These tests are currently skipped because they require:
 * - Running gRPC server
 * - Network connectivity
 * - Proper Envoy proxy configuration
 */
```

**Action Required**: Set up automated test infrastructure
**Related Files**: `packages/test-server/`

---

### 10. 📖 Server Behavior Documentation

| | |
|---|---|
| **Priority** | 🟢 Low |
| **Files** | Multiple test files |
| **Estimated** | - |

**Files**:
- `packages/generator/tests/integration/grpc-web-integration.test.ts:297`
- `packages/generator/tests/integration/grpc-web-integration.test.ts:459`
- `packages/generator/tests/integration/grpc-web-integration.test.ts:473`

**Description**: Document expected server behaviors and edge cases

**Topics**:
- Invalid pageSize handling
- Trailer access patterns
- Error response formats

---

### 11. 📄 Generator Processing Documentation

| | |
|---|---|
| **Priority** | 🟢 Low |
| **File** | `packages/generator/tests/integration/complete-workflow.test.ts:879` |
| **Estimated** | - |

**Description**: Document current generator processing limitations

```typescript
// Note: This test reveals that the generator currently only processes...
```

**Action Required**: Complete documentation and add test coverage

---

## 📋 Spec-Related TODOs

### 12. 🚀 Native gRPC Migration

| | |
|---|---|
| **Priority** | 🔴 High |
| **File** | `.claude/specs/generator-gap/TODO-native-grpc.md` |
| **Estimated** | 40-60 hours |

**Description**: Complete migration from grpc-web to native @grpc/grpc-js

**Phases**:
1. Spike & Research
2. Core Adapter Development
3. Service Template Integration
4. React Hooks Integration
5. Testing & Validation
6. Migration & Cleanup

**Status**: 📝 Documented, pending implementation

---

### 13. 🧹 Remove Debug Code & TODOs

| | |
|---|---|
| **Priority** | 🟡 Medium |
| **File** | `.claude/specs/generator-gap/IMPLEMENTATION_WORKFLOW.md:708` |
| **Estimated** | - |

**Description**: Task 5.3 - Clean up debug code and replace TODOs

**Checklist**:
- [ ] Remove console.log statements
- [ ] Replace TODOs with implementations
- [ ] Clean up commented code
- [ ] Update error messages
- [ ] Document remaining limitations

---

## 📦 패키지별 요약

| 패키지 | 파일 | TODO 개수 | 내용 |
|--------|------|-----------|------|
| `generator/src/core/` | generator.ts | 4 | version, validation, messages/enums, standalone enums |
| `generator/src/generators/` | EnhancedServiceGenerator.ts | 1 | streaming methods |
| `generator/src/generators/` | MessageGenerator.ts | 1 | unused imports |
| `generator/src/generators/` | ReactHookGenerator.ts | 1 | ImportManager |
| `generator/src/utils/` | NameResolver.ts | 1 | future types |
| `generator/tests/` | integration tests | 5 | server behavior, test requirements |
| `.claude/specs/` | TODO-native-grpc.md | 1 | Native gRPC migration plan |
| `.claude/specs/` | IMPLEMENTATION_WORKFLOW.md | 1 | Implementation workflow tasks |

---

## 🤝 기여 가이드

TODO 작업 시 체크리스트:

- [ ] 이 문서를 업데이트하여 진행 상태 표시
- [ ] 새로운 구현에 대한 테스트 커버리지 추가
- [ ] 관련 스펙 문서 참조 및 업데이트
- [ ] 구현 결정 사항을 문서화
- [ ] TODO 주석을 실제 구현으로 대체
- [ ] 코드 리뷰 요청 전에 포맷팅 확인 (`yarn format`)

---

## 🎯 다음 단계

### 🚀 즉시 실행 (Quick Wins)

1. **Version Management** - `generator.ts:180`
   - ⏱️ 1시간
   - ✅ package.json에서 버전 자동 로드
   - 💡 시작하기 좋은 첫 번째 작업

2. **Unused Import Cleanup** - `MessageGenerator.ts:17`
   - ⏱️ 15분
   - ✅ 불필요한 import 제거
   - 💡 빠른 코드 정리

### 📈 단기 목표 (1-2주)

1. **Proto File Validation** - 4-6시간
   - 안정성 향상
   - 에러 조기 발견

2. **Standalone Enum Generation** - 4-6시간
   - proto 파일 호환성 개선
   - 기능 완성도 향상

### 🎯 중기 목표 (1-2개월)

1. **Streaming Method Implementation** - 8-12시간
   - 전체 스트리밍 지원
   - 고급 사용 사례 지원

2. **Message/Enum Chunked Generation** - 6-8시간
   - 대용량 파일 처리 성능 개선
   - 메모리 효율성 향상

### 🚀 장기 목표 (3-6개월)

1. **Native gRPC Migration** - 40-60시간
   - @grpc/grpc-js로 완전 마이그레이션
   - 성능 및 안정성 대폭 개선
   - 최신 gRPC 기능 지원

2. **Comprehensive Test Infrastructure**
   - 자동화된 통합 테스트
   - CI/CD 파이프라인 개선
   - 테스트 커버리지 90% 이상

3. **Code Cleanup and Optimization**
   - 기술 부채 해소
   - 코드 품질 개선
   - 문서화 완성

---

## 📌 참고 사항

- 작업 시작 전에 이 문서를 확인하세요
- 우선순위가 높은 항목부터 처리하는 것을 권장합니다
- 질문이나 제안사항은 이슈로 등록해주세요
- 정기적으로 문서를 업데이트하여 최신 상태를 유지합니다
