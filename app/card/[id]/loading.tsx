import Loader from "@/components/Loader"

export default function Loading() {
  return (
    <div
      className={`font-fredoka h-screen flex flex-col items-center justify-center text-center bg-[#ffeded] px-2`}
    >
      <Loader color="border-t-[#d98f8f]"/>
    </div>
  )
}
