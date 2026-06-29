import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center font-poppins">
      <h1
        className="text-9xl font-extrabold mb-6 select-none"
        style={{
          background: "linear-gradient(to right, #3F51B5, #FF4081, #00BFA5)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        404
      </h1>
      <p className="text-2xl text-text mb-4">Oops! Page Not Found.</p>
      <p className="text-base text-text max-w-md mb-10">
        The page you are looking for doesn’t exist or has been moved.
      </p>
      <Link href="/">
        <button className="bg-primary hover:bg-secondary text-white font-semibold px-8 py-3 rounded-xl shadow-btn transition duration-300">
          Go Home
        </button>
      </Link>
    </div>
  );
}