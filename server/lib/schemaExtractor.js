const RELATION_DECORATORS = ["OneToMany", "ManyToOne", "ManyToMany", "OneToOne"];
const COLUMN_DECORATORS = ["Column", "PrimaryGeneratedColumn", "PrimaryColumn", "CreateDateColumn", "UpdateDateColumn"];

function getEntityName(decorator, className) {
  const args = decorator.getArguments();
  if (args.length && args[0].getKind() !== undefined) {
    try {
      return args[0].getLiteralText();
    } catch {
      // arg wasn't a plain string literal (e.g. options object) — fall back
    }
  }
  return className;
}

function extractRelationTarget(decorator) {
  // Relation decorators take a type-returning arrow function as first arg,
  // e.g. @ManyToOne(() => User). Pull the referenced identifier out of it.
  const args = decorator.getArguments();
  if (!args.length) return null;
  const text = args[0].getText();
  const match = text.match(/=>\s*([A-Za-z_][A-Za-z0-9_]*)/);
  return match ? match[1] : null;
}

export function extractEntities(project, rootDir, pathModule) {
  const entities = [];

  for (const sf of project.getSourceFiles()) {
    if (!sf.getFilePath().endsWith(".entity.ts")) continue;

    for (const cls of sf.getClasses()) {
      const entityDecorator = cls.getDecorator("Entity");
      if (!entityDecorator) continue;

      const entityName = getEntityName(entityDecorator, cls.getName());
      const columns = [];
      const relations = [];

      for (const prop of cls.getProperties()) {
        for (const colDec of COLUMN_DECORATORS) {
          if (prop.getDecorator(colDec)) {
            columns.push({
              name: prop.getName(),
              type: prop.getTypeNode()?.getText() ?? "unknown",
              decorator: colDec,
            });
          }
        }
        for (const relDec of RELATION_DECORATORS) {
          const decorator = prop.getDecorator(relDec);
          if (decorator) {
            relations.push({
              name: prop.getName(),
              type: relDec,
              target: extractRelationTarget(decorator),
            });
          }
        }
      }

      entities.push({
        name: entityName,
        className: cls.getName(),
        file: pathModule.relative(rootDir, sf.getFilePath()),
        columns,
        relations,
      });
    }
  }

  return entities;
}