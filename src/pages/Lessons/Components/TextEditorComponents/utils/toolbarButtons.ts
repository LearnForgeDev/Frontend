import FormatText from "../../../../../assets/images/toolbarIcons/file-earmark-text.svg";
import FormatHeader1 from "../../../../../assets/images/toolbarIcons/type-h1.svg";
import FormatHeader2 from "../../../../../assets/images/toolbarIcons/type-h2.svg";
import FormatListNumberedIcon from "../../../../../assets/images/toolbarIcons/list-ol.svg";
import FormatListBulletedIcon from "../../../../../assets/images/toolbarIcons/list-ul.svg";
import FormatQuoteIcon from "../../../../../assets/images/toolbarIcons/chat-square-quote.svg";
import CodeIcon from "../../../../../assets/images/toolbarIcons/journal-code.svg";
import RedoOutlinedIcon from "../../../../../assets/images/toolbarIcons/arrow-clockwise.svg";
import UndoOutlinedIcon from "../../../../../assets/images/toolbarIcons/arrow-counterclockwise.svg";
import FormatBoldOutlinedIcon from "../../../../../assets/images/toolbarIcons/type-bold.svg";
import FormatItalicOutlinedIcon from "../../../../../assets/images/toolbarIcons/type-italic.svg";
import FormatUnderlinedOutlinedIcon from "../../../../../assets/images/toolbarIcons/type-underline.svg";
import StrikethroughSOutlinedIcon from "../../../../../assets/images/toolbarIcons/type-strikethrough.svg";
import ImageIcon from "../../../../../assets/images/toolbarIcons/file-image.svg";
import InsertLinkOutlinedIcon from "../../../../../assets/images/toolbarIcons/link.svg";
import FormatAlignLeftOutlinedIcon from "../../../../../assets/images/toolbarIcons/text-left.svg";
import FormatAlignCenterOutlinedIcon from "../../../../../assets/images/toolbarIcons/text-center.svg";
import FormatAlignRightOutlinedIcon from "../../../../../assets/images/toolbarIcons/text-right.svg";
import GraphIcon from "../../../../../assets/images/toolbarIcons/desmos.png";
import YoutubeIcon from "../../../../../assets/images/toolbarIcons/youtube.svg";
import EquationIcon from "../../../../../assets/images/toolbarIcons/plus-slash-minus.svg";
import JustifyIcon from "../../../../../assets/images/toolbarIcons/justify.svg";

import type {PluginItem} from "../../../../../types/lessonTypes.ts";

export const eventTypes = {
  paragraph: "paragraph",
  h1: "h1",
  h2: "h2",
  ul: "ul",
  ol: "ol",
  quote: "quote",
  formatCode: "code",
  formatUndo: "undo",
  formatRedo: "redo",
  formatBold: "bold",
  formatItalic: "italic",
  formatUnderline: "underline",
  formatStrike: "strikethrough",
  formatInsertLink: "formatInsertLink",
  formatAlignLeft: "left",
  formatAlignCenter: "center",
  formatAlignRight: "right",
  formatAlignJustify: "justify",
  insertImage: "insertImage",
  insertGraphic: 'insertGraphic',
  insertVideo: 'insertVideo',
  insertEquation: 'insertEquation',
};

const pluginsList: Record<keyof typeof eventTypes, PluginItem> = {
  formatRedo: {
    icon: RedoOutlinedIcon,
    event: eventTypes.formatRedo,
    label: "Повторить",
  },
  formatUndo: {
    icon: UndoOutlinedIcon,
    event: eventTypes.formatUndo,
    label: "Отменить",
  },
  paragraph: {
    icon: FormatText,
    event: eventTypes.paragraph,
    label: "Обычный текст",
  },
  h1: {
    icon: FormatHeader1,
    event: eventTypes.h1,
    label: "Заголовок 1",
  },
  h2: {
    icon: FormatHeader2,
    event: eventTypes.h2,
    label: "Заголовок 2",
  },
  ul: {
    icon: FormatListBulletedIcon,
    event: eventTypes.ul,
    label: "Маркированный список",
  },
  ol: {
    icon: FormatListNumberedIcon,
    event: eventTypes.ol,
    label: "Нумерованный список",
  },
  quote: {
    icon: FormatQuoteIcon,
    event: eventTypes.quote,
    label: "Цитата",
  },
  formatCode: {
    icon: CodeIcon,
    event: eventTypes.formatCode,
    label: "Код",
  },
  formatBold: {
    icon: FormatBoldOutlinedIcon,
    event: eventTypes.formatBold,
    label: "Жирный",
  },
  formatItalic: {
    icon: FormatItalicOutlinedIcon,
    event: eventTypes.formatItalic,
    label: "Курсив",
  },
  formatUnderline: {
    icon: FormatUnderlinedOutlinedIcon,
    event: eventTypes.formatUnderline,
    label: "Подчеркнутый",
  },
  formatStrike: {
    icon: StrikethroughSOutlinedIcon,
    event: eventTypes.formatStrike,
    label: "Зачеркнутый",
  },
  insertImage: {
    icon: ImageIcon,
    event: eventTypes.insertImage,
    label: "Вставить изображение",
  },
  formatInsertLink: {
    icon: InsertLinkOutlinedIcon,
    event: eventTypes.formatInsertLink,
    label: "Вставить ссылку",
  },
  formatAlignLeft: {
    icon: FormatAlignLeftOutlinedIcon,
    event: eventTypes.formatAlignLeft,
    label: "Выровнять по левому краю",
  },
  formatAlignCenter: {
    icon: FormatAlignCenterOutlinedIcon,
    event: eventTypes.formatAlignCenter,
    label: "Выровнять по центру",
  },
  formatAlignRight: {
    icon: FormatAlignRightOutlinedIcon,
    event: eventTypes.formatAlignRight,
    label: "Выровнять по правому краю",
  },
  formatAlignJustify: {
    icon: JustifyIcon,
    event: eventTypes.formatAlignJustify,
    label: "Выровнять по ширине",
  },
  insertGraphic: {
    icon: GraphIcon,
    event: eventTypes.insertGraphic,
    label: "Вставить график",
  },
  insertVideo: {
    icon: YoutubeIcon,
    event: eventTypes.insertVideo,
    label: 'Вставить видео',
  },
  insertEquation: {
    icon: EquationIcon,
    event: eventTypes.insertEquation,
    label: 'Вставить уравнение',
  }
};

export default pluginsList;
