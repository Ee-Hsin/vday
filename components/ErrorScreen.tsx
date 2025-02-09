import { Fredoka } from "next/font/google"

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

interface ErrorScreenProps {
  message: string
}

export default function ErrorScreen({ message }: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-pink-100 flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-[calc(90vw+6px)] md:max-w-[756px] h-[500px] md:h-[506px] bg-[#d98f8f] rounded-lg shadow-xl flex flex-col items-center justify-center space-y-4 px-4">
        <h2 className={`${fredoka.className} text-[#ffffff] text-3xl md:text-4xl font-medium text-center`}>
          Error: {message}
        </h2>
        <p className={`${fredoka.className} text-[#ffffff] text-lg md:text-xl text-center`}>
          The URL seems to be wrong, <br/> perhaps double check that it wasn&apos;t mistyped.
        </p>
      </div>
    </div>
  )
}