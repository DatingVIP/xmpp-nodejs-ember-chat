Chat.Views.ChatTab.MoreTabs = Ember.View.extend({
    template: Ember.Handlebars.compile(
          '<div id="more-tabs">{{t chat_tab.more_tabs.title }} {{view Chat.Views.ChatTab.MoreTabsCount}} >> </div>'
        + '{{collection Chat.Views.ChatTab.MoreTabsCollection}}'
    ),
    tagName: 'div',
    classNames: Ember.A(['chat-more-tabs']),
    isVisibleBinding: 'Chat.Controllers.chatTabs.more_button',

	didInsertElement: function () {
		this.$("#more-tabs").click(_.bind(function (event) {
			$('.chat-more-tabs-collection').toggle();
		}));
	}
});
