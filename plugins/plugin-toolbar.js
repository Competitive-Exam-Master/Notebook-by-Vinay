import { registerPlugin } from '../plugin-loader.js';

registerPlugin({
  name: 'toolbar',
  setup({ input, updatePreview }) {
    const bar = document.getElementById('plugin-bar');
    bar.innerHTML = '';
    bar.style.overflowX = 'auto';
    bar.style.whiteSpace = 'nowrap';

    let currentMenu = 'main';

    const menus = {
      main: [
        { label: "✍️ Text", submenu: "text" },
        { label: "📐 Math", submenu: "math" },
        { label: "🎨 UI", submenu: "theme" },
        { label: "📂 File", submenu: "file" },
        { label: "🖼️ Media", submenu: "media" },
        { label: "🆘 Help", submenu: "help" }
      ],
      text: [
        { label: "Bold", fn: () => wrap("**", "**") },
        { label: "Italic", fn: () => wrap("*", "*") },
        { label: "Heading", fn: () => linePrefix("# ") },
        { label: "Back ◀️", submenu: "main" }
      ],
      math: [
        { label: "Inline $x$", fn: () => wrap("$", "$") },
        { label: "Block $$...$$", fn: () => insert("$$\n\\int_0^1 x dx\n$$") },
        { label: "Back ◀️", submenu: "main" }
      ],
      theme: [
        { label: "🌓 Toggle Theme", fn: toggleTheme },
        { label: "Back ◀️", submenu: "main" }
      ],
      file: [
        { label: "🔗 Preview", fn: preview },
        { label: "💾 Save", fn: save },
        { label: "📂 Load", fn: load },
        { label: "📄 Export", fn: exportMD },
        { label: "Back ◀️", submenu: "main" }
      ],
      media: [
        {
          label: "🖼️ Insert Image",
          fn: () => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.style.display = "none";
            fileInput.onchange = (e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                  if (!window.imageMap) window.imageMap = {};
                  const imgCount = Object.keys(window.imageMap).length + 1;
                  const label = `[📷 Image ${imgCount}]`;
                  window.imageMap[label] = evt.target.result;
                  const markdown = `${label}\n<!-- ${evt.target.result} -->`;
                  const pos = input.selectionStart;
                  input.setRangeText(markdown, pos, pos, 'end');
                  updatePreview(input.value);
                  input.focus();
                  setTimeout(() => input.setSelectionRange(pos + markdown.length, pos + markdown.length), 0);
                };
                reader.readAsDataURL(file);
              }
            };
            document.body.appendChild(fileInput);
            fileInput.click();
          }
        },
        { label: "Wrap Left", fn: () => wrapNearestImage("left") },
        { label: "Wrap Center", fn: () => wrapNearestImage("center") },
        { label: "Wrap Right", fn: () => wrapNearestImage("right") },
        { label: "Back ◀️", submenu: "main" }
      ],
      help: [
        {
          label: "❔ Quick Tips",
          fn: () => alert(`Editor Tips:
• Insert image → shows label, hides base64
• Load will auto-clean base64 into labels
• Preview will restore full images from memory`)
        },
        { label: "Back ◀️", submenu: "main" }
      ]
    };

    renderMenu(currentMenu);

    function renderMenu(menuKey) {
      bar.innerHTML = '';
      menus[menuKey].forEach(item => {
        const btn = document.createElement("button");
        btn.textContent = item.label;
        if (item.fn) btn.onclick = item.fn;
        else if (item.submenu) btn.onclick = () => {
          currentMenu = item.submenu;
          renderMenu(currentMenu);
        };
        bar.appendChild(btn);
      });
    }

    function wrap(before, after) {
      const s = input.selectionStart, e = input.selectionEnd;
      input.setRangeText(before + input.value.slice(s, e) + after, s, e, 'end');
      updatePreview(input.value);
      input.focus();
      const cursor = s + before.length + (e - s) + after.length;
      setTimeout(() => input.setSelectionRange(cursor, cursor), 0);
    }

    function insert(text) {
      const pos = input.selectionStart;
      input.setRangeText(text, pos, pos, 'end');
      updatePreview(input.value);
      input.focus();
      setTimeout(() => input.setSelectionRange(pos + text.length, pos + text.length), 0);
    }

    function linePrefix(prefix) {
      const lines = input.value.split("\n");
      const pos = input.selectionStart;
      const idx = input.value.slice(0, pos).split("\n").length - 1;
      const lineStart = lines.slice(0, idx).join("\n").length + (idx > 0 ? 1 : 0);
      lines[idx] = prefix + lines[idx];
      input.value = lines.join("\n");
      updatePreview(input.value);
      input.focus();
      const newPos = lineStart + prefix.length;
      setTimeout(() => input.setSelectionRange(newPos, newPos), 0);
    }

    function wrapNearestImage(align) {
      const lines = input.value.split("\n");
      const pos = input.selectionStart;
      const cursorLine = input.value.slice(0, pos).split("\n").length - 1;

      let imgLine = -1;
      for (let i = cursorLine; i >= 0; i--) {
        if (
          lines[i].includes("![") ||
          lines[i].includes("[📷") ||
          lines[i].includes("<img")
        ) {
          imgLine = i;
          break;
        }
      }

      if (imgLine === -1) {
        alert("No image found above the cursor.");
        return;
      }

      lines[imgLine] = `<p align="${align}">${lines[imgLine]}</p>`;
      input.value = lines.join("\n");
      updatePreview(input.value);

      const offset = lines.slice(0, imgLine + 1).join("\n").length;
      input.focus();
      setTimeout(() => input.setSelectionRange(offset, offset), 0);
    }

    let dark = false;
    function toggleTheme() {
      document.body.style.background = dark ? "#fdfdfd" : "#222";
      document.body.style.color = dark ? "black" : "#ddd";
      document.querySelectorAll("button").forEach(btn =>
        btn.style.background = dark ? "#444" : "#eee"
      );
      dark = !dark;
    }

    function preview() {
      const encoded = encodeURIComponent(input.value);
      window.open("preview.html#" + encoded, "_blank");
    }

    function save() {
      localStorage.setItem("markdownDraft", input.value);
      alert("Saved!");
    }

    function load() {
      const draft = localStorage.getItem("markdownDraft");
      if (!draft) return alert("No draft found.");

      const lines = draft.split("\n");
      window.imageMap = {}; // Reset
      let counter = 1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("<!--") && lines[i].includes("data:image")) {
          const base64 = lines[i].slice(4, -3).trim();
          const label = `[📷 Image ${counter}]`;
          window.imageMap[label] = base64;

          if (i > 0 && lines[i - 1].startsWith("[📷")) {
            lines[i] = ""; // Remove base64 line
          } else {
            lines[i] = label;
          }

          counter++;
        }
      }

      const cleaned = lines.filter(line => line !== "").join("\n");
      input.value = cleaned;
      updatePreview(cleaned);
      input.focus();
      setTimeout(() => input.setSelectionRange(cleaned.length, cleaned.length), 0);
    }

    function exportMD() {
      const blob = new Blob([input.value], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "draft.md";
      a.click();
    }
  }
});