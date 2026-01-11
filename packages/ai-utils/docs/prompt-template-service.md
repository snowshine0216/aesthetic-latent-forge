# Prompt Template Service Design

This document outlines the design for a YAML-based Prompt Template Service that supports logic-based templating (e.g., Jinja2/Mustache syntax). This approach decouples prompt engineering from application logic, enabling better versioning, portability, and collaboration.

## 1. Overview
The service uses a "Prompt Contract" defined in YAML files. Each file contains not just the prompt text, but also the execution parameters and structural metadata required for model interaction.

## 2. Template Schema (YAML)
A recommended structure for prompt templates:

```yaml
name: customer_feedback_analyzer
version: "1.0.0"
description: "Identifies sentiment and key topics in user reviews"

# Model-specific settings bundled with the prompt
settings:
  model: "gpt-4o"
  temperature: 0.2
  response_format: "json"

# Core templates using conditional logic
prompts:
  system: |
    You are an expert sentiment analyst. 
    {% if detailed_mode %}
    Provide a deep dive into psychological triggers.
    {% endif %}
  
  user: |
    Analyze this feedback from {{ customer_name }}:
    "{{ feedback_text }}"
    
    {% if include_history %}
    Refer to these previous interactions: {{ history_summary }}
    {% endif %}
```

## 3. Core Architecture Components

### A. Template Registry (Loader)
*   **Responsibility**: Manages the loading of YAML files from the filesystem or a database.
*   **Features**: Implements caching and hot-reloading to ensure high performance.
*   **Validation**: Uses schema validation (e.g., Pydantic or JSON Schema) to ensure YAML integrity.

### B. Logic Engine
*   **Responsibility**: Renders raw strings into final text using user-provided context.
*   **Recommended Syntax**: Jinja2 (Python) or a similar logic-capable engine in other languages. Supports `{{ variable }}`, `{% if %}`, `{% for %}`, and custom filters.

### C. Message Orchestrator
*   **Responsibility**: Transforms rendered strings into the structured message format expected by LLMs (e.g., System, User, and Assistant roles).
*   **Partials**: Supports including reusable snippets (e.g., standard format instructions) across different templates.

### D. Context Validator
*   **Responsibility**: Performs pre-render checks to ensure all required variables are present in the provided context, preventing malformed prompts from being sent to the LLM.

## 4. Advanced Considerations

*   **Security**: Implement auto-escaping for user inputs to prevent prompt injection at the templating layer.
*   **Versioning**: Leverage Git for version control of prompt files, allowing simultaneous use of multiple prompt versions.
*   **Metadata Extraction**: The service returns a payload including rendered text, token counts, and recommended model configuration.

## 5. Key Benefits
1.  **Portability**: Prompt engineers can update logic without touching application code.
2.  **Logic Separation**: Application code remains clean, only calling the `render` method.
3.  **Consistency**: Ensures prompts are always executed with the model settings they were tuned for.
