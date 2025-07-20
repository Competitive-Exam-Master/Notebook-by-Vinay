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
            const inputEl = document.createElement("input");
            inputEl.type = "file";
            inputEl.accept = "image/*";
            inputEl.style.display = "none";
            inputEl.onchange = (e) => {
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
            document.body.appendChild(inputEl);
            inputEl.click();
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
          fn: () => alert(`Images now:
• show icon labels in editor
• render full image in preview
• remove base64 blobs on import`)
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
      setTimeout(() => input.setSelectionRange(s + before.length + (e - s) + after.length, s + before.length + (e - s) + after.length), 0);
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
      setTimeout(() => input.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length), 0);
    }

    function wrapNearestImage(align) {
      const lines = input.value.split("\n");
      const pos = input.selectionStart;
      const lineIndex = input.value.slice(0, pos).split("\n").length - 1;

      let imgLine = -1;
      for (let i = lineIndex; i >= 0; i--) {
        if (lines[i].includes("![") || lines[i].includes("[📷") || lines[i].includes("<img")) {
          imgLine = i;
          break;
        }
      }

      if (imgLine === -1) return alert("No image found above the cursor.");

      lines[imgLine] = `<p align="${align}">${lines[imgLine]}</p>`;
      input.value = lines.join("\n");
      updatePreview(input.value);
      const offset = lines.slice(0, imgLine + 1).join("\n").length;
      input.focus();
      setTimeout(() => input.setSelectionRange(offset, offset), 0);
    }

    function toggleTheme() {
      dark = !dark;
      document.body.style.background = dark ? "#222" : "#fdfdfd";
      document.body.style.color = dark ? "#ddd" : "black";
      document.querySelectorAll("button").forEach(btn =>
        btn.style.background = dark ? "#444" : "#eee"
      );
    }

    let dark = false;

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
      window.imageMap = {};
      let cleaned = [];
      let counter = 1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("<!--") && line.includes("data:image")) {
          const base64 = line.slice(4, -3).trim();
          const label = `[📷 Image ${counter}]`;

          if (cleaned.length > 0 && cleaned[cleaned.length - 1] === label) {
            window.imageMap[label] = base64;
            counter++;
            continue;
          }

          window.imageMap[label] = base64;
          cleaned.push(label);
          counter++;
        } else if (!line.startsWith("<!--") || !line.includes("data:image")) {
          cleaned.push(line);
        }
      }

      const result = cleaned.join("\n");
      input.value = result;
      updatePreview(result);
      input.focus();
      setTimeout(() => input.setSelectionRange(result.length, result.length), 0);
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