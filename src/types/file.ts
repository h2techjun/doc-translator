export type FileFormat = 'docx' | 'xlsx' | 'pptx' | 'hwp' | 'pdf' | 'txt';

export interface FileType {
    name: string;
    size: number;
    type: string;
    lastModified: number;
}

export interface UploadedFile extends FileType {
    buffer: Buffer;
    extension: FileFormat;
}
