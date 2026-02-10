import Link from "next/link"
import Image from "next/image"
import { MdHome } from "react-icons/md"
import HeartBackground from "@/components/HeartBackground"
import ClickHeartEffect from "@/components/ClickHeartEffect"
import SuccessClient from "@/components/SuccessClient"
import pcBg from "@/assets/mofu yay pc.png"
import mobileBg from "@/assets/mofu yay mobile longer.png"
import HomeButton from "@/components/HomeButton"

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function SuccessPage({ searchParams }: PageProps) {
  const id = Array.isArray(searchParams.id)
    ? searchParams.id[0]
    : searchParams.id

  return (
    <div className="h-svh relative bg-[#ffeded] overflow-hidden">
      <HeartBackground />
      <ClickHeartEffect />
      <HomeButton />

      <div className="relative z-10 mt-[5svh] md:mt-[80px] md:ml-[5vw] text-center md:text-center md:w-[46vw]">
        <h1 className="text-[14vw] leading-[1] md:text-8xl py-1 font-bold text-[#d98f8f] mb-[4svh] md:mb-[4svh] font-fredoka">
          {id ? (
            <>
              Your <br className="block md:hidden" />
              Website
              <br />
              is Live!
            </>
          ) : (
            <>
              Something
              <br />
              Went Wrong
            </>
          )}
        </h1>

        {/* Description Text */}
        <p className="text-[5vw] md:text-4xl max-w-5xl leading-relaxed text-[#aa9a7d] px-[5vw] mb-[4svh] md:mb-[4svh] font-poppins">
          {id
            ? "Share this link with your potential valentine. We hope they say yes!"
            : "Please try submitting the form again. Make sure there is an 'id value' in this page's url."}
        </p>

        {id ? (
          <SuccessClient id={id} />
        ) : (
          <Link href="/form">
            <button
              className="bg-[#d98f8f] text-white font-bold text-[5vw] md:text-4xl py-[2svh] md:py-8 px-[6vw] md:px-[60px] rounded-full whitespace-nowrap 
              z-30 relative cursor-pointer
              transition-shadow duration-200 ease-in-out hover:shadow-[0_0_20px_rgba(217,143,143,0.8)]
              font-fredoka"
            >
              Back to Form
            </button>
          </Link>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full pointer-events-none">
        <div className="hidden md:block">
          <Image
            src={pcBg}
            alt="Background"
            width={1920}
            height={1080}
            className="w-full object-contain"
            priority
          />
        </div>
        <div className="block md:hidden">
          <Image
            src={mobileBg}
            alt="Background Mobile"
            width={390}
            height={844}
            className="w-full object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
}
