Chat.Views.Roster.Layout = Ember.ContainerView.extend({
    childViews: [
        Chat.Views.Roster.Button,
        Chat.Views.Roster.Flyout
    ],
    classNames: Ember.A(['roster', 'chat-tab']),
    classNameBindings: Ember.A(['isActive']),

    isActive: false
});
