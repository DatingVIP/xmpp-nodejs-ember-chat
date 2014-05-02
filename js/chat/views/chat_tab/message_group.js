Chat.Views.ChatTab.MessageGroup = Ember.View.extend({
	template: Ember.Handlebars.compile(
		'<a class="avatar" href="#" >'
	  //+   '<img class="profile-photo" src="{{unbound view.avatar}}" {{bindAttr title="from"}} />'
	  + '</a>'
	  + '{{collection Chat.Views.ChatTab.MessageCollection}}'
	),
	classNames: Ember.A(['chat-message-group clearfix']),
	attributeBindings: Ember.A(['data-chat-message-from']),
	'data-chat-message-fromBinding': 'content.from',

	from: Ember.computed( function () {
		var from = this.get('content.from'),
			you  = Chat.Controllers.application.get('user.jid');
		return from === you ? 'You' : from;
	}).property('content.from'),
	
	classNameBindings: Ember.A(['owner_member']),
	owner_member: Ember.computed( function () {
		if (this.get('content.from') == 'system') { return 'system-message'; }
		var from = getNodeFromJid(this.get('content.from')),
			you  = getNodeFromJid(Chat.Controllers.application.get('user.jid'));
		return from === you ? 'owner' : 'member';
	}).property(),
	
	getTab: function(){
		var to = null;
		var me = getNodeFromJid(Chat.Controllers.application.get('user.jid'))
		if (me == getNodeFromJid(this.get('content.messages.firstObject.from'))){
			to = this.get('content.messages.firstObject.to');
		}
		else {
			to = this.get('content.messages.firstObject.from');
		}
		tab = Chat.Controllers.chatTabs.find(function (tab) {
			return tab.get('friend.jid') === getBareJidFromJid(to);
		});
		return tab;
	}
});
