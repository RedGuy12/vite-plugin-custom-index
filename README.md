# vite-plugin-custom-index

> Define a custom file for Vite to use as your index.html file

## What?

[Vite](https://vitejs.dev/) only allows you to use the index.html in your root as your app's HTML entry. This plugin lets you redefine that to be any file in your project. You can have a different index for dev vs build and even have your index file nested into a subdirectory.

## Usage

```shell
npm install vite-plugin-custom-index --save-dev
```

#### Basic config

```javascript
import customIndex from "vite-plugin-custom-index";

export default defineConfig({
    plugins: [
        customIndex("index.hbs")
    ]
});

// Different indexes for dev and build, either or are optional
customIndex({
    dev: "nested/index.html",
    build: "buildIndex.html"
});

// Treat different extensions as HTML. They won't be used as your index, but Vite will transform them as HTML when they are requested (injects Vite client, run other html plugins on it, etc)
customIndex({
    index: "index.hbs", // optional
    treatAsHtml: ["hbs", "any", "file", "ext"]
});

customIndex({
    dev: {
        index: "app.html",
        treatAsHtml: ["ejs"]
    }
});

// Or use a function 
customIndex((requestedPath) => {
    if(requestedPath.endsWith("my/custom/route")) {
        return "otherIndex.html";
    }

    return requestedPath; // Just return the original path to do nothing
});
```