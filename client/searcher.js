Template.searcher.show = function () {
  return Session.equals('mode', 'search');
};

Template.searcher.cards = function () {
  return Cards.find({game_id: currentGameId(), player_id: currentPlayerId(), $or: [{state: 'library'}, {state: 'libraryTop'}, {state: 'libraryBottom'}]}, {sort: {name: 1}});
};

Template.searcher.events = {
  'click #cancel-search': function (e) {
    Session.set('mode', 'game');
    e.preventDefault();
  },
  'click .search-card': function (e) {
    var cardId = e.target.id.substring(7);
    Cards.update(cardId, {$set: {state: 'hand', hand_time: new Date().getTime()}});
    Session.set('mode', 'game');
  }
};
