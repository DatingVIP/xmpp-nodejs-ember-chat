Chat.Views.Application = Ember.ContainerView.extend({
    childViews: [
        Chat.Views.ChatTab.MoreTabs,
        Chat.Views.ChatTabCollection,
        Chat.Views.Roster.Layout,
    ],
    classNames: ['chat-dock-wrapper', 'clearfix'],
    classNameBindings: ['Chat.Controllers.application.user.show']
});