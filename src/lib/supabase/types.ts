export type UserRole = "super_admin" | "admin" | "manager" | "employee";
export type EmployeeStatus = "active" | "invited" | "inactive";
export type DocumentType = "PDF" | "DOC" | "Video" | "URL";
export type IndexStatus = "not_indexed" | "indexing" | "indexed" | "failed";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          industry: string | null;
          size: string | null;
          website: string | null;
          business_hours_start: string | null;
          business_hours_end: string | null;
          timezone: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          org_id: string | null;
          name: string;
          email: string;
          role: UserRole;
          department: string | null;
          designation: string | null;
          reporting_manager: string | null;
          status: EmployeeStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      departments: {
        Row: {
          id: string;
          org_id: string | null;
          name: string;
          head: string | null;
          employee_count: number;
        };
        Insert: Partial<Database["public"]["Tables"]["departments"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["departments"]["Row"]>;
        Relationships: [];
      };
      branches: {
        Row: {
          id: string;
          org_id: string | null;
          name: string;
          city: string | null;
          employee_count: number;
        };
        Insert: Partial<Database["public"]["Tables"]["branches"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["branches"]["Row"]>;
        Relationships: [];
      };
      designations: {
        Row: {
          id: string;
          org_id: string | null;
          title: string;
        };
        Insert: Partial<Database["public"]["Tables"]["designations"]["Row"]> & {
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["designations"]["Row"]>;
        Relationships: [];
      };
      company_policies: {
        Row: {
          id: string;
          org_id: string | null;
          title: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["company_policies"]["Row"]> & {
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["company_policies"]["Row"]>;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          org_id: string | null;
          title: string;
          category: string | null;
          type: DocumentType;
          size: string | null;
          storage_path: string | null;
          uploaded_by: string | null;
          updated_at: string;
          indexed_at: string | null;
          index_status: IndexStatus;
        };
        Insert: Partial<Database["public"]["Tables"]["documents"]["Row"]> & {
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
        Relationships: [];
      };
      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          org_id: string | null;
          chunk_index: number;
          content: string;
          embedding: number[];
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["document_chunks"]["Row"]> & {
          document_id: string;
          chunk_index: number;
          content: string;
          embedding: number[];
        };
        Update: Partial<Database["public"]["Tables"]["document_chunks"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_document_chunks: {
        Args: {
          query_embedding: number[];
          match_org_id: string;
          match_count?: number;
        };
        Returns: {
          chunk_id: string;
          document_id: string;
          document_title: string;
          document_category: string | null;
          content: string;
          similarity: number;
        }[];
      };
    };
  };
}
