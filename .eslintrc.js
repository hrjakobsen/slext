module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    rules: {
        "@typescript-eslint/no-unused-vars": ["error", { args: "all", argsIgnorePattern: "^_" }],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
    },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
    env: {
        node: true,
    },
};
