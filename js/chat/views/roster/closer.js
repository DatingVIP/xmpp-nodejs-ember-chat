Chat.Views.Roster.Closer = Ember.View.extend({
	template: Ember.Handlebars.compile(
		'<span></span>{{Chat.Controllers.application.user.show2}}'
	),
	
	classNames: Ember.A(['chat-close']),
	
	didInsertElement: function () {
		this.$().click(_.bind(function (event) {
			Chat.toggleChatApp();
    	}, this));
	}
});
