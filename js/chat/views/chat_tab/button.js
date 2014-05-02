Chat.Views.ChatTab.Button = Ember.View.extend({
	template: Ember.Handlebars.compile(
		'<div class="chat-button-content clearfix">'
	  +   '<div class="chat-button-options chat-right clearfix">'
	  +	 	'<label class="chat-button-action close"><span type="button"></span></label>'
	  +   '</div>'
	  +   '<div class="wrapper">'
	  +	 	'<div class="wrap"><div class="name">{{view.parentView.content.friend.name}}</div></div>'
	  +	 	'{{view Chat.Views.ChatTab.UnreadMessagesCount}}'
	  +   '</div>'
	  + '</div>'
	),

	tagName: 'a',
	classNames: ['chat-button'],
	attributeBindings: [
		'href', 'rel'
	],

	href: '#',
	rel: 'toggle',

	isVisibleBinding: 'isActive',

	isActive: Ember.computed( function () {
		return !this.get('parentView.content.isActive');
	}).property('parentView.content.isActive'),
	
	didInsertElement: function () {
		this.$().click(_.bind(function (event) {
			var tabs = Chat.Controllers.chatTabs,
				content = this.get('parentView').content;
	
			if ($(event.target).is('.chat-button-action.close')) {
				tabs.removeTab(content);

				// check if there are some toggled tabs
				var l=0, sum_visible=0;
				$(Chat.Controllers.chatTabs.content).each(function(index, value){
					if(value.get('isVisible')==true && value.get('test')==false) { 
						sum_visible++;
					}
					else {
						l = index;
					}
				})
				if (Chat.Controllers.chatTabs.content.length > 0 && sum_visible < Chat.Controllers.chatTabs.max_visible)
				{
					Chat.Controllers.chatTabs.content[l].set('test', false);
					Chat.Controllers.chatTabs.content[l].set('isVisible', true);
					Chat.Controllers.chatTabs.isMore();
				}
			} else {
				tabs.toggleTabActiveState(content);
			}
			return false;
		}, this));
	}
});
