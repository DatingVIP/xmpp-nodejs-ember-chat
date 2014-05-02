Chat.Views.ChatTab.MessageGroupCollection = Ember.CollectionView.extend({
	itemViewClass: Chat.Views.ChatTab.MessageGroup,
	//classNames: Ember.A(['message-list']),
	contentBinding: 'parentView.parentView.content.messageGroups',

	onDidInsertMessageView: function () {
		this.scrollFlyoutView();
	},

	scrollFlyoutView: function () {
		var container = this.$().parent();
		container.prop('scrollTop', container.prop('scrollHeight'));
	}
});
