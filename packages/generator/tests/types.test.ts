import { GenerationError, GenerationErrorCode } from '../src/core';

describe('GenerationError', () => {
  it('should create error with message and code', () => {
    const error = new GenerationError(
      'Test error',
      GenerationErrorCode.INVALID_PROTO
    );
    
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(GenerationErrorCode.INVALID_PROTO);
    expect(error.name).toBe('GenerationError');
    expect(error.details).toBeUndefined();
  });
  
  it('should create error with details', () => {
    const details = { field: 'test', value: 123 };
    const error = new GenerationError(
      'Test error with details',
      GenerationErrorCode.TYPE_MAPPING_ERROR,
      details
    );
    
    expect(error.details).toEqual(details);
  });
  
  it('should be instanceof Error', () => {
    const error = new GenerationError(
      'Test error',
      GenerationErrorCode.TEMPLATE_NOT_FOUND
    );
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(GenerationError);
  });
});