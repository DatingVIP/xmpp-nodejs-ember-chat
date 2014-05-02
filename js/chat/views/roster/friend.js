Chat.Views.Roster.Friend = Ember.View.extend({
	template: Ember.Handlebars.compile(
		'</img>'
	  + '<a href="#" class="roster-item">'
	  +    '<span>{{{view.content.name}}}'
	  +     '<em class="presence-metainfo">{{{view.content.status}}}</em>'
	  +    '</span>'
	  +  '</a>'
	  +  '<div class="rsubmenu">...</div>'
	  +  '<ul class="rostersubmenu">'
	  +     '<li><a href="#" class="chat-block-user">{{t roster.remove_user }}</a></li>'
	  +  '</ul>'
	),
	tagName: 'div',
	classNames: Ember.A(['chat-friend', 'clearfix']),
	attributeBindings: Ember.A([
		'data-chat-jid',
		'data-chat-presence',
		'data-chat-status',
		'data-chat-subscription'
	]),
	
	isVisibleBinding: 'isBoth',

	isBoth: Ember.computed( function () {
		if (this.get('content.subscription') == 'both'){ return true; }
		return false;
	}).property('content.subscription'),
	
	'data-chat-jidBinding': 'content.jid',
	'data-chat-presenceBinding': 'content.presence',
	'data-chat-statusBinding': 'content.status',
	'data-chat-subscriptionBinding': 'content.subscription',

	// Event handlers
	didInsertElement: function () {
		this.$('a.roster-item').click(_.bind(function (event) {
			if (Chat.Controllers.application.user.get('show') == 'available')
			{
				var friend = this.content;
				Chat.Controllers.chatTabs.activateTabFor(friend);
				$('div.chat-flyout textarea').each(function(index, value){
					$(value).focusout();
				});
				// set focus on selected tab 
				var jid = friend.jid;
				$('div[data-chat-with="'+getBareJidFromJid(jid)+'"] textarea').focus();
			}
			return false;
		}, this));
		
		this.$('a.chat-block-user').click(_.bind(function (event) {
			Chat.Controllers.application.removeFromRosterDialog(this.get('content').jid);
			return false;
		}, this));
	},
})

