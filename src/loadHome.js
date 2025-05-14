import goldenImg from "./golden_nugget.jpeg";

export const loadHome = () => {
    const contentDiv = document.querySelector("div#content");
    const subContentDiv = document.createElement("div");
    subContentDiv.classList.add("sub-content");
    const header1 = document.createElement("h1");
    header1.innerText = "Golden Nugget Pancake House";
    const myImage = document.createElement("img");
    myImage.src = goldenImg;
    myImage.alt = "Golden Nugget Pancake House";
    const para = document.createElement("p");
    para.innerText = "Never been there, but heard it's decent, and open 24 hours, too!";
    subContentDiv.appendChild(header1);
    subContentDiv.appendChild(myImage);
    subContentDiv.appendChild(para);
    contentDiv.appendChild(subContentDiv);
}