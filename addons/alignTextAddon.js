// addons/alignTextAddon.js
(() => {
    /**
     * Wraps the selected text in the markdownInput with the specified HTML div and style.
     * It intelligently decides whether to add newlines around the content inside the div.
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
        let selectedText = markdownInput.value.substring(start, end);

        // Trim selectedText for initial checks but retain original for insertion
        const trimmedSelectedText = selectedText.trim();

        if (!trimmedSelectedText) {
            console.warn("No text selected for alignment.");
            return;
        }

        const currentContent = App.getContent();
        const before = currentContent.substring(0, start);
        const after = currentContent.substring(end);

        // Determine if newlines are needed around the content inside the div.
        // If the selected text contains multiple lines OR starts with a Markdown heading,
        // we'll add newlines for better Markdown processing within the div.
        const needsNewlines = trimmedSelectedText.includes('\n') || trimmedSelectedText.match(/^(#+\s.*)$/m);

        const openingTag = `<div style="text-align: ${alignment};">`;
        const closingTag = `</div>`;

        let contentToInsert;
        let newlineOffset = 0; // To adjust cursor position after insertion

        if (needsNewlines) {
            contentToInsert = `${openingTag}\n${selectedText}\n${closingTag}`;
            newlineOffset = 2; // Two newlines added (one after opening, one before closing)
        } else {
            // For single-line text, wrapping in a div with newlines might disrupt inline markdown.
            // However, a div is a block element, so it will always create a block.
            // For consistency and to ensure proper block parsing by Markdown within the div,
            // even single lines often benefit from being treated as a block.
            // Let's stick to the principle of using div for blocks, so we'll add newlines
            // unless the context absolutely forbids it (e.g., trying to center inline bold).
            // For simplicity and effectiveness with headings/paragraphs, let's keep newlines.
            contentToInsert = `${openingTag}\n${selectedText}\n${closingTag}`;
            newlineOffset = 2;
        }

        const newContent = `${before}${contentToInsert}${after}`;
        App.setContent(newContent);

        // Restore selection or cursor position after update
        // Use a timeout to ensure DOM update (setContent) has completed
        setTimeout(() => {
            markdownInput.focus();
            const newStart = start + openingTag.length + (needsNewlines ? 1 : 0); // +1 for newline if added
            const newEnd = newStart + selectedText.length;
            markdownInput.selectionStart = newStart;
            markdownInput.selectionEnd = newEnd;
        }, 0);

        console.log(`Text aligned to: ${alignment} using <div>`);
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
