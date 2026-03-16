function transporMatriz(A) {
  const linhas = A.length;
  const colunas = A[0].length;

  /*Criar matriz transposta com dimensões invertidas*/
  const transposta = [];
  for (let j = 0; j < colunas; j++) {
    transposta[j] = [];
    for (let i = 0; i < linhas; i++) {
      transposta[j][i] = A[i][j];
    }
  }

  console.log("Matriz original:");
  A.forEach(linha => console.log(linha.join("\t")));

  console.log("\nMatriz transposta:");
  transposta.forEach(linha => console.log(linha.join("\t")));

  return transposta;
}

/*Exemplo da imagem: matriz 3x2 */
const A = [
  [1, 2],
  [3, 4],
  [5, 6]
];

transporMatriz(A);
