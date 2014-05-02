Chat.Views.Roster.Button = Ember.View.extend({
	template: Ember.Handlebars.compile(
		'<div class="chat-button-rule">'
	  +   '<div class="image-block clearfix">'
	  +	 '<img class="image-block-image icon" src="'+main_url+'/images/empty.gif" width="1" height="1"/>'
	  +	 '<div class="image-block-content chat-button-content clearfix">'
	  +	   '<span class="label">{{t roster.button.label_title }}</span>'
	  +	   '{{view Chat.Views.Roster.Closer}}'
	  +	 '</div>'
	  +   '</div>'
	  + '</div>'
	),

	tagName: 'a',
	classNames: Ember.A(['chat-button']),
	href: '#',
	rel: 'toggle',

	isVisibleBinding: 'isVisible',
	isVisible: Ember.computed( function () {
		return true;
	}).property('isVisible'),
	
	didInsertElement: function () {
		var parentView = this.get('parentView');
		if ($.cookie != undefined){
			var cookie_isActive = $.cookie('roster_isActive_' + Chat.Controllers.application.user.jid);
			if (cookie_isActive && cookie_isActive == 'true') {  parentView.set('isActive', true); }
		}
		
		this.$().click(_.bind(function (event) {
			// if clicked on/off, roster view have same status
			var classes = '';
			if(typeof $(event.target).attr('class') != "undefined"){
				classes = $(event.target).attr('class').toString();
			}
			if(classes.indexOf("chat-close") < 0)
			{
				parentView.set('isActive', !parentView.get('isActive'));
				$.cookie('roster_isActive_' + Chat.Controllers.application.user.jid, parentView.get('isActive'), { expires: 1, path: '/'});
			}
			return false;
		}, this));
	},
});
