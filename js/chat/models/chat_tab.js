Chat.Models.ChatTab = Ember.Object.extend({
	user: null,
	isActive: false,
	isVisible: true,
	unreadMessagesCount: '0',
	waiting: false,
	blocking: false,
	last_message: null,
	test: false,
	typing: false,
	typingTimeout: false,
	load_any_archive: false,
	

	init: function () {
		Chat.Controllers.application.getArchiveByUser(this.get('friend').jid);
		this.set('messageGroups', Ember.A([]));
	},
	
	/**
	 * set that user is typing
	 */
	setTyping: function(date) {
		this.set('typing', date);
		if (this.get('typingTimeout') != true){
			this.set('typingTimeout', true);
			setTimeout(this.isTyping, 2*1000, this);
		}
	},
	
	/**
	 * if still typing checker
	 */
	isTyping: function(tab) {
		if (tab.get('typing') != false) {
			var diff = (new Date().getTime() - tab.get('typing'))/1000;
			if (diff > 1){
				tab.set('typing', false);
				tab.set('typingTimeout', false);
			}
			else {
				setTimeout(tab.isTyping, 2*1000, tab);
			}
			
		}
	},

	_onMessage : function(message) {
		// TODO: handle activity messages as well
		if (message.get('body') && $.trim(message.get('body')).length > 0) {
			// Group consecutive messages from the same user
			var groups = this.get('messageGroups'),
				group = groups.get('lastObject'),
				fullJid = message.get('from'),
				bareJid = getBareJidFromJid(fullJid),
				from;

			if (message.get('direction') == 'system')
			{
				bareJid = 'system';
			}
			else {
				try {
					if (!window.focus_state )	{
						$.playSound('/media/new_message');
					}
				}
				catch (e) {}
			}
			if (this.shouldCreateNewGroup(group, bareJid)) {
				group = Chat.Models.MessageGroup.create({
					from : bareJid
				});
				groups.addObject(group);
				// if no free slots for new tab
				var l = 0, sum_visible = 0;
				$(Chat.Controllers.chatTabs.content).each(function(index, value) {
					if (value.get('isVisible') === true
							&& value.get('test') === false /*&& tab.friend.jid!=value.friend.jid*/) {
						//if(l==0) { l = index; }
						l = index;
						sum_visible++;
					}
				});
				if (Chat.Controllers.chatTabs.content.length > Chat.Controllers.chatTabs.max_visible
						&& sum_visible > Chat.Controllers.chatTabs.max_visible) {
					this.set('test', true);
					this.set('isVisible', false);
					this.set('isActive', true);
					Chat.Controllers.chatTabs.isMore();
				}
			}

			Ember.A(group.get('messages')).addObject(message);
			this.last_message = new Date().getTime();

			if (!this.get('isActive') || (this.get('test') && !this.get('isVisible'))) {
				this.set('unreadMessagesCount', parseInt(this.get('unreadMessagesCount') + 1, 10));
			}
		}
	},

	resetUnreadMessagesCount: Ember.observer( function () {
		if (this.get('isActive')) {
			this.set('unreadMessagesCount', 0);
		}
	}, 'isActive'),

	shouldCreateNewGroup : function(group, sender) {
		if (!group) { return true; }
		// last group is from other user than the new message
		if (group && group.get('from') !== sender) { return true; }
		// last message was created more than 5 minutes ago
		//IE8 FIX:: if (group && (Date.now() - group.get('messages.lastObject.createdAt').valueOf() > 5 * 60 * 1000)){ return true; }
		
		return false;
	},
});
