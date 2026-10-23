const config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  // `.kilo/worktrees/` contains full copies of this project for agent
  // workspaces. Jest was discovering their duplicate test files and running
  // them against stale sources, producing failures that had nothing to do
  // with the working tree (e.g. tests for a deleted `getCompressedExtension`).
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/.kilo/",
    "<rootDir>/.next/",
  ],
  modulePathIgnorePatterns: ["<rootDir>/.kilo/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/src/__mocks__/fileMock.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default config;