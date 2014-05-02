Chat.Controllers.RosterVisible = Ember.ArrayController.extend({
	content: Ember.A([]),
	sortProperties: Ember.A(['show', 'jid']),
});
Ember.A(Chat.Controllers.RosterVisible);
Chat.Controllers.rosterVisible = Chat.Controllers.RosterVisible.create();
