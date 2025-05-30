const matOps = {
  add: (A, B) => A.map((r, i) => r.map((v, j) => v + B[i][j])),
  subtract: (A, B) => A.map((r, i) => r.map((v, j) => v - B[i][j])),
  multiply: (A, B) => {
    const rowsA = A.length, colsA = A[0].length, colsB = B[0].length;
    const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));
    for (let i = 0; i < rowsA; i++)
      for (let j = 0; j < colsB; j++)
        for (let k = 0; k < colsA; k++)
          result[i][j] += A[i][k] * B[k][j];
    return result;
  },
  transpose: A => A[0].map((_, i) => A.map(r => r[i])),
  determinant: A => {
    if (A.length !== A[0].length) return null;
    const n = A.length;
    if (n === 1) return A[0][0];
    if (n === 2) return A[0][0]*A[1][1] - A[0][1]*A[1][0];
    if (n === 3) {
      return A[0][0]*A[1][1]*A[2][2] + A[0][1]*A[1][2]*A[2][0] + A[0][2]*A[1][0]*A[2][1]
           - A[0][2]*A[1][1]*A[2][0] - A[0][1]*A[1][0]*A[2][2] - A[0][0]*A[1][2]*A[2][1];
    }
    return null;
  },
  adjoint: A => {
    const n = A.length;
    const cofactor = (i, j) => {
      const minor = A.filter((_, r) => r !== i).map(r => r.filter((_, c) => c !== j));
      return ((i + j) % 2 === 0 ? 1 : -1) * matOps.determinant(minor);
    };
    const cofactorMatrix = A.map((row, i) => row.map((_, j) => cofactor(i, j)));
    return matOps.transpose(cofactorMatrix);
  },
  inverse: (A) => {
    const det = matOps.determinant(A);
    if (det === 0 || det === null) return null;
    const adj = matOps.adjoint(A);
    return adj.map(row => row.map(val => val / det));
  }
};

function createMatrixInputs(container, rows, cols) {
  container.innerHTML = '';
  for (let i = 0; i < rows; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'matrix-row';
    for (let j = 0; j < cols; j++) {
      const input = document.createElement('input');
      input.type = 'number';
      input.step = 'any';
      input.value = '0';
      rowDiv.appendChild(input);
    }
    container.appendChild(rowDiv);
  }
}

function getMatrixFromInputs(container) {
  const rows = container.querySelectorAll('.matrix-row');
  return Array.from(rows).map(row =>
    Array.from(row.querySelectorAll('input')).map(input => parseFloat(input.value) || 0)
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const el = {
    orderARows: document.getElementById('orderA-rows'),
    orderACols: document.getElementById('orderA-cols'),
    matrixA: document.getElementById('matrixA-grid'),

    orderBRows: document.getElementById('orderB-rows'),
    orderBCols: document.getElementById('orderB-cols'),
    matrixB: document.getElementById('matrixB-grid'),

    createA: document.getElementById('create-matrixA'),
    createB: document.getElementById('create-matrixB'),

    addRowA: document.getElementById('add-rowA'),
    addColA: document.getElementById('add-colA'),
    addRowB: document.getElementById('add-rowB'),
    addColB: document.getElementById('add-colB'),

    opsPanel: document.querySelector('.panel-operations'),
    resultContainer: document.getElementById('result-matrix'),
    stepsContainer: document.getElementById('steps'),
  };

  function updateMatrixA() {
    const rows = parseInt(el.orderARows.value);
    const cols = parseInt(el.orderACols.value);
    createMatrixInputs(el.matrixA, rows, cols);
  }

  function updateMatrixB() {
    const rows = parseInt(el.orderBRows.value);
    const cols = parseInt(el.orderBCols.value);
    createMatrixInputs(el.matrixB, rows, cols);
  }

  el.createA.addEventListener('click', updateMatrixA);
  el.createB.addEventListener('click', updateMatrixB);

  el.addRowA.addEventListener('click', () => {
    const rows = el.matrixA.querySelectorAll('.matrix-row').length + 1;
    const cols = el.matrixA.querySelector('.matrix-row').querySelectorAll('input').length;
    createMatrixInputs(el.matrixA, rows, cols);
    el.orderARows.value = rows;
  });

  el.addColA.addEventListener('click', () => {
    const rows = el.matrixA.querySelectorAll('.matrix-row').length;
    const cols = el.matrixA.querySelector('.matrix-row').querySelectorAll('input').length + 1;
    createMatrixInputs(el.matrixA, rows, cols);
    el.orderACols.value = cols;
  });

  el.addRowB.addEventListener('click', () => {
    const rows = el.matrixB.querySelectorAll('.matrix-row').length + 1;
    const cols = el.matrixB.querySelector('.matrix-row').querySelectorAll('input').length;
    createMatrixInputs(el.matrixB, rows, cols);
    el.orderBRows.value = rows;
  });

  el.addColB.addEventListener('click', () => {
    const rows = el.matrixB.querySelectorAll('.matrix-row').length;
    const cols = el.matrixB.querySelector('.matrix-row').querySelectorAll('input').length + 1;
    createMatrixInputs(el.matrixB, rows, cols);
    el.orderBCols.value = cols;
  });

  updateMatrixA();
  updateMatrixB();

  el.opsPanel.addEventListener('click', (e) => {
    if (!e.target.matches('button')) return;
    const op = e.target.dataset.op;
    const A = getMatrixFromInputs(el.matrixA);
    const B = getMatrixFromInputs(el.matrixB);
    let result, steps = '';

    try {
      if (op === 'add') {
        if (A.length !== B.length || A[0].length !== B[0].length) {
          alert('Dimensi Matriks A dan B harus sama untuk penjumlahan.');
          return;
        }
        result = matOps.add(A, B);
        steps = 'Penjumlahan elemen per elemen.';
      } else if (op === 'subtract') {
        if (A.length !== B.length || A[0].length !== B[0].length) {
          alert('Dimensi Matriks A dan B harus sama untuk pengurangan.');
          return;
        }
        result = matOps.subtract(A, B);
        steps = 'Pengurangan elemen per elemen.';
      } else if (op === 'multiply') {
        if (A[0].length !== B.length) {
          alert('Jumlah kolom Matriks A harus sama dengan jumlah baris Matriks B untuk perkalian.');
          return;
        }
        result = matOps.multiply(A, B);
        steps = 'Perkalian matriks A × B.';
      } else if (op === 'transpose') {
        result = matOps.transpose(A);
        steps = 'Transpose Matriks A.';
      } else if (op === 'determinant') {
        const det = matOps.determinant(A);
        if (det === null) {
          alert('Matriks harus persegi dan ukuran maksimal 3x3 untuk determinan.');
          return;
        }
        result = [[det]];
        steps = 'Determinan matriks dihitung.';
      } else if (op === 'adjoint') {
        result = matOps.adjoint(A);
        steps = 'Adjoin matriks A dihitung.';
      } else if (op === 'inverse') {
        const inv = matOps.inverse(A);
        if (!inv) {
          alert('Matriks A tidak memiliki invers.');
          return;
        }
        result = inv;
        steps = 'Invers matriks A dihitung.';
      } else if (op === 'solve-inverse') {
        if (A.length !== A[0].length) {
          alert('Matriks A harus persegi untuk metode invers SPL.');
          return;
        }
        if (A.length !== B.length || B[0].length !== 1) {
          alert('Matriks B harus kolom dan jumlah baris sama dengan matriks A.');
          return;
        }
        const inv = matOps.inverse(A);
        if (!inv) {
          alert('Matriks A tidak memiliki invers.');
          return;
        }
        result = matOps.multiply(inv, B);
        steps = 'Solusi SPL X = A⁻¹ × B berhasil dihitung.';
      } else if (op === 'obe' || op === 'oke') {
        alert('Fitur OBE dan OKE belum diimplementasikan.');
        return;
      } else {
        alert('Operasi tidak dikenali.');
        return;
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
      return;
    }

    // Tampilkan hasil matriks
    el.resultContainer.innerHTML = '';
    result.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'result-row';
      rowDiv.textContent = row.map(v => v.toFixed(2)).join(' ');
      el.resultContainer.appendChild(rowDiv);
    });
    el.stepsContainer.textContent = steps;
  });
});

// Fungsi deepcopy matriks biar gak merusak data asli
function deepCopyMatrix(M) {
  return M.map(row => row.slice());
}

// Fungsi OBE: Reduced Row Echelon Form (RREF)
function obeRref(matrix) {
  let A = deepCopyMatrix(matrix);
  const rows = A.length;
  const cols = A[0].length;
  let lead = 0;

  for (let r = 0; r < rows; r++) {
    if (lead >= cols) break;
    let i = r;
    while (A[i][lead] === 0) {
      i++;
      if (i === rows) {
        i = r;
        lead++;
        if (lead === cols) return A;
      }
    }

    // Tukar baris i dan r
    [A[i], A[r]] = [A[r], A[i]];

    // Normalisasi baris r supaya pivot = 1
    let lv = A[r][lead];
    if (lv !== 0) {
      for (let j = 0; j < cols; j++) {
        A[r][j] /= lv;
      }
    }

    // Eliminasi elemen lain di kolom pivot
    for (let k = 0; k < rows; k++) {
      if (k !== r) {
        let lv2 = A[k][lead];
        for (let j = 0; j < cols; j++) {
          A[k][j] -= lv2 * A[r][j];
        }
      }
    }
    lead++;
  }
  return A;
}

// Fungsi OKE: Reduced Column Echelon Form (mirip OBE tapi per kolom)
function okeRcef(matrix) {
  let A = deepCopyMatrix(matrix);
  const rows = A.length;
  const cols = A[0].length;
  let lead = 0;

  for (let c = 0; c < cols; c++) {
    if (lead >= rows) break;
    let i = c;
    while (A[lead][i] === 0) {
      i++;
      if (i === cols) {
        i = c;
        lead++;
        if (lead === rows) return A;
      }
    }

    // Tukar kolom i dan c
    for (let r = 0; r < rows; r++) {
      [A[r][i], A[r][c]] = [A[r][c], A[r][i]];
    }

    // Normalisasi kolom c supaya pivot = 1
    let lv = A[lead][c];
    if (lv !== 0) {
      for (let r = 0; r < rows; r++) {
        A[r][c] /= lv;
      }
    }

    // Eliminasi elemen lain di baris pivot kolom c
    for (let r = 0; r < rows; r++) {
      if (r !== lead) {
        let lv2 = A[r][c];
        for (let j = 0; j < cols; j++) {
          A[r][j] -= lv2 * A[lead][j];
        }
      }
    }
    lead++;
  }
  return A;
}

// Contoh potongan event handler operasi (disesuaikan dengan kode kamu)
function handleOperation(op, matrixA, matrixB) {
  let result;
  let steps = '';

  if (op === 'add') {
    // implementasi penjumlahan
  } else if (op === 'subtract') {
    // implementasi pengurangan
  } else if (op === 'multiply') {
    // implementasi perkalian
  } else if (op === 'obe') {
    result = obeRref(matrixA);
    steps = 'Matriks A telah diubah ke bentuk Reduced Row Echelon Form (OBE).';
  } else if (op === 'oke') {
    result = okeRcef(matrixA);
    steps = 'Matriks A telah diubah ke bentuk Reduced Column Echelon Form (OKE).';
  } else if (op === 'transpose') {
    // implementasi transpose
  } else if (op === 'determinant') {
    // implementasi determinan
  } else if (op === 'adjoint') {
    // implementasi adjoin
  }

  // Tampilkan result dan steps sesuai UI kamu
  tampilkanHasil(result, steps);
}

// Fungsi tampilkan hasil ke UI (contoh)
function tampilkanHasil(matrix, deskripsi) {
  const resultContainer = document.getElementById('result-matrix');
  const stepsContainer = document.getElementById('steps');

  if (!matrix) {
    resultContainer.innerHTML = 'Tidak ada hasil.';
    stepsContainer.textContent = '';
    return;
  }

  // Bersihkan kontainer hasil
  resultContainer.innerHTML = '';

  // Buat tabel grid hasil matriks
  const table = document.createElement('table');
  matrix.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(value => {
      const td = document.createElement('td');
      td.textContent = Number.isInteger(value) ? value : value.toFixed(3);
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  resultContainer.appendChild(table);

  stepsContainer.textContent = deskripsi;
}
