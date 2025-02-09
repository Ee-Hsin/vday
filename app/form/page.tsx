import dynamic from "next/dynamic"

const ValentineForm = dynamic(() => import("./valentineFormComponent"), {
  ssr: false,
})

export default ValentineForm
