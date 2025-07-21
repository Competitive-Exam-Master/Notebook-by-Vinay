// addons/exampleAddon.js
(() => {
    // This function will be called when the "Insert Example" button is clicked
    const insertExampleMarkdown = () => {
        // Using template literals (backticks `) for a robust multi-line string.
        // This ensures newlines and backslashes are handled correctly for Markdown and MathJax.
        const exampleMarkdown = `
# Markdown and MathJax Example

This is an example demonstrating **Markdown** formatting and MathJax for mathematical equations.

## Basic Markdown

* **Bold Text**: **bold** or __bold__
* *Italic Text*: *italic* or _italic_
* \`Monospace Code\`: \`inline code\`
* ~~Strikethrough~~: ~~strikethrough~~

## Code Blocks

Inline code can be highlighted. For example: \`console.log("Hello, World!")\`.

\`\`\`javascript
function helloWorld() {
    console.log("Hello, World!")
}
helloWorld();
\`\`\`

## Mathematics

Here's an inline equation using single dollar signs: $E=mc^2$.

And a display equation using double dollar signs:
$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

Another common formula:
$$
a^2 + b^2 = c^2
$$

Enjoy editing!
        `;
        // Use the App's setContent method to update the markdownInput
        if (typeof App !== 'undefined' && App.setContent) {
            App.setContent(exampleMarkdown.trim());
            console.log("Example Markdown inserted.");
        } else {
            console.error("App.setContent not available. Cannot insert example markdown.");
        }
    };

    // Create a button for the toolbar
    const exampleButton = document.createElement('button');
    exampleButton.id = 'insertExampleBtn';
    exampleButton.textContent = 'Insert Example';
    exampleButton.addEventListener('click', insertExampleMarkdown);

    // Add the button to the App's toolbar
    if (typeof App !== 'undefined' && App.addToolbarItem) {
        App.addToolbarItem(exampleButton);
        console.log("Insert Example button added to toolbar.");
    } else {
        console.error("App.addToolbarItem not available. Cannot add example button.");
    }
})();
