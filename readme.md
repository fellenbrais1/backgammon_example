# Backgammon game

To load:
In vscode, right click on index.html and 'Open with Live Server'

# Example rpc Message

sendRPC('move', {
pieceId: move.piece.id,
player: game.currentTurn,
from: move.from,
to: move.to,
});
