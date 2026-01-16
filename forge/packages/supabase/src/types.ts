/**
 * Database type definitions for Supabase.
 *
 * Generate your types using the Supabase CLI:
 * npx supabase gen types typescript --project-id <your-project-id> > src/types.ts
 *
 * Or using the linked project:
 * npx supabase gen types typescript --linked > src/types.ts
 */
export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
