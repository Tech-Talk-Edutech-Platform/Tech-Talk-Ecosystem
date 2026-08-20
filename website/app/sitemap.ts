import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://techtalk-hub.com'

  return [
    {
      url: baseUrl,
      priority: 1,
    },
    {
      url: `${baseUrl}/junior-coders`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/future-developers`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/courses`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/book-trial`,
      priority: 0.9,
    },
  ]
}