import { registerPlugin } from './index.html';

registerPlugin({
  name: 'core-toolbar',
  setup({ input, updatePreview }) {
    const container = document.getElementById('plugin-bar');

    function makeButton(label, handler) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.onclick = handler;
      container.appendChild(btn);
    }

    makeButton("🔗 Preview", () => {
      const encoded = encodeURIComponent(input.value);
      window.open("preview.html#" + encoded, "_blank");
    });

    makeButton("💾 Save", () => {
      localStorage.setItem("markdownDraft", input.value);
      alert("Draft saved!");
    });

    makeButton("📂 Load", () => {
      const draft = localStorage.getItem("markdownDraft");
      if (draft !== null) {
        input.value = draft;
        updatePreview(draft);
      } else {
        alert("No draft found.");
      }
    });

    makeButton("📄 Export", () => {
      const blob = new Blob([input.value], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "draft.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
});
