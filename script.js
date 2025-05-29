document.addEventListener("DOMContentLoaded", () => {
  const gridData = [
    ["Y", "K", "N", "Z", "N", "Z", "B", "W", "N", "B", "M", "Y", "P", "C"],
    ["T", "P", "U", "G", "R", "A", "F", "I", "C", "A", "L", "N", "R", "J"],
    ["G", "I", "T", "H", "U", "B", "F", "L", "V", "Q", "E", "U", "F", "A"],
    ["I", "N", "G", "R", "E", "S", "A", "R", "V", "W", "M", "L", "S", "V"],
    ["I", "C", "V", "G", "A", "S", "T", "O", "S", "D", "U", "R", "H", "A"],
    ["Y", "A", "V", "G", "J", "A", "Q", "W", "F", "T", "L", "D", "F", "S"],
    ["L", "T", "T", "E", "R", "M", "I", "N", "A", "L", "A", "F", "K", "C"],
    ["A", "E", "E", "X", "P", "O", "R", "F", "L", "U", "D", "E", "Q", "R"],
    ["F", "G", "A", "P", "G", "N", "G", "I", "T", "J", "O", "J", "L", "I"],
    ["H", "O", "G", "O", "Y", "S", "M", "F", "S", "F", "R", "E", "R", "P"],
    ["O", "R", "J", "S", "D", "K", "W", "A", "K", "C", "G", "I", "G", "T"],
    ["A", "I", "A", "V", "T", "Y", "P", "E", "S", "C", "R", "I", "P", "T"],
    ["S", "A", "D", "E", "P", "E", "N", "D", "E", "N", "C", "I", "A", "S"],
    ["Z", "S", "W", "L", "R", "P", "E", "G", "P", "V", "I", "G", "Y", "U"],
  ];

  const wordsToFind = [
    "EMULADOR",
    "GASTOS",
    "GITHUB",
    "INGRESAR",
    "SDK",
    "TYPESCRIPT",
    "EXPO",
    "GIT",
    "GRAFICA",
    "JAVASCRIPT",
    "TERMINAL",
    "CATEGORIAS",
    "DEPENDENCIAS",
  ];

  let selectedCells = [];
  let foundWords = new Set();
  const wordSearchGrid = document.getElementById("word-search-grid");
  const foundSound = document.getElementById("foundSound");

  // Generar la cuadrícula
  function generateGrid() {
    const rows = gridData.length;
    const cols = gridData[0].length;

    wordSearchGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell");
        cell.textContent = gridData[r][c];
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener("mousedown", startSelection);
        wordSearchGrid.appendChild(cell);
      }
    }
  }

  let isSelecting = false;

  function startSelection(e) {
    if (e.button !== 0) return; // Solo clic izquierdo
    isSelecting = true;
    selectedCells = [];
    const cells = document.querySelectorAll(".grid-cell");
    cells.forEach((cell) => cell.classList.remove("selected")); // Limpiar selecciones anteriores

    addCellToSelection(e.target);
    document.addEventListener("mouseup", endSelection);
    document.addEventListener("mouseover", duringSelection);
  }

  function duringSelection(e) {
    if (!isSelecting) return;
    if (e.target.classList.contains("grid-cell")) {
      addCellToSelection(e.target);
    }
  }

  function addCellToSelection(cell) {
    if (!selectedCells.includes(cell)) {
      selectedCells.push(cell);
      cell.classList.add("selected");
    }
  }

  function endSelection() {
    isSelecting = false;
    document.removeEventListener("mouseup", endSelection);
    document.removeEventListener("mouseover", duringSelection);

    checkWord();
    selectedCells.forEach((cell) => cell.classList.remove("selected"));
    selectedCells = [];
  }

  function checkWord() {
    if (selectedCells.length === 0) return;

    // Extraer la palabra de las celdas seleccionadas
    let currentWord = "";
    const coords = selectedCells.map((cell) => ({
      row: parseInt(cell.dataset.row),
      col: parseInt(cell.dataset.col),
    }));

    // Ordenar las coordenadas para formar la palabra en orden correcto (horizontal, vertical, diagonal)
    coords.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });

    // Reconstruir la palabra, asumiendo que las celdas seleccionadas forman una línea recta
    // Esta es una simplificación; una implementación robusta verificaría si las celdas están realmente adyacentes y en línea
    coords.forEach((coord) => {
      currentWord += gridData[coord.row][coord.col];
    });

    const reversedWord = currentWord.split("").reverse().join("");

    let found = false;
    let foundWordText = "";

    for (let i = 0; i < wordsToFind.length; i++) {
      const word = wordsToFind[i];
      if (currentWord === word && !foundWords.has(word)) {
        found = true;
        foundWordText = word;
        break;
      } else if (reversedWord === word && !foundWords.has(word)) {
        // También verifica la palabra al revés
        found = true;
        foundWordText = word;
        break;
      }
    }

    if (found) {
      foundWords.add(foundWordText);
      selectedCells.forEach((cell) => cell.classList.add("found"));
      playSound();
      markWordAsFoundInList(foundWordText);
    }
  }

  function playSound() {
    if (foundSound) {
      foundSound.currentTime = 0; // Reinicia el sonido si ya está reproduciéndose
      foundSound
        .play()
        .catch((e) => console.error("Error al reproducir el sonido:", e));
    }
  }

  function markWordAsFoundInList(word) {
    // Normalizar la palabra para buscarla en el ID de la lista
    const normalizedWordId = `word-${word
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")}`;
    const listItem = document.getElementById(normalizedWordId);
    if (listItem) {
      listItem.classList.add("found-word");
    }
  }

  // Inicializar la cuadrícula
  generateGrid();
});
