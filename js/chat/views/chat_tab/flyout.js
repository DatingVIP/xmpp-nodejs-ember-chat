Chat.Views.ChatTab.Flyout = Ember.View.extend({
	template: Ember.Handlebars.compile(
		'<div class="chat-flyout-titlebar clearfix">'
	  +   '<div class="chat-buttons">'
	  +   '<label class="chat-button-action close"><span type="button"></span></label>'
	  +   '</div>'
	  +   '<div class="titlebar-text-wrapper chat-floyout-top">'
	  +	  '<span class="titlebar-text">'
	  +	   '<span class="chat-tab-status"></span>'
	  +	   '<span class="chat-username">'
	  +		  '<span title="{{unbound view.parentView.content.friend.name}}">{{view.parentView.content.friend.name}}</span>'
	  +		'</span>'
	  +	 '</span>'
	  +   '</div>'
	  +   '<div class="chat-button-options chat-right"></div>'
	  + '</div>'
	  + '<div class="chat-flyout-body"><div class="message-list">'
	  +   '{{collection Chat.Views.ChatTab.MessageGroupCollection}}'
	  +    '{{#if view.isTyping}}<div class="chat-typing">{{view.parentView.content.friend.name}} {{t chat_tab.flyout.user_is_typing}}</div>{{/if}}'
	  + '</div></div>'
	  + '{{view Chat.Views.ChatTab.TextAreaContainer contentBinding="view.parentView.content"}}'
	),
	
	classNames: Ember.A(['chat-flyout no-avatar']),
	classNameBindings: Ember.A(['activeClass']),
	activeClass: '',
	
	isVisibleBinding: 'isActivated',
	
	isActivated: Ember.computed( function () {
		if(this.get('parentView.content.isActive')){
			this.get('parentView').click();
		}
		return this.get('parentView.content.isActive');
	}).property('parentView.content.isActive'),
	
	isTyping: Ember.computed( function(){
		if (this.get('parentView.content.typing') != false){
			//scroll container down
			var container = this.$('.message-list');
			container.prop('scrollTop', container.prop('scrollHeight'));

			return true;
		}
		return false;
	}).property('parentView.content.typing'),
	
	didInsertElement: function () {
		this.$("div label.close").click(_.bind(function (event) {
			var tab = this.get('parentView.content');
			Chat.Controllers.chatTabs.removeTab(tab);

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
			return false;
		}, this));

		this.$(".chat-flyout-titlebar").click(_.bind(function (event) {
			if ($(event.target).hasClass('chat-flyout-titlebar')) {
				var tab = this.get('parentView.content');
				Chat.Controllers.chatTabs.toggleTabActiveState(tab);
				return false;
			}
		}, this));
	},
});
