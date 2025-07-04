use swc_core::ecma::{
    ast::*,
    visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use serde::Deserialize;
use std::path::Path;

mod proto_parser;
mod code_generator;

use proto_parser::ProtoParser;
use code_generator::TypeScriptCodeGenerator;

#[derive(Debug, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    #[serde(default = "default_enabled")]
    pub enabled: bool,
}

fn default_enabled() -> bool {
    true
}

pub struct ProtoImportTransformer {
    config: Config,
}

impl ProtoImportTransformer {
    pub fn new(config: Config) -> Self {
        Self { config }
    }
}

impl VisitMut for ProtoImportTransformer {
    fn visit_mut_module_items(&mut self, items: &mut Vec<ModuleItem>) {
        if !self.config.enabled {
            return;
        }

        let mut new_items = Vec::new();
        
        for item in items.iter_mut() {
            match item {
                ModuleItem::ModuleDecl(ModuleDecl::Import(import_decl)) => {
                    if let Some(transformed) = self.transform_proto_import(import_decl) {
                        new_items.extend(transformed);
                    } else {
                        new_items.push(item.clone());
                    }
                }
                _ => {
                    new_items.push(item.clone());
                }
            }
        }
        
        *items = new_items;
    }
}

impl ProtoImportTransformer {
    fn transform_proto_import(&self, import_decl: &ImportDecl) -> Option<Vec<ModuleItem>> {
        let src = import_decl.src.value.as_str();
        
        if !src.ends_with(".proto") {
            return None;
        }

        // Extract the imported names
        let mut imported_names = Vec::new();
        for specifier in &import_decl.specifiers {
            if let ImportSpecifier::Named(named) = specifier {
                if let Some(imported) = &named.imported {
                    if let ModuleExportName::Ident(ident) = imported {
                        imported_names.push(ident.sym.as_str());
                    }
                } else {
                    imported_names.push(named.local.sym.as_str());
                }
            }
        }

        // Generate stub class code for each imported name
        let mut generated_items = Vec::new();
        
        for name in imported_names {
            if let Some(stub_class) = self.generate_stub_class(name, src) {
                generated_items.push(stub_class);
            }
        }

        Some(generated_items)
    }

    fn generate_stub_class(&self, class_name: &str, proto_path: &str) -> Option<ModuleItem> {
        // Parse the .proto file
        let (services, _messages) = match ProtoParser::parse_file(proto_path) {
            Ok(result) => result,
            Err(_) => {
                // If we can't parse the file, skip transformation
                return None;
            }
        };

        // Find the service that matches the class name
        let service = services.iter().find(|s| {
            // Try to match by service name or class name
            s.name == class_name || 
            format!("{}Stub", s.name) == class_name ||
            format!("{}Service", s.name) == class_name
        })?;

        // Generate the stub class
        let generated_items = TypeScriptCodeGenerator::generate_stub_class(service, class_name);
        
        // Return the class declaration (skip the import for now)
        generated_items.into_iter().find(|item| {
            matches!(item, ModuleItem::Stmt(Stmt::Decl(Decl::Class(_))))
        })
    }
}

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let config = serde_json::from_str::<Config>(
        &metadata.get_transform_plugin_config().unwrap_or_else(|| "{}".to_string())
    ).unwrap_or_default();

    program.fold_with(&mut as_folder(ProtoImportTransformer::new(config)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_default() {
        let config = Config::default();
        assert!(config.enabled);
    }

    #[test]
    fn test_config_deserialization() {
        let json = r#"{"enabled": false}"#;
        let config: Config = serde_json::from_str(json).unwrap();
        assert!(!config.enabled);
    }
}