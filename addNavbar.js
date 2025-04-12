// Adds a navigationbar to the top of the webpage
function createElement(tagName, toAppend) {
    let element = document.createElement(tagName);
    toAppend.appendChild(element);
    return element;
}

let link = createElement('link',document.head); link.rel = 'stylesheet'; link.type = 'text/css'; link.href = "/private/navbar.css"
let navbar = createElement("div",document.body);