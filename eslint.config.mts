import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["**/test/**", "**/performance-test/**"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  tseslint.configs.recommended,
  // TODO: The following rule is disabled temporarily. All usages of `any` need to be carefully
  // reviewed and proper alternatives (e.g. `unknown`, specific types, generics) need to be evaluated.
  { rules: { "@typescript-eslint/no-explicit-any": "off" } },
]);
