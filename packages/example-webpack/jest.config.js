module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',

  // Set test environment to jsdom for DOM testing
  testEnvironment: 'jsdom',

  // Root directory for tests
  roots: ['<rootDir>/src', '<rootDir>/server/src'],

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.ts?(x)',
    '**/__tests__/**/*.spec.ts?(x)',
  ],

  // Module name mapper for non-JS imports
  moduleNameMapper: {
    // CSS imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Proto file imports - mock with our test utilities
    '\\.proto$': '<rootDir>/src/__tests__/mocks/proto-mock.ts',

    // Path aliases from tsconfig
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Setup files to run after Jest is initialized
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'server/src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/index.tsx',
  ],

  // Coverage thresholds
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Transform configuration
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/.cache/'],

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Verbose output
  verbose: true,
};
