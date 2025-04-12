export function addScript(path) {
    const script = addResource("script",path)
    script.async = false;
    script.onerror = () => console.error(`Error loading ${name}.`);
}

export function addResource(name, path) {
    return $(`<${name}>`, {
        src: path
    }).appendTo(document.head)
}

export function addDefaults() {
    addScript("https://code.jquery.com/jquery-3.7.1.min.js")
    addScript("/addNavbar.js")
}
