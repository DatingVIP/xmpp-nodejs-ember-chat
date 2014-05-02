Chat.Views.Roster.Chat_Off = Ember.View.extend({
	template: Ember.Handlebars.compile(
		'<div class="chat-roster-overlay">'
		+'</div>'
		+'<div class="chat-roster-no-overlay">{{t roster.chat_off.message }}</div>'
	),
	
	tagName: 'div',
	
	isVisible: Ember.computed(function() {
		if (Chat.Controllers.application.get('user.show') == 'unavailable'){ return true; }
		return false;
	}).property('Chat.Controllers.application.user.show'),
	
	didInsertElement: function () {
		this.$().click(_.bind(function (event) {
			Chat.toggleChatApp();
		}, this));
	}
});