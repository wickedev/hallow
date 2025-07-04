use swc_core::ecma::ast::*;
use swc_core::common::{Span, DUMMY_SP};
use crate::proto_parser::{ServiceDefinition, MethodDefinition};

pub struct TypeScriptCodeGenerator;

impl TypeScriptCodeGenerator {
    pub fn generate_stub_class(
        service: &ServiceDefinition,
        class_name: &str,
    ) -> Vec<ModuleItem> {
        let mut items = Vec::new();
        
        // Add Client import
        items.push(Self::generate_client_import());
        
        // Generate the stub class
        items.push(Self::generate_class_declaration(service, class_name));
        
        items
    }

    fn generate_client_import() -> ModuleItem {
        ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
            span: DUMMY_SP,
            specifiers: vec![ImportSpecifier::Named(ImportNamedSpecifier {
                span: DUMMY_SP,
                local: Ident::new("Client".into(), DUMMY_SP),
                imported: None,
                is_type_only: false,
            })],
            src: Box::new(Str {
                span: DUMMY_SP,
                value: "@hallow/grpc-web".into(),
                raw: None,
            }),
            type_only: false,
            with: None,
            phase: Default::default(),
        }))
    }

    fn generate_class_declaration(service: &ServiceDefinition, class_name: &str) -> ModuleItem {
        let constructor = Self::generate_constructor();
        let mut methods = vec![constructor];
        
        // Generate service methods
        for method in &service.methods {
            methods.push(Self::generate_service_method(method));
        }
        
        // Generate createHooks method
        methods.push(Self::generate_create_hooks_method(service));

        ModuleItem::Stmt(Stmt::Decl(Decl::Class(ClassDecl {
            ident: Ident::new(class_name.into(), DUMMY_SP),
            declare: false,
            class: Box::new(Class {
                span: DUMMY_SP,
                decorators: vec![],
                body: methods,
                super_class: None,
                is_abstract: false,
                type_params: None,
                super_type_params: None,
                implements: vec![],
            }),
        })))
    }

    fn generate_constructor() -> ClassMember {
        ClassMember::Constructor(Constructor {
            span: DUMMY_SP,
            key: PropName::Ident(Ident::new("constructor".into(), DUMMY_SP)),
            params: vec![Param {
                span: DUMMY_SP,
                decorators: vec![],
                pat: Pat::Ident(BindingIdent {
                    id: Ident::new("client".into(), DUMMY_SP),
                    type_ann: Some(Box::new(TsTypeAnn {
                        span: DUMMY_SP,
                        type_ann: Box::new(TsType::TsTypeRef(TsTypeRef {
                            span: DUMMY_SP,
                            type_name: TsEntityName::Ident(Ident::new("Client".into(), DUMMY_SP)),
                            type_params: None,
                        })),
                    })),
                }),
            }],
            body: Some(BlockStmt {
                span: DUMMY_SP,
                stmts: vec![Stmt::Expr(ExprStmt {
                    span: DUMMY_SP,
                    expr: Box::new(Expr::Assign(AssignExpr {
                        span: DUMMY_SP,
                        op: AssignOp::Assign,
                        left: PatOrExpr::Expr(Box::new(Expr::Member(MemberExpr {
                            span: DUMMY_SP,
                            obj: Box::new(Expr::This(ThisExpr { span: DUMMY_SP })),
                            prop: MemberProp::Ident(Ident::new("client".into(), DUMMY_SP)),
                        }))),
                        right: Box::new(Expr::Ident(Ident::new("client".into(), DUMMY_SP))),
                    })),
                })],
            }),
            accessibility: None,
            is_optional: false,
        })
    }

    fn generate_service_method(method: &MethodDefinition) -> ClassMember {
        let method_name = Self::camel_case(&method.name);
        let service_path = format!("/{}/{}", "Service", &method.name); // Simplified for now
        
        // Generate method body based on streaming type
        let body = if method.client_streaming || method.server_streaming {
            Self::generate_streaming_method_body(&service_path)
        } else {
            Self::generate_unary_method_body(&service_path)
        };

        ClassMember::Method(ClassMethod {
            span: DUMMY_SP,
            key: PropName::Ident(Ident::new(method_name.into(), DUMMY_SP)),
            function: Box::new(Function {
                params: vec![Param {
                    span: DUMMY_SP,
                    decorators: vec![],
                    pat: Pat::Ident(BindingIdent {
                        id: Ident::new("request".into(), DUMMY_SP),
                        type_ann: Some(Box::new(TsTypeAnn {
                            span: DUMMY_SP,
                            type_ann: Box::new(TsType::TsKeywordType(TsKeywordType {
                                span: DUMMY_SP,
                                kind: TsKeywordTypeKind::TsAnyKeyword,
                            })),
                        })),
                    }),
                }],
                decorators: vec![],
                span: DUMMY_SP,
                body: Some(body),
                is_generator: false,
                is_async: true,
                type_params: None,
                return_type: None,
            }),
            kind: MethodKind::Method,
            is_static: false,
            accessibility: None,
            is_abstract: false,
            is_optional: false,
            is_override: false,
        })
    }

    fn generate_unary_method_body(service_path: &str) -> BlockStmt {
        BlockStmt {
            span: DUMMY_SP,
            stmts: vec![Stmt::Return(ReturnStmt {
                span: DUMMY_SP,
                arg: Some(Box::new(Expr::Await(AwaitExpr {
                    span: DUMMY_SP,
                    arg: Box::new(Expr::Call(CallExpr {
                        span: DUMMY_SP,
                        callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                            span: DUMMY_SP,
                            obj: Box::new(Expr::Member(MemberExpr {
                                span: DUMMY_SP,
                                obj: Box::new(Expr::This(ThisExpr { span: DUMMY_SP })),
                                prop: MemberProp::Ident(Ident::new("client".into(), DUMMY_SP)),
                            })),
                            prop: MemberProp::Ident(Ident::new("invoke".into(), DUMMY_SP)),
                        }))),
                        args: vec![
                            ExprOrSpread {
                                spread: None,
                                expr: Box::new(Expr::Lit(Lit::Str(Str {
                                    span: DUMMY_SP,
                                    value: service_path.into(),
                                    raw: None,
                                }))),
                            },
                            ExprOrSpread {
                                spread: None,
                                expr: Box::new(Expr::Ident(Ident::new("request".into(), DUMMY_SP))),
                            },
                        ],
                        type_args: None,
                    })),
                }))),
            })],
        }
    }

    fn generate_streaming_method_body(service_path: &str) -> BlockStmt {
        // For streaming methods, return a stream object
        BlockStmt {
            span: DUMMY_SP,
            stmts: vec![Stmt::Return(ReturnStmt {
                span: DUMMY_SP,
                arg: Some(Box::new(Expr::Call(CallExpr {
                    span: DUMMY_SP,
                    callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                        span: DUMMY_SP,
                        obj: Box::new(Expr::Member(MemberExpr {
                            span: DUMMY_SP,
                            obj: Box::new(Expr::This(ThisExpr { span: DUMMY_SP })),
                            prop: MemberProp::Ident(Ident::new("client".into(), DUMMY_SP)),
                        })),
                        prop: MemberProp::Ident(Ident::new("stream".into(), DUMMY_SP)),
                    }))),
                    args: vec![ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Str(Str {
                            span: DUMMY_SP,
                            value: service_path.into(),
                            raw: None,
                        }))),
                    }],
                    type_args: None,
                }))),
            })],
        }
    }

    fn generate_create_hooks_method(service: &ServiceDefinition) -> ClassMember {
        // Generate object literal with hook methods
        let mut properties = Vec::new();
        
        for method in &service.methods {
            let hook_name = format!("use{}", &method.name);
            let method_name = Self::camel_case(&method.name);
            
            properties.push(PropOrSpread::Prop(Box::new(Prop::Method(MethodProp {
                key: PropName::Ident(Ident::new(hook_name.into(), DUMMY_SP)),
                function: Box::new(Function {
                    params: vec![Param {
                        span: DUMMY_SP,
                        decorators: vec![],
                        pat: Pat::Ident(BindingIdent {
                            id: Ident::new("params".into(), DUMMY_SP),
                            type_ann: Some(Box::new(TsTypeAnn {
                                span: DUMMY_SP,
                                type_ann: Box::new(TsType::TsKeywordType(TsKeywordType {
                                    span: DUMMY_SP,
                                    kind: TsKeywordTypeKind::TsAnyKeyword,
                                })),
                            })),
                        }),
                    }],
                    decorators: vec![],
                    span: DUMMY_SP,
                    body: Some(BlockStmt {
                        span: DUMMY_SP,
                        stmts: vec![Stmt::Return(ReturnStmt {
                            span: DUMMY_SP,
                            arg: Some(Box::new(Expr::Call(CallExpr {
                                span: DUMMY_SP,
                                callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                                    span: DUMMY_SP,
                                    obj: Box::new(Expr::This(ThisExpr { span: DUMMY_SP })),
                                    prop: MemberProp::Ident(Ident::new(method_name.into(), DUMMY_SP)),
                                }))),
                                args: vec![ExprOrSpread {
                                    spread: None,
                                    expr: Box::new(Expr::Ident(Ident::new("params".into(), DUMMY_SP))),
                                }],
                                type_args: None,
                            }))),
                        })],
                    }),
                    is_generator: false,
                    is_async: false,
                    type_params: None,
                    return_type: None,
                }),
            }))));
        }

        ClassMember::Method(ClassMethod {
            span: DUMMY_SP,
            key: PropName::Ident(Ident::new("createHooks".into(), DUMMY_SP)),
            function: Box::new(Function {
                params: vec![],
                decorators: vec![],
                span: DUMMY_SP,
                body: Some(BlockStmt {
                    span: DUMMY_SP,
                    stmts: vec![Stmt::Return(ReturnStmt {
                        span: DUMMY_SP,
                        arg: Some(Box::new(Expr::Object(ObjectLit {
                            span: DUMMY_SP,
                            props: properties,
                        }))),
                    })],
                }),
                is_generator: false,
                is_async: false,
                type_params: None,
                return_type: None,
            }),
            kind: MethodKind::Method,
            is_static: false,
            accessibility: None,
            is_abstract: false,
            is_optional: false,
            is_override: false,
        })
    }

    fn camel_case(s: &str) -> String {
        if s.is_empty() {
            return s.to_string();
        }
        
        let mut result = String::new();
        let mut capitalize_next = false;
        
        for (i, ch) in s.char_indices() {
            if ch == '_' {
                capitalize_next = true;
            } else if i == 0 {
                result.push(ch.to_lowercase().next().unwrap_or(ch));
            } else if capitalize_next {
                result.push(ch.to_uppercase().next().unwrap_or(ch));
                capitalize_next = false;
            } else {
                result.push(ch);
            }
        }
        
        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::proto_parser::MethodDefinition;

    #[test]
    fn test_camel_case() {
        assert_eq!(TypeScriptCodeGenerator::camel_case("hello_world"), "helloWorld");
        assert_eq!(TypeScriptCodeGenerator::camel_case("get_user"), "getUser");
        assert_eq!(TypeScriptCodeGenerator::camel_case("simple"), "simple");
        assert_eq!(TypeScriptCodeGenerator::camel_case(""), "");
    }
}