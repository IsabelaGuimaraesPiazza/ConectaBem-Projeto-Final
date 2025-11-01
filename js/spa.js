// js/spa.js
function loadPage(page) {
document.addEventListener("click", function (e) {
  const link = e.target.closest("a[data-spa]");
  if (!link) return;

  e.preventDefault();
  const page = link.getAttribute("href");

  fetch(`pages/${page}`)
    .then(res => {
      if (!res.ok) throw new Error("Página não encontrada");
      return res.text();
    })
    .then(html => {
      document.getElementById("main").innerHTML = html;
    })
    .catch(() => {
      document.getElementById("main").innerHTML;
            ativarCertificado();
    });
});
function ativarCertificado() {
  const btn = document.getElementById("baixarCertificado");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const nome = document.getElementById("nomeCert")?.value || "Participante";
    const tipo = document.getElementById("tipo")?.value || "Voluntário";

    if (!window.jspdf) {
      alert("Erro ao carregar PDF. Recarregue a página.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(`Certificado - ConectaBem`, 20, 20);
    doc.text(`Nome: ${nome}`, 20, 40);
    doc.text(`Tipo: ${tipo}`, 20, 60);
    doc.save(`Certificado_${nome}.pdf`);
  });
}
function ativarCertificado() {
  const btn = document.getElementById("baixarCertificado");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const nome = document.getElementById("nomeCert")?.value || "Participante";
    const tipo = document.getElementById("tipo")?.value || "Voluntário";

    if (!window.jspdf) {
      alert("Erro ao carregar bibliotecas do PDF. Tente atualizar a página.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.text("Certificado ConectaBem", 20, 20);
    pdf.text(`Nome: ${nome}`, 20, 40);
    pdf.text(`Tipo: ${tipo}`, 20, 60);
    pdf.save(`certificado_${nome}.pdf`);
  });
}

// after content load
const conteudo = document.getElementById("main");

function carregarPagina(url) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      conteudo.innerHTML = html;

      // ativa o certificado quando estiver na tela cadastro
      if (url.includes("cadastro")) {
        ativarCertificado();
      }
    });
}
// ✅ Ativa funcionalidades da página de cadastro quando ela é carregada
function initCadastroPage() {
  const form = document.getElementById("formCadastro");
  const certBtn = document.getElementById("baixarCertificado");

  // --- ✅ Máscaras dos campos ---
  const mask = (id, pattern) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      let v = el.value.replace(/\D/g, "");
      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] && pattern[i].test && pattern[i].test(v)) {
          v = v.replace(pattern[i].test, pattern[i].replace);
        }
      }
      el.value = v;
    });
  };

  mask("cpf", [
    { test: v => v.length > 3, replace: /(\d{3})(\d)/, result: "$1.$2" },
    { test: v => v.length > 6, replace: /(\d{3})\.(\d{3})(\d)/, result: "$1.$2.$3" },
    { test: v => v.length > 9, replace: /(\d{3})\.(\d{3})\.(\d{3})(\d{2})/, result: "$1.$2.$3-$4" }
  ]);

  mask("telefone", [
    { test: v => v.length > 2, replace: /(\d{2})(\d)/, result: "($1) $2" },
    { test: v => v.length > 7, replace: /(\d)(\d{4})$/, result: "$1-$2" }
  ]);

  mask("cep", [
    { test: v => v.length > 5, replace: /(\d{5})(\d)/, result: "$1-$2" }
  ]);

  // ✅ Envio do formulário sem recarregar SPA
  if (form) {
    form.addEventListener("submit", () => {
      alert("✅ Cadastro realizado com sucesso!");
    });
  }

  // ✅ Gerar certificado
  if (certBtn) {
    certBtn.addEventListener("click", async () => {
      const nome = document.getElementById("nomeCert").value || "Participante";
      const tipo = document.getElementById("tipo").value;
      const { jsPDF } = window.jspdf;

      const doc = new jsPDF();
      doc.text(`Certificado`, 20, 20);
      doc.text(`Nome: ${nome}`, 20, 40);
      doc.text(`Tipo: ${tipo}`, 20, 60);
      doc.save(`Certificado_${nome}.pdf`);
    });
  }
}

// ✅ Detecta quando a página de cadastro é carregada
document.addEventListener("spa:loaded", () => {
  if (window.location.pathname.includes("cadastro")) {
    initCadastroPage();
  }
});
