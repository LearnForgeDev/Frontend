export interface CourseItemDto {
  id: number;
  publicId: string;
  position: number;
  itemType: number;
  title: string;
  description: string | null;
  file: { publicId: string; fileName: string; sizeBytes: number; mimeType: string | null } | null;
  scheduleEventId: number | null;
  lessonId: number | null;
  homeworkId: number | null;
  isRequired: boolean;
  availableFromUtc: string | null;
  availableUntilUtc: string | null;
}

export interface CourseDto {
  id: number;
  publicId: string;
  title: string;
  description: string | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  items: CourseItemDto[];
  allowedUserIds: number[];
  allowedGroupIds: number[];
  allowedUserPublicIds: string[] | null;
  canManage: boolean;
}

export interface CourseProgressDto {
  coursePublicId: string;
  completedItemsCount: number;
  totalRequiredItemsCount: number;
  percent: number;
  startedAt: string;
  lastActivityAt: string;
  completedAt: string | null;
  items: { itemPublicId: string; position: number; status: number; startedAt: string; completedAt: string | null }[];
}

export interface CourseRosterDto {
  coursePublicId: string;
  isSchoolWide: boolean;
  totalRequiredItemsCount: number;
  students: {
    publicId: string;
    login: string;
    avatarUrl: string | null;
    isDirectlyAssigned: boolean;
    accessGroupIds: number[];
    progress: CourseProgressDto | null;
  }[];
}

export interface CourseMetadataInput {
  title: string;
  description: string;
}

export interface CourseAccessInput {
  allowedUserPublicIds: string[];
  allowedGroupIds: number[];
}

export interface CourseItemInput {
  title: string;
  itemType: number;
  lessonId: number;
  position: number;
  isRequired: boolean;
}
