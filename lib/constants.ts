import stamp1 from "../assets/stamp 1.png"
import stamp2 from "../assets/stamp 2.png"
import stamp3 from "../assets/stamp 3.png"

import pinkTheme from "../assets/pink_theme.png"
import purpleTheme from "../assets/purple_theme.png"
import blueTheme from "../assets/blue_theme.png"
// import greenTheme from "../assets/green_theme.png"

export const declineMessages = [
  "are you sure?",
  "really sure?",
  "think again!",
  "last chance!",
  "surely not?",
  "you might regret this!",
  "give it another thought!",
  "are you absolutely certain?",
  "this could be a mistake!",
  "have a heart!",
  "don't be so cold!",
  "change of heart?",
  "wouldn't you reconsider?",
  "is that your final answer?",
  "you're breaking my heart ;(",
]

export const stamps = [
  { id: "stamp1", src: stamp1, alt: "Cats with cake" },
  { id: "stamp2", src: stamp2, alt: "Two cats with heart" },
  { id: "stamp3", src: stamp3, alt: "Penguin cats" },
]

export const themes = [
  { id: "pinkTheme", src: pinkTheme, alt: "pink theme" },
  { id: "purpleTheme", src: purpleTheme, alt: "purple theme" },
  { id: "blueTheme", src: blueTheme, alt: "blue theme" },
]

export const colourThemes = {
  pinkTheme: {
    cover: "#d98f8f",
    text: "#cd7b7b",
    btn: "#d98f8f",
    btnHover: "#a55c5c",
    decline: "#efcdd0",
  },
  purpleTheme: {
    cover: "#a48fd9",
    text: "#957bcd",
    btn: "#a48fd9",
    btnHover: "#755ca5",
    decline: "#e2cdef",
  },
  blueTheme: {
    cover: "#8fbcd9",
    text: "#7ba3cd",
    btn: "#8fbcd9",
    btnHover: "#5c8aa5",
    decline: "#cde4ef",
  },
}
