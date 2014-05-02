Chat.Controllers.Roster = Ember.ArrayController.extend({
	content: Ember.A([]),
	sortProperties: Ember.A(['show']),
	/**
	 * chek if user has online presence
	 **/
	contentChanged: Ember.observer( function () {
		Chat.Controllers.rosterVisible.get('content').clear();
		counter = 0;
		if (this.content.length > 0)
		{
			this.content.forEach(function(row){
				if (row.get('show') == 'available' || counter++ < Chat.Controllers.application.roster_limit){
					Chat.Controllers.rosterVisible.addObject(row);
				}
			});
		}
	}, 'arrangedContent.[]'),
	
	/**
	 * set user presence
	 **/
	setFriendPresence: function (presence) {
		var fullJid = presence.from,
			bareJid = getBareJidFromJid(fullJid),
			friend = this.findProperty('jid', bareJid);

		if (friend) {
			friend.setPresence(presence);
		} else {
			// Something went wrong.
			// Got presence notification from user not in the roster.
//			console.warn('Presence update from user not in the roster: ' + fullJid + ':' + presence.type);
			return false;
		}
		return true;
	}
});
Ember.A(Chat.Controllers.Roster);
Chat.Controllers.roster = Chat.Controllers.Roster.create();
