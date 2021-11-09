'use strict';
(function () {
    let side = 3;
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

    let game = (function () {
        let currentPlayer = 0;
        let playerList = [];
        let finished = "finished";
        let incomplete = "incomplete";
        let tie = "tie";

        let _getWinner = ((marker) => playerList.filter((player) => (player.getMarker() == marker))[0].getName());
        let getCurrentPlayer = () => playerList[currentPlayer];
        let changeCurrentPlayer = () => currentPlayer ^= 1;
        let start = (name1, name2) => playerList = [playerFactory(name1, "X"), playerFactory(name2, "O")];

        function _checkRows() {
            let board = gameBoard.getCurrentBoard();
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
                    return { verdict: finished, winner: _getWinner(board[row][0]), row };
                }
            }
            return { verdict: incomplete };
        }

        function _checkColumns() {
            let board = gameBoard.getCurrentBoard();
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
                    return { verdict: finished, winner: _getWinner(board[0][column]), column };
                }
            }
            return { verdict: incomplete };
        }

        function _checkDiagonals() {
            let board = gameBoard.getCurrentBoard();
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
                return { verdict: finished, winner: _getWinner(board[0][0]), diagonal: "left" };
            } else if (isFinishedRight) {
                return { verdict: finished, winner: _getWinner(board[0][side - 1]), diagonal: "right" };
            } else {
                return { verdict: incomplete };
            }
        }

        function _countEmptyCells() {
            let board = gameBoard.getCurrentBoard();
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

        function getVerdict() {
            let rowVerdict = _checkRows();
            let columnVerdict = _checkColumns();
            let diagonalVerdict = _checkDiagonals();
            if (rowVerdict.verdict !== incomplete) {
                return rowVerdict;
            } else if (columnVerdict.verdict !== incomplete) {
                return columnVerdict;
            } else if (diagonalVerdict.verdict !== incomplete) {
                return diagonalVerdict;
            } else {
                let cnt = _countEmptyCells();
                if (cnt === 0) {
                    return { verdict: tie };
                }
                else {
                    return { verdict: incomplete };
                }
            }
        }

        return { getCurrentPlayer, changeCurrentPlayer, getVerdict, start };
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
                disableAllCells();
                if (currentVerdict.verdict === "finished") {
                    highlightWinCells(currentVerdict);
                    publishVerdict(`Winner is ${currentVerdict.winner}`);
                } else {
                    publishVerdict("TIE");
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
            for (let row = 1; row <= side; row++) {
                for (let column = 1; column <= side; column++) {
                    let cell = _getCell(row, column);
                    cell.classList.remove("green");
                    _unmark(row, column);
                }
            }
        }

        function highlightWinCells(verdict) {
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

        function disableAllCells() {
            for (let row = 1; row <= side; row++) {
                for (let column = 1; column <= side; column++) {
                    _disableClick(row, column);
                }
            }
        }

        function publishVerdict(verdict) {
            const verdictPara = document.querySelector("#verdict");
            verdictPara.textContent = verdict;
        }

        function reset(Event) {
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
        resetButton.addEventListener("click", reset);
        return { createGrid, clearGrid, publishVerdict };
    }();
})();
