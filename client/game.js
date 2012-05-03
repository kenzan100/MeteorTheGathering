Template.game.show = function () {
  return !Session.get('editor');
}

Template.game.gameName = function () {
  var myGame = currentGame();
  return myGame && myGame.name;
};

Template.game.playerName = function () {
  var me = currentPlayer();
  return me && me.name;
};

Template.game.deckName = function () {
  var myDeck = currentPlayerDeck();
  return myDeck && myDeck.name;
};

Template.game.deckCardCount = function () {
  var myDeck = currentPlayerDeck();
  return (myDeck && myDeck.card_names) ? myDeck.card_names.length : 0;
};

Template.game.opponentPlayerName = function () {
  var myOpponent = currentOpponent();
  return myOpponent && myOpponent.name;
};

Template.game.opponentDeckName = function () {
  var myOpponentDeck = currentOpponentDeck();
  return myOpponentDeck && myOpponentDeck.name;
};

Template.game.opponentDeckCardCount = function () {
  var myOpponentDeck = currentOpponentDeck();
  return (myOpponentDeck && myOpponentDeck.card_names) ? myOpponentDeck.card_names.length : 0;
};

Template.game.isStarted = function () {
  return Cards.find({game_id: currentGameId(), player_id: currentPlayerId()}).count() > 0;
};

Template.game.librarySize = function () {
  return Cards.find({game_id: currentGameId(), player_id: currentPlayerId(), state: 'library'}).count();
};

Template.game.myHand = function () {
  return Cards.find({game_id: currentGameId(), player_id: currentPlayerId(), state: 'hand'});
};

Template.game.opponentIsStarted = function () {
  var opp = currentOpponent();
  return opp && Cards.find({game_id: currentGameId(), player_id: opp._id}).count() > 0;
};

Template.game.opponentLibrarySize = function () {
  var opp = currentOpponent();
  return opp ? Cards.find({game_id: currentGameId(), player_id: opp._id, state: 'library'}).count() : 0;
};

Template.game.opponentHand = function () {
  var opp = currentOpponent();
  return opp && Cards.find({game_id: currentGameId(), player_id: opp._id, state:'hand'});
};

Template.game.cardsOnMat = function () {
  return Cards.find({game_id: currentGameId(), state: 'untapped'});
};

Template.game.events = {
  'click #show-game-form': function () {
    $('#game-name').hide();
    $('#change-game-form').show();
    $('#new-game').select();
  },
  'click #cancel-game-form': function () {
    $('#change-game-form').hide();
    $('#game-name').show();
  },
  'click #change-game': function () {
    var gameName = $.trim($('#new-game').val());
    var existingGame = Games.findOne({name: gameName});
    var gameId;
    
    if (existingGame) {
      gameId = existingGame._id;
    }
    else {
      gameId = Games.insert({name: gameName});
    }
    
    Session.set('game_id', gameId);
    Players.update(currentPlayerId(), {$set: {game_id: gameId}});

    $('#change-game-form').hide();
    $('#game-name').show();
  },
  'click #show-player-form': function () {
    $('#player-name').hide();
    $('#change-player-form').show();
    $('#new-player').select();
  },
  'click #cancel-player-form': function () {
    $('#change-player-form').hide();
    $('#player-name').show();
  },
  'click #change-player': function () {
    var playerName = $.trim($('#new-player').val());
    var existingPlayer = Players.findOne({name: playerName});
    var playerId;

    if (existingPlayer) {
      playerId = existingPlayer._id;
      Session.set('player_id', playerId);
      Session.set('game_id', existingPlayer.game_id);
    }
    else {
      playerId = currentPlayerId();
      Players.update(playerId, {$set: {name: playerName}});
    }

    $('#change-player-form').hide();
    $('#player-name').show();
  },
  'click #show-deck-form': function () {
    $('#deck-name').hide();
    $('#change-deck-form').show();
    $('#new-deck').select();
  },
  'click #cancel-deck-form': function () {
    $('#change-deck-form').hide();
    $('#deck-name').show();
  },
  'click #change-deck': function () {
    var deckName = $.trim($('#new-deck').val());
    var existingDeck = Decks.findOne({name: deckName});
    var deckId;
    
    if (existingDeck) {
      deckId = existingDeck._id;
    }
    else {
      deckId = createNewDeck(deckName);
    }
    
    Players.update(currentPlayerId(), {$set: {deck_id: deckId}});

    $('#change-deck-form').hide();
    $('#deck-name').show();
  },
  'click #edit-deck': function () {
    Session.set('editor', true);
  },
  'click #start': function () {
    var myDeck = currentPlayerDeck();
    var i;    
    if (myDeck) {
      for (i = 0; i < myDeck.card_names.length; i++) {
        Cards.insert({name: myDeck.card_names[i], player_id: currentPlayerId(), game_id: currentGameId(), state: 'library' });
      }
    }
  },
  'click #draw': function () {
    var card = Cards.findOne({game_id: currentGameId(), player_id: currentPlayerId(), state: 'library'});
    if (card) {
      Cards.update(card._id, {$set: {state: 'hand'}});
    }
  },
  'click #my-hand .card': function (e) {
    var cardId = e.target.id.substring(5);
    Cards.update(cardId, {$set: {state: 'untapped', top: 100, left: 100}});
  },
  'dragged .card': function (e) {
    var cardId = e.target.id.substring(5);
    var $target = $(e.target);
    Cards.update(cardId, {$set: {top: $target.position().top, left: $target.position().left}});
  }
};
