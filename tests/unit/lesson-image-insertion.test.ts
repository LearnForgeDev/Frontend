import { createElement } from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import InsertImageModal from '@/Services/Lessons/components/TextEditorComponents/ui/modals/InsertImageModal';

const insertNodes = vi.hoisted(() => vi.fn());
vi.mock('@/Endpoints', () => ({
  filesEndpoints: {
    uploadFileMultipart: vi.fn().mockResolvedValue({ publicId: 'uploaded-image' }),
    getFileUrl: () => '/protected/image',
  },
}));
vi.mock('react-router-dom', () => ({ useParams: () => ({ schoolPublicId: 'school' }) }));
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [{ update: (callback: () => void) => callback() }],
}));
vi.mock('lexical', () => ({
  $getSelection: () => ({}),
  $isRangeSelection: () => true,
  $insertNodes: insertNodes,
}));
vi.mock('@/Services/Lessons/components/TextEditorComponents/nodes/ImageNode', () => ({
  $createImageNode: (image: unknown) => image,
}));

afterEach(() => cleanup());

it('keeps upload pending until the uploaded image passes URL validation and is inserted', async () => {
  const images: HTMLImageElement[] = [];
  vi.spyOn(window, 'Image').mockImplementation(function () {
    const image = document.createElement('img');
    images.push(image);
    return image;
  });
  const onClose = vi.fn();
  render(createElement(InsertImageModal, { onClose }));
  const input = document.querySelector('input[type="file"]');
  if (!input) {
    throw new Error('The lesson image upload input is missing.');
  }
  fireEvent.change(input, { target: { files: [new File(['image'], 'image.png', { type: 'image/png' })] } });
  await waitFor(() => expect(images).toHaveLength(1));
  expect(input.hasAttribute('disabled')).toBe(true);
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.load(images[0]);
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(insertNodes).toHaveBeenCalledWith([{ src: '/protected/image', altText: 'image.png' }]);
  expect(input.hasAttribute('disabled')).toBe(false);
});
