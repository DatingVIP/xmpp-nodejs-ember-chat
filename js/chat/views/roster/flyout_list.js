Chat.Views.Roster.Flyout_List = Ember.View.extend({
	template: Ember.Handlebars.compile(
		'{{collection Chat.Views.Roster.FriendCollection contentBinding=Chat.Controllers.rosterVisible}}'
		+'{{#if view.emptyList}}<div class="chat-friend-empty">{{t roster.empty}}</div>{{/if}}'
	),
	
	tagName: 'div',

	isVisible: Ember.computed(function() {
		if (Chat.Controllers.application.get('user.show') == 'unavailable'){ return false; }
		return true;
	}).property('Chat.Controllers.application.user.show'),
	
	emptyList: Ember.computed(function() {
		if (Chat.Controllers.roster.content.length == '0'){ return true; }
		return false;
	}).property('Chat.Controllers.roster.content.length'),
});