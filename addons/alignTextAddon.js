// addons/alignTextAddon.js
(() => {
    /**
     * Wraps the selected text in the markdownInput with the specified HTML tag and style.
     * @param {string} alignment - 'left', 'center', or 'right'.
     */
    const applyAlignment = (alignment) => {
        if (typeof App === 'undefined' || !App.getContent || !App.setContent || !App.getIsCodeView) {
            console.error("App object or its required methods not available for Align Text Addon.");
            return;
        }

        // Ensure we are in code view to modify the text
        if (!App.getIsCodeView()) {
            App.toggleView('code'); // Switch to code view if not already there
        }

        const markdownInput = document.getElementById('markdownInput');
        if (!markdownInput) {
            console.error("Markdown input element not found.");
            return;
        }

        const start = markdownInput.selectionStart;
        const end = markdownInput.selectionEnd;
        const selectedText = markdownInput.value.substring(start, end);

        if (!selectedText) {
            console.warn("No text selected for alignment.");
            return;
        }

        const currentContent = App.getContent();
        const before = currentContent.substring(0, start);
        const after = currentContent.substring(end);

        // Determine the appropriate tag and style
        let openingTag, closingTag;
        if (selectedText.includes('\n')) {
            // If the selection contains newlines, treat it as a block and use <div>
            openingTag = `<div style="text-align: ${alignment};">`;
            closingTag = `</div>`;
        } else {
            // Otherwise, assume it's inline and use <p> for paragraphs
            openingTag = `<p style="text-align: ${alignment};">`;
            closingTag = `</p>`;
        }
        
        const newContent = `${before}${openingTag}${selectedText}${closingTag}${after}`;
        App.setContent(newContent);

        // Restore selection or cursor position after update
        // Use a timeout to ensure DOM update (setContent) has completed
        setTimeout(() => {
            markdownInput.focus();
            markdownInput.selectionStart = start + openingTag.length;
            markdownInput.selectionEnd = start + openingTag.length + selectedText.length;
        }, 0);

        console.log(`Text aligned to: ${alignment}`);
    };

    // Create buttons for each alignment option
    const createAlignmentButton = (id, text, alignment) => {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        button.title = `Align selected text to ${alignment}`;
        button.addEventListener('click', () => applyAlignment(alignment));
        return button;
    };

    const alignLeftBtn = createAlignmentButton('alignLeftBtn', 'Align Left', 'left');
    const alignCenterBtn = createAlignmentButton('alignCenterBtn', 'Align Center', 'center');
    const alignRightBtn = createAlignmentButton('alignRightBtn', 'Align Right', 'right');

    // Add buttons to the toolbar
    if (typeof App !== 'undefined' && App.addToolbarItem) {
        App.addToolbarItem(alignLeftBtn);
        App.addToolbarItem(alignCenterBtn);
        App.addToolbarItem(alignRightBtn);
        console.log("Alignment buttons added to toolbar.");
    } else {
        console.error("App.addToolbarItem not available. Cannot add alignment buttons.");
    }
})();
