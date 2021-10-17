import { generatorGen } from '#/utils/pre';

export const { g, h } = generatorGen('foo', 'bar');
export const ENDPOINT = import.meta.env.VITE_ENDPOINT ?? 'http://localhost:5000';
