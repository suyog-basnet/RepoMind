import { SyntaxKind } from "ts-morph";

const HTTP_METHOD_DECORATORS = ["Get", "Post", "Put", "Patch", "Delete"];
const EXPRESS_METHODS = ["get", "post", "put", "patch", "delete"];

function getDecoratorArg(decorator) {
  const args = decorator.getArguments();
  if (!args.length) return "";
  const arg = args[0];
  return arg.getKind() === SyntaxKind.StringLiteral ? arg.getLiteralText() : "";
}

function joinPaths(prefix, path) {
  const clean = (s) => s.replace(/^\/+|\/+$/g, "");
  const parts = [clean(prefix), clean(path)].filter(Boolean);
  return "/" + parts.join("/");
}

export function findNestJsEndpoints(project, rootDir, pathModule) {
  const endpoints = [];

  for (const sf of project.getSourceFiles()) {
    if (!sf.getFilePath().endsWith(".controller.ts")) continue;

    for (const cls of sf.getClasses()) {
      const controllerDecorator = cls.getDecorator("Controller");
      if (!controllerDecorator) continue;

      const prefix = getDecoratorArg(controllerDecorator);

      for (const method of cls.getMethods()) {
        for (const httpMethod of HTTP_METHOD_DECORATORS) {
          const decorator = method.getDecorator(httpMethod);
          if (!decorator) continue;

          const routePath = getDecoratorArg(decorator);
          endpoints.push({
            method: httpMethod.toUpperCase(),
            path: joinPaths(prefix, routePath),
            handler: method.getName(),
            file: pathModule.relative(rootDir, sf.getFilePath()),
          });
        }
      }
    }
  }

  return endpoints;
}

export function findExpressEndpoints(project, rootDir, pathModule) {
  const endpoints = [];

  for (const sf of project.getSourceFiles()) {
    sf.forEachDescendant((node) => {
      if (node.getKind() !== SyntaxKind.CallExpression) return;

      const expr = node.getExpression();
      if (expr.getKind() !== SyntaxKind.PropertyAccessExpression) return;

      const methodName = expr.getName();
      if (!EXPRESS_METHODS.includes(methodName)) return;

      const callerText = expr.getExpression().getText();
      if (!/^(app|router|\w*[Rr]outer)$/.test(callerText)) return;

      const args = node.getArguments();
      if (!args.length) return;
      const pathArg = args[0];
      if (pathArg.getKind() !== SyntaxKind.StringLiteral) return;

      endpoints.push({
        method: methodName.toUpperCase(),
        path: pathArg.getLiteralText(),
        handler: args.length > 1 ? "<handler>" : "<anonymous>",
        file: pathModule.relative(rootDir, sf.getFilePath()),
      });
    });
  }

  return endpoints;
}