// ── MÁSCARAS ──────────────────────────────────────────
document.getElementById('cpf').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 9)      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, '$1.$2');
  this.value = v;
});

document.getElementById('telefone').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 10)     v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  else if (v.length > 6) v = v.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
  else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  this.value = v;
});

document.getElementById('cep').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 8);
  if (v.length > 5) v = v.replace(/(\d{5})(\d{0,3})/, '$1-$2');
  this.value = v;
});

// ── ROTEAMENTO ─────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  const hash = id === 'page-confirmation' ? '/agendamento' : '/';
  history.pushState({ page: id }, '', hash);
}

window.addEventListener('popstate', function (e) {
  const page = e.state?.page || 'page-form';
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page).classList.add('active');
});

// Rota inicial
(function () {
  if (window.location.pathname === '/agendamento') {
    const data = sessionStorage.getItem('agendamentoData');
    if (data) { renderConfirmation(JSON.parse(data)); showPage('page-confirmation'); }
    else showPage('page-form');
  } else {
    history.replaceState({ page: 'page-form' }, '', '/');
  }
})();

// ── VALIDAÇÃO ──────────────────────────────────────────
function clearErrors() {
  document.querySelectorAll('.form-control.is-invalid, .form-select.is-invalid')
    .forEach(el => el.classList.remove('is-invalid'));
  document.querySelectorAll('.invalid-feedback')
    .forEach(el => el.textContent = '');
}

function setError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById('err-' + fieldId);
  if (field)  field.classList.add('is-invalid');
  if (errEl)  errEl.textContent = message;
}

function isValidCPF(cpf) {
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(c[i]) * (10 - i);
  let r = (s * 10) % 11; if (r >= 10) r = 0;
  if (r !== parseInt(c[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(c[i]) * (11 - i);
  r = (s * 10) % 11; if (r >= 10) r = 0;
  return r === parseInt(c[10]);
}

function validateForm(data) {
  let valid = true;

  // Campos de texto simples obrigatórios
  [['nome', 'Nome é obrigatório'],
   ['sobrenome', 'Sobrenome é obrigatório'],
   ['endereco', 'Endereço é obrigatório']
  ].forEach(([id, msg]) => {
    if (!data[id]) { setError(id, msg); valid = false; }
  });

  // CPF
  if (!data.cpf) {
    setError('cpf', 'CPF é obrigatório'); valid = false;
  } else if (!isValidCPF(data.cpf)) {
    setError('cpf', 'CPF inválido'); valid = false;
  }

  // Nascimento
  if (!data.nascimento) {
    setError('nascimento', 'Data de nascimento é obrigatória'); valid = false;
  }

  // Telefone
  const telD = data.telefone.replace(/\D/g, '');
  if (!data.telefone) {
    setError('telefone', 'Telefone é obrigatório'); valid = false;
  } else if (telD.length < 10) {
    setError('telefone', 'Telefone inválido'); valid = false;
  }

  // CEP
  const cepD = data.cep.replace(/\D/g, '');
  if (!data.cep) {
    setError('cep', 'CEP é obrigatório'); valid = false;
  } else if (cepD.length !== 8) {
    setError('cep', 'CEP inválido'); valid = false;
  }

  // Clínica
  if (!data.clinica) {
    setError('clinica', 'Selecione uma clínica'); valid = false;
  }

  // Especialidade
  if (!data.especialidade) {
    setError('especialidade', 'Selecione uma especialidade'); valid = false;
  }

  // Data e hora
  if (!data.dataHora) {
    setError('dataHora', 'Data e hora são obrigatórias'); valid = false;
  } else if (new Date(data.dataHora) <= new Date()) {
    setError('dataHora', 'O agendamento deve ser em uma data/hora futura'); valid = false;
  }

  return valid;
}

// ── SUBMIT ─────────────────────────────────────────────
document.getElementById('scheduling-form').addEventListener('submit', function (e) {
  e.preventDefault();
  clearErrors();

  const g = id => document.getElementById(id).value.trim();

  const data = {
    nome: g('nome'),
    sobrenome: g('sobrenome'),
    cpf: g('cpf'),
    nascimento: g('nascimento'),
    telefone: g('telefone'),
    cep: g('cep'),
    endereco: g('endereco'),
    clinica: g('clinica'),
    especialidade: g('especialidade'),
    observacao: g('observacao'),
    dataHora: g('dataHora'),
  };

  if (!validateForm(data)) {
    const firstInvalid = document.querySelector('.is-invalid');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  sessionStorage.setItem('agendamentoData', JSON.stringify(data));
  renderConfirmation(data);
  showPage('page-confirmation');
});

// ── RENDERIZAÇÃO DA CONFIRMAÇÃO ────────────────────────
function fmtDate(s) {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

function fmtDateTime(s) {
  if (!s) return '—';
  return new Date(s).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function confirmItem(label, value, full = false) {
  const col = full ? 'col-12' : 'col-md-6 col-sm-6';
  return `<div class="${col}">
    <div class="confirm-item">
      <span class="c-label">${label}</span>
      <span class="c-value">${value || '—'}</span>
    </div>
  </div>`;
}

function renderConfirmation(data) {
  document.getElementById('confirm-patient').innerHTML =
    confirmItem('Nome', data.nome) +
    confirmItem('Sobrenome', data.sobrenome) +
    confirmItem('CPF', data.cpf) +
    confirmItem('Data de Nascimento', fmtDate(data.nascimento)) +
    confirmItem('Telefone', data.telefone) +
    confirmItem('CEP', data.cep) +
    confirmItem('Endereço', data.endereco, true);

  document.getElementById('confirm-appt').innerHTML =
    confirmItem('Clínica', data.clinica) +
    confirmItem('Especialidade', data.especialidade) +
    confirmItem('Data e Hora', fmtDateTime(data.dataHora)) +
    (data.observacao ? confirmItem('Observação', data.observacao, true) : '');
}

// ── VOLTAR ─────────────────────────────────────────────
function goBack() {
  document.getElementById('scheduling-form').reset();
  clearErrors();
  sessionStorage.removeItem('agendamentoData');
  showPage('page-form');
}
