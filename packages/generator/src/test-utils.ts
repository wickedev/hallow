import fs from "fs";
import {
  MessageBlockContext,
  ProtoVisitor,
  ServiceBlockContext,
} from "@hallow/parser";
import {
  IndentationText,
  MemoryEmitResultFile,
  Project,
  ScriptTarget,
  SourceFileStructure,
  StatementStructures,
  WriterFunction,
} from "ts-morph";

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

export class MessageVisitor<T> extends ProtoVisitor<T[]> {
  private statements: T[] = [];

  constructor(private readonly transfomer: (ctx: MessageBlockContext) => T) {
    super();
  }

  protected defaultResult(): T[] {
    return this.statements;
  }
  visitMessageBlock(ctx: MessageBlockContext): T[] {
    const result = this.transfomer(ctx);
    this.statements.push(result);
    return this.statements;
  }
}

export class ServiceVisitor<T> extends ProtoVisitor<T[]> {
  private statements: T[] = [];

  constructor(private readonly transfomer: (ctx: ServiceBlockContext) => T) {
    super();
  }

  protected defaultResult(): T[] {
    return this.statements;
  }
  visitServiceBlock(ctx: ServiceBlockContext): T[] {
    const result = this.transfomer(ctx);
    this.statements.push(result);
    return this.statements;
  }
}

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

export function toStructure(
  statement: StatementStructures
): SourceFileStructure {
  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      useTrailingCommas: true,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
    },
  });
  const file = project.createSourceFile("fixture.ts", {
    statements: [statement],
  });
  return file.getStructure();
}

export function readStructureFrom(path: string): SourceFileStructure {
  const fixture = fs.readFileSync(path, "utf-8");

  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      useTrailingCommas: true,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
    },
  });
  const file = project.createSourceFile("fixture.ts", {
    statements: [fixture],
  });
  return file.getStructure();
}
