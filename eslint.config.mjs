import eslint from "@eslint/js";
import eslintPluginNext from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginTailwindcss from "eslint-plugin-tailwindcss";
import eslintUnusedImportsPlugin from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["node_modules", ".next"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ["./tsconfig.lint.json"],
      },
    },
  },
  eslintConfigPrettier,
  {
    files: ["**/*.tsx", "**/*.ts"],
    ignores: [".next"],
    plugins: {
      react: eslintPluginReact,
      "react-hooks": eslintPluginReactHooks,
      "@next/next": eslintPluginNext,
      "unused-imports": eslintUnusedImportsPlugin,
      "simple-import-sort": eslintPluginSimpleImportSort,
      tailwindcss: eslintPluginTailwindcss,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...eslintConfigPrettier.rules,
      ...eslintPluginNext.configs.recommended.rules,
      ...eslintPluginNext.configs["core-web-vitals"].rules,
      ...eslintPluginReact.configs["jsx-runtime"].rules,
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginTailwindcss.configs.recommended.rules,
      "import/extensions": "off", // Avoid missing file extension errors, TypeScript already provides a similar feature
      "react/function-component-definition": "off", // Disable Airbnb's specific function type
      "react/destructuring-assignment": "off", // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
      "react/require-default-props": "off", // Allow non-defined react props as undefined
      "react/jsx-props-no-spreading": "off", // _app.tsx uses spread operator and also, react-hook-form
      "@typescript-eslint/comma-dangle": "off", // Avoid conflict rule between Eslint and Prettier
      "@typescript-eslint/consistent-type-imports": "error", // Ensure `import type` is used when it's necessary
      "no-restricted-syntax": [
        "error",
        "ForInStatement",
        "LabeledStatement",
        "WithStatement",
      ], // Overrides Airbnb configuration and enable no-restricted-syntax
      "import/prefer-default-export": "off", // Named export is easier to refactor automatically
      "simple-import-sort/imports": "error", // Import configuration for `eslint-plugin-simple-import-sort`
      "simple-import-sort/exports": "error", // Export configuration for `eslint-plugin-simple-import-sort`
      "import/order": "off", // Avoid conflict rule between `eslint-plugin-import` and `eslint-plugin-simple-import-sort`
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
    settings: {
      react: {
        version: "detect", // You can add this if you get a warning about the React version when you lint
      },
    },
  },
);
