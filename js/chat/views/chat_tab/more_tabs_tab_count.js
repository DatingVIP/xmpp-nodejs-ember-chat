Chat.Views.ChatTab.MoreTabsTabCount = Ember.View.extend({
	    template: Ember.Handlebars.compile(
	        '{{view.unreadMessagesCount}}'
	    ),
	    tagName: 'span',
	    classNames: Ember.A(['chat-tab-unread-messages']),

	    // Order of bindings is important here.
	    // See https://github.com/emberjs/ember.js/issues/1164
	    unreadMessagesCountBinding: 'parentView.content.unreadMessagesCount',
	    isVisibleBinding: 'areUnreadMessagesPresent',

	    areUnreadMessagesPresent: Ember.computed( function () {
			//this.set('unreadMessagesCount');
	    	Chat.Controllers.chatTabs.calcUnreadedTabs();
	        return this.get('unreadMessagesCount') != 0;
	    }).property('unreadMessagesCount')
	});
