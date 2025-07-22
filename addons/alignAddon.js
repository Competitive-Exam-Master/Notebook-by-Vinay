// addons/alignAddon.js
(() => {
    const markdownInput = document.getElementById('markdownInput');
    if (!markdownInput) {
        console.error("Markdown input element not found. Cannot initialize alignAddon.");
        return;
    }

    const applyAlignment = (alignment) => {
        const start = markdownInput.selectionStart;
        const end = markdownInput.selectionEnd;
        let selectedText = markdownInput.value.substring(start, end);

        if (!selectedText) {
            // If no text is selected, try to apply to the current line
            const lines = markdownInput.value.split('\n');
            let currentLineIndex = markdownInput.value.substring(0, start).split('\n').length - 1;
            selectedText = lines[currentLineIndex];
            
            // Adjust start and end to cover the whole line
            const lineStart = markdownInput.value.lastIndexOf('\n', start - 1) + 1;
            const lineEnd = markdownInput.value.indexOf('\n', end);
            selectedText = markdownInput.value.substring(lineStart, lineEnd === -1 ? markdownInput.value.length : lineEnd);
            
            // Recalculate start and end for the replacement
            markdownInput.selectionStart = lineStart;
            markdownInput.selectionEnd = (lineEnd === -1 ? markdownInput.value.length : lineEnd);
            selectedText = markdownInput.value.substring(markdownInput.selectionStart, markdownInput.selectionEnd);
        }

        let newText;
        // Check if alignment tags are already present and remove them first
        const hasCenter = selectedText.includes('<center>') && selectedText.includes('</center>');
        const hasLeft = selectedText.includes('<left>') && selectedText.includes('</left>');
        const hasRight = selectedText.includes('<right>') && selectedText.includes('</right>');

        if (hasCenter || hasLeft || hasRight) {
            // Remove existing alignment tags
            let cleanedText = selectedText.replace(/<(center|left|right)>/g, '').replace(/<\/(center|left|right)>/g, '');
            if (alignment === 'none') { // Option to remove alignment
                newText = cleanedText;
            } else {
                newText = `<${alignment}>${cleanedText}</${alignment}>`;
            }
        } else if (alignment === 'none') {
            newText = selectedText; // No alignment to remove
        } else {
            // Apply new alignment
            newText = `<${alignment}>${selectedText}</${alignment}>`;
        }
        
        // Replace selected text with new aligned text
        const before = markdownInput.value.substring(0, markdownInput.selectionStart);
        const after = markdownInput.value.substring(markdownInput.selectionEnd);
        markdownInput.value = before + newText + after;

        // Restore selection or set cursor after the inserted text
        if (selectedText) {
            markdownInput.selectionStart = before.length;
            markdownInput.selectionEnd = before.length + newText.length;
        } else {
            markdownInput.selectionStart = markdownInput.selectionEnd = before.length + newText.length;
        }

        // Trigger content re-render
        if (typeof App !== 'undefined' && App.renderContent) {
            App.renderContent();
            console.log(`Text aligned to ${alignment}.`);
        } else {
            console.warn("App.renderContent not available. Render not updated after alignment.");
        }
    };

    // Helper to create buttons
    const createButton = (id, text, title, onClickHandler) => {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        button.title = title;
        button.addEventListener('click', onClickHandler);
        return button;
    };

    // Create alignment buttons
    const leftAlignBtn = createButton('leftAlignBtn', 'Align Left', 'Align selected text or current line to the left', () => applyAlignment('left'));
    const centerAlignBtn = createButton('centerAlignBtn', 'Align Center', 'Center selected text or current line', () => applyAlignment('center'));
    const rightAlignBtn = createButton('rightAlignBtn', 'Align Right', 'Align selected text or current line to the right', () => applyAlignment('right'));
    const removeAlignBtn = createButton('removeAlignBtn', 'Remove Alignment', 'Remove alignment from selected text or current line', () => applyAlignment('none'));

    // Add buttons to the toolbar
    if (typeof App !== 'undefined' && App.addToolbarItem) {
        App.addToolbarItem(leftAlignBtn);
        App.addToolbarItem(centerAlignBtn);
        App.addToolbarItem(rightAlignBtn);
        App.addToolbarItem(removeAlignBtn);
        console.log("Text alignment buttons added to toolbar.");
    } else {
        console.error("App.addToolbarItem not available. Cannot add alignment buttons.");
    }

    // Add custom renderer rules to marked.js for <center>, <left>, <right> tags
    if (typeof marked !== 'undefined') {
        // Ensure this only runs once, or handles re-configuration properly
        marked.use({
            extensions: [{
                name: 'alignBlock',
                level: 'block',
                start(src) { return src.match(/<(center|left|right)>/); },
                tokenizer(src, tokens) {
                    const rule = /^<(center|left|right)>([\s\S]*?)<\/(center|left|right)> *(?:\n|$)/;
                    const match = rule.exec(src);
                    if (match) {
                        const tag = match[1];
                        const content = match[2];
                        return {
                            type: 'alignBlock',
                            raw: match[0],
                            align: tag,
                            tokens: this.lexer.blockTokens(content)
                        };
                    }
                },
                renderer(token) {
                    return `<div style="text-align: ${token.align};">${this.parser.parse(token.tokens)}\n</div>`;
                }
            }]
        });
        console.log("Marked.js extension for text alignment added.");
    } else {
        console.warn("Marked.js not available. Alignment rendering will not work.");
    }
})();
