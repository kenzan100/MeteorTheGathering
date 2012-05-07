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
  return Cards.find({game_id: currentGameId(), player_id: currentPlayerId(), state: 'hand'}, {sort: {hand_time: 1}});
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
  return opp && Cards.find({game_id: currentGameId(), player_id: opp._id, state: 'hand'});
};

Template.game.cardsOnMat = function () {
  return Cards.find({game_id: currentGameId(), $or: [{state: 'untapped'}, {state: 'tapped'}]})
    .map(function (card) {
      if (Session.equals('menu', card._id)) {
        card.menuItems = [];
        card.menuItems.push(card.state == 'untapped' ? {action: 'tap', text: 'tap'} : {action: 'untap', text: 'untap'});
        card.menuItems.push({action: 'unsummon', text: 'return to hand'});
        card.menuTop = card.state == 'tapped' ? card.top + 28 : card.top;
        card.menuLeft = card.state == 'tapped' ? card.left -28 : card.left;
      }
      return card;
    });
};

Template.game.events = {
  'click #show-game-form': function (e) {
    $('#game-name').hide();
    $('#change-game-form').show();
    $('#new-game').select();
    e.preventDefault();
  },
  'click #cancel-game-form': function (e) {
    $('#change-game-form').hide();
    $('#game-name').show();
    e.preventDefault();
  },
  'submit #change-game-form': function (e) {
    var gameName = $.trim($('#new-game').val());
    var existingGame, gameId;

    e.preventDefault();

    if (gameName.length == 0) {
      return;
    }

    existingGame = Games.findOne({name: gameName});

    if (existingGame) {
      if (Players.find({game_id: existingGame._id, _id: {$ne: currentPlayerId()}}).count() >= 2) {
        alert('There are already two players in ' + gameName);
        return;
      }

      gameId = existingGame._id;
    }
    else {
      gameId = createNewGame(gameName);
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
    e.preventDefault();
  },
  'click #cancel-player-form': function (e) {
    $('#change-player-form').hide();
    $('#player-name').show();
    e.preventDefault();
  },
  'submit #change-player-form': function (e) {
    var playerName = $.trim($('#new-player').val());
    var existingPlayer, playerId;

    e.preventDefault();

    if (playerName.length == 0) {
      return;
    }

    existingPlayer = Players.findOne({name: playerName});

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
  'click #show-deck-form': function (e) {
    $('#deck-name').hide();
    $('#change-deck-form').show();
    $('#new-deck').select();
    e.preventDefault();
  },
  'click #cancel-deck-form': function (e) {
    $('#change-deck-form').hide();
    $('#deck-name').show();
    e.preventDefault();
  },
  'submit #change-deck-form': function (e) {
    var deckName = $.trim($('#new-deck').val());
    var existingDeck, deckId;
    
    e.preventDefault();

    if (deckName.length == 0) {
      return;
    }

    existingDeck = Decks.findOne({name: deckName});

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
  'click #edit-deck': function (e) {
    Session.set('editor', true);
    e.preventDefault();
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
    var myDeck = currentPlayerDeck();
    var deckSize, skip, card;
    
    if (myDeck) {
      deckSize = Cards.find({game_id: currentGameId(), player_id: currentPlayerId(), state: 'library'}).count();
      skip = Math.floor(Math.random() * deckSize);
      card = Cards.findOne({game_id: currentGameId(), player_id: currentPlayerId(), state: 'library'}, {skip: skip});
      if (card) {
        Cards.update(card._id, {$set: {state: 'hand', hand_time: new Date().getTime()}});
      }
    }
  },
  'click #my-hand .card': function (e) {
    var cardId = e.target.id.substring(5);
    var $mat = $('#mat');
    var top = $mat.height() / 2 - 100 + Math.floor(Math.random() * 31) - 15;
    var left = $mat.width() / 2 - 72 + Math.floor(Math.random() * 31) - 15;
    var maxZIndex = incrementCurrentMaxZIndex();
    Cards.update(cardId, {$set: {state: 'untapped', top: top, left: left, z_index: maxZIndex}});
  },
  'dragged .card': function (e) {
    var cardId = e.target.id.substring(5);
    var position = $(e.target).parent().position();
    Cards.update(cardId, {$set: {top: position.top, left: position.left}});
    Session.set('menu', '');
  },
  'elevate .card': function (e) {
    var cardId = e.target.id.substring(5);
    var maxZIndex = incrementCurrentMaxZIndex();
    Cards.update(cardId, {$set: {z_index: maxZIndex}});
  },
  'menu .card': function (e) {
    var cardId = e.target.id.substring(5);
    Session.set('menu', cardId);
  },
  'mousedown': function (e) {
    var menuCardId = Session.get('menu');
    if (e.target.id != 'menu' && e.target.id != ('card-' + menuCardId) && !$(e.target).parents('#menu').length) {
      Session.set('menu', '');
    }
  },
  'click #menu a': function (e) {
    var cardId = Session.get('menu');
    var $target = $(e.target);
    
    if ($target.hasClass('unsummon')) {
      Cards.update(cardId, {$set: {state: 'hand', hand_time: new Date().getTime()}});
    }
    else if ($target.hasClass('tap')) {
      Cards.update(cardId, {$set: {state: 'tapped'}});
    }
    else if ($target.hasClass('untap')) {
      Cards.update(cardId, {$set: {state: 'untapped'}});
    }
    
    e.preventDefault();
    Session.set('menu', '');
  }
};
