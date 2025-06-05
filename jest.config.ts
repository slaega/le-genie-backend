module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^#dto/(.*)$': '<rootDir>/src/shared/dto/$1',
        '^#config/(.*)$': '<rootDir>/src/shared/config/$1',
        '^#use-cases/(.*)$': '<rootDir>/src/applications/use-cases/$1',
        '^#infra/(.*)$': '<rootDir>/src/infra/$1',
        '^#shared/(.*)$': '<rootDir>/src/shared/$1',
        '^#domain/(.*)$': '<rootDir>/src/domain/$1',
        '^#applications/(.*)$': '<rootDir>/src/applications/$1',
        '^#framework/(.*)$': '<rootDir>/src/infra/framework/$1',
        '^#percistences/(.*)$': '<rootDir>/src/infra/percistences/$1',
        '^#core/(.*)$': '<rootDir>/src/core/$1',
    },
};
