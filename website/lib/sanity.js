import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';


export const client = createClient({
  projectId: '6r4esya0',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-06-16',
});

const builder = imageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source);
}