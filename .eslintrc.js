module.exports = {
    env: {
        es6: true,
        node: true,
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaVersion: 2018,
    },
    rules: {
        "no-unused-vars": ["warn"],
        indent: ["error", 4, { SwitchCase: 1 }],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        semi: ["error", "always"],
    },
};
