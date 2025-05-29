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
  let isSelecting = false; // Estado para saber si estamos en un proceso de selección (mouse o touch)

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
        cell.addEventListener("touchstart", startSelectionTouch, {
          passive: false,
        }); // passive: false para preventDefault

        wordSearchGrid.appendChild(cell);
      }
    }

    startGameTimer();
  }

  // --- Funciones para la selección con ratón ---
  function startSelection(e) {
    if (e.button !== 0) return; // Solo clic izquierdo
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
    e.preventDefault(); // Evita el scroll o zoom por defecto al tocar
    isSelecting = true;
    selectedCells = [];
    clearSelectedCellsStyles();

    // Obtener la celda donde se inició el toque
    const touch = e.touches[0];
    const cell = document.elementFromPoint(touch.clientX, touch.clientY);
    if (cell && cell.classList.contains("grid-cell")) {
      addCellToSelection(cell);
    }

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

    if (cell && cell.classList.contains("grid-cell")) {
      addCellToSelection(cell);
    }
  }

  function endSelectionTouch() {
    isSelecting = false;
    document.removeEventListener("touchmove", duringSelectionTouch);
    document.removeEventListener("touchend", endSelectionTouch);

    checkWord();
    clearSelectedCellsStyles();
    selectedCells = [];
  }
  // ------------------------------------------

  function addCellToSelection(cell) {
    // Añadir solo si no está ya seleccionada y es una celda válida
    if (
      cell &&
      cell.classList.contains("grid-cell") &&
      !selectedCells.includes(cell)
    ) {
      // Opcional: para una experiencia más fluida en móvil, puedes verificar que las celdas sean adyacentes
      // Esta verificación hace la selección más estricta, pero puede ser mejor para la usabilidad.
      // Si la última celda seleccionada es válida y la nueva es adyacente a ella
      if (selectedCells.length > 0) {
        const lastCell = selectedCells[selectedCells.length - 1];
        const lastRow = parseInt(lastCell.dataset.row);
        const lastCol = parseInt(lastCell.dataset.col);
        const newRow = parseInt(cell.dataset.row);
        const newCol = parseInt(cell.dataset.col);

        const rowDiff = Math.abs(lastRow - newRow);
        const colDiff = Math.abs(lastCol - newCol);

        // Permite solo movimientos a celdas adyacentes (horizontal, vertical o diagonal)
        if (rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)) {
          selectedCells.push(cell);
          cell.classList.add("selected");
        }
      } else {
        // Si es la primera celda en la selección
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

    // NOTA IMPORTANTE: Para una sopa de letras real donde el usuario arrastra libremente,
    // la reconstrucción de la palabra y la verificación de linealidad es compleja.
    // Aquí asumimos que `selectedCells` están en orden (horizontal, vertical, diagonal)
    // por cómo se seleccionaron y que forman una línea.
    // La implementación actual no verifica si las celdas forman una línea recta perfecta
    // lo cual es un desafío significativo en sopas de letras interactivas.

    // Una forma básica de "ordenar" las celdas para reconstruir la palabra
    // podría ser ordenar por fila y luego por columna, o viceversa,
    // dependiendo de la dirección dominante de la selección.
    // Sin embargo, para una selección diagonal, esto puede no ser suficiente.
    // Para simplificar, asumimos que el usuario selecciona en una dirección consistente.
    coords.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });

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

    // Formato para mostrar el tiempo
    let timeString = "";
    if (minutes > 0) {
      timeString += `${minutes} minuto${minutes === 1 ? "" : "s"}`;
      if (seconds > 0) {
        timeString += ` y `;
      }
    }
    if (seconds > 0 || totalSeconds === 0) {
      // Muestra 0 segundos si el tiempo es muy corto
      timeString += `${seconds} segundo${seconds === 1 ? "" : "s"}`;
    }
    if (timeString === "") {
      // Para casos donde el tiempo es 0 o muy pequeño
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
  }

  // Inicializar la cuadrícula
  generateGrid();
});
