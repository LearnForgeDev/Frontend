function importsReactNamespace(sourceCode, scope, name, visited = new Set()) {
  for (let current = scope; current; current = current.upper) {
    const variable = current.set.get(name);
    if (variable) {
      if (visited.has(variable)) {
        return false;
      }
      visited.add(variable);
      return variable.defs.some(({ type, node, parent }) => {
        if (type !== 'ImportBinding') {
          return false;
        }
        if (node.type === 'TSImportEqualsDeclaration') {
          let reference = node.moduleReference;
          if (reference.type === 'TSExternalModuleReference') {
            return reference.expression.value === 'react';
          }
          while (reference.type === 'TSQualifiedName') {
            reference = reference.left;
          }
          return reference.type === 'Identifier'
            && importsReactNamespace(sourceCode, sourceCode.getScope(node), reference.name, visited);
        }
        const isNamespace = ['ImportDefaultSpecifier', 'ImportNamespaceSpecifier'].includes(node.type)
          || (node.type === 'ImportSpecifier' && (node.imported.name ?? node.imported.value) === 'default');
        return isNamespace && parent.source.value === 'react';
      });
    }
  }
  return name === 'React';
}

export const multilineIf = {
  meta: {
    type: 'layout',
    schema: [],
    messages: { multiline: 'Use a multiline braced block for every if and else body.' },
  },
  create(context) {
    return {
      IfStatement(node) {
        for (const body of [node.consequent, node.alternate]) {
          if (!body || (body === node.alternate && body.type === 'IfStatement')) {
            continue;
          }
          if (body.type !== 'BlockStatement' || body.loc.start.line === body.loc.end.line) {
            context.report({ node: body, messageId: 'multiline' });
          }
        }
      },
    };
  },
};

export const namedReactTypes = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: { named: 'Import this React type by name instead of qualifying the React namespace.' },
  },
  create(context) {
    return {
      TSQualifiedName(node) {
        if (node.parent.type === 'TSQualifiedName' || node.parent.type === 'TSTypeQuery') {
          return;
        }
        let root = node.left;
        while (root.type === 'TSQualifiedName') {
          root = root.left;
        }
        if (root.type !== 'Identifier') {
          return;
        }
        if (importsReactNamespace(context.sourceCode, context.sourceCode.getScope(node), root.name)) {
          context.report({ node, messageId: 'named' });
        }
      },
    };
  },
};

export const namedTypePlacement = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      sidecar: 'Declare named types and interfaces in a .type.ts file.',
      runtime: 'Keep runtime declarations and imports outside type sidecars.',
    },
  },
  create(context) {
    if (context.filename.endsWith('.type.ts')) {
      return {
        Program(node) {
          for (const statement of node.body) {
            const declaration = ['ExportNamedDeclaration', 'ExportDefaultDeclaration'].includes(statement.type) ? statement.declaration : statement;
            const erased = declaration && (['TSTypeAliasDeclaration', 'TSInterfaceDeclaration'].includes(declaration.type) || declaration.declare);
            const typeImport = statement.type === 'ImportDeclaration' && statement.importKind === 'type';
            const typeExport = ['ExportNamedDeclaration', 'ExportAllDeclaration'].includes(statement.type) && statement.exportKind === 'type';
            const moduleMarker = statement.type === 'ExportNamedDeclaration' && !statement.source && !statement.declaration && !statement.specifiers.length;
            if (!erased && !typeImport && !typeExport && !moduleMarker) {
              context.report({ node: statement, messageId: 'runtime' });
            }
          }
        },
      };
    }
    const report = node => context.report({ node, messageId: 'sidecar' });
    return { TSTypeAliasDeclaration: report, TSInterfaceDeclaration: report };
  },
};
