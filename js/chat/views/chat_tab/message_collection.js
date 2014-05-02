Chat.Views.ChatTab.MessageCollection = Ember.CollectionView.extend({
	didInsertElement: function() {
		var obj = Ember.View.extend({
			tagName: 'div',
			classNames: Ember.A(['chat-message-group-metainfo']),
			template: Ember.Handlebars.compile('{{view.from_short}}'),

			from_short: Ember.computed( function () {
				var from = getNodeFromJid(this.get('parentView._context.from')),
				you  = getNodeFromJid(Chat.Controllers.application.get('user.jid'));
				return from === you ? 'You' : from;
			}).property('content.from_short')

		});
		this.get('childViews').pushObject(obj.create({}));
	},
	itemViewClass: Chat.Views.ChatTab.Message,
	contentBinding: 'parentView.content.messages',
	classNames: ['chat-messages']
});