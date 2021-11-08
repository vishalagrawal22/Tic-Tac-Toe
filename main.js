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
        let playerList = [playerFactory("Vishal", "X"), playerFactory("Utkarsh", "O")]
        let finished = "finished";
        let incomplete = "incomplete";

        let _getWinner = ((marker) => playerList.filter((player) => (player.getMarker() == marker))[0].getName());
        let getCurrentPlayer = () => playerList[currentPlayer];
        let changeCurrentPlayer = () => currentPlayer ^= 1;

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
                    return { verdict: finished, winner: _getWinner(board[row][0]) };
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
                    return { verdict: finished, winner: _getWinner(board[0][column]) };
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
                return { verdict: finished, winner: _getWinner(board[0][0]) };
            } else if (isFinishedRight) {
                return { verdict: finished, winner: _getWinner(board[0][side - 1]) };
            } else {
                return { verdict: incomplete };
            }
        }
        return { getCurrentPlayer, changeCurrentPlayer, _checkRows, _checkColumns, _checkDiagonals };
    })();

    let displayController = function () {
        function getCell(row, column) {
            return document.querySelector(`[data-row="${row}"][data-column="${column}"]`);
        }

        function _enableClick(row, column) {
            const cell = getCell(row, column);
            cell.classList.remove("disabled");
        }

        function _disableClick(row, column) {
            const cell = getCell(row, column);
            cell.classList.add("disabled");
        }

        function _setupOnClickListeners() {
            for (let row = 1; row <= side; row++) {
                for (let column = 1; column <= side; column++) {
                    const cell = getCell(row, column);
                    cell.addEventListener('click', (Event) => {
                        if (Event.target.classList.contains("disabled")) {
                            alert("Already Taken!");
                        } else {
                            _cellClicked(row, column);
                        }
                    });
                }
            }
        }

        function _unmark(row, column) {
            const cell = getCell(row, column);
            cell.textContent = "";
            gameBoard.unmark(row, column);
            _enableClick(row, column);
        }

        function _mark(row, column) {
            const cell = getCell(row, column);
            cell.textContent = game.getCurrentPlayer().getMarker();
            _disableClick(row, column);
        }

        function _cellClicked(row, column) {
            _mark(row, column);
            gameBoard.mark(row, column, game.getCurrentPlayer().getMarker());
            game.changeCurrentPlayer();
        }

        function createGrid() {
            let gridInnerHTML = "";
            for (let row = 1; row <= side; row++) {
                for (let column = 1; column <= side; column++) {
                    const cell = `<section class="grid-item" style="grid-row: ${row}; grid-column: ${column};" data-row="${row}" data-column="${column}"></section>`;
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
                    _unmark(row, column);
                }
            }
        }

        function publishVerdict(verdict) {
            const verdictPara = document.querySelector("#verdict");
            verdictPara.textContent = verdict;
        }
        return { createGrid, clearGrid, publishVerdict };
    }();

    (function test() {
        displayController.createGrid();
    })();
})();
