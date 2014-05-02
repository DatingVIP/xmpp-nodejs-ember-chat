var Chat = window.Chat = Ember.Application.create({
	connect: function (options) {
		return Chat.Controllers.application.connect(options);
	},

	disconnect: function () {
		return Chat.Controllers.application.disconnect();
	},

	toggleChatApp: function() {
		if (Chat.Controllers.application.get('user.show2').toString() == translate('application.presence.off')){
			//ping socket
			if (Chat.Controllers.application.socket.disconnected == true) {
				Chat.Controllers.application.socket = Chat.connectPrimus();
			} 
			else {
				$('.chat-button .chat-close span').html('<img src="images/chat/ajax-loader.gif" class="chat-app-loader"/>');
				$('.chat-roster-no-overlay').hide();
				Chat.Controllers.application.chatOn();
			}
		}
		else {
			var tabs = Ember.A(Chat.Controllers.chatTabs.get('content'));
			tabs.forEach(function (tab) {
				Chat.Controllers.application.sendLeftChat(tab.get('friend.jid'));
				Chat.Controllers.application.lefftsent[tab.get('friend.jid')] = tab.get('friend.jid');
			});
			
			Chat.Controllers.application.chatOff(false);
			
			$('.chat-roster-no-overlay').show();
			$('.chat-button .chat-close span').html('');
		}
	}
});
Chat.Router = Ember.Router.extend({
	location: 'none'
});

Chat.Models = {};
Chat.Controllers = {};
Chat.Views = {
    Roster: {},
    ChatTab: {}
};
