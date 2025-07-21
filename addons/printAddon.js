// addons/printAddon.js
(() => {
    const printButton = document.createElement('button');
    printButton.id = 'printBtn';
    printButton.textContent = 'Print Rendered';
    printButton.title = 'Print the rendered output';

    printButton.addEventListener('click', () => {
        if (typeof App === 'undefined' || !App.getIsCodeView || !App.toggleView) {
            console.error("App object or its required methods (getIsCodeView, toggleView) not available for Print Addon.");
            return;
        }

        const wasInCodeView = App.getIsCodeView();

        // Temporarily switch to rendered view for printing
        if (wasInCodeView) {
            App.toggleView('render'); // Force to render view
        }

        // Wait a moment for rendering to complete (especially MathJax)
        // A small timeout helps ensure the content is fully laid out before printing.
        // For more robust solutions, one might listen to MathJax's typesetting completion.
        setTimeout(() => {
            window.print();

            // Switch back to code view after printing, if it was originally in code view
            if (wasInCodeView) {
                App.toggleView('code'); // Force back to code view
            }
        }, 500); // 500ms delay
    });

    // Add the button to the App's toolbar
    if (typeof App !== 'undefined' && App.addToolbarItem) {
        App.addToolbarItem(printButton);
        console.log("Print button added to toolbar.");
    } else {
        console.error("App.addToolbarItem not available. Cannot add print button.");
    }
})();