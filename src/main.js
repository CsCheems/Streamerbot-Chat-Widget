import { hexToRgb } from "./utils";
import { colorFondo, opacity } from "./constantes";

const body = document.body;
const { r, g, b } = hexToRgb(colorFondo);
body.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;

window.addEventListener("load", function () {
    connectws();
});