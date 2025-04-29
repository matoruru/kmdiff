<h1 align="center">kmdiff</h1>

**kmdiff** is a CLI tool to visually compare two Kubernetes YAML manifests, highlighting differences in a clean and structured format.

## Features

- Diff detection by `namespace`, `kind`, and `name`
- Supports `added`, `removed`, and `modified` resource types
- Outputs human-readable **Markdown** summary by default
- Optional `--json` output for machine-readable diff results
- Ignores YAML key order differences
- Handles multi-document YAML (`---` separated)
- Validates and preserves unknown Kubernetes fields

## Installation

Under construction

## Usage

```bash
kmdiff <old.yaml> <new.yaml> [--json]
```

### Examples

```bash
# Compare two manifests and get a Markdown diff
kmdiff staging-old.yaml staging-new.yaml

# Get the raw structured diff as JSON
kmdiff staging-old.yaml staging-new.yaml --json
```

## Output Format

### Markdown (default)

```markdown
# Namespace: default

## ConfigMap

- Added: example-config
- Modified: my-config

  \`\`\`diff
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: my-config
     namespace: default
   data:
  -  key: old
  +  key: new
  \`\`\`

## Service

- Removed: old-service
```

### JSON (with `--json`)

```json
[
  {
    "namespace": "default",
    "diffs": [
      { "kind": "ConfigMap", "name": "example-config", "type": "added" },
      { "kind": "ConfigMap", "name": "my-config", "type": "modified", "diffText": "...diff here..." },
      { "kind": "Service", "name": "old-service", "type": "removed" }
    ]
  }
]
```

## Exit Codes

| Code | Description                                |
|------|--------------------------------------------|
| 0    | No differences found (success)             |
| 1    | Differences found, or invalid input/error  |

## License

MIT
