Chat.Views.ChatTab.TextArea = Ember.TextArea.extend({
	classNames: Ember.A(['autogrow']),
	value: '',

	didInsertElement: function () {
		this.$().autogrow();
		this.$().attr('placeholder', translate('textarea.placeholder'));
		this.focus();
		this.$().keydown(_.bind(function (event) {
			if (event.which === 13) {
				if (event.keyCode == 13 && event.shiftKey) { }
				else {
					this.send(event);
				}
			}
			else {
				if(event.keyCode > 20 && event.keyCode < 110){
					Chat.Controllers.application.sendTyping(this.get('content.friend.jid', ''));
				}
			}
		}, this));
		
		$('.emoticons-picker').emoticonspicker();
		$('#' + this.get('parentView.elementId') + ' > div > .input-icon').click(_.bind(function (event) {
			this.send(event);
		}, this));
	},

	focus: Ember.observer( function () {
		if (this.get('parentView.isVisible')) {
			// This observer is called before the observer of the parent view
			// that toggles its visiblity, so we have to wait a bit
			window.setTimeout(_.bind(function () {
				if (typeof this.$() != 'undefined'){
					this.$().focus();
				}
			}, this), 0);
		}
	}, 'parentView.isVisible'),
	
	send: function (event) {
		// Send message when Enter key is pressed
		event.preventDefault();
		// easy check if all html tags are closed
		if( ('<p>'+$('#'+this.elementId).val()+'</p>').match(/</gi).length > 
			('<p>'+$('#'+this.elementId).val()+'</p>').match(/>/gi).length )
		{ 
			$('#'+this.elementId).val( ($('#'+this.elementId).val() + "").replace(/[<>]/gi, '') );
		}
		var tab = this.get('content'),
			body = $.trim(HTMLtoXML(strip_tags($('#'+this.elementId).val(), '<b><u><i>'))),
			user = tab.get('user'),
			friend = tab.get('friend'),
			message = Chat.Models.Message.create({
				from: user.get('jid'),
				to: friend.get('jid'),
				body: body,
				fromName: user.get('name'),
				direction: 'outgoing'
			});

		$('#'+this.elementId).val('').trigger('change');
		this.set('value', '');
		// Send message to XMPP server
		Chat.Controllers.application.sendMessage(message);
		
		// Display the message to the sender,
		// because it won't be sent back by XMPP server
		tab._onMessage(message);
		this.focus();
		
		//additional info if tab is waiting for invitation accept
		if (tab.get('waiting') == true){
			var message = {
				from: tab.get('friend').get('jid'),
				body: translate('application.message.waiting_accept', {'nick': tab.get('friend').get('name')}),
				direction: 'system',
			};
			Chat.Controllers.chatTabs.onArchiveMessage(message);
			tab.set('blocking', true);
		}
	},
});
