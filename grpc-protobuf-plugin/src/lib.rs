use swc_core::common::Spanned;
use swc_core::ecma::ast::Program;
use swc_core::ecma::visit::{FoldWith, VisitMutWith};
use swc_core::ecma::{
    ast::{op, BinExpr, Ident},
    transforms::testing::test_inline,
    visit::{as_folder, VisitMut},
};
use swc_core::plugin::plugin_transform;
use swc_core::plugin::proxies::TransformPluginProgramMetadata;
use tracing::trace;

pub struct TransformVisitor;

impl VisitMut for TransformVisitor {
    fn visit_mut_module(&mut self, e: &mut swc_core::ecma::ast::Module) {
        trace!("visit_mut_module");
        e.visit_mut_children_with(self);
    }

    fn visit_mut_module_decl(&mut self, e: &mut swc_core::ecma::ast::ModuleDecl) {
        trace!("visit_mut_module_decl");
        e.visit_mut_children_with(self);
    }

    fn visit_mut_module_export_name(&mut self, e: &mut swc_core::ecma::ast::ModuleExportName) {
        trace!("visit_mut_module_export_name");
        e.visit_mut_children_with(self);
    }

    fn visit_mut_module_item(&mut self, e: &mut swc_core::ecma::ast::ModuleItem) {
        trace!("visit_mut_module_item");
        e.visit_mut_children_with(self);
    }

    fn visit_mut_module_items(&mut self, e: &mut std::vec::Vec<swc_core::ecma::ast::ModuleItem>) {
        trace!("visit_mut_module_items");
        e.visit_mut_children_with(self);
    }

    fn visit_mut_bin_expr(&mut self, e: &mut BinExpr) {
        trace!("visit_mut_bin_expr");
        e.visit_mut_children_with(self);

        if e.op == op!("===") {
            e.left = Box::new(Ident::new("kdy1".into(), e.left.span()).into());
        }
    }
}

#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
    program.fold_with(&mut as_folder(TransformVisitor))
}


test_inline!(
    Default::default(),
    |_| as_folder(TransformVisitor),
    boo,
    r#"foo === bar;"#,
    r#"kdy1 === bar;"#
);

test_inline!(
    Default::default(),
    |_| as_folder(TransformVisitor),
    import_module,
    r#"import { GreetingStub } from './greeting.proto'"#,
    r#"import { GreetingStub } from './greeting.proto'"#
);
