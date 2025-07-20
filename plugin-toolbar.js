import { registerPlugin } from './plugin-loader.js';

registerPlugin({
  name: 'toolbar',
  setup({ input, updatePreview }) {
    const bar = document.getElementById('plugin-bar');

    function add(label, action) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.onclick = action;
      bar.appendChild(btn);
    }

    // ✍️ Formatting
    add("Bold", () => wrap("**", "**"));
    add("Italic", () => wrap("*", "*"));
    add("Heading", () => linePrefix("# "));

    // 🧮 Math Templates
    add("Inline $x$", () => wrap("$", "$"));
    add("Block $$...$$", () => insert("$$\n\\int_0^1 x dx\n$$"));

    // 🎨 Theme Toggle
    let dark = false;
    add("🌓 Theme", () => {
      document.body.style.background = dark ? "#fdfdfd" : "#222";
      document.body.style.color = dark ? "black" : "#ddd";
      document.querySelectorAll("button").forEach(btn =>
        btn.style.background = dark ? "#444" : "#eee"
      );
      dark = !dark;
    });

    // 🆘 Help
    add("❔ Help", () => {
      alert(`Editor Shortcuts:
• Bold: Select → Bold
• Inline math: $E=mc^2$
• Block math: $$\\int_0^1 x dx$$
• Drag circle to resize editor
• Preview to share output`);
    });

    // 🔗 Core Actions
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

    // 🔧 Utilities
    function wrap(before, after) {
      const s = input.selectionStart;
      const e = input.selectionEnd;
      const selected = input.value.slice(s, e);
      input.setRangeText(before + selected + after, s, e, 'end');
      updatePreview(input.value);
    }

    function linePrefix(prefix) {
      const lines = input.value.split("\n");
      const pos = input.selectionStart;
      const idx = input.value.slice(0, pos).split("\n").length - 1;
      lines[idx] = prefix + lines[idx];
      input.value = lines.join("\n");
      updatePreview(input.value);
    }

    function insert(content) {
      const pos = input.selectionStart;
      input.setRangeText(content, pos, pos, 'end');
      updatePreview(input.value);
    }
  }
});