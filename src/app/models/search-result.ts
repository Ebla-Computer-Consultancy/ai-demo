export class SearchResult {
    '@search.captions': unknown;
    '@search.highlights': {
        merged_content: string[];
        imageCaption: string[];
    } | null;
    '@search.reranker_score': unknown;
    '@search.score': number;
    chunk!: string;
    chunk_id!: string;
    keywords: string[] = [];
    metadata_storage_path!: string;
    parent_id!: string;
    text_vector: number[] = [];
    title!: string;
    ref_url!: string;
}
