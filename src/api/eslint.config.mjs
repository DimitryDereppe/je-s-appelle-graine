import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist/**", "node_modules/**"]), // fichiers générés
  js.configs.recommended, // règles JavaScript recommandées
  tseslint.configs.recommended, // + TypeScript (variables inutilisées, any...)
  { languageOptions: { globals: globals.node } }, // process, console... connus
]);
