use std::fs;
use regex::Regex;

#[derive(Debug, Clone)]
pub struct ServiceDefinition {
    pub name: String,
    pub methods: Vec<MethodDefinition>,
}

#[derive(Debug, Clone)]
pub struct MethodDefinition {
    pub name: String,
    pub input_type: String,
    pub output_type: String,
    pub client_streaming: bool,
    pub server_streaming: bool,
}

#[derive(Debug, Clone)]
pub struct MessageDefinition {
    pub name: String,
    pub fields: Vec<FieldDefinition>,
}

#[derive(Debug, Clone)]
pub struct FieldDefinition {
    pub name: String,
    pub field_type: String,
    pub repeated: bool,
    pub optional: bool,
}

pub struct ProtoParser;

impl ProtoParser {
    pub fn parse_file(file_path: &str) -> Result<(Vec<ServiceDefinition>, Vec<MessageDefinition>), String> {
        let content = fs::read_to_string(file_path)
            .map_err(|e| format!("Failed to read proto file {}: {}", file_path, e))?;
        
        Self::parse_content(&content)
    }

    pub fn parse_content(content: &str) -> Result<(Vec<ServiceDefinition>, Vec<MessageDefinition>), String> {
        let services = Self::extract_services(content)?;
        let messages = Self::extract_messages(content)?;
        
        Ok((services, messages))
    }

    fn extract_services(content: &str) -> Result<Vec<ServiceDefinition>, String> {
        let service_regex = Regex::new(r"service\s+(\w+)\s*\{([^}]+)\}")
            .map_err(|e| format!("Failed to compile service regex: {}", e))?;
        
        let mut services = Vec::new();
        
        for cap in service_regex.captures_iter(content) {
            let service_name = cap[1].to_string();
            let service_body = &cap[2];
            
            let methods = Self::extract_methods(service_body)?;
            
            services.push(ServiceDefinition {
                name: service_name,
                methods,
            });
        }
        
        Ok(services)
    }

    fn extract_methods(service_body: &str) -> Result<Vec<MethodDefinition>, String> {
        let method_regex = Regex::new(r"rpc\s+(\w+)\s*\(\s*(stream\s+)?(\w+)\s*\)\s*returns\s*\(\s*(stream\s+)?(\w+)\s*\)")
            .map_err(|e| format!("Failed to compile method regex: {}", e))?;
        
        let mut methods = Vec::new();
        
        for cap in method_regex.captures_iter(service_body) {
            let method_name = cap[1].to_string();
            let client_streaming = cap.get(2).is_some();
            let input_type = cap[3].to_string();
            let server_streaming = cap.get(4).is_some();
            let output_type = cap[5].to_string();
            
            methods.push(MethodDefinition {
                name: method_name,
                input_type,
                output_type,
                client_streaming,
                server_streaming,
            });
        }
        
        Ok(methods)
    }

    fn extract_messages(content: &str) -> Result<Vec<MessageDefinition>, String> {
        let message_regex = Regex::new(r"message\s+(\w+)\s*\{([^}]+)\}")
            .map_err(|e| format!("Failed to compile message regex: {}", e))?;
        
        let mut messages = Vec::new();
        
        for cap in message_regex.captures_iter(content) {
            let message_name = cap[1].to_string();
            let message_body = &cap[2];
            
            let fields = Self::extract_fields(message_body)?;
            
            messages.push(MessageDefinition {
                name: message_name,
                fields,
            });
        }
        
        Ok(messages)
    }

    fn extract_fields(message_body: &str) -> Result<Vec<FieldDefinition>, String> {
        let field_regex = Regex::new(r"(repeated\s+|optional\s+)?(\w+)\s+(\w+)\s*=\s*\d+")
            .map_err(|e| format!("Failed to compile field regex: {}", e))?;
        
        let mut fields = Vec::new();
        
        for cap in field_regex.captures_iter(message_body) {
            let modifier = cap.get(1).map(|m| m.as_str().trim()).unwrap_or("");
            let field_type = cap[2].to_string();
            let field_name = cap[3].to_string();
            
            let repeated = modifier == "repeated";
            let optional = modifier == "optional";
            
            fields.push(FieldDefinition {
                name: field_name,
                field_type,
                repeated,
                optional,
            });
        }
        
        Ok(fields)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_service() {
        let content = r#"
            service GreetingService {
                rpc Greeting(GreetingRequest) returns (GreetingResponse);
            }
        "#;
        
        let (services, _) = ProtoParser::parse_content(content).unwrap();
        assert_eq!(services.len(), 1);
        
        let service = &services[0];
        assert_eq!(service.name, "GreetingService");
        assert_eq!(service.methods.len(), 1);
        
        let method = &service.methods[0];
        assert_eq!(method.name, "Greeting");
        assert_eq!(method.input_type, "GreetingRequest");
        assert_eq!(method.output_type, "GreetingResponse");
        assert!(!method.client_streaming);
        assert!(!method.server_streaming);
    }

    #[test]
    fn test_parse_streaming_service() {
        let content = r#"
            service ChatService {
                rpc SendMessage(stream MessageRequest) returns (MessageResponse);
                rpc ReceiveMessages(MessageRequest) returns (stream MessageResponse);
                rpc ChatStream(stream MessageRequest) returns (stream MessageResponse);
            }
        "#;
        
        let (services, _) = ProtoParser::parse_content(content).unwrap();
        assert_eq!(services.len(), 1);
        
        let service = &services[0];
        assert_eq!(service.methods.len(), 3);
        
        // Client streaming
        assert!(service.methods[0].client_streaming);
        assert!(!service.methods[0].server_streaming);
        
        // Server streaming
        assert!(!service.methods[1].client_streaming);
        assert!(service.methods[1].server_streaming);
        
        // Bidirectional streaming
        assert!(service.methods[2].client_streaming);
        assert!(service.methods[2].server_streaming);
    }

    #[test]
    fn test_parse_message() {
        let content = r#"
            message GreetingRequest {
                string name = 1;
                int32 age = 2;
                repeated string hobbies = 3;
                optional string email = 4;
            }
        "#;
        
        let (_, messages) = ProtoParser::parse_content(content).unwrap();
        assert_eq!(messages.len(), 1);
        
        let message = &messages[0];
        assert_eq!(message.name, "GreetingRequest");
        assert_eq!(message.fields.len(), 4);
        
        assert_eq!(message.fields[0].name, "name");
        assert_eq!(message.fields[0].field_type, "string");
        assert!(!message.fields[0].repeated);
        assert!(!message.fields[0].optional);
        
        assert_eq!(message.fields[2].name, "hobbies");
        assert!(message.fields[2].repeated);
        
        assert_eq!(message.fields[3].name, "email");
        assert!(message.fields[3].optional);
    }
}