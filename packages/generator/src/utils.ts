import {
  MemoryEmitResultFile,
  Project,
  ScriptTarget,
  StatementStructures,
  WriterFunction,
} from "ts-morph";

export function stripIndent(s: string): string {
  return s.replace(/^\s+/gm, "");
}

export function createMemoryFiles(
  statements:
    | (string | WriterFunction | StatementStructures)[]
    | string
    | WriterFunction
): MemoryEmitResultFile[] {
  const project = new Project({
    compilerOptions: {
      outDir: "dist",
      declaration: true,
      target: ScriptTarget.ESNext,
    },
  });

  project.createSourceFile("result.ts", {
    statements,
  });

  const result = project.emitToMemory();

  return result.getFiles();
}
