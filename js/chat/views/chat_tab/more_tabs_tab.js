Chat.Views.ChatTab.MoreTabsTab = Ember.View.extend({
    template: Ember.Handlebars.compile(
        '</img>'
      + '<span>{{view.content.friend.name}} {{view Chat.Views.ChatTab.MoreTabsTabCount}}</span>'
    ),
    tagName: 'a',
    classNames: Ember.A(['chat-friend', 'clearfix']),
    isVisibleBinding: 'content.test',
    
    didInsertElement: function () {
    	this.$().click(_.bind(function (event) {
    		this.content.set('test',false);
    		this.content.set('isVisible',true);
    		this.content.set('unreadMessagesCount',0);

        	Chat.Controllers.chatTabs.activateTab(this.content);
        	Chat.Controllers.chatTabs.calcUnreadedTabs();

        	// set focus on selected tab 
    		var	jid = this.content.friend.get('jid');
			$('div[data-chat-with="'+getBareJidFromJid(jid)+'"] textarea').focus();
    	}, this));
    },
})

