import {
  MemoryEmitResultFile,
  Project,
  ScriptTarget,
  StatementStructures,
  WriterFunction,
} from "ts-morph";

export function stripSpace(s: string): string {
  return s.replace(/^\s+/gm, "");
}

export function stripIndent(s: string, indent: number = 0): string {
  const firstLineIndenet = s.match(/\n\s+/);

  const removeSize = (firstLineIndenet?.toString().length || 0) - 1;

  if (removeSize === 0) {
    return s;
  }

  return s.replace(RegExp(`\\n\\s{${removeSize - indent}}`, "gm"), "\n");
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
