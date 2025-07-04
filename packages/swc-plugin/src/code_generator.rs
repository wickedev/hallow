use swc_core::ecma::ast::*;
use swc_core::common::DUMMY_SP;
use crate::proto_parser::{ServiceDefinition, MethodDefinition};

pub struct TypeScriptCodeGenerator;

impl TypeScriptCodeGenerator {
    pub fn generate_stub_class(
        service: &ServiceDefinition,
        class_name: &str,
    ) -> Vec<ModuleItem> {
        // For now, return a simple placeholder class
        // Full implementation will be added when API compatibility is resolved
        vec![Self::generate_placeholder_class(class_name)]
    }
    
    fn generate_placeholder_class(class_name: &str) -> ModuleItem {
        // Generate a simple class declaration without complex AST construction
        ModuleItem::Stmt(Stmt::Decl(Decl::Class(ClassDecl {
            ident: Ident::new(class_name.into(), DUMMY_SP),
            declare: false,
            class: Box::new(Class {
                span: DUMMY_SP,
                decorators: vec![],
                body: vec![], // Empty for now
                super_class: None,
                is_abstract: false,
                type_params: None,
                super_type_params: None,
                implements: vec![],
            }),
        })))
    }

    // TODO: Implement full AST generation when SWC API compatibility is resolved
    // This is a simplified placeholder for now

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