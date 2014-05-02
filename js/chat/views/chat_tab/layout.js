Chat.Views.ChatTab.Layout = Ember.View.extend({
	template: Ember.Handlebars.compile(
	  '{{view Chat.Views.ChatTab.Button}}'
	  +'{{view Chat.Views.ChatTab.Flyout}}'
	),
	
	classNames: ['chat-tab clearfix'],
	classNameBindings: ['isActive'],
	attributeBindings: [
		'data-chat-with',
		'data-chat-presence',
		'data-chat-status'
	],
	
	isVisibleBinding: 'content.isVisible',

	isActiveBinding: 'content.isActive',
	'data-chat-withBinding': 'content.friend.jid',
	'data-chat-presenceBinding': 'content.friend.presence',
	'data-chat-statusBinding': 'content.friend.presence',
	
	click: function(event){
		$('#' + this.get('elementId') + ' textarea').focus();
	},
});
