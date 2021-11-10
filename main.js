'use strict';
(function () {
    let side = 3;

    let base3 = (function () {
        let base = 3;
        function shift(index) {
            let ans = 1;
            for (let i = 0; i < index; i++) {
                ans *= base;
            }
            return ans;
        }

        function getBit(num, index) {
            let d = shift(index);
            num = Math.floor(num / d);
            return num % base;
        }

        function setBit(num, index, val) {
            let cur = getBit(num, index) * shift(index);
            num -= cur;
            num += val * shift(index);
            return num;
        }

        function transform(num, len) {
            let ans = 0;
            for (let i = 0; i < len; i++) {
                let cur = getBit(num, i);
                if (cur == 0) {
                    ans += shift(i);
                } else if (cur == 2) {
                    ans += 2 * shift(i);
                }
            }
            return ans;
        }

        function print(num, len) {
            let ans = "";
            for (let i = 0; i < len; i++) {
                ans = getBit(num, i) + ans;
            }
            console.log(ans);
        }

        return { getBit, setBit, transform, shift, print };
    })();


    let checker = (function () {
        let finished = "finished";
        let incomplete = "incomplete";
        let tie = "tie";

        function _checkRows(board) {
            for (let row = 0; row < side; row++) {
                if (board[row][0] === " ") {
                    continue;
                }
                let isFinished = 1;
                for (let column = 1; column < side; column++) {
                    if (board[row][column] !== board[row][0]) {
                        isFinished = 0;
                    }
                }
                if (isFinished) {
                    return { verdict: finished, winner: board[row][0], row };
                }
            }
            return { verdict: incomplete };
        }

        function _checkColumns(board) {
            for (let column = 0; column < side; column++) {
                if (board[0][column] === " ") {
                    continue;
                }
                let isFinished = 1;
                for (let row = 1; row < side; row++) {
                    if (board[row][column] !== board[row - 1][column]) {
                        isFinished = 0;
                    }
                }
                if (isFinished) {
                    return { verdict: finished, winner: board[0][column], column };
                }
            }
            return { verdict: incomplete };
        }

        function _checkDiagonals(board) {
            let isFinishedLeft = 1;
            let isFinishedRight = 1;
            let columnLeft = 0;
            let columnRight = side - 1;

            if (board[0][0] === " ") {
                isFinishedLeft = 0;
            }

            if (board[0][side - 1] === " ") {
                isFinishedRight = 0;
            }

            for (let row = 1; row < side; row++) {
                columnLeft++;
                columnRight--;
                if (board[row][columnLeft] !== board[0][0]) {
                    isFinishedLeft = 0;
                }

                if (board[row][columnRight] !== board[0][side - 1]) {
                    isFinishedRight = 0;
                }
            }

            if (isFinishedLeft) {
                return { verdict: finished, winner: board[0][0], diagonal: "left" };
            } else if (isFinishedRight) {
                return { verdict: finished, winner: board[0][side - 1], diagonal: "right" };
            } else {
                return { verdict: incomplete };
            }
        }

        function _countEmptyCells(board) {
            let cnt = 0;
            for (let row = 0; row < side; row++) {
                for (let column = 0; column < side; column++) {
                    if (board[row][column] === " ") {
                        cnt++;
                    }
                }
            }
            return cnt;
        }

        function checkBoard(board) {
            let rowVerdict = _checkRows(board);
            let columnVerdict = _checkColumns(board);
            let diagonalVerdict = _checkDiagonals(board);
            if (rowVerdict.verdict !== incomplete) {
                return rowVerdict;
            } else if (columnVerdict.verdict !== incomplete) {
                return columnVerdict;
            } else if (diagonalVerdict.verdict !== incomplete) {
                return diagonalVerdict;
            } else {
                let cnt = _countEmptyCells(board);
                if (cnt === 0) {
                    return { verdict: tie };
                }
                else {
                    return { verdict: incomplete };
                }
            }
        }

        return { checkBoard };
    })();

    let gameBoard = (function () {
        let board = new Array(side);
        for (let row = 0; row < side; row++) {
            board[row] = new Array(side);
            for (let column = 0; column < side; column++) {
                board[row][column] = " ";
            }
        }

        let mark = (row, column, marker) => board[row - 1][column - 1] = marker;
        let unmark = (row, column) => board[row - 1][column - 1] = " ";
        let getCurrentBoard = () => board;
        return { mark, unmark, getCurrentBoard };
    })();

    function playerFactory(name, marker) {
        let getName = () => name;
        let getMarker = () => marker;
        return { getName, getMarker };
    }

    let computer = (function () {
        let bestScore = new Array(base3.shift(side * side));
        bestScore.fill(1e9);
        let numOfMoves = new Array(base3.shift(side * side));
        numOfMoves.fill(1e9);
        let bestMove = new Array(base3.shift(side * side));

        function recur(num) {
            if (bestScore[num] != 1e9) {
                return bestScore[num];
            }

            let currentVerdict = checker.checkBoard(makeBoard(num));
            if (currentVerdict.verdict === "finished") {
                numOfMoves[num] = 0;
                if (currentVerdict.winner === "1") {
                    bestScore[num] = -1;
                    return bestScore[num];
                } else if (currentVerdict.winner === "0") {
                    bestScore[num] = 1;
                    return bestScore[num];
                }
            } else if (currentVerdict.verdict === "tie") {
                numOfMoves[num] = 0;
                bestScore[num] = 0;
                return bestScore[num];
            } else {
                bestScore[num] = -2;
                for (let i = 0; i < side * side; i++) {
                    if (base3.getBit(num, i) === 2) {
                        let nxt = base3.transform(base3.setBit(num, i, 0), side * side);
                        let result = -1 * recur(nxt);
                        let updateAns = () => {
                            numOfMoves[num] = numOfMoves[nxt] + 1;
                            bestScore[num] = result;
                            let row = Math.floor(i / side);
                            let column = i % side;
                            bestMove[num] = { row, column };
                        }
                        if (result > bestScore[num]) {
                            updateAns();
                        }
                        else if (result === bestScore[num] && numOfMoves[nxt] + 1 < numOfMoves[num]) {
                            updateAns();
                        }
                    }
                }
                return bestScore[num];
            }
        }

        function makeBoard(num) {
            let board = new Array(side);
            for (let row = 0; row < side; row++) {
                board[row] = new Array(side);
                for (let column = 0; column < side; column++) {
                    let index = row * side + column;
                    board[row][column] = base3.getBit(num, index);
                }
                board[row] = board[row].map((cur) => {
                    if (cur != 2) {
                        return cur.toString();
                    } else {
                        return " ";
                    }
                });
            }
            return board;
        }

        function makeNum(board, marker) {
            let result = new Array(side);
            let num = 0;
            for (let row = 0; row < side; row++) {
                result[row] = new Array(side);
                for (let column = 0; column < side; column++) {
                    let index = row * side + column;
                    if (board[row][column] === " ") {
                        result[row][column] = 2;
                        num += 2 * base3.shift(index);
                    } else if (board[row][column] !== marker) {
                        result[row][column] = 1;
                        num += base3.shift(index);
                    } else {
                        result[row][column] = 0;
                    }
                }
            }
            return num;
        }

        function precompute() {
            recur(base3.shift(side * side) - 1);
        }

        function _computeMove() {
            if (game.getCurrentMode() == "easy") {
                let board = gameBoard.getCurrentBoard();
                let remainCells = [];
                for (let row = 0; row < side; row++) {
                    for (let column = 0; column < side; column++) {
                        if (board[row][column] === " ") {
                            remainCells.push({ row, column });
                        }
                    }
                }
                let randIndex = Math.floor(Math.random() * remainCells.length);
                return remainCells[randIndex];
            } else if (game.getCurrentMode() == "hard") {
                let board = gameBoard.getCurrentBoard();
                let computerMarker = game.getCurrentPlayer().getMarker();
                let num = makeNum(board, computerMarker);
                let move = bestMove[num];
                return { row: move.row, column: move.column };
            }
        }

        function move() {
            let computerMove = _computeMove();
            displayController.simulateClick(computerMove.row + 1, computerMove.column + 1);
        }

        return { precompute, move };
    })();

    let game = (function () {
        let currentPlayer = 0;
        let mode = "pvp";
        let playerList = [];

        let getCurrentMode = () => mode;
        let setMode = (newMode) => mode = newMode;
        let _getWinner = ((marker) => playerList.filter((player) => (player.getMarker() == marker))[0].getName());
        let getCurrentPlayer = () => playerList[currentPlayer];
        let resetCurrentPlayer = () => currentPlayer = 0;
        let changeCurrentPlayer = () => currentPlayer ^= 1;
        let start = (name1, name2) => playerList = [playerFactory(name1, "X"), playerFactory(name2, "O")];

        function getVerdict() {
            let board = gameBoard.getCurrentBoard();
            let verdict = checker.checkBoard(board);
            if (verdict.verdict === "finished") {
                verdict["winner"] = _getWinner(verdict["winner"]);
            }
            return verdict;
        }

        return { getCurrentPlayer, changeCurrentPlayer, getVerdict, start, setMode, getCurrentMode, resetCurrentPlayer };
    })();

    let displayController = function () {
        function _getCell(row, column) {
            return document.querySelector(`[data-row="${row}"][data-column="${column}"]`);
        }

        function _enableClick(row, column) {
            const cell = _getCell(row, column);
            cell.classList.remove("disabled");
        }

        function _disableClick(row, column) {
            const cell = _getCell(row, column);
            cell.classList.add("disabled");
        }

        function _setupOnClickListeners() {
            for (let row = 1; row <= side; row++) {
                for (let column = 1; column <= side; column++) {
                    const cell = _getCell(row, column);
                    cell.addEventListener('click', (Event) => {
                        if (!Event.target.classList.contains("disabled")) {
                            _cellClicked(row, column);
                        }
                    });
                }
            }
        }

        function _unmark(row, column) {
            const cell = _getCell(row, column);
            cell.innerHTML = "&nbsp;&nbsp;&nbsp;";
            cell.classList.remove("blue");
            cell.classList.remove("yellow");
            cell.classList.remove("computer-move");
            gameBoard.unmark(row, column);
            _enableClick(row, column);
        }

        function _mark(row, column) {
            const cell = _getCell(row, column);
            cell.innerHTML = game.getCurrentPlayer().getMarker();
            if (game.getCurrentPlayer().getMarker() === "O") {
                cell.classList.add("blue");
            } else {
                cell.classList.add("yellow");
            }
            _disableClick(row, column);
        }

        function _cellClicked(row, column) {
            _mark(row, column);
            gameBoard.mark(row, column, game.getCurrentPlayer().getMarker());
            game.changeCurrentPlayer();
            let currentVerdict = game.getVerdict();
            if (currentVerdict.verdict !== "incomplete") {
                _disableAllCells();
                _manageInputField(false);
                if (currentVerdict.verdict === "finished") {
                    _highlightWinCells(currentVerdict);
                    publishVerdict(`Winner is ${currentVerdict.winner}`);
                } else {
                    publishVerdict("TIE");
                }
            }
            else if (game.getCurrentMode() !== "pvp") {
                const cell = _getCell(row, column);
                if (!cell.classList.contains("computer-move")) {
                    computer.move();
                }
            }
        }

        function createGrid() {
            let gridInnerHTML = "";
            for (let row = 1; row <= side; row++) {
                for (let column = 1; column <= side; column++) {
                    const cell = `<section class="grid-item" style="grid-row: ${row}; grid-column: ${column};" data-row="${row}" data-column="${column}">&nbsp;&nbsp;&nbsp;</section>`;
                    gridInnerHTML += cell;
                }
            }
            const gridContainer = document.querySelector("#grid-container");
            gridContainer.innerHTML += gridInnerHTML;
            _setupOnClickListeners();
        }

        function clearGrid() {
            const verdictPara = document.querySelector("#verdict");
            verdictPara.textContent = "Verdict will come here!";
            game.resetCurrentPlayer();
            for (let row = 1; row <= side; row++) {
                for (let column = 1; column <= side; column++) {
                    let cell = _getCell(row, column);
                    cell.classList.remove("green");
                    _unmark(row, column);
                }
            }
        }

        function simulateClick(row, column) {
            const cell = _getCell(row, column);
            cell.classList.add("computer-move");
            cell.click();
        }

        function _highlightWinCells(verdict) {
            if ("row" in verdict) {
                for (let column = 1; column <= side; column++) {
                    let cell = _getCell(verdict["row"] + 1, column);
                    cell.classList.add("green");
                }
            } else if ("column" in verdict) {
                for (let row = 1; row <= side; row++) {
                    let cell = _getCell(row, verdict["column"] + 1);
                    cell.classList.add("green");
                }
            } else if (verdict["diagonal"] === "left") {
                let column = 1;
                for (let row = 1; row <= side; row++) {
                    let cell = _getCell(row, column);
                    cell.classList.add("green");
                    column++;
                }
            } else if (verdict["diagonal"] === "right") {
                let column = side;
                for (let row = 1; row <= side; row++) {
                    let cell = _getCell(row, column);
                    cell.classList.add("green");
                    column--;
                }
            }
        }

        function _disableAllCells() {
            for (let row = 1; row <= side; row++) {
                for (let column = 1; column <= side; column++) {
                    _disableClick(row, column);
                }
            }
        }

        function _manageInputField(status) {
            let inputFields = document.querySelectorAll("#user-input input");
            for (let index = 0; index < inputFields.length; index++) {
                const element = inputFields[index];
                element.disabled = status;
            }

            let modeButtons = document.querySelector("#modes").children;
            for (let index = 0; index < modeButtons.length; index++) {
                const element = modeButtons[index];
                element.disabled = status;
            }
        }


        function publishVerdict(verdict) {
            const verdictPara = document.querySelector("#verdict");
            verdictPara.textContent = verdict;
        }

        function _reset(Event) {
            _manageInputField(true);
            if (Event.target.textContent === "Start") {
                Event.target.textContent = "Reset";
                createGrid();
            } else {
                clearGrid();
            }
            let playerName1 = document.querySelector("input[name='playerName1']").value;
            let playerName2 = document.querySelector("input[name='playerName2']").value;
            game.start(playerName1, playerName2);
        }

        const resetButton = document.querySelector(".reset");
        resetButton.addEventListener("click", _reset);
        const modesButtons = document.querySelector("#modes").children;
        for (let child = 0; child < modesButtons.length; child++) {
            const modeButton = modesButtons[child];
            modeButton.addEventListener('click', (Event) => {
                const activeButton = document.querySelector(".active");
                activeButton.classList.remove("active");
                Event.target.classList.add("active");
                let buttonType = Event.target.getAttribute("data-mode");
                if (buttonType === "easy") {
                    const secondLabel = document.querySelector("label[for='name2']");
                    secondLabel.textContent = "Computer Name: ";
                    const secondNameInput = document.querySelector("#name2");
                    secondNameInput.value = "Random Bot";
                } else if (buttonType === "hard") {
                    const secondLabel = document.querySelector("label[for='name2']");
                    secondLabel.textContent = "Computer Name: ";
                    const secondNameInput = document.querySelector("#name2");
                    secondNameInput.value = "Smart Bot";
                } else {
                    const secondLabel = document.querySelector("label[for='name2']");
                    secondLabel.textContent = "Second Player: ";
                    const secondNameInput = document.querySelector("#name2");
                    secondNameInput.value = "Bob";
                }
                game.setMode(buttonType);
            });
        }
        return { createGrid, clearGrid, publishVerdict, simulateClick };
    }();

    computer.precompute();
})();
