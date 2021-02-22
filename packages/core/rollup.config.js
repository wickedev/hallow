import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-ts";
import excludeDependenciesFromBundle from "rollup-plugin-exclude-dependencies-from-bundle";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
  ],
  plugins: [
    typescript(),
    excludeDependenciesFromBundle({ peerDependencies: pkg.peerDependencies }),
    nodeResolve({
      mainFields: ["ts", "module", "main"],
    }),
  ],
};
