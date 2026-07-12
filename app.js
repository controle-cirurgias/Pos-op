/* ===========================================================
   Pós-Operatório — App vanilla JS (sem React, sem build, sem CDN)
   =========================================================== */

const HOSPITAL_NOME = "HOSPITAL DE PENHA";
const HOSPITAL_END = "Rua Calisto Luiz Honório, s/nº — Fone: (47) 3345-6756 — CEP 88.385-000 — Penha/SC";
const MEDICO = "Dr. Mateus Rover Cipili";
const CRM = "CRM/SC 23793";
const ESPECIALIDADE = "Cirurgião Geral";

const MEDS_BRANCO_PADRAO = [
  { nome: "Cefalexina 500mg", qtd: "28 comprimidos", pos: "Tomar 1 comprimido de 6/6h por 7 dias" },
  { nome: "Nimesulida 100mg", qtd: "1 caixa", pos: "Tomar 1 comprimido de 12/12h por 3 dias" },
  { nome: "Dipirona 1g  ou  Paracetamol 750mg", qtd: "1 caixa", pos: "Tomar 1 comprimido de 6/6h se dor ou febre" },
  { nome: "Vonau 4mg (Ondansetrona)", qtd: "1 caixa", pos: "Tomar 1 comprimido de 6/6h se náuseas ou vômitos" },
];

const MED_NEBACETIN = { nome: "Nebacetin _______", qtd: "2 tubos", pos: "Aplicar na ferida em toda troca de curativo, diariamente" };

// Medicamentos extras adicionados automaticamente à receita conforme a
// cirurgia selecionada (além dos MEDS_BRANCO_PADRAO). Só são inseridos se
// ainda não estiverem na lista, para não duplicar em reedições.
const MEDS_EXTRA_POR_CIRURGIA = {
  "Exérese de cisto pilonidal": [MED_NEBACETIN],
};

const CIRURGIAS_PADRAO = [
  { nome: "Colecistectomia Videolaparoscópica", cid: "K80.2" },
  { nome: "Colecistectomia", cid: "K80.2" },
  { nome: "Hernioplastia inguinal esquerda", cid: "K40.9" },
  { nome: "Hernioplastia inguinal direita", cid: "K40.9" },
  { nome: "Hernioplastia incisional", cid: "K43" },
  { nome: "Hernioplastia umbilical", cid: "K42" },
  { nome: "Hernioplastia epigástrica", cid: "K43" },
  { nome: "Laqueadura", cid: "Z30.2" },
  { nome: "Hemorroidectomia", cid: "I84" },
  { nome: "Postectomia", cid: "N47" },
  { nome: "Extirpação de lesão de pele e subcutâneo", cid: "L98.9" },
  { nome: "Exérese de cisto pilonidal", cid: "L05" },
  { nome: "Cirurgia de hidrocele", cid: "N43" },
  { nome: "Cirurgia de varicocele", cid: "I86.1" },
  { nome: "Vasectomia", cid: "Z30.2" },
  { nome: "Fistulectomia anal", cid: "K60.5" },
];

// ---------- Estado global ----------
const state = {
  nomePaciente: "",
  dataDocumento: "",
  cirurgia: "",
  cirurgiaOutraTexto: "",
  diasRepouso: "",
  cid: "",
  observacoesAtestado: "",
  observacoesOrientacoes: "",
  dietaOpcao: "3",
  medsBranco: MEDS_BRANCO_PADRAO.map((m) => ({ ...m })),
  usarB1: false,
  medPaco: {
    nome: "PACO (Paracetamol 500mg + Codeína 30mg)",
    qtd: "1 caixa",
    pos: "Tomar 1 comprimido de 6/6h apenas se dor forte",
  },
  printMode: false,
};

// ---------- Helpers DOM ----------
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (v !== undefined && v !== null) {
      node.setAttribute(k, v);
    }
  }
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c === null || c === undefined) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}
function txt(s) { return document.createTextNode(s); }

function escapeHtml(s) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------- Componentes de formulário ----------
function fieldInput({ label, value, onInput, placeholder, type = "text", wide = false }) {
  const input = el("input", {
    type,
    value,
    placeholder: placeholder || "",
    class: "field-input",
    oninput: (e) => onInput(e.target.value),
  });
  return el("label", { class: "field" + (wide ? " field-wide" : "") }, [
    el("span", { class: "field-label" }, label),
    input,
  ]);
}

function fieldTextarea({ label, value, onInput, placeholder, rows = 2 }) {
  const textarea = el("textarea", {
    rows: String(rows),
    placeholder: placeholder || "",
    class: "field-input field-textarea",
    oninput: (e) => onInput(e.target.value),
  });
  textarea.value = value;
  return el("label", { class: "field" }, [
    el("span", { class: "field-label" }, label),
    textarea,
  ]);
}

function medCard(med, index, onChange, onRemove) {
  const nomeInput = el("input", {
    class: "med-input med-input-name",
    placeholder: "Nome do medicamento",
    value: med.nome,
    oninput: (e) => onChange(index, { ...med, nome: e.target.value }),
  });
  const qtdInput = el("input", {
    class: "med-input",
    placeholder: "Quantidade (ex: 1 caixa)",
    value: med.qtd,
    oninput: (e) => onChange(index, { ...med, qtd: e.target.value }),
  });
  const posInput = el("input", {
    class: "med-input",
    placeholder: "Posologia",
    value: med.pos,
    oninput: (e) => onChange(index, { ...med, pos: e.target.value }),
  });

  const header = el("div", { class: "med-card-header" }, [
    el("span", { class: "med-number" }, String(index + 1)),
    onRemove
      ? el("button", { class: "btn-icon-remove", type: "button", onclick: onRemove }, "✕")
      : null,
  ]);

  return el("div", { class: "med-card" }, [header, nomeInput, qtdInput, posInput]);
}

// ---------- Render: tela de formulário ----------
function renderForm(root) {
  root.innerHTML = "";

  const header = el("header", { class: "app-header" }, [
    el("div", { class: "app-header-title" }, "Pós-Operatório"),
    el("div", { class: "app-header-subtitle" }, `${MEDICO} · ${ESPECIALIDADE}`),
  ]);

  // --- Seção: Dados do paciente ---
  const secDados = el("section", { class: "form-section" }, [
    el("h2", { class: "section-title" }, "Dados do paciente"),
    el("p", { class: "section-hint" }, "Preencha uma vez — esses dados aparecem em todos os documentos."),
  ]);

  const gridRow1 = el("div", { class: "field-grid" }, [
    fieldInput({
      label: "Nome do paciente",
      value: state.nomePaciente,
      onInput: (v) => { state.nomePaciente = v; updateGenerateButton(); },
      placeholder: "Nome completo",
      wide: true,
    }),
  ]);

  const dataField = el("label", { class: "field" }, [
    el("span", { class: "field-label" }, "Data"),
    el("input", {
      type: "date",
      class: "field-input field-date",
      value: brToIso(state.dataDocumento),
      onchange: (e) => { state.dataDocumento = isoToBr(e.target.value); },
    }),
  ]);
  gridRow1.appendChild(dataField);

  const usandoOutra = state.cirurgia === "__outra__";

  const selectOptions = [
    el("option", { value: "" }, "— Selecione —"),
    ...CIRURGIAS_PADRAO.map((c) => el("option", { value: c.nome, ...(state.cirurgia === c.nome ? { selected: "selected" } : {}) }, c.nome)),
    el("option", { value: "__outra__", ...(usandoOutra ? { selected: "selected" } : {}) }, "Outra cirurgia..."),
  ];

  const cirurgiaSelect = el("select", {
    class: "field-input",
    onchange: (e) => {
      const val = e.target.value;
      state.cirurgia = val;
      if (val === "__outra__") {
        state.cirurgiaOutraTexto = state.cirurgiaOutraTexto || "";
      } else {
        const match = CIRURGIAS_PADRAO.find((c) => c.nome === val);
        if (match) state.cid = match.cid;
      }
      const extras = MEDS_EXTRA_POR_CIRURGIA[val] || [];
      extras.forEach((extra) => {
        const jaExiste = state.medsBranco.some((m) => m.nome === extra.nome);
        if (!jaExiste) state.medsBranco.push({ ...extra });
      });
      renderForm(root);
    },
  }, selectOptions);

  const gridRow2Children = [
    el("label", { class: "field field-wide" }, [
      el("span", { class: "field-label" }, "Cirurgia realizada"),
      cirurgiaSelect,
    ]),
  ];

  if (usandoOutra) {
    gridRow2Children.push(
      el("label", { class: "field field-wide" }, [
        el("span", { class: "field-label" }, "Nome da cirurgia (digite)"),
        el("input", {
          type: "text",
          class: "field-input",
          placeholder: "Digite o nome da cirurgia",
          value: state.cirurgiaOutraTexto || "",
          oninput: (e) => { state.cirurgiaOutraTexto = e.target.value; },
        }),
      ])
    );
  }

  const gridRow2 = el("div", { class: "field-grid" }, gridRow2Children);

  const gridRow3 = el("div", { class: "field-grid" }, [
    fieldInput({
      label: "Dias de repouso",
      value: state.diasRepouso,
      onInput: (v) => { state.diasRepouso = v; },
      placeholder: "Ex: 15",
    }),
    fieldInput({
      label: "CID-10",
      value: state.cid,
      onInput: (v) => { state.cid = v; },
      placeholder: "Ex: K35.8",
    }),
  ]);

  const obsAtestado = fieldTextarea({
    label: "Observações do atestado (opcional)",
    value: state.observacoesAtestado,
    onInput: (v) => { state.observacoesAtestado = v; },
    placeholder: "Observações adicionais para o atestado",
  });

  const obsOrientacoes = fieldTextarea({
    label: "Observações das orientações (opcional)",
    value: state.observacoesOrientacoes,
    onInput: (v) => { state.observacoesOrientacoes = v; },
    placeholder: "Observações adicionais para as orientações pós-operatórias",
  });

  const dietaField = el("div", { class: "field" }, [
    el("span", { class: "field-label" }, "Dieta pós-operatória (orientações)"),
    el("div", { class: "radio-group" }, [
      radioPill("3 dias", state.dietaOpcao === "3", () => { state.dietaOpcao = "3"; renderForm(root); }),
      radioPill("20 dias", state.dietaOpcao === "20", () => { state.dietaOpcao = "20"; renderForm(root); }),
      radioPill("Livre", state.dietaOpcao === "livre", () => { state.dietaOpcao = "livre"; renderForm(root); }),
    ]),
  ]);

  secDados.append(gridRow1, gridRow2, gridRow3, obsAtestado, obsOrientacoes, dietaField);

  // --- Seção: Receituário Branco ---
  const secBranco = el("section", { class: "form-section" }, [
    el("h2", { class: "section-title" }, "Receituário Branco"),
    el("p", { class: "section-hint" }, "Medicamentos padrão — edite se precisar mudar algo neste paciente."),
  ]);
  const medList = el("div", { class: "med-list" });
  state.medsBranco.forEach((med, i) => {
    medList.appendChild(
      medCard(
        med,
        i,
        (idx, novo) => { state.medsBranco[idx] = novo; },
        () => { state.medsBranco.splice(i, 1); renderForm(root); }
      )
    );
  });
  const addBtn = el("button", {
    class: "btn btn-add",
    type: "button",
    onclick: () => { state.medsBranco.push({ nome: "", qtd: "", pos: "" }); renderForm(root); },
  }, "+ Adicionar medicamento");
  secBranco.append(medList, addBtn);

  // --- Seção: Receituário B1 ---
  const secB1 = el("section", { class: "form-section" });
  const toggleRow = el("div", { class: "toggle-row" }, [
    el("div", {}, [
      el("h2", { class: "section-title" }, "Receituário Amarelo"),
      el("p", { class: "section-hint" }, "Para codeína/opioides (ex: PACO). Ative se este paciente precisar."),
    ]),
    switchToggle(state.usarB1, (checked) => { state.usarB1 = checked; renderForm(root); }),
  ]);
  secB1.appendChild(toggleRow);

  if (state.usarB1) {
    const b1List = el("div", { class: "med-list" }, [
      medCard(state.medPaco, 0, (idx, novo) => { state.medPaco = novo; }, null),
    ]);
    secB1.appendChild(b1List);
  }

  // --- Barra de ação ---
  const actionBar = el("div", { class: "action-bar", id: "action-bar" });
  renderActionBar(actionBar);

  root.append(header, el("div", { class: "form-container" }, [secDados, secBranco, secB1]), actionBar);
}

function radioPill(label, active, onClick) {
  return el("label", { class: "radio-pill" + (active ? " active" : ""), onclick: onClick }, label);
}

function switchToggle(checked, onChange) {
  const input = el("input", {
    type: "checkbox",
    onchange: (e) => onChange(e.target.checked),
  });
  input.checked = checked;
  return el("label", { class: "switch" }, [input, el("span", { class: "switch-slider" })]);
}

function updateGenerateButton() {
  const bar = document.getElementById("action-bar");
  if (bar) renderActionBar(bar);
}

function renderActionBar(bar) {
  bar.innerHTML = "";
  const valid = state.nomePaciente.trim().length > 0;
  if (!valid) {
    bar.appendChild(el("div", { class: "warning-text" }, "Preencha o nome do paciente para continuar."));
  }
  const btn = el("button", {
    class: "btn btn-primary btn-large",
    type: "button",
    onclick: () => {
      if (!valid) return;
      state.printMode = true;
      renderApp();
    },
  }, "Gerar documentos →");
  if (!valid) btn.setAttribute("disabled", "true");
  bar.appendChild(btn);
}

// ---------- Conversores de data ----------
function brToIso(br) {
  const m = (br || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";
  return `${m[3]}-${m[2]}-${m[1]}`;
}
function isoToBr(iso) {
  const m = (iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}

// ---------- Render: documentos para impressão ----------
function hospitalHeader() {
  return el("div", { class: "doc-header" }, [
    el("div", { class: "doc-header-text" }, [
      el("div", { class: "doc-hospital-nome" }, HOSPITAL_NOME),
      el("div", { class: "doc-hospital-end" }, HOSPITAL_END),
    ]),
  ]);
}

function assinaturaBlock() {
  return el("div", { class: "assinatura" }, [
    el("div", { class: "assinatura-linha" }),
    el("div", { class: "assinatura-nome" }, MEDICO),
    el("div", { class: "assinatura-crm" }, `${CRM} | ${ESPECIALIDADE}`),
  ]);
}

function caixaFarmaceutico(via) {
  function row(cells) {
    return el("div", { class: "caixa-farm-row" }, cells.map((c) => el("div", { class: "caixa-farm-cell" }, c)));
  }
  return el("div", { class: "caixa-farm" }, [
    el("div", { class: "caixa-farm-titulo" }, `IDENTIFICAÇÃO DO COMPRADOR — ${via} VIA`),
    row(["Nome: ___________________________________", "RG / CPF: ___________________________"]),
    row(["Endereço: _______________________________________________________________"]),
    row(["Cidade: ______________________________", "Telefone: ___________________________"]),
    row(["Data da dispensação: ___/___/______", "Ass. Farmacêutico(a): ______________"]),
  ]);
}

function receituarioPage({ tipo, subtitulo, cor, via, meds, nomePaciente, data }) {
  const pacienteCell = el("div", { class: "paciente-data-cell paciente-data-cell-wide" }, [
    el("strong", {}, "Paciente: "),
    nomePaciente ? txt(nomePaciente) : el("span", { class: "placeholder-text" }, "________________________"),
  ]);
  const dataCell = el("div", { class: "paciente-data-cell" }, [
    el("strong", {}, "Data: "),
    data ? txt(data) : el("span", { class: "placeholder-text" }, "__/__/____"),
  ]);

  const prescricaoList = el("div", { class: "prescricao-list" });
  meds.forEach((m, i) => {
    const nomeLine = el("div", { class: "prescricao-nome" }, [
      el("strong", {}, `${i + 1}.  ${m.nome}`),
      m.qtd ? el("span", { class: "prescricao-qtd" }, `   (${m.qtd})`) : null,
    ]);
    const posLine = el("div", { class: "prescricao-pos" }, m.pos);
    prescricaoList.appendChild(el("div", { class: "prescricao-item" }, [nomeLine, posLine]));
  });

  const titulo = el("h1", { class: "doc-titulo" }, tipo);
  titulo.style.color = cor;

  return el("div", { class: "doc-page" }, [
    hospitalHeader(),
    el("div", { class: "doc-divider" }),
    titulo,
    el("p", { class: "doc-subtitulo" }, subtitulo),
    el("div", { class: "doc-divider" }),
    el("div", { class: "paciente-data-row" }, [pacienteCell, dataCell]),
    prescricaoList,
    assinaturaBlock(),
    caixaFarmaceutico(via),
  ]);
}

function atestadoPage({ tituloVia, nomePaciente, cirurgia, data, diasRepouso, cid, observacoes }) {
  const titulo = el("h1", { class: "doc-titulo" }, tituloVia);
  titulo.style.color = "#1A5276";

  const texto = el("p", { class: "atestado-texto" }, [
    txt("Atesto para os devidos fins que o(a) paciente "),
    el("strong", {}, nomePaciente || "_______________________________________________"),
    txt(", esteve sob meus cuidados médicos, sendo submetido(a) a procedimento cirúrgico ("),
    el("strong", {}, cirurgia || "______________________________________________"),
    txt(") em "),
    el("strong", {}, data || "____/____/________"),
    txt(", necessitando de repouso pelo período de "),
    el("strong", {}, diasRepouso || "______"),
    txt(" dia(s), a partir desta data."),
  ]);

  const cidLine = el("div", { class: "campo-linha" }, [
    el("strong", {}, "CID-10: "),
    cid ? txt(cid) : el("span", { class: "placeholder-text" }, "_________________________"),
  ]);

  const obsBlock = el("div", { class: "campo-bloco" }, [
    el("strong", {}, "Observações:"),
    el("div", { class: "campo-bloco-linha" }, observacoes || ""),
    el("div", { class: "campo-bloco-linha-vazia" }),
  ]);

  const localData = el("div", { class: "campo-linha" }, [
    el("strong", {}, "Local e Data: "),
    txt("________________________________________"),
  ]);

  return el("div", { class: "doc-page" }, [
    titulo,
    el("div", { class: "doc-divider" }),
    texto,
    cidLine,
    obsBlock,
    localData,
    assinaturaBlock(),
  ]);
}

function dietaTexto(opcao) {
  if (opcao === "20") return "Dieta leve sem comidas gordurosas ou pesadas por 20 dias.";
  if (opcao === "livre") return "Dieta livre.";
  return "Dieta leve sem comidas gordurosas ou pesadas por 3 dias.";
}

function itemRepouso(diasRepouso, extra) {
  return el("li", {}, [
    txt("Repouso relativo e afastamento de atividades físicas por "),
    el("strong", {}, diasRepouso || "______"),
    txt(` dias (andar de moto e bicicleta é considerado atividade física; dirigir carro liberado após 7 dias)${extra ? "; " + extra : "."}`),
  ]);
}

// Fábricas de item: cada chamada cria um nó <li> novo. Nós de DOM não podem
// pertencer a duas listas ao mesmo tempo (appendChild move, não clona), então
// não reutilizamos uma única instância entre as várias listas de cirurgia.
function itemContato() {
  return el("li", {}, "Em caso de febre, sangramento, dor intensa ou dúvidas, entrar em contato com o hospital ou procurar o pronto-socorro se necessário.");
}
function itemRetorno() {
  return el("li", {}, "Agendar retorno no hospital em: ____/____/________ às ______h.");
}

// Ilustração do banho de assento (foto ilustrativa em sitzbath.jpg).
function figuraBanhoAssento() {
  return el("div", { class: "figura-banho" }, [
    el("img", {
      src: "sitzbath.jpg",
      alt: "Ilustração de banho de assento",
      class: "figura-banho-img",
    }),
  ]);
}

function itemBanhoAssento() {
  return el("li", {}, [
    txt("Banho de assento com água morna por 10-15min, 3-4x ao dia e sempre após evacuar."),
    figuraBanhoAssento(),
  ]);
}

// Listas de orientações específicas por cirurgia. A chave deve bater com o
// nome exato da cirurgia em CIRURGIAS_PADRAO. Cirurgias fora desta lista
// (incluindo "Outra cirurgia...") usam ORIENTACOES_PADRAO.
const ORIENTACOES_POR_CIRURGIA = {
  "Postectomia": (diasRepouso, dietaOpcao) => [
    itemRepouso(diasRepouso, "evitar relação sexual e masturbação por 30 dias"),
    el("li", {}, dietaTexto(dietaOpcao)),
    el("li", {}, "Higiene local no banho com água e sabonete neutro; secar bem após."),
    el("li", {}, "Uso de cueca justa (tipo sunga) para melhor sustentação nos primeiros dias, se tolerado."),
    el("li", {}, "Edema (inchaço) e hematoma (roxidão) local são esperados nos primeiros dias e tendem a melhorar progressivamente."),
    el("li", {}, "Fazer gelo local por 10min, 3x ao dia, nos primeiros 3 dias, se houver inchaço importante."),
    el("li", {}, "Curativos diários."),
    el("li", {}, "Retirar pontos em 14 dias no posto de saúde, se não forem absorvíveis."),
    itemContato(),
    itemRetorno(),
  ],
  "Hemorroidectomia": (diasRepouso, dietaOpcao) => [
    itemRepouso(diasRepouso),
    el("li", {}, "Dieta rica em fibras (ex.: frutas com casca e bagaço, verduras, aveia, feijão, ameixa) e bastante líquido (mín. 2L de água/dia) para manter as fezes macias e evitar esforço evacuatório; usar laxante conforme orientação médica se necessário."),
    itemBanhoAssento(),
    el("li", {}, "Higiene local cuidadosa após cada evacuação."),
    el("li", {}, "Dor ao evacuar nos primeiros dias é esperada; usar os analgésicos prescritos antes da evacuação, se necessário."),
    el("li", {}, "Pequeno sangramento vivo nas primeiras evacuações pode ocorrer e é normal em pequena quantidade."),
    el("li", {}, "Evitar prender as fezes; procurar evacuar assim que sentir vontade."),
    itemContato(),
    itemRetorno(),
  ],
  "Fistulectomia anal": (diasRepouso, dietaOpcao) => [
    itemRepouso(diasRepouso),
    el("li", {}, "Dieta rica em fibras (ex.: frutas com casca e bagaço, verduras, aveia, feijão, ameixa) e bastante líquido (mín. 2L de água/dia) para manter as fezes macias e evitar esforço evacuatório; usar laxante conforme orientação médica se necessário."),
    itemBanhoAssento(),
    el("li", {}, "Curativo diário da ferida, mantendo-a limpa e seca fora dos horários de banho de assento."),
    el("li", {}, "A ferida cicatriza por segunda intenção (aberta), podendo haver secreção discreta; isso é esperado durante a cicatrização."),
    el("li", {}, "Evitar prender as fezes; procurar evacuar assim que sentir vontade."),
    itemContato(),
    itemRetorno(),
  ],
  "Cirurgia de hidrocele": (diasRepouso, dietaOpcao) => [
    itemRepouso(diasRepouso, "evitar relação sexual e esforço físico intenso por 15 dias"),
    el("li", {}, dietaTexto(dietaOpcao)),
    el("li", {}, "Uso de cueca justa (tipo sunga) ou suspensório escrotal para sustentação da bolsa escrotal nas primeiras semanas."),
    el("li", {}, "Edema (inchaço) e equimose (roxidão) escrotal são esperados e podem levar de 2 a 3 semanas para melhorar."),
    el("li", {}, "Fazer gelo local por 10min, 3x ao dia, nos primeiros 2-3 dias, para ajudar a reduzir o inchaço."),
    el("li", {}, "Manter a região cirúrgica limpa e seca; higiene no banho com água e sabonete neutro, secando bem após."),
    el("li", {}, "Curativos diários."),
    el("li", {}, "Retirar pontos em 14 dias no posto de saúde, se não forem absorvíveis."),
    itemContato(),
    itemRetorno(),
  ],
  "Cirurgia de varicocele": (diasRepouso, dietaOpcao) => [
    itemRepouso(diasRepouso, "evitar esforço físico intenso e levantamento de peso por 15 dias"),
    el("li", {}, dietaTexto(dietaOpcao)),
    el("li", {}, "Uso de cueca justa (tipo sunga) ou suspensório escrotal nos primeiros dias para maior conforto e sustentação."),
    el("li", {}, "Fazer gelo local por 10-15min a cada 3 a 4x ao dia nas primeiras 48h, para ajudar a reduzir o inchaço."),
    el("li", {}, "Edema (inchaço) e hematoma (roxidão) escrotal são esperados nos primeiros dias e tendem a melhorar progressivamente."),
    el("li", {}, "Curativos diários."),
    el("li", {}, "Retirar pontos em 14 dias no posto de saúde, se não forem absorvíveis."),
    itemContato(),
    itemRetorno(),
  ],
  "Exérese de cisto pilonidal": (diasRepouso, dietaOpcao) => [
    itemRepouso(diasRepouso, "evitar permanecer sentado por períodos prolongados e evitar exercícios físicos intensos por 45 dias"),
    el("li", {}, dietaTexto(dietaOpcao)),
    el("li", {}, "Curativo diário da ferida com pomada, mantendo-a limpa e seca; higiene local no banho ou após evacuar."),
    el("li", {}, "A ferida pode cicatrizar por segunda intenção (aberta), podendo haver secreção discreta; isso é esperado durante a cicatrização."),
    el("li", {}, "Preferir roupas íntimas de algodão, evitando calças e roupas muito justas na região operada."),
    el("li", {}, "Depilar a região da cicatriz por 6 meses após a cirurgia, para reduzir o risco de pelos encravados e recidiva."),
    itemContato(),
    itemRetorno(),
  ],
  "Laqueadura": (diasRepouso, dietaOpcao) => [
    itemRepouso(diasRepouso),
    el("li", {}, dietaTexto(dietaOpcao)),
    el("li", {}, "Curativos diários."),
    el("li", {}, "Retirar pontos em 14 dias no posto de saúde."),
    el("li", {}, "Fazer gelo local por 10min, 3x ao dia, nos primeiros 3 dias."),
    el("li", {}, "Manter métodos contraceptivos por dois meses após a cirurgia."),
    itemContato(),
    itemRetorno(),
  ],
};

function ORIENTACOES_PADRAO(diasRepouso, dietaOpcao) {
  return [
    itemRepouso(diasRepouso),
    el("li", {}, dietaTexto(dietaOpcao)),
    el("li", {}, "Curativos diários."),
    el("li", {}, "Retirar pontos em 14 dias no posto de saúde."),
    el("li", {}, "Fazer gelo local por 10min, 3x ao dia, nos primeiros 3 dias."),
    itemContato(),
    itemRetorno(),
  ];
}

function orientacoesPage({ nomePaciente, cirurgiaKey, cirurgia, data, diasRepouso, dietaOpcao, observacoes }) {
  const titulo = el("h1", { class: "doc-titulo" }, "ORIENTAÇÕES PÓS-OPERATÓRIAS");
  titulo.style.color = "#1A5276";

  function linha(label, value, placeholder) {
    return el("div", { class: "campo-linha" }, [
      el("strong", {}, label + ": "),
      value ? txt(value) : el("span", { class: "placeholder-text" }, placeholder),
    ]);
  }

  const gerarItens = ORIENTACOES_POR_CIRURGIA[cirurgiaKey] || ORIENTACOES_PADRAO;
  const lista = el("ol", { class: "orientacoes-list" }, gerarItens(diasRepouso, dietaOpcao));

  const obsBlock = el("div", { class: "campo-bloco" }, [
    el("strong", {}, "Observações:"),
    el("div", { class: "campo-bloco-linha" }, observacoes || ""),
    el("div", { class: "campo-bloco-linha-vazia" }),
  ]);

  return el("div", { class: "doc-page" }, [
    hospitalHeader(),
    el("div", { class: "doc-divider" }),
    titulo,
    el("div", { class: "doc-divider" }),
    linha("Paciente", nomePaciente, "________________________"),
    linha("Cirurgia realizada", cirurgia, "________________________"),
    linha("Data", data, "__/__/____"),
    el("div", { class: "orientacoes-titulo" }, "Orientações gerais:"),
    lista,
    obsBlock,
    assinaturaBlock(),
  ]);
}

// ---------- Render: tela de impressão ----------
function renderPrintMode(root) {
  root.innerHTML = "";

  const cirurgiaFinal = state.cirurgia === "__outra__" ? (state.cirurgiaOutraTexto || "") : state.cirurgia;

  const toolbar = el("div", { class: "print-toolbar no-print" }, [
    el("button", {
      class: "btn btn-secondary",
      type: "button",
      onclick: () => { state.printMode = false; renderApp(); },
    }, "← Voltar para editar"),
    el("button", {
      class: "btn btn-primary",
      type: "button",
      onclick: () => window.print(),
    }, "Imprimir tudo"),
  ]);

  const printRoot = el("div", { class: "print-root" }, [toolbar]);

  printRoot.appendChild(receituarioPage({
    tipo: "RECEITUÁRIO DE CONTROLE ESPECIAL",
    subtitulo: "Portaria SVS/MS nº 344/98 — 1ª Via: Farmácia | 2ª Via: Paciente",
    cor: "#1A5276", via: "1ª", meds: state.medsBranco,
    nomePaciente: state.nomePaciente, data: state.dataDocumento,
  }));
  printRoot.appendChild(receituarioPage({
    tipo: "RECEITUÁRIO DE CONTROLE ESPECIAL",
    subtitulo: "Portaria SVS/MS nº 344/98 — 1ª Via: Farmácia | 2ª Via: Paciente",
    cor: "#1A5276", via: "2ª", meds: state.medsBranco,
    nomePaciente: state.nomePaciente, data: state.dataDocumento,
  }));

  if (state.usarB1) {
    printRoot.appendChild(receituarioPage({
      tipo: "RECEITUÁRIO DE CONTROLE ESPECIAL",
      subtitulo: "Portaria SVS/MS nº 344/98 — 1ª Via: Farmácia | 2ª Via: Paciente",
      cor: "#7D6608", via: "1ª", meds: [state.medPaco],
      nomePaciente: state.nomePaciente, data: state.dataDocumento,
    }));
    printRoot.appendChild(receituarioPage({
      tipo: "RECEITUÁRIO DE CONTROLE ESPECIAL",
      subtitulo: "Portaria SVS/MS nº 344/98 — 1ª Via: Farmácia | 2ª Via: Paciente",
      cor: "#7D6608", via: "2ª", meds: [state.medPaco],
      nomePaciente: state.nomePaciente, data: state.dataDocumento,
    }));
  }

  printRoot.appendChild(atestadoPage({
    tituloVia: "ATESTADO MÉDICO",
    nomePaciente: state.nomePaciente, cirurgia: cirurgiaFinal, data: state.dataDocumento,
    diasRepouso: state.diasRepouso, cid: state.cid, observacoes: state.observacoesAtestado,
  }));
  printRoot.appendChild(atestadoPage({
    tituloVia: "ATESTADO MÉDICO — PERÍCIA INSS",
    nomePaciente: state.nomePaciente, cirurgia: cirurgiaFinal, data: state.dataDocumento,
    diasRepouso: state.diasRepouso, cid: state.cid, observacoes: state.observacoesAtestado,
  }));

  printRoot.appendChild(orientacoesPage({
    nomePaciente: state.nomePaciente, cirurgiaKey: state.cirurgia, cirurgia: cirurgiaFinal, data: state.dataDocumento,
    diasRepouso: state.diasRepouso, dietaOpcao: state.dietaOpcao, observacoes: state.observacoesOrientacoes,
  }));

  root.appendChild(printRoot);
}

// ---------- App raiz ----------
function renderApp() {
  const root = document.getElementById("root");
  if (state.printMode) {
    renderPrintMode(root);
  } else {
    renderForm(root);
  }
}

document.addEventListener("DOMContentLoaded", renderApp);
