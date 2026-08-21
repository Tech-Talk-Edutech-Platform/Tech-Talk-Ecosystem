export const metadata = {
  title: "Book a Free Coding Trial Class | Tech Talk Hub",
  description: "Book a free 1-on-1 coding trial with a certified tutor for your child.",
  openGraph: {
    title: "Book a Free Coding Trial Class 🚀",
    description: "Give your child a confident start in coding with a free 1-on-1 trial.",
    images: [{ url: '/girl-code.png', width: 800, height: 600, alt: 'Child coding trial' }],
  },
};

export default function BookClassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
