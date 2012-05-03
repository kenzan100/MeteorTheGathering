Template.dashboard.gameName = function () {
  var myGame = currentGame();
  return myGame && myGame.name;
};

Template.dashboard.playerName = function () {
  var me = currentPlayer();
  return me && me.name;
};

Template.dashboard.deckName = function () {
  var myDeck = currentPlayerDeck();
  return myDeck && myDeck.name;
};

Template.dashboard.deckCardCount = function () {
  var myDeck = currentPlayerDeck();
  return (myDeck && myDeck.card_names) ? myDeck.card_names.length : 0;
};

Template.dashboard.opponentPlayerName = function () {
  var myOpponent = currentOpponent();
  return myOpponent && myOpponent.name;
};

Template.dashboard.opponentDeckName = function () {
  var myOpponentDeck = currentOpponentDeck();
  return myOpponentDeck && myOpponentDeck.name;
};

Template.dashboard.opponentDeckCardCount = function () {
  var myOpponentDeck = currentOpponentDeck();
  return (myOpponentDeck && myOpponentDeck.card_names) ? myOpponentDeck.card_names.length : 0;
};

Template.dashboard.events = {
  'click #show-game-form': function (e) {
    $('#game-name').hide();
    $('#change-game-form').show();
    $('#new-game').select();
    e.stopPropagation();    
    return false;
  },
  'click #cancel-game-form': function (e) {
    $('#change-game-form').hide();
    $('#game-name').show();
  },
  'click #change-game': function (e) {
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
  'click #show-player-form': function (e) {
    $('#player-name').hide();
    $('#change-player-form').show();
    $('#new-player').select();
  },
  'click #cancel-player-form': function (e) {
    $('#change-player-form').hide();
    $('#player-name').show();
  },
  'click #change-player': function () {
    var playerName = $.trim($('#new-player').val());
    Players.update(currentPlayerId(), {$set: {name: playerName}});
    
    $('#change-player-form').hide();
    $('#player-name').show();
  },
  'click #show-deck-form': function () {
    $('#deck-name').hide();
    $('#change-deck-form').show();
    $('#new-deck').select();
  },
  'click #cancel-deck-form': function (e) {
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
  }
};
