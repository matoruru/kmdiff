import { K8sResourceSchema } from "./types";
import * as YAML from 'yaml';
/**
 * Parse YAML content into K8sResource array
 */
export const parseYaml = (content: string) => {
  const docs = content.split(/^---\s*$/gm)
    .map(doc => doc.trim())
    .filter(doc => doc.length > 0)
    .map(doc => YAML.parse(doc));
  const resources = K8sResourceSchema.array().parse(docs);
  return resources;
};
