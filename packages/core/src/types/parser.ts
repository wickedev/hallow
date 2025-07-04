export interface ProtoField {
  name: string;
  type: string;
  number: number;
  options?: Record<string, any>;
}

export interface ProtoMessage {
  name: string;
  fields: ProtoField[];
  nested?: Record<string, ProtoMessage>;
}

export interface ProtoMethod {
  name: string;
  requestType: string;
  responseType: string;
  requestStream?: boolean;
  responseStream?: boolean;
  options?: Record<string, any>;
}

export interface ProtoService {
  name: string;
  methods: ProtoMethod[];
  options?: Record<string, any>;
}

export interface ProtoPackage {
  name?: string;
  syntax?: string;
  imports?: string[];
  messages: Record<string, ProtoMessage>;
  services: Record<string, ProtoService>;
  enums?: Record<string, ProtoEnum>;
}

export interface ProtoEnum {
  name: string;
  values: Record<string, number>;
}

export interface ParseOptions {
  keepCase?: boolean;
  alternateCommentMode?: boolean;
  preferTrailingComment?: boolean;
}

export interface ParseResult {
  package: ProtoPackage;
  errors: ParseError[];
  warnings: ParseWarning[];
}

export interface ParseError {
  message: string;
  line?: number;
  column?: number;
}

export interface ParseWarning {
  message: string;
  line?: number;
  column?: number;
}