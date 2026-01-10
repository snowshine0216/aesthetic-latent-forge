/**
 * Shared AI/LLM utilities package.
 *
 * This package will contain common utilities for:
 * - Prompt formatting and templates
 * - Token counting and management
 * - LLM API client wrappers
 * - Response parsing utilities
 */

export function formatPrompt(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? '')
}

export function truncateToTokenLimit(text: string, maxTokens: number): string {
  // Rough approximation: ~4 characters per token
  const maxChars = maxTokens * 4
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars - 3) + '...'
}
