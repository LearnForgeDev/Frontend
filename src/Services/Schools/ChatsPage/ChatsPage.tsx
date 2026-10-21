import { useParams } from 'react-router-dom';
import ChatsWorkspace from './components/ChatsWorkspace/ChatsWorkspace';

export default function ChatsPage() {
  const { schoolPublicId = '' } = useParams<{ schoolPublicId: string }>();
  return <ChatsWorkspace key={schoolPublicId} schoolPublicId={schoolPublicId} />;
}
