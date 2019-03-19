const { convertPath, parseSchemaToMethod } = require("./converter");

function compileRoutesSpec(router, baseConfig) {
  const paths = {};

  for (const route of router.internalRouter.routes) {
    const path = convertPath(route.path);

    if (paths[path] == null) {
      paths[path] = {};
    }

    const method = route.method.toLowerCase();

    if (paths[path][method] != null) {
      throw new Error(`Duplicate route for ${route.method} ${route.path}`);
    }

    paths[path][method] = parseSchemaToMethod(route.store.schema);
  }

  return {
    openapi: "3.0.0",
    ...baseConfig,
    paths
  };
}

module.exports = compileRoutesSpec;
