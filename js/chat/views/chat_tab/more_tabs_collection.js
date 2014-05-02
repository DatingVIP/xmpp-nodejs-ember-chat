Chat.Views.ChatTab.MoreTabsCollection = Ember.CollectionView.extend({
    itemViewClass: Chat.Views.ChatTab.MoreTabsTab,
    classNames: Ember.A(['chat-flyout', 'chat-more-tabs-collection']),
    contentBinding: 'Chat.Controllers.chatTabs',
});
