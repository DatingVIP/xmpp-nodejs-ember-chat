Chat.Controllers.ChatTabs = Ember.ArrayController.extend({
	content: Ember.A([]),
	max_visible: 3,
	more_button: false,
	unreadTabsCount: 0,
	sent_invitations: {},
	
	calcUnreadedTabs: function() {
		var unread_count=0;
		$(this.content).each(function(index, value){
			if(value.get('unreadMessagesCount') > 0) {
				unread_count++;
			}
		});
		this.set('unreadTabsCount', unread_count);
	},
	/**
	 * if more tabs button should be active
	 */
	isMore: function() {
		if (this.content.length > this.max_visible) { 
			this.set('more_button', true); 
		}
		else {
			this.set('more_button', false);
		}
	},
	
	/**
	 * activate tab for selected friend
	 **/
	activateTabFor: function (friend) {
		var tab = this.content.find(function (item) {
			return item.get('friend.jid') === friend.get('jid');
		});

		if (!tab) {
			tab = this.createTab(friend);
			this.addTab(tab);
		}
		
		this.activateTab(tab);
	},
	
	/**
	 * activate selected tab
	 **/
	activateTab: function (tab) {
		var l=0, sum_visible=0;
		$(this.content).each(function(index, value){
			if(value.get('isVisible')===true && value.get('test')===false && tab.friend.jid!=value.friend.jid) {
				//if(l==0) { l = index; }
				l = index;
				sum_visible++;
			}
		});
		if (this.content.length > this.max_visible && sum_visible >= this.max_visible) {
			this.content[l].set('test', true);
			this.content[l].set('isVisible', false);
			tab.set('isActive', true);
			$.cookie('tab_isActive_' + tab.user.jid + '_' + tab.friend.jid, true, { expires: 1, path: '/'});
		}
		this.isMore();
		
		if (tab.get('friend.subscription') != 'both') { tab.set('waiting', true); } 

		// set tabs state (minimize/maximize) as before reload
		var cookie_isActive = $.cookie('tab_isActive_' + tab.user.jid + '_' + tab.friend.jid);
		if(cookie_isActive && cookie_isActive === 'false')	{ tab.set('isActive', false); }
		else												{ tab.set('isActive', true); }
		tab.set('test', false);
		tab.set('isVisible', true);

	},

	/**
	 * deactivate selected tab
	 **/
	deactivateTab: function (tab) {
		tab.set('isActive', false);
	},

	/**
	 * toogle tab state 
	 **/
	toggleTabActiveState: function (tab) {
		if (tab.get('isActive')) {
			$.cookie('tab_isActive_'  + tab.user.jid + '_' + tab.friend.jid, false, { expires: 1, path: '/'});
			this.deactivateTab(tab);
		} else {
			$.cookie('tab_isActive_' + tab.user.jid + '_' + tab.friend.jid, true, { expires: 1, path: '/'});
			this.activateTab(tab);
		}
	},

	/**
	 * create new tab for selected friend
	 **/
	createTab: function (friend) {
		return Chat.Models.ChatTab.create({
			user: Chat.Controllers.application.user,
			friend: friend
		});
	},
	
	/**
	 * create tab for selected jid 
	 **/
	createTabByJid: function (jid) {
		friend = Chat.Controllers.roster.findProperty('jid', getBareJidFromJid(jid));
		var invitation_sent = false;
		var blocking = false;
		
		if (this.sent_invitations[jid]){ blocking = true; }
		if (!friend || friend.get('subscription') == 'none' || friend.get('subscription') == 'to'){
			var friend = {
					jid: getBareJidFromJid(jid),
					subscription: 'to',
				};
			model = Chat.Models.User.create(friend);
			Chat.Controllers.roster.addObject(model);
			friend = Chat.Controllers.roster.findProperty('jid', getBareJidFromJid(jid));
			//send invitation
			Chat.Controllers.application.addToRoster(getBareJidFromJid(jid));
			invitation_sent = true;
		}
		
		tab = this.find(function (tab) {
			return tab.get('friend.jid') === friend.get('jid');
		});
		if (!tab){
			tab = this.createTab(friend);
			this.addTab(tab);
		}

		this.activateTab(tab);
		if (blocking == true){
			tab.set('blocking', true);
			if (invitation_sent == true){
				var message = {
					from: tab.get('friend').get('jid'),
					body: translate('application.message.waiting_accept', {'nick': tab.get('friend').get('name')}),
					direction: 'system',
				};
				Chat.Controllers.chatTabs.onArchiveMessage(message);
			}
		}
		else {
			this.sent_invitations[jid] = jid;
		}
		
		return tab;
	},
	
	/**
	 * add new tab 
	 **/
	addTab: function (tab) {

		$.cookie("tab_closed_" + tab.friend.jid, null, {path: '/'});
		this.content.unshiftObject(tab);
		if (tab.get('friend.subscription') != 'both') { tab.set('waiting', true); }
		this.activateTab(tab);
	},

	/**
	 * remove tab 
	 **/
	removeTab: function (tab)
	{
		// send message of closed
		Chat.Controllers.application.sendLeftChat(tab.friend.jid);
		$.cookie("tab_closed_" + tab.friend.jid, '1', { expires : 1, path: '/' });
		// close any other chat tabs in this browser
		Chat.Controllers.application.sendRemoveTab(tab.friend.jid);
		this.content.removeObject(tab);
	},

	/**
	 * handle incoming messages  (check if tab exists, user exists - if no run proper actions)
	 **/
	_onMessage: function (message) {
		var fullJid = message.from,
			bareJid = getBareJidFromJid(fullJid),
			friend = Chat.Controllers.roster.findProperty('jid', bareJid),
			tab;
		
		if (friend && friend.get('subscription', 'both') != 'to') {
			message.fromName = friend.get('name');
			message.direction = 'incoming';

			tab = this.find(function (tab) {
				return tab.get('friend.jid') === friend.get('jid');
			});

			// Create a new tab if there isn't one already,
			// but only for non-activity messages
			if (!tab && message.body) {
				tab = this.createTab(friend);
				this.addTab(tab);

				// Activate the new tab if there are no other active tabs
				if (!this.someProperty('isActive')) {
					this.activateTab(tab);
				}
			}
			if (tab) {
				tab._onMessage(Chat.Models.Message.create(message));
			}
			
		}
	},
	
	/**
	 * handle incoming archive messages (already loaded during session, only in case of page refresh)
	 **/
	onArchiveMessage: function (message) {
		var friend = Chat.Controllers.roster.findProperty('jid',getBareJidFromJid(message.from)),
			tab;
		
		if (friend) {
			message.fromName = friend.get('name');
			if (!message.direction == 'system') { message.direction = 'incoming'; }

			tab = this.find(function (tab) {
				return tab.get('friend.jid') === friend.get('jid');
			});

			// Create a new tab if there isn't one already,
			// but only for non-activity messages
			if (!tab && message.body) {
				tab = this.createTab(friend);
				this.addTab(tab);
				this.activateTab(tab);
			}
			
			if (tab) {
				tab._onMessage(Chat.Models.Message.create(message));
				tab.set('unreadMessagesCount', 0);
			}
			
		}
	},
	
	/**
	 * handle messages from present user (outgoing message)
	 **/
	ownMessage: function (message) {
		var friend = Chat.Controllers.roster.findProperty('jid',getBareJidFromJid(message.to)),
			tab;
		
		if (friend) {
			tab = this.find(function (tab) {
				return tab.get('friend.jid') === friend.get('jid');
			});
			
			// Create a new tab if there isn't one already,
			// but only for non-activity messages
			if (!tab && message.body) {
				tab = this.createTab(friend);
				this.addTab(tab);
				this.activateTab(tab);
			}
			
			if (tab) {
				tab._onMessage(Chat.Models.Message.create(message));
				tab.set('unreadMessagesCount', 0);
			}
		}
	}
});

Ember.A(Chat.Controllers.chatTabs);
Chat.Controllers.chatTabs = Chat.Controllers.ChatTabs.create();
