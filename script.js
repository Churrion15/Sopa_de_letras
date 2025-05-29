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

  let startTime;
  let isSelecting = false;

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

        // Eventos de ratón
        cell.addEventListener("mousedown", startSelection);

        // Eventos táctiles
        // Asegúrate de que passive: false esté aquí para permitir preventDefault
        cell.addEventListener("touchstart", startSelectionTouch, {
          passive: false,
        });

        wordSearchGrid.appendChild(cell);
      }
    }

    startGameTimer();
  }

  // --- Funciones para la selección con ratón ---
  function startSelection(e) {
    if (e.button !== 0) return;
    isSelecting = true;
    selectedCells = [];
    clearSelectedCellsStyles();

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

  function endSelection() {
    isSelecting = false;
    document.removeEventListener("mouseup", endSelection);
    document.removeEventListener("mouseover", duringSelection);

    checkWord();
    clearSelectedCellsStyles();
    selectedCells = [];
  }

  // --- Funciones para la selección táctil ---
  function startSelectionTouch(e) {
    // e.preventDefault(); // Moved to touchmove/touchend listener registration below
    isSelecting = true;
    selectedCells = [];
    clearSelectedCellsStyles();

    const touch = e.touches[0];
    const initialCell = document.elementFromPoint(touch.clientX, touch.clientY);

    console.log("Touch started on:", initialCell); // Depuración

    if (initialCell && initialCell.classList.contains("grid-cell")) {
      addCellToSelection(initialCell);
    }

    // Listener para touchmove y touchend en el document
    // Asegúrate de que passive: false esté aquí para permitir preventDefault en touchmove
    document.addEventListener("touchmove", duringSelectionTouch, {
      passive: false,
    });
    document.addEventListener("touchend", endSelectionTouch);
  }

  function duringSelectionTouch(e) {
    e.preventDefault(); // Evita el scroll o zoom al mover el dedo
    if (!isSelecting) return;

    const touch = e.touches[0];
    const cell = document.elementFromPoint(touch.clientX, touch.clientY);

    // Depuración: Puedes ver qué celda está detectando el dedo
    // console.log("During touch move, cell detected:", cell);

    if (cell && cell.classList.contains("grid-cell")) {
      addCellToSelection(cell);
    }
  }

  function endSelectionTouch(e) {
    // e.preventDefault(); // preventDefault en touchend puede ser problemático con el clic, no siempre necesario
    isSelecting = false;
    document.removeEventListener("touchmove", duringSelectionTouch);
    document.removeEventListener("touchend", endSelectionTouch);

    checkWord();
    clearSelectedCellsStyles();
    selectedCells = [];
    console.log("Touch ended."); // Depuración
  }
  // ------------------------------------------

  function addCellToSelection(cell) {
    if (
      cell &&
      cell.classList.contains("grid-cell") &&
      !selectedCells.includes(cell)
    ) {
      if (selectedCells.length > 0) {
        const lastCell = selectedCells[selectedCells.length - 1];
        const lastRow = parseInt(lastCell.dataset.row);
        const lastCol = parseInt(lastCell.dataset.col);
        const newRow = parseInt(cell.dataset.row);
        const newCol = parseInt(cell.dataset.col);

        const rowDiff = Math.abs(lastRow - newRow);
        const colDiff = Math.abs(lastCol - newCol);

        // Permite solo movimientos a celdas adyacentes (horizontal, vertical o diagonal)
        // y que no sea la misma celda
        if (rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)) {
          selectedCells.push(cell);
          cell.classList.add("selected");
        }
      } else {
        selectedCells.push(cell);
        cell.classList.add("selected");
      }
    }
  }

  function clearSelectedCellsStyles() {
    document.querySelectorAll(".grid-cell.selected").forEach((cell) => {
      cell.classList.remove("selected");
    });
  }

  function checkWord() {
    if (selectedCells.length === 0) return;

    let currentWord = "";
    const coords = selectedCells.map((cell) => ({
      row: parseInt(cell.dataset.row),
      col: parseInt(cell.dataset.col),
    }));

    // La lógica de ordenar y reconstruir la palabra sigue siendo una simplificación.
    // Para que funcione bien con selección táctil libre, deberíamos asegurarnos
    // de que las celdas formen una línea recta y que se procesen en el orden correcto
    // a lo largo de esa línea. Si la selección es un zigzag, no funcionará.
    // Esto es un desafío inherente a la implementación de sopas de letras.
    // Asumimos que el usuario intentará seleccionar en una dirección lineal.

    // Intenta ordenar las celdas para que la palabra se forme correctamente.
    // Esta heurística es una aproximación. Para palabras diagonales puede fallar si la selección es imperfecta.
    if (coords.length > 1) {
      const first = coords[0];
      const last = coords[coords.length - 1];

      const dRow = last.row - first.row;
      const dCol = last.col - first.col;

      // Determinar la dirección principal (horizontal, vertical, diagonal)
      if (Math.abs(dRow) >= Math.abs(dCol)) {
        // Más vertical o diagonal-vertical
        coords.sort((a, b) => a.row - b.row || a.col - b.col);
      } else {
        // Más horizontal o diagonal-horizontal
        coords.sort((a, b) => a.col - b.col || a.row - b.row);
      }
    }

    coords.forEach((coord) => {
      currentWord += gridData[coord.row][coord.col];
    });

    const reversedWord = currentWord.split("").reverse().join("");

    let found = false;
    let foundWordText = "";

    for (let i = 0; i < wordsToFind.length; i++) {
      const word = wordsToFind[i];
      if (
        (currentWord === word || reversedWord === word) &&
        !foundWords.has(word)
      ) {
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

      if (foundWords.size === wordsToFind.length) {
        endGame();
      }
    }
  }

  function playSound() {
    if (foundSound) {
      foundSound.currentTime = 0;
      foundSound
        .play()
        .catch((e) => console.error("Error al reproducir el sonido:", e));
    }
  }

  function markWordAsFoundInList(word) {
    const normalizedWordId = `word-${word
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")}`;
    const listItem = document.getElementById(normalizedWordId);
    if (listItem) {
      listItem.classList.add("found-word");
    }
  }

  function startGameTimer() {
    startTime = Date.now();
  }

  function endGame() {
    const endTime = Date.now();
    const timeTakenMs = endTime - startTime;

    const totalSeconds = Math.floor(timeTakenMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    let timeString = "";
    if (minutes > 0) {
      timeString += `${minutes} minuto${minutes === 1 ? "" : "s"}`;
      if (seconds > 0) {
        timeString += ` y `;
      }
    }
    if (seconds > 0 || totalSeconds === 0) {
      timeString += `${seconds} segundo${seconds === 1 ? "" : "s"}`;
    }
    if (timeString === "") {
      timeString = `menos de 1 segundo`;
    }

    const finalMessage = document.createElement("div");
    finalMessage.classList.add("final-message");
    finalMessage.innerHTML = `
            <h2>¡Felicidades!</h2>
            <p>¡Has encontrado todas las palabras!</p>
            <p>Tiempo total: <strong>${timeString}</strong></p>
            <button onclick="location.reload()">Jugar de nuevo</button>
        `;

    wordSearchGrid.style.display = "none";
    document.querySelector(".word-lists-container").style.display = "none";
    document.querySelector(".instruccion").style.display = "none";

    document.querySelector(".container").appendChild(finalMessage);

    // Opcional: Desactivar la interacción con la cuadrícula después de ganar
    const allCells = document.querySelectorAll(".grid-cell");
    allCells.forEach((cell) => {
      cell.removeEventListener("mousedown", startSelection);
      cell.removeEventListener("touchstart", startSelectionTouch);
      cell.style.pointerEvents = "none"; // Desactiva clics y toques
    });
  }

  // Inicializar la cuadrícula
  generateGrid();
});
