import { registerPlugin } from '../plugin-loader.js';

registerPlugin({
  name: 'toolbar',
  setup({ editor, updatePreview }) {
    const bar = document.getElementById('plugin-bar');
    bar.innerHTML = '';
    bar.style.overflowX = 'auto';
    bar.style.whiteSpace = 'nowrap';

    const buttons = [
      {
        label: "🖼️ Insert Image",
        fn: () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.style.display = "none";
          input.onchange = e => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = evt => {
                const img = document.createElement("img");
                img.src = evt.target.result;
                img.alt = "Image";
                img.style.maxWidth = "100%";

                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0) return;
                const range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(img);
                range.setStartAfter(img);
                range.setEndAfter(img);
                sel.removeAllRanges();
                sel.addRange(range);
              };
              reader.readAsDataURL(file);
            }
          };
          document.body.appendChild(input);
          input.click();
        }
      },
      {
        label: "∫ Insert Math",
        fn: () => {
          const span = document.createElement("span");
          span.textContent = "$\\int x dx$";
          span.style.padding = "2px 4px";
          span.style.background = "#cce";
          span.style.borderRadius = "4px";

          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0) return;
          const range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(span);
          range.setStartAfter(span);
          range.setEndAfter(span);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      },
      {
        label: "🔄 Preview",
        fn: () => updatePreview(editor.innerHTML)
      }
    ];

    buttons.forEach(({ label, fn }) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.onclick = fn;
      bar.appendChild(btn);
    });
  }
});