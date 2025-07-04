// Basic SWC Plugin skeleton for Hallow gRPC
// This is a minimal implementation that will be expanded later

use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    #[serde(default)]
    pub enabled: bool,
}

impl Default for Config {
    fn default() -> Self {
        Self { enabled: true }
    }
}

// Placeholder for the actual SWC plugin implementation
// This will be implemented with proper SWC dependencies once Rust is updated

pub struct ProtoImportTransformer {
    config: Config,
}

impl ProtoImportTransformer {
    pub fn new(config: Config) -> Self {
        Self { config }
    }
    
    pub fn transform_proto_import(&self, import_path: &str) -> String {
        if !self.config.enabled {
            return import_path.to_string();
        }
        
        if import_path.ends_with(".proto") {
            // TODO: Implement actual transformation logic
            format!("// Generated from {}", import_path)
        } else {
            import_path.to_string()
        }
    }
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
    fn test_proto_import_detection() {
        let config = Config::default();
        let transformer = ProtoImportTransformer::new(config);
        
        let result = transformer.transform_proto_import("./greeting.proto");
        assert!(result.contains("Generated from"));
        
        let result = transformer.transform_proto_import("./normal.ts");
        assert_eq!(result, "./normal.ts");
    }
}