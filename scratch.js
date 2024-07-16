import { timerify } from "./index.js"

const timerified = timerify(function foo() {

})

timerified()

console.log(timerified.histogramMs)
