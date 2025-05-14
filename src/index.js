import "./styles.css";
import { loadMenu } from "./loadMenu.js";
import { loadHome } from "./loadHome.js";
import { loadContact } from "./loadContact.js";

// loadInitialContent();
console.log("Hello, world!");
const homeBtn = document.querySelector("nav>button:nth-child(1)");
const menu = document.querySelector("nav>button:nth-child(2)");
const contact = document.querySelector("nav>button:nth-child(3)");
function clearContent() {
    const contentDiv = document.querySelector("div#content");
    contentDiv.removeChild(contentDiv.firstChild);
}

document.addEventListener("DOMContentLoaded", loadHome);

homeBtn.addEventListener("click", () => {
    clearContent();
    loadHome();
});

menu.addEventListener("click", () => {
    clearContent();
    loadMenu();
});

contact.addEventListener("click", () => {
    clearContent();
    loadContact();
});