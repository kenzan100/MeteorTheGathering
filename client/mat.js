Template.mat.show = function () {
  return !Session.get('editor');
}

Template.mat.cards = function () {
  return Cards.find({game_id: currentGameId()});
};

Template.mat.events = {
  'click #play-random': function () {
    var myDeck = currentPlayerDeck();
    var cardName;
    if (myDeck && myDeck.card_names && myDeck.card_names.length > 0) {
      cardName = myDeck.card_names[Math.floor(Math.random() * myDeck.card_names.length)];
      Cards.insert({name: cardName, player_id: currentPlayerId(), game_id: currentGameId(), top: 100, left: 100});
    }
  },
  'dragged .card': function (e) {
    var cardId = e.target.id.substring(5);
    var $target = $(e.target);
    Cards.update(cardId, {$set: {top: $target.position().top, left: $target.position().left}});
  }
};
