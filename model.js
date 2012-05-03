Games = new Meteor.Collection('games');
Players = new Meteor.Collection('players');
Decks = new Meteor.Collection('decks');
Cards = new Meteor.Collection('cards');

function createNewDeck(name) {
  return Decks.insert({name: name, card_names: []});
}

if (Meteor.is_server) {
  Meteor.publish('games', function () {
    return Games.find({});
  });  

  Meteor.publish('players', function (gameId) {
    return Players.find({game_id: gameId});
  });

  Meteor.publish('decks', function () {
    return Decks.find();
  });

  Meteor.publish('cards', function (gameId) {
    return Cards.find({game_id: gameId});
  });
}
