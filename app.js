const HOSPITAL_NOME = "HOSPITAL NOSSA SENHORA DA PENHA";
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

function Field({ label, value, onChange, placeholder, className = "" }) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field-input"
      />
    </label>
  );
}

// Converte "dd/mm/aaaa" <-> "aaaa-mm-dd" (formato exigido pelo input type=date)
function brToIso(br) {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";
  return `${m[3]}-${m[2]}-${m[1]}`;
}
function isoToBr(iso) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function DateField({ label, value, onChange, className = "" }) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">{label}</span>
      <input
        type="date"
        value={brToIso(value)}
        onChange={(e) => onChange(isoToBr(e.target.value))}
        className="field-input field-date"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 2 }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="field-input field-textarea"
      />
    </label>
  );
}

function MedicamentoEditor({ med, index, onChange, onRemove }) {
  return (
    <div className="med-card">
      <div className="med-card-header">
        <span className="med-number">{index + 1}</span>
        <button className="btn-icon-remove" onClick={onRemove} title="Remover medicamento" type="button">✕</button>
      </div>
      <input className="med-input med-input-name" value={med.nome} onChange={(e) => onChange({ ...med, nome: e.target.value })} placeholder="Nome do medicamento" />
      <input className="med-input" value={med.qtd} onChange={(e) => onChange({ ...med, qtd: e.target.value })} placeholder="Quantidade (ex: 1 caixa)" />
      <input className="med-input" value={med.pos} onChange={(e) => onChange({ ...med, pos: e.target.value })} placeholder="Posologia" />
    </div>
  );
}

function DocumentPage({ children, noBreakAfter }) {
  return <div className={`doc-page${noBreakAfter ? " no-break" : ""}`}>{children}</div>;
}

function HospitalHeader() {
  return (
    <div className="doc-header">
      <div className="doc-header-text">
        <div className="doc-hospital-nome">{HOSPITAL_NOME}</div>
        <div className="doc-hospital-end">{HOSPITAL_END}</div>
      </div>
    </div>
  );
}

function Assinatura() {
  return (
    <div className="assinatura">
      <div className="assinatura-linha" />
      <div className="assinatura-nome">{MEDICO}</div>
      <div className="assinatura-crm">{CRM} | {ESPECIALIDADE}</div>
    </div>
  );
}

function CaixaFarmaceutico({ via }) {
  return (
    <div className="caixa-farm">
      <div className="caixa-farm-titulo">IDENTIFICAÇÃO DO COMPRADOR — {via} VIA</div>
      <div className="caixa-farm-row">
        <div className="caixa-farm-cell">Nome: ___________________________________</div>
        <div className="caixa-farm-cell">RG / CPF: ___________________________</div>
      </div>
      <div className="caixa-farm-row">
        <div className="caixa-farm-cell caixa-farm-full">Endereço: _______________________________________________________________</div>
      </div>
      <div className="caixa-farm-row">
        <div className="caixa-farm-cell">Cidade: ______________________________</div>
        <div className="caixa-farm-cell">Telefone: ___________________________</div>
      </div>
      <div className="caixa-farm-row">
        <div className="caixa-farm-cell">Data da dispensação: ___/___/______</div>
        <div className="caixa-farm-cell">Ass. Farmacêutico(a): ______________</div>
      </div>
    </div>
  );
}

function ReceituarioPage({ tipo, subtitulo, cor, via, meds, nomePaciente, data }) {
  return (
    <DocumentPage>
      <HospitalHeader />
      <div className="doc-divider" />
      <h1 className="doc-titulo" style={{ color: cor }}>{tipo}</h1>
      <p className="doc-subtitulo">{subtitulo}</p>
      <div className="doc-divider" />
      <div className="paciente-data-row">
        <div className="paciente-data-cell paciente-data-cell-wide">
          <strong>Paciente:</strong> {nomePaciente || <span className="placeholder-text">________________________</span>}
        </div>
        <div className="paciente-data-cell">
          <strong>Data:</strong> {data || <span className="placeholder-text">__/__/____</span>}
        </div>
      </div>
      <div className="prescricao-list">
        {meds.map((m, i) => (
          <div key={i} className="prescricao-item">
            <div className="prescricao-nome">
              <strong>{i + 1}.  {m.nome}</strong>
              {m.qtd && <span className="prescricao-qtd">   ({m.qtd})</span>}
            </div>
            <div className="prescricao-pos">{m.pos}</div>
          </div>
        ))}
      </div>
      <Assinatura />
      <CaixaFarmaceutico via={via} />
    </DocumentPage>
  );
}

function AtestadoPage({ tituloVia, nomePaciente, cirurgia, data, diasRepouso, cid, observacoes }) {
  return (
    <DocumentPage>
      <h1 className="doc-titulo" style={{ color: "#1A5276" }}>{tituloVia}</h1>
      <div className="doc-divider" />
      <p className="atestado-texto">
        Atesto para os devidos fins que o(a) paciente{" "}
        <strong>{nomePaciente || "_______________________________________________"}</strong>
        , esteve sob meus cuidados médicos, sendo submetido(a) a procedimento cirúrgico (
        <strong>{cirurgia || "______________________________________________"}</strong>
        ) em <strong>{data || "____/____/________"}</strong>, necessitando de repouso pelo
        período de <strong>{diasRepouso || "______"}</strong> dia(s), a partir desta data.
      </p>
      <div className="campo-linha"><strong>CID-10:</strong> {cid || <span className="placeholder-text">_________________________</span>}</div>
      <div className="campo-bloco">
        <strong>Observações:</strong>
        <div className="campo-bloco-linha">{observacoes || ""}</div>
        <div className="campo-bloco-linha-vazia" />
      </div>
      <div className="campo-linha"><strong>Local e Data:</strong> ________________________________________</div>
      <Assinatura />
    </DocumentPage>
  );
}

function OrientacoesPage({ nomePaciente, cirurgia, data, diasRepouso, dietaOpcao, observacoes }) {
  return (
    <DocumentPage>
      <HospitalHeader />
      <div className="doc-divider" />
      <h1 className="doc-titulo" style={{ color: "#1A5276" }}>ORIENTAÇÕES PÓS-OPERATÓRIAS</h1>
      <div className="doc-divider" />
      <div className="campo-linha"><strong>Paciente:</strong> {nomePaciente || <span className="placeholder-text">________________________</span>}</div>
      <div className="campo-linha"><strong>Cirurgia realizada:</strong> {cirurgia || <span className="placeholder-text">________________________</span>}</div>
      <div className="campo-linha"><strong>Data:</strong> {data || <span className="placeholder-text">__/__/____</span>}</div>
      <div className="orientacoes-titulo">Orientações gerais:</div>
      <ol className="orientacoes-list">
        <li>Repouso relativo e afastamento de atividades físicas por <strong>{diasRepouso || "______"}</strong> dias (andar de moto e bicicleta é considerado atividade física; dirigir carro liberado após 7 dias).</li>
        <li>
          Dieta leve sem comidas gordurosas ou pesadas:{" "}
          <span className={`checkbox ${dietaOpcao === "20" ? "checked" : ""}`}>☐</span> 20 dias{"   "}
          <span className={`checkbox ${dietaOpcao === "3" ? "checked" : ""}`}>☐</span> 3 dias
        </li>
        <li>Curativos diários.</li>
        <li>Fazer gelo local por 10min, 3x ao dia, nos primeiros 3 dias.</li>
        <li>Em caso de febre, sangramento, dor intensa ou dúvidas, entrar em contato com o hospital ou procurar o pronto-socorro se necessário.</li>
        <li>Agendar retorno no hospital em: ____/____/________ às ______h.</li>
      </ol>
      <div className="campo-bloco">
        <strong>Observações:</strong>
        <div className="campo-bloco-linha">{observacoes || ""}</div>
        <div className="campo-bloco-linha-vazia" />
      </div>
      <Assinatura />
    </DocumentPage>
  );
}

function App() {
  const [usarB1, setUsarB1] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  const [nomePaciente, setNomePaciente] = useState("");
  const [dataDocumento, setDataDocumento] = useState("");
  const [cirurgia, setCirurgia] = useState("");
  const [diasRepouso, setDiasRepouso] = useState("");
  const [cid, setCid] = useState("");
  const [observacoesAtestado, setObservacoesAtestado] = useState("");
  const [observacoesOrientacoes, setObservacoesOrientacoes] = useState("");
  const [dietaOpcao, setDietaOpcao] = useState("3");

  const [medsBranco, setMedsBranco] = useState(MEDS_BRANCO_PADRAO);
  const [medPaco, setMedPaco] = useState({
    nome: "PACO (Paracetamol 325mg + Codeína 30mg)",
    qtd: "1 caixa",
    pos: "Tomar 1 comprimido de 6/6h apenas se dor forte",
  });

  const updateMed = (index, novo) => {
    const copia = [...medsBranco];
    copia[index] = novo;
    setMedsBranco(copia);
  };
  const removeMed = (index) => setMedsBranco(medsBranco.filter((_, i) => i !== index));
  const addMed = () => setMedsBranco([...medsBranco, { nome: "", qtd: "", pos: "" }]);

  const isDadosValid = nomePaciente.trim().length > 0;
  const handlePrint = () => window.print();

  if (printMode) {
    return (
      <div className="print-root">
        <style>{STYLES}</style>
        <div className="print-toolbar no-print">
          <button onClick={() => setPrintMode(false)} className="btn btn-secondary">← Voltar para editar</button>
          <button onClick={handlePrint} className="btn btn-primary">Imprimir tudo</button>
        </div>

        <ReceituarioPage tipo="RECEITUÁRIO DE CONTROLE ESPECIAL" subtitulo="Portaria SVS/MS nº 344/98 — 1ª Via: Farmácia | 2ª Via: Paciente" cor="#1A5276" via="1ª" meds={medsBranco} nomePaciente={nomePaciente} data={dataDocumento} />
        <ReceituarioPage tipo="RECEITUÁRIO DE CONTROLE ESPECIAL" subtitulo="Portaria SVS/MS nº 344/98 — 1ª Via: Farmácia | 2ª Via: Paciente" cor="#1A5276" via="2ª" meds={medsBranco} nomePaciente={nomePaciente} data={dataDocumento} />

        {usarB1 && (
          <>
            <ReceituarioPage tipo="RECEITUÁRIO DE CONTROLE ESPECIAL — TIPO B1" subtitulo="Portaria SVS/MS nº 344/98 | Lista B1 (Opioides) — 1ª Via: Farmácia | 2ª Via: Paciente" cor="#7D6608" via="1ª" meds={[medPaco]} nomePaciente={nomePaciente} data={dataDocumento} />
            <ReceituarioPage tipo="RECEITUÁRIO DE CONTROLE ESPECIAL — TIPO B1" subtitulo="Portaria SVS/MS nº 344/98 | Lista B1 (Opioides) — 1ª Via: Farmácia | 2ª Via: Paciente" cor="#7D6608" via="2ª" meds={[medPaco]} nomePaciente={nomePaciente} data={dataDocumento} />
          </>
        )}

        <AtestadoPage tituloVia="ATESTADO MÉDICO" nomePaciente={nomePaciente} cirurgia={cirurgia} data={dataDocumento} diasRepouso={diasRepouso} cid={cid} observacoes={observacoesAtestado} />
        <AtestadoPage tituloVia="ATESTADO MÉDICO — PERÍCIA INSS" nomePaciente={nomePaciente} cirurgia={cirurgia} data={dataDocumento} diasRepouso={diasRepouso} cid={cid} observacoes={observacoesAtestado} />

        <OrientacoesPage nomePaciente={nomePaciente} cirurgia={cirurgia} data={dataDocumento} diasRepouso={diasRepouso} dietaOpcao={dietaOpcao} observacoes={observacoesOrientacoes} />
      </div>
    );
  }

  return (
    <div className="app-root">
      <style>{STYLES}</style>
      <header className="app-header">
        <div className="app-header-title">Pós-Operatório</div>
        <div className="app-header-subtitle">{MEDICO} · {ESPECIALIDADE}</div>
      </header>

      <div className="form-container">
        <section className="form-section">
          <h2 className="section-title">Dados do paciente</h2>
          <p className="section-hint">Preencha uma vez — esses dados aparecem em todos os documentos.</p>

          <div className="field-grid">
            <Field label="Nome do paciente" value={nomePaciente} onChange={setNomePaciente} placeholder="Nome completo" className="field-wide" />
            <DateField label="Data" value={dataDocumento} onChange={setDataDocumento} />
          </div>
          <div className="field-grid">
            <Field label="Cirurgia realizada" value={cirurgia} onChange={setCirurgia} placeholder="Ex: Apendicectomia" className="field-wide" />
          </div>
          <div className="field-grid">
            <Field label="Dias de repouso" value={diasRepouso} onChange={setDiasRepouso} placeholder="Ex: 15" />
            <Field label="CID-10" value={cid} onChange={setCid} placeholder="Ex: K35.8" />
          </div>

          <TextAreaField label="Observações do atestado (opcional)" value={observacoesAtestado} onChange={setObservacoesAtestado} placeholder="Observações adicionais para o atestado" />

          <TextAreaField label="Observações das orientações (opcional)" value={observacoesOrientacoes} onChange={setObservacoesOrientacoes} placeholder="Observações adicionais para as orientações pós-operatórias" />

          <div className="field">
            <span className="field-label">Dieta pós-operatória (orientações)</span>
            <div className="radio-group">
              <label className={`radio-pill ${dietaOpcao === "3" ? "active" : ""}`}>
                <input type="radio" checked={dietaOpcao === "3"} onChange={() => setDietaOpcao("3")} />3 dias
              </label>
              <label className={`radio-pill ${dietaOpcao === "20" ? "active" : ""}`}>
                <input type="radio" checked={dietaOpcao === "20"} onChange={() => setDietaOpcao("20")} />20 dias
              </label>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-title">Receituário Branco</h2>
          <p className="section-hint">Medicamentos padrão — edite se precisar mudar algo neste paciente.</p>
          <div className="med-list">
            {medsBranco.map((med, i) => (
              <MedicamentoEditor key={i} med={med} index={i} onChange={(novo) => updateMed(i, novo)} onRemove={() => removeMed(i)} />
            ))}
          </div>
          <button className="btn btn-add" onClick={addMed} type="button">+ Adicionar medicamento</button>
        </section>

        <section className="form-section">
          <div className="toggle-row">
            <div>
              <h2 className="section-title">Receituário Amarelo B1</h2>
              <p className="section-hint">Para codeína/opioides (ex: PACO). Ative se este paciente precisar.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={usarB1} onChange={(e) => setUsarB1(e.target.checked)} />
              <span className="switch-slider" />
            </label>
          </div>
          {usarB1 && (
            <div className="med-list">
              <div className="med-card">
                <div className="med-card-header"><span className="med-number">1</span></div>
                <input className="med-input med-input-name" value={medPaco.nome} onChange={(e) => setMedPaco({ ...medPaco, nome: e.target.value })} placeholder="Nome do medicamento" />
                <input className="med-input" value={medPaco.qtd} onChange={(e) => setMedPaco({ ...medPaco, qtd: e.target.value })} placeholder="Quantidade" />
                <input className="med-input" value={medPaco.pos} onChange={(e) => setMedPaco({ ...medPaco, pos: e.target.value })} placeholder="Posologia" />
              </div>
            </div>
          )}
        </section>

        <div className="action-bar">
          {!isDadosValid && <div className="warning-text">Preencha o nome do paciente para continuar.</div>}
          <button className="btn btn-primary btn-large" disabled={!isDadosValid} onClick={() => setPrintMode(true)}>
            Gerar documentos →
          </button>
        </div>
      </div>
    </div>
  );
}

const STYLES = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  .app-root { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F4F6F8; min-height: 100vh; color: #1A2330; }
  .app-header { background: #1A5276; color: white; padding: 24px 20px; text-align: center; }
  .app-header-title { font-size: 22px; font-weight: 700; letter-spacing: 0.3px; }
  .app-header-subtitle { font-size: 13px; opacity: 0.85; margin-top: 4px; }
  .form-container { max-width: 640px; margin: 0 auto; padding: 20px 16px 110px; }
  .form-section { background: white; border-radius: 14px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .section-title { font-size: 17px; font-weight: 700; margin: 0 0 4px; color: #1A2330; }
  .section-hint { font-size: 13px; color: #6B7785; margin: 0 0 16px; }
  .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .field-wide { grid-column: 1 / -1; }
  .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
  .field-grid .field { margin-bottom: 0; }
  .field-label { font-size: 13px; font-weight: 600; color: #4A5563; }
  .field-input { border: 1.5px solid #DDE3E8; border-radius: 9px; padding: 11px 12px; font-size: 15px; font-family: inherit; outline: none; transition: border-color 0.15s; width: 100%; }
  .field-input:focus { border-color: #1A5276; }
  .field-textarea { resize: vertical; min-height: 60px; }
  .field-date { appearance: none; -webkit-appearance: none; }
  .radio-group { display: flex; gap: 10px; }
  .radio-pill { border: 1.5px solid #DDE3E8; border-radius: 20px; padding: 9px 18px; font-size: 14px; font-weight: 600; color: #4A5563; cursor: pointer; display: flex; align-items: center; gap: 6px; }
  .radio-pill input { display: none; }
  .radio-pill.active { background: #1A5276; color: white; border-color: #1A5276; }
  .med-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
  .med-card { border: 1.5px solid #E5E9EC; border-radius: 10px; padding: 12px; background: #FAFBFC; }
  .med-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .med-number { width: 22px; height: 22px; background: #1A5276; color: white; border-radius: 50%; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .btn-icon-remove { background: none; border: none; color: #C0392B; font-size: 16px; cursor: pointer; padding: 4px; }
  .med-input { width: 100%; border: 1px solid #DDE3E8; border-radius: 7px; padding: 8px 10px; font-size: 14px; margin-bottom: 6px; font-family: inherit; }
  .med-input-name { font-weight: 600; }
  .med-input:last-child { margin-bottom: 0; }
  .btn { border: none; border-radius: 10px; padding: 11px 18px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .btn-add { background: #EAF0FB; color: #1A5276; width: 100%; }
  .btn-primary { background: #1A5276; color: white; }
  .btn-primary:disabled { background: #B8C4CC; cursor: not-allowed; }
  .btn-secondary { background: #E5E9EC; color: #1A2330; }
  .btn-large { width: 100%; padding: 15px; font-size: 16px; }
  .toggle-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .switch { position: relative; display: inline-block; width: 48px; height: 28px; flex-shrink: 0; }
  .switch input { opacity: 0; width: 0; height: 0; }
  .switch-slider { position: absolute; cursor: pointer; inset: 0; background-color: #DDE3E8; border-radius: 28px; transition: 0.2s; }
  .switch-slider:before { position: absolute; content: ""; height: 22px; width: 22px; left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: 0.2s; }
  .switch input:checked + .switch-slider { background-color: #1A5276; }
  .switch input:checked + .switch-slider:before { transform: translateX(20px); }
  .action-bar { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 14px 16px; box-shadow: 0 -2px 10px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 8px; align-items: stretch; }
  .warning-text { font-size: 13px; color: #C0392B; text-align: center; }
  .print-root { background: #E8EAED; min-height: 100vh; padding: 20px 0; }
  .print-toolbar { max-width: 720px; margin: 0 auto 16px; display: flex; gap: 10px; padding: 0 16px; }
  .print-toolbar .btn { flex: 1; }
  .doc-page { width: 720px; min-height: 980px; background: white; margin: 0 auto 24px; padding: 40px 48px; box-shadow: 0 1px 6px rgba(0,0,0,0.15); font-family: Arial, sans-serif; color: #111; font-size: 14px; }
  .doc-header { display: flex; align-items: center; gap: 16px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
  .doc-hospital-nome { font-weight: 700; font-size: 16px; }
  .doc-hospital-end { font-size: 11px; color: #555; margin-top: 2px; }
  .doc-divider { border-bottom: 1px solid #ccc; margin: 14px 0; }
  .doc-titulo { text-align: center; font-size: 19px; font-weight: 700; margin: 10px 0 4px; }
  .doc-subtitulo { text-align: center; font-size: 12px; color: #888; margin: 0 0 6px; }
  .paciente-data-row { display: flex; border: 1px solid #999; border-radius: 2px; margin: 14px 0; }
  .paciente-data-cell { flex: 1; padding: 10px 12px; border-right: 1px solid #999; font-size: 14px; }
  .paciente-data-cell:last-child { border-right: none; }
  .placeholder-text { color: #999; }
  .prescricao-list { margin: 16px 0; }
  .prescricao-item { margin-bottom: 14px; }
  .prescricao-nome { font-size: 15px; }
  .prescricao-qtd { color: #444; font-size: 13px; font-weight: 400; }
  .prescricao-pos { font-style: italic; color: #333; font-size: 13px; margin-left: 22px; margin-top: 2px; }
  .assinatura { text-align: center; margin: 40px 0 0; width: 280px; margin-left: auto; }
  .assinatura-linha { border-top: 1px solid #333; margin-bottom: 6px; }
  .assinatura-nome { font-weight: 700; font-size: 13px; }
  .assinatura-crm { font-size: 11px; color: #555; }
  .caixa-farm { border: 1px solid #999; margin-top: 20px; font-size: 12px; }
  .caixa-farm-titulo { background: #e0e0e0; text-align: center; font-weight: 700; padding: 6px; border-bottom: 1px solid #999; font-size: 12px; }
  .caixa-farm-row { display: flex; border-bottom: 1px solid #999; }
  .caixa-farm-row:last-child { border-bottom: none; }
  .caixa-farm-cell { flex: 1; padding: 6px 10px; border-right: 1px solid #999; }
  .caixa-farm-cell:last-child { border-right: none; }
  .atestado-texto { font-size: 14px; line-height: 1.8; margin: 14px 0; }
  .campo-linha { margin: 14px 0; font-size: 14px; border-bottom: 1px solid #999; padding-bottom: 8px; }
  .campo-bloco { margin: 14px 0; font-size: 14px; }
  .campo-bloco-linha { border-bottom: 1px solid #999; padding: 8px 0 4px; min-height: 20px; }
  .campo-bloco-linha-vazia { border-bottom: 1px solid #999; padding: 12px 0; }
  .orientacoes-titulo { font-weight: 700; margin: 18px 0 8px; font-size: 14px; }
  .orientacoes-list { padding-left: 20px; font-size: 14px; line-height: 1.7; }
  .orientacoes-list li { margin-bottom: 10px; }
  .checkbox { font-size: 15px; }
  .checkbox.checked { font-weight: 700; }
  @media print {
    .no-print { display: none !important; }
    .print-root { background: white; padding: 0; }
    .doc-page { box-shadow: none; margin: 0; page-break-after: always; width: 100%; }
  }
  @media (max-width: 600px) {
    .field-grid { grid-template-columns: 1fr; }
    .doc-page { width: 100%; padding: 24px 20px; }
  }
`;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));

