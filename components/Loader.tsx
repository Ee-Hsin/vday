interface LoaderProps {
  size?: string
  color?: string
}

export default function Loader({
  size = "w-8 h-8",
  color = "border-gray-500",
}: LoaderProps) {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`${size} border-4 border-t-transparent ${color} rounded-full animate-spin`}
      />
    </div>
  )
}
