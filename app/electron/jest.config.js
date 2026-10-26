// Unit tests mock native Electron APIs; no desktop process is required.
module.exports = {
  transform: {
    "^.+\\.tsx?$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          "@babel/preset-typescript",
        ],
      },
    ],
  },
  modulePathIgnorePatterns: ["build"],
  testEnvironment: "node",
  verbose: true,
};
