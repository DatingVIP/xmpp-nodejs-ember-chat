Chat.Views.ChatTab.Message = Ember.View.extend({
    template: Ember.Handlebars.compile(
        '{{{view.content.body}}}'
    ),

    classNames: Ember.A(['chat-message']),

    willInsertElement: function () {
    	return true;
//        this.messageGroupCollectionView().onWillInsertMessageView();
    },
//
    didInsertElement: function () {
		this.content.set('body', $("<div>" + this.content.body + "</div>").emoticons()[0].innerHTML);
		this.content.set('body', $("<div>" + this.content.body + "</div>").mklinks()[0].innerHTML);

        this.messageGroupCollectionView().onDidInsertMessageView();
    },
//
    messageGroupCollectionView: function () {
        return this.get('parentView.parentView.parentView');
    }
});
