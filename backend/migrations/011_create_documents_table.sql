-- ============================================
-- DOCUMENTS TABLE
-- Stores file uploads, document metadata, and file references
-- ============================================

-- Documents table (tenant-specific)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
  category VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (category IN ('profile', 'booking', 'payment', 'library', 'student', 'other')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT fk_documents_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_user FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_tenant_user ON documents(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents(deleted_at) WHERE deleted_at IS NULL;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- Comments
COMMENT ON TABLE documents IS 'Stores document/file metadata and references to storage (S3/R2)';
COMMENT ON COLUMN documents.filename IS 'Generated unique filename (UUID.ext)';
COMMENT ON COLUMN documents.original_filename IS 'Original filename from upload';
COMMENT ON COLUMN documents.file_path IS 'Storage path (tenant_id/category/filename)';
COMMENT ON COLUMN documents.file_url IS 'Full URL to access the file (S3/R2 URL)';
COMMENT ON COLUMN documents.file_size IS 'File size in bytes';
COMMENT ON COLUMN documents.mime_type IS 'MIME type of the file';
COMMENT ON COLUMN documents.category IS 'Document category: profile, booking, payment, library, student, other';
COMMENT ON COLUMN documents.metadata IS 'Additional JSON data for the document';
COMMENT ON COLUMN documents.deleted_at IS 'Soft delete timestamp (NULL if not deleted)';

