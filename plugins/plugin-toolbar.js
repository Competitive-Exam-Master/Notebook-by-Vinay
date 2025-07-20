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
      help: [
        {
          label: "❔ Quick Tips",
          fn: () => alert(`Editor Tips:\n• Use ⬅️ Back to return\n• Scroll toolbar for hidden buttons\n• Type Markdown + MathJax\n• Drag divider to resize`)
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

    // 🔧 Helpers with keyboard-safe focus
    function wrap(before, after) {
      const s = input.selectionStart, e = input.selectionEnd;
      input.setRangeText(before + input.value.slice(s, e) + after, s, e, 'end');
      updatePreview(input.value);
      input.focus();
      const cursor = s + before.length + (e - s) + after.length;
      setTimeout(() => input.setSelectionRange(cursor, cursor), 0);
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

    function insert(text) {
      const pos = input.selectionStart;
      input.setRangeText(text, pos, pos, 'end');
      updatePreview(input.value);
      input.focus();
      setTimeout(() => input.setSelectionRange(pos + text.length, pos + text.length), 0);
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
      if (draft) {
        input.value = draft;
        updatePreview(draft);
        input.focus();
        setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
      } else {
        alert("No draft found.");
      }
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