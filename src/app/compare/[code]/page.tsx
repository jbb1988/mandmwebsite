import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import ComparisonShareClient from './ComparisonShareClient';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ComparisonSharePageProps {
  params: Promise<{ code: string }>;
}

interface AnalysisData {
  id: string;
  video_url: string;
  thumbnail_urls: string[] | null;
  overall_rating: string;
  summary: string;
  created_at: string;
  title: string | null;
  drill_title: string | null;
}

interface ComparisonShareData {
  shareData: {
    share_code: string;
    feature_label: string;
    view_count: number;
    expires_at: string;
  } | null;
  analysis1: AnalysisData | null;
  analysis2: AnalysisData | null;
  error: string | null;
}

async function getComparisonShareData(code: string): Promise<ComparisonShareData> {
  try {
    // Get the share record
    const { data: share, error: shareError } = await supabase
      .from('comparison_shares')
      .select('share_code, analysis_id_1, analysis_id_2, feature_label, view_count, expires_at')
      .eq('share_code', code)
      .single();

    if (shareError || !share) {
      return { shareData: null, analysis1: null, analysis2: null, error: 'Comparison not found' };
    }

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return { shareData: share, analysis1: null, analysis2: null, error: 'This share link has expired' };
    }

    // Get both analyses
    const { data: analyses, error: analysesError } = await supabase
      .from('swing_lab_analyses')
      .select(`
        id,
        video_url,
        thumbnail_urls,
        created_at,
        title,
        drill_title,
        analysis_data
      `)
      .in('id', [share.analysis_id_1, share.analysis_id_2]);

    if (analysesError || !analyses || analyses.length !== 2) {
      return { shareData: share, analysis1: null, analysis2: null, error: 'Analyses not found' };
    }

    // Extract summary and rating from analysis_data
    const formatAnalysis = (analysis: typeof analyses[0]): AnalysisData => {
      const analysisData = analysis.analysis_data as Record<string, unknown> | null;
      return {
        id: analysis.id,
        video_url: analysis.video_url,
        thumbnail_urls: analysis.thumbnail_urls,
        overall_rating: (analysisData?.overall_rating as string) || 'N/A',
        summary: (analysisData?.summary as string) || 'No summary available',
        created_at: analysis.created_at,
        title: analysis.title,
        drill_title: analysis.drill_title,
      };
    };

    // Order analyses correctly
    const analysis1 = analyses.find(a => a.id === share.analysis_id_1);
    const analysis2 = analyses.find(a => a.id === share.analysis_id_2);

    if (!analysis1 || !analysis2) {
      return { shareData: share, analysis1: null, analysis2: null, error: 'Analyses not found' };
    }

    // Increment view count
    await supabase.rpc('increment_comparison_view', { p_share_code: code });

    return {
      shareData: {
        share_code: share.share_code,
        feature_label: share.feature_label,
        view_count: share.view_count + 1,
        expires_at: share.expires_at,
      },
      analysis1: formatAnalysis(analysis1),
      analysis2: formatAnalysis(analysis2),
      error: null,
    };
  } catch (err) {
    console.error('Error fetching comparison share data:', err);
    return { shareData: null, analysis1: null, analysis2: null, error: 'An error occurred' };
  }
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: ComparisonSharePageProps): Promise<Metadata> {
  const { code } = await params;
  const { shareData, analysis1, analysis2, error } = await getComparisonShareData(code);

  if (error || !shareData || !analysis1 || !analysis2) {
    return {
      title: 'Analysis Comparison | Mind & Muscle',
      description: 'View this comparison in the Mind & Muscle app',
    };
  }

  const featureLabel = shareData.feature_label || 'Swing';

  return {
    title: `${featureLabel} Comparison | Mind & Muscle`,
    description: `Side-by-side ${featureLabel.toLowerCase()} analysis comparison on Mind & Muscle`,
    openGraph: {
      title: `${featureLabel} Comparison | Mind & Muscle`,
      description: `Compare and track ${featureLabel.toLowerCase()} progress with AI analysis`,
      images: analysis1.thumbnail_urls?.[0]
        ? [{ url: analysis1.thumbnail_urls[0], width: 1200, height: 630 }]
        : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${featureLabel} Comparison | Mind & Muscle`,
      description: `Compare and track ${featureLabel.toLowerCase()} progress with AI analysis`,
      images: analysis1.thumbnail_urls?.[0] ? [analysis1.thumbnail_urls[0]] : [],
    },
  };
}

export default async function ComparisonSharePage({ params }: ComparisonSharePageProps) {
  const { code } = await params;
  const { shareData, analysis1, analysis2, error } = await getComparisonShareData(code);

  return (
    <ComparisonShareClient
      code={code}
      shareData={shareData}
      analysis1={analysis1}
      analysis2={analysis2}
      error={error}
    />
  );
}
