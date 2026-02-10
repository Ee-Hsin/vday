import Link from "next/link"
import { MdHome } from "react-icons/md"

export default function HomeButton() {
  return (
    <>
      <Link
        href="/"
        className="absolute top-5 left-5 z-20 text-[#d98f8f] hover:text-[#b35151] transition-colors"
      >
        <MdHome className="w-[4svh] h-[4svh] md:w-[40px] md:h-[40px]" />
      </Link>
    </>
  )
}
