import { supabase } from '../lib/supabase';
import { Report, ReportFilters, Comment, ReportStatus, EvidenceFile, TargetType, ReportCategory } from '../types';
import { Database } from '../lib/database.types';

const BUCKET_NAME = 'evidence';

type SupabaseEvidenceFile = Database['public']['Tables']['evidence_files']['Row'];

// --- Mapper ---
const toReport = (r: any): Report => {
  const evidenceFilesWithUrls: EvidenceFile[] | undefined = r.evidence_files?.map((file: SupabaseEvidenceFile) => {
    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.file_path);
    return {
      id: file.id,
      filePath: file.file_path,
      originalName: file.original_name,
      mimeType: file.mime_type || 'application/octet-stream',
      size: file.size || 0,
      publicURL: publicUrl
    };
  });

  return {
    id: r.id,
    title: r.title,
    targetType: r.target_type,
    category: r.category,
    description: r.description,
    reported_by_id: r.reported_by_id,
    created_at: r.created_at,
    status: r.status,
    contactInfo: r.contact_info,
    reporterIdentifier: (r.profiles as any)?.identifier || 'N/A',
    evidenceFiles: evidenceFilesWithUrls,
  };
};

// --- File Upload Helper ---
const uploadEvidenceFiles = async (reportId: string, files: File[]): Promise<EvidenceFile[]> => {
  const uploadPromises = files.map(async (file) => {
    const filePath = `${reportId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }

    // Return data for insertion into the evidence_files table
    return {
      report_id: reportId,
      file_path: filePath,
      original_name: file.name,
      mime_type: file.type,
      size: file.size,
    };
  });

  const evidenceData: Database['public']['Tables']['evidence_files']['Insert'][] = await Promise.all(uploadPromises);
  
  // Batch insert evidence metadata into the database
  const { data: insertedFiles, error: insertError } = await supabase
    .from('evidence_files')
    .insert(evidenceData)
    .select();
  
  if (insertError) {
    throw new Error(`Could not save evidence metadata: ${insertError.message}`);
  }
  return (insertedFiles || []).map((file: SupabaseEvidenceFile): EvidenceFile => ({
      id: file.id,
      filePath: file.file_path,
      originalName: file.original_name,
      mimeType: file.mime_type || 'application/octet-stream',
      size: file.size || 0,
      publicURL: supabase.storage.from(BUCKET_NAME).getPublicUrl(file.file_path).data.publicUrl,
  }));
};


export const getReports = async (filters?: ReportFilters): Promise<Report[]> => {
  let query = supabase
    .from('reports')
    .select(`
      *,
      profiles ( identifier )
    `)
    .order('created_at', { ascending: false });

  if (filters) {
    if (filters.keyword) {
      query = query.textSearch('title_description_tokens', `"${filters.keyword}"`);
    }
    if (filters.targetType && filters.targetType !== 'All Types') {
      query = query.eq('target_type', filters.targetType);
    }
    if (filters.category && filters.category !== 'All Categories') {
      query = query.eq('category', filters.category);
    }
    if (filters.status && filters.status !== 'All Statuses') {
      query = query.eq('status', filters.status);
    } else {
        // Non-admins should only see approved reports if no other status is set
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile, error: profileError } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
            if (profileError && profileError.code !== 'PGRST116') {
              console.error("Could not check admin status, defaulting to public view.", profileError);
            }
            if (!profile?.is_admin && !filters.status) {
                 query = query.eq('status', ReportStatus.APPROVED);
            }
        } else {
             query = query.eq('status', ReportStatus.APPROVED);
        }
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map(toReport);
};

export const getReportById = async (id: string): Promise<Report | undefined> => {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      profiles ( identifier ),
      evidence_files ( * )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching report by ID: ", error);
    if(error.code === 'PGRST116') return undefined; // Not found is not a throw-worthy error
    throw new Error(error.message);
  }
  if (!data) return undefined;
  
  return toReport(data);
};

export const getReportsByUserId = async (userId: string): Promise<Report[]> => {
  const query = supabase
    .from('reports')
    .select(`
      *,
      profiles ( identifier )
    `)
    .eq('reported_by_id', userId)
    .order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map(toReport);
};

export const addReport = async (formData: FormData): Promise<Report> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to submit a report.");

  const newReportData: Database['public']['Tables']['reports']['Insert'] = {
    title: formData.get('title') as string,
    target_type: formData.get('targetType') as TargetType,
    category: formData.get('category') as ReportCategory,
    description: formData.get('description') as string,
    contact_info: formData.get('contactInfo') as string,
    reported_by_id: user.id,
    status: ReportStatus.PENDING,
  };

  const { data: insertedReport, error: reportError } = await supabase
    .from('reports')
    .insert(newReportData)
    .select()
    .single();

  if (reportError) throw new Error(`Could not create report: ${reportError.message}`);
  
  // Handle file uploads
  const evidenceFiles = formData.getAll('evidence') as File[];
  if (evidenceFiles.length > 0 && evidenceFiles[0].size > 0) {
      await uploadEvidenceFiles(insertedReport.id, evidenceFiles);
  }

  // Refetch the full report to ensure all data is consistent
  const fullReport = await getReportById(insertedReport.id);
  if (!fullReport) throw new Error("Could not retrieve the newly created report.");
  
  return fullReport;
};

export const updateReportStatus = async (id: string, status: ReportStatus): Promise<Report | null> => {
  const { data, error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  return data ? toReport(data) : null;
};

export const deleteReport = async (id: string): Promise<boolean> => {
    // Also need to delete associated files in storage
  const { data: files, error: fileError } = await supabase
    .from('evidence_files')
    .select('file_path')
    .eq('report_id', id);

  if (fileError) throw new Error(fileError.message);
  
  if (files && files.length > 0) {
      const filePaths = files.map(f => f.file_path);
      await supabase.storage.from(BUCKET_NAME).remove(filePaths);
  }

  const { error } = await supabase.from('reports').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
};

// --- Comment Functions ---

export const getCommentsByReportId = async (reportId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select(`*, profiles(identifier)`)
    .eq('report_id', reportId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as unknown as Comment[];
};

export const addComment = async (
  reportId: string, 
  text: string, 
  isAnonymous: boolean
): Promise<Comment> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to comment.");
  
  const newCommentData: Database['public']['Tables']['comments']['Insert'] = {
      report_id: reportId,
      user_id: user.id,
      text,
      is_anonymous: isAnonymous,
  };

  const { data: newComment, error } = await supabase
    .from('comments')
    .insert(newCommentData)
    .select(`*, profiles(identifier)`)
    .single();

  if (error) throw new Error(error.message);
  return newComment as unknown as Comment;
};
