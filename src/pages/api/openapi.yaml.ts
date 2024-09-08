import openapiJson from "@/../public/openapi.json";
import yaml from "js-yaml";
import { merge } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import { createSwaggerSpec } from "next-swagger-doc";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Generate Swagger spec from next-swagger-doc
  const generatedSpec = createSwaggerSpec({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "OnLaunch - API Documentation",
        version: "1.0",
      },
    },
  });

  // Merge the two specifications
  const combinedSpec = merge(generatedSpec, openapiJson);

  // Convert to YAML
  const yamlSpec = yaml.dump(combinedSpec);

  // Set the content type to 'text/plain' and return the YAML
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(yamlSpec);
}
