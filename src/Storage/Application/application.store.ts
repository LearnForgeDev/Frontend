import { configureStore } from '@reduxjs/toolkit';
import homework from '@/Storage/Homework/homework.slice';

export function createApplicationStore() {
  return configureStore({ reducer: { homework } });
}
