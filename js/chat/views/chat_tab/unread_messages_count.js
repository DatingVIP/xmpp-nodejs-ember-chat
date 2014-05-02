Chat.Views.ChatTab.UnreadMessagesCount = Ember.View.extend({
	template: Ember.Handlebars.compile(
		'{{view.unreadMessagesCount}}'
	),
	tagName: 'span',
	classNames: Ember.A(['chat-tab-unread-messages']),

	// Order of bindings is important here.
	// See https://github.com/emberjs/ember.js/issues/1164
	unreadMessagesCountBinding: 'parentView.parentView.content.unreadMessagesCount',
	isVisibleBinding: 'areUnreadMessagesPresent',

	areUnreadMessagesPresent: Ember.computed( function () {
		if (this.get('parentView.parentView.content.waiting', false) == true)		{ return false; }
		if (this.get('unreadMessagesCount') && this.get('unreadMessagesCount') > 0)	{ return true; }
		
		return false;
	}).property('unreadMessagesCount')
});
