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
  }
});
