Chat.Views.ChatTab.TextAreaContainer = Ember.View.extend({//
	template: Ember.Handlebars.compile(
		'<div class="input-container" {{bindAttr style=view.isWaiting}}">'
		  + '{{view Chat.Views.ChatTab.TextArea contentBinding="view.content"}}'
		  + '<span class="emoticons-picker"></span>'
		  + '<span class="input-icon"></span>'
		  +  '</div>'
	),
	tagName: 'div',
	classNames: Ember.A(['chat-flyout-footer']),
	
	//isVisibleBinding: 'isWaiting',
	
	isWaiting: Ember.computed( function () {
		if (this.get('content.waiting', false) == true && this.get('content.blocking', false) == true) { return 'visibility:hidden;'; }
		return '';
	}).property('content.waiting','content.blocking'),

	focusIn: function(event, view) {
		this.set('parentView.activeClass', 'active');
	},
	click: function(event, view) {
		this.set('parentView.activeClass', 'active');
	},
	focusOut: function(event, view) {
		this.set('parentView.activeClass', '');
	},
});
