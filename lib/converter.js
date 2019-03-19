const pathToRegexp = require("path-to-regexp");

function convertPath(path) {
  return pathToRegexp
    .parse(path)
    .map(x => (typeof x == "object" ? `${x.prefix}{${x.name}}` : x))
    .join("");
}

function parseSchemaToMethod(schema) {
  if (schema == null) {
    return {
      summary: ""
    };
  }

  return {
    operationId: schema.operationId,
    summary: schema.summary,
    description: schema.description,
    deprecated: schema.deprecated,
    security: schema.security,
    requestBody: parseRequestBody(schema),
    responses: openApi3Responses(schema),
    parameters: [
      ...parseParams(schema.request && schema.request.params).map(
        addIn("path")
      ),
      ...parseParams(schema.request && schema.request.query).map(
        addIn("query")
      ),
      ...parseParams(schema.request && schema.request.headers).map(
        addIn("header")
      )
    ],
    tags: schema.tags
  };
}

function openApi3Responses(schema) {
  const result = {};

  if (schema.response != null) {
    for (const httpCode in schema.response) {
      const responseDefinition = schema.response[httpCode];

      result[httpCode] = {
        description: responseDefinition.description
      };

      if (responseDefinition.type != null) {
        result[httpCode].content = {
          "application/json": {
            schema: responseDefinition
          }
        };
      }
    }
  }

  return result;
}

function parseRequestBody(schema) {
  if (schema.request == null || schema.request.body == null) {
    return;
  }

  const mimeTypes = (schema.request && schema.request.consumes) || [
    "application/json"
  ];

  const requestBody = {
    content: {}
  };

  for (const mimeType of mimeTypes) {
    requestBody.content[mimeType] = {
      schema: schema.request.body
    };
  }

  return requestBody;
}

function addIn(inValue) {
  function mapper(obj) {
    return {
      ...obj,
      in: inValue
    };
  }

  return mapper;
}

function parseParams(params) {
  if (params == null) {
    return [];
  }

  if (!params.properties) {
    return parseParams({
      properties: params
    });
  }

  return Object.keys(params.properties).map(name => {
    return {
      name,
      schema: params.properties[name] || {},
      required: params.required && params.required.includes(name)
    };
  });
}

module.exports = {
  convertPath,
  parseSchemaToMethod
};
