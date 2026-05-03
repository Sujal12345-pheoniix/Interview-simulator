import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#030303] text-gray-100 p-6 text-center">
      <div className="text-[12rem] font-black leading-none bg-clip-text text-transparent bg-gradient-to-b from-white/20 to-transparent select-none">
        404
      </div>
      <h2 className="text-3xl font-bold mt-[-2rem] mb-4 relative z-10">Page Not Found</h2>
      <p className="text-gray-400 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
