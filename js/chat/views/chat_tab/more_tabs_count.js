Chat.Views.ChatTab.MoreTabsCount = Ember.View.extend({
	    template: Ember.Handlebars.compile(
	        '{{view.unreadTabsCount}}'
	    ),
	    tagName: 'span',
	    classNames: Ember.A(['chat-tab-unread-messages']),

	    // Order of bindings is important here.
	    // See https://github.com/emberjs/ember.js/issues/1164
	    unreadTabsCountBinding: 'Chat.Controllers.chatTabs.unreadTabsCount',
	    isVisibleBinding: 'areUnreadMessagesPresent',

	    areUnreadMessagesPresent: Ember.computed( function () {
	        return this.get('unreadTabsCount') !== 0;
	    }).property('unreadTabsCount')
	});
