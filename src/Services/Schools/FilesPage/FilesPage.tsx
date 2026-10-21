import { useParams } from 'react-router-dom';
import FilesWorkspace from './components/FilesWorkspace';

export default function FilesPage() {
  const { schoolPublicId = '' } = useParams<{ schoolPublicId: string }>();
  return <FilesWorkspace key={schoolPublicId} schoolPublicId={schoolPublicId} />;
}
