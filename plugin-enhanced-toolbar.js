import { registerPlugin } from './plugin-loader.js';

registerPlugin({
  name: 'enhanced-toolbar',
  setup({ input, updatePreview }) {
    const bar = document.getElementById('plugin-bar');

    function add(label, action) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.onclick = action;
      bar.appendChild(btn);
    }

    // ✍️ Formatting Buttons
    add("Bold", () => wrapSelection("**", "**"));
    add("Italic", () => wrapSelection("*", "*"));
    add("Heading", () => insertPrefix("# "));

    // 🧮 Math Templates
    add("Inline $x$", () => wrapSelection("$", "$"));
    add("Block $$...$$", () => insertBlock("$$\n\\int_0^1 x dx\n$$"));

    // 🎨 Theme Switcher
    let isDark = false;
    add("🌓 Theme", () => {
      document.body.style.background = isDark ? "#fdfdfd" : "#222";
      document.body.style.color = isDark ? "black" : "#ddd";
      document.querySelectorAll("button").forEach(btn =>
        btn.style.background = isDark ? "#444" : "#eee"
      );
      isDark = !isDark;
    });

    // 🆘 Help Button
    add("❔ Help", () => {
      alert(`Editor Shortcuts:
• Bold: Select → Bold
• Inline math: $E=mc^2$
• Block math: $$\\int_0^1 x dx$$
• Drag circle to resize editor
• Use '🔗 Preview' to view rendered output`);
    });

    // 🔗 Preview, Save, Load, Export
    add("🔗 Preview", () => {
      const encoded = encodeURIComponent(input.value);
      window.open("preview.html#" + encoded, "_blank");
    });

    add("💾 Save", () => {
      localStorage.setItem("markdownDraft", input.value);
      alert("Saved!");
    });

    add("📂 Load", () => {
      const draft = localStorage.getItem("markdownDraft");
      if (draft) {
        input.value = draft;
        updatePreview(draft);
      } else {
        alert("No draft found.");
      }
    });

    add("📄 Export", () => {
      const blob = new Blob([input.value], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "draft.md";
      a.click();
    });

    // Utilities
    function wrapSelection(before, after) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const selected = input.value.slice(start, end);
      input.setRangeText(before + selected + after, start, end, 'end');
      updatePreview(input.value);
    }

    function insertPrefix(prefix) {
      const lines = input.value.split("\n");
      const pos = input.selectionStart;
      let lineIndex = input.value.slice(0, pos).split("\n").length - 1;
      lines[lineIndex] = prefix + lines[lineIndex];
      input.value = lines.join("\n");
      updatePreview(input.value);
    }

    function insertBlock(template) {
      const pos = input.selectionStart;
      input.setRangeText(template, pos, pos, 'end');
      updatePreview(input.value);
    }
  }
});