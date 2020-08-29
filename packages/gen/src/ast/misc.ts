import {
  identifier,
  importDeclaration,
  importDefaultSpecifier,
  importSpecifier,
  stringLiteral,
} from '@babel/types';

export function createImportDefaultDeclaration(
  defaultLocal: string,
  source: string,
) {
  return importDeclaration(
    [importDefaultSpecifier(identifier(defaultLocal))],
    stringLiteral(source),
  );
}

export function createImportDeclaration(locals: string[], source: string) {
  return importDeclaration(
    locals.map((local) =>
      importSpecifier(identifier(local), identifier(local)),
    ),
    stringLiteral(source),
  );
}
