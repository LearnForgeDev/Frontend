import type {SerializedEditorState} from "lexical";

export type lessonCompactObject = {
    id: number | string;
    title: string;
}

export type lessonObject = {
    id: number | string;
    title: string;
    content: SerializedEditorState | null;
};

export type PluginItem = {
    icon: string;
    event: string;
    label: string;
};

export type viewLessonProps = {
    id: number | string;
    title: string;
    content?: string;
};