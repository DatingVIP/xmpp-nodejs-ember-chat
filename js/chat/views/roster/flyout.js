Chat.Views.Roster.Flyout = Ember.View.extend({
	template: Ember.Handlebars.compile(
		'<div class="chat-flyout-titlebar clearfix">'
	  +   '<div class="titlebar-text-wrapper">'
	  +	 '<div class="titlebar-text">{{t roster.flayout.title}}</div>'
	  +	 '<span class="titlebar-closer"></span>'
	  +   '</div>'
	  + '</div>'
	  + '<div class="chat-flyout-body chat-friend-list">'
	  + '{{view Chat.Views.Roster.Flyout_List}}'
	  + '{{view Chat.Views.Roster.Chat_Off}}'
	  + '</div>'
	  + '{{#if view.bigList}}<div class="chat-roster-more-contacts">{{t roster.flayout.all_contacts}}</div>{{/if}}'
	),
	
	classNames: Ember.A(['chat-flyout']),
	isVisibleBinding: 'parentView.isActive',

	didInsertElement: function () {
		var parentView = this.get('parentView');
		var cookie_isActive = $.cookie('roster_isActive_' + Chat.Controllers.application.user.jid);
		if (cookie_isActive && cookie_isActive == 'true') {  parentView.set('isActive', true); }
		
		this.$('.titlebar-closer').click(_.bind(function (event) {
			parentView.set('isActive', !parentView.get('isActive'));
			$.cookie('roster_isActive_' + Chat.Controllers.application.user.jid, parentView.get('isActive'), { expires: 1, path: '/'});
		}, this));
		
		this.$('.contactslist').click(_.bind(function (event) {
			return true;
		}, this));
	},
	
	bigList: Ember.computed(function() {
		if (Chat.Controllers.application.get('user.show') == 'unavailable'){ return false; }
		
		if (Chat.Controllers.roster.content.length > Chat.Controllers.application.roster_limit){ return true; }
		return false;
	}).property('Chat.Controllers.roster.content.length', 'Chat.Controllers.application.user.show'),
});
