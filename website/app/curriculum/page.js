import { client } from '../../lib/sanity';
import CurriculumClientPage from '../../components/CurriculumClientPage';

export const metadata = {
  title: 'Coding Curriculum for Kids',
  description: 'Explore our flexible coding curriculum from Scratch to AI. Designed for K-12 students to master digital skills at their own pace.',
};

export default async function CurriculumPage() {
  // Use the expanded query to ensure Sanity resolves the image asset
  const levels = await client.fetch(
    `*[_type == "curriculum"]{
      ...,
      levelImage {
        asset->
      }
    } | order(orderRank asc)`, 
    {}, 
    { next: { revalidate: 3600 } }
  );

  return <CurriculumClientPage initialLevels={levels} />;
}
// import { client } from '../../lib/sanity';
// import CurriculumClientPage from '../../components/CurriculumClientPage';

// export const metadata = {
//   title: 'Coding Curriculum for Kids | Tech Talk Hub',
//   description: 'Explore our flexible coding curriculum from Scratch to AI. Designed for K-12 students to master digital skills at their own pace.',
// };

// export default async function CurriculumPage() {
//   const levels = await client.fetch(
//     `*[_type == "curriculum"] | order(orderRank asc)`, 
//     {}, 
//     { next: { revalidate: 3600 } }
//   );

//   return <CurriculumClientPage initialLevels={levels} />;
// }