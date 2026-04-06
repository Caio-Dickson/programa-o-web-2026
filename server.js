const http = require('http');
const url = require('url');

// Estoque em memória
const estoque = {};

function jsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const parts = pathname.split('/').filter(Boolean);

  // GET /adicionar/:id/:nome/:qtd
  if (parts[0] === 'adicionar' && parts.length === 4) {
    const id = parts[1];
    const nome = decodeURIComponent(parts[2]);
    const qtd = parseInt(parts[3]);

    if (isNaN(qtd) || qtd < 0) {
      return jsonResponse(res, 400, { erro: 'Quantidade inválida. Informe um número inteiro não negativo.' });
    }

    if (estoque[id]) {
      return jsonResponse(res, 409, { erro: `Produto com ID "${id}" já existe no estoque.` });
    }

    estoque[id] = { id, nome, quantidade: qtd };
    return jsonResponse(res, 201, {
      mensagem: 'Produto adicionado com sucesso!',
      produto: estoque[id]
    });
  }

  // GET /listar
  if (parts[0] === 'listar' && parts.length === 1) {
    const lista = Object.values(estoque);
    return jsonResponse(res, 200, {
      mensagem: lista.length === 0 ? 'Estoque vazio.' : `${lista.length} produto(s) no estoque.`,
      estoque: lista
    });
  }

  // GET /remover/:id
  if (parts[0] === 'remover' && parts.length === 2) {
    const id = parts[1];

    if (!estoque[id]) {
      return jsonResponse(res, 404, { erro: `Produto com ID "${id}" não encontrado.` });
    }

    const removido = estoque[id];
    delete estoque[id];
    return jsonResponse(res, 200, {
      mensagem: 'Produto removido com sucesso!',
      produto: removido
    });
  }

  // GET /editar/:id/:qtd
  if (parts[0] === 'editar' && parts.length === 3) {
    const id = parts[1];
    const novaQtd = parseInt(parts[2]);

    if (isNaN(novaQtd) || novaQtd < 0) {
      return jsonResponse(res, 400, { erro: 'Quantidade inválida. Informe um número inteiro não negativo.' });
    }

    if (!estoque[id]) {
      return jsonResponse(res, 404, { erro: `Produto com ID "${id}" não encontrado.` });
    }

    const qtdAnterior = estoque[id].quantidade;
    estoque[id].quantidade = novaQtd;
    return jsonResponse(res, 200, {
      mensagem: 'Quantidade atualizada com sucesso!',
      produto: estoque[id],
      quantidade_anterior: qtdAnterior
    });
  }

  // Rota raiz com instruções
  if (pathname === '/' || pathname === '') {
    return jsonResponse(res, 200, {
      aplicacao: 'Gerenciador de Estoque',
      rotas: {
        adicionar: '/adicionar/:id/:nome/:qtd',
        listar: '/listar',
        remover: '/remover/:id',
        editar: '/editar/:id/:qtd'
      },
      exemplo: {
        adicionar: '/adicionar/1/Arroz/50',
        listar: '/listar',
        editar: '/editar/1/30',
        remover: '/remover/1'
      }
    });
  }

  // Rota não encontrada
  return jsonResponse(res, 404, { erro: 'Rota não encontrada.' });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Rotas disponíveis:');
  console.log('  GET /adicionar/:id/:nome/:qtd');
  console.log('  GET /listar');
  console.log('  GET /remover/:id');
  console.log('  GET /editar/:id/:qtd');
});
