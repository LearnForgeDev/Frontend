import type { HomeworkFile } from '@/Endpoints/Homework/homework.type';
import type { ImageAnnotation } from '@/Assets/Components/ImageAnnotations/ImageAnnotations.type';

export interface HomeworkAttachmentProps {
  schoolPublicId: string;
  homeworkPublicId: string;
  attemptPublicId?: string;
  questionId: number;
  file: HomeworkFile;
  annotations?: ImageAnnotation[];
  onAnnotations?: (annotations: ImageAnnotation[]) => void;
  onRemove?: () => void;
  readOnly?: boolean;
}
