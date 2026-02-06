export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-pink-100 flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-[calc(90vw+6px)] md:max-w-[756px] h-[500px] md:h-[506px] bg-[#d98f8f] rounded-lg shadow-xl flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#ffffff] border-t-transparent rounded-full animate-spin"></div>
        <p className={`font-fredoka text-[#ffffff] text-xl`}>
          Loading your card...
        </p>
      </div>
    </div>
  )
}