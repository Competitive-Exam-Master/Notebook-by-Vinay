import { registerPlugin } from '../plugin-loader.js';

registerPlugin({
  name: 'toolbar',
  setup({ input, updatePreview }) {
    const bar = document.getElementById('plugin-bar');
    bar.innerHTML = ''; // Clear if rerun
    bar.style.overflowX = 'auto';
    bar.style.whiteSpace = 'nowrap';

    let currentMenu = 'main';

    const menus = {
      main: [
        { label: "Bold", fn: () => wrap("**", "**") },
        { label: "Italic", fn: () => wrap("*", "*") },
        { label: "Heading", fn: () => linePrefix("# ") },
        { label: "Math 📐", submenu: "math" },
        { label: "Theme", fn: toggleTheme },
        { label: "Help", fn: showHelp },
        { label: "Preview", fn: () => openPreview() },
        { label: "Save", fn: () => save() },
        { label: "Load", fn: () => load() },
        { label: "Export", fn: () => exportMD() }
      ],
      math: [
        { label: "Inline $x$", fn: () => wrap("$", "$") },
        { label: "Block $$...$$", fn: () => insert("$$\n\\int_0^1 x dx\n$$") },
        { label: "Back ◀️", submenu: "main" }
      ]
    };

    function renderMenu(menuKey) {
      bar.innerHTML = '';
      menus[menuKey].forEach(item => {
        const btn = document.createElement('button');
        btn.textContent = item.label;
        if (item.fn) btn.onclick = item.fn;
        else if (item.submenu) btn.onclick = () => {
          currentMenu = item.submenu;
          renderMenu(currentMenu);
        };
        bar.appendChild(btn);
      });
    }

    renderMenu(currentMenu);

    // 🔧 Utilities
    function wrap(before, after) {
      const s = input.selectionStart, e = input.selectionEnd;
      const selected = input.value.slice(s, e);
      input.setRangeText(before + selected + after, s, e, 'end');
      updatePreview(input.value);
      input.focus();
      const cursor = s + before.length + selected.length + after.length;
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
      const lineIndex = input.value.slice(0, pos).split("\n").length - 1;
      const lineStart = lines.slice(0, lineIndex).join("\n").length + (lineIndex > 0 ? 1 : 0);
      lines[lineIndex] = prefix + lines[lineIndex];
      input.value = lines.join("\n");
      updatePreview(input.value);
      input.focus();
      const newPos = lineStart + prefix.length;
      setTimeout(() => input.setSelectionRange(newPos, newPos), 0);
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

    function showHelp() {
      alert(`Editor Tips:
• Bold / Italic / Headings
• Switch to Math submenu for equations
• Drag split handle to resize editor
• Toolbar scrolls horizontally
• Tap 'Back ◀️' to return to Main menu`);
    }

    function openPreview() {
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