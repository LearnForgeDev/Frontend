import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import ArticleIcon from '@mui/icons-material/Article';
import { getFileCategory } from '../FilesPage.utils';

export default function FileIcon({ filename }: { filename: string }) {
  switch (getFileCategory(filename)) {
    case 'image': return <ImageIcon color="primary" />;
    case 'pdf': return <PictureAsPdfIcon color="error" />;
    case 'text':
    case 'document': return <ArticleIcon color="info" />;
    case 'archive': return <FolderZipIcon color="warning" />;
    case 'audio': return <AudioFileIcon color="secondary" />;
    case 'video': return <VideoFileIcon color="secondary" />;
    default: return <InsertDriveFileIcon />;
  }
}
