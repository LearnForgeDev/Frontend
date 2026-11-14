import { expect, it } from 'vitest';
import { getSupportedLessonFiles } from './FileManager.upload';

it('keeps supported lesson uploads in input order without changing file identity', () => {
  const document = new File(['document'], 'NOTES.PDF');
  const executable = new File(['code'], 'script.exe');
  const image = new File(['image'], 'diagram.jpg');
  expect(getSupportedLessonFiles([document, executable, image])).toEqual([document, image]);
});
