import { registerPlugin } from '../plugin-loader.js';

registerPlugin({
  name: 'toolbar',
  setup({ input, updatePreview }) {
    const bar = document.getElementById('plugin-bar');

    function add(label, action) {
      const btn = document.createElement("button");
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

    // 🎨 Theme toggle
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
• Bold/Italic/Heading
• Math: $x$ or $$...$$
• Drag the divider to resize
• Use toolbar to export or preview`);
    });

    // 🔗 Preview + Save/Load/Export
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

    // 🔧 Utilities (with keyboard fix)
    function wrap(before, after) {
      const s = input.selectionStart, e = input.selectionEnd;
      const selected = input.value.slice(s, e);
      const newText = before + selected + after;

      input.setRangeText(newText, s, e, 'end');
      updatePreview(input.value);
      input.focus();
      setTimeout(() => input.setSelectionRange(s + before.length + selected.length + after.length, s + before.length + selected.length + after.length), 0);
    }

    function linePrefix(prefix) {
      const lines = input.value.split("\n");
      const pos = input.selectionStart;
      const idx = input.value.slice(0, pos).split("\n").length - 1;
      lines[idx] = prefix + lines[idx];
      input.value = lines.join("\n");
      updatePreview(input.value);
      input.focus();
      setTimeout(() => input.setSelectionRange(pos + prefix.length, pos + prefix.length), 0);
    }

    function insert(content) {
      const pos = input.selectionStart;
      input.setRangeText(content, pos, pos, 'end');
      updatePreview(input.value);
      input.focus();
      setTimeout(() => input.setSelectionRange(pos + content.length, pos + content.length), 0);
    }
  }
});