export default function NotFound() {
  return (
    <div className={`font-fredoka h-screen flex flex-col items-center justify-center text-center bg-[#ffeded] px-2`}>
      <h1 className="text-6xl font-bold text-[#d98f8f]">404</h1>
      <p className="text-xl text-[#aa9a7d]">
        Oops! The page you are looking for doesn't exist.
      </p>
      <a
        href="/"
        className="mt-4 px-6 py-2 bg-[#d98f8f] text-white rounded-full hover:bg-[#b35151] transition"
      >
        Go Home
      </a>
    </div>
  );
}
