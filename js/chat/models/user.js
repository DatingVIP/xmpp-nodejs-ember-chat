Chat.Models.User = Ember.Object.extend({
	// Default attribute values
	jid: null,
	
	show: 'unavailable',
	presence: 'unavailable',
	status: 'offline',
	show2: 'On',
	
	subscription: 'none',

	name: Ember.computed(function () {
		var jid = this.get('jid');
		return jid ? getNodeFromJid(jid) : jid;
	}).property('jid').cacheable(),
	
	setPresence: function (presence) {
		this.set('show', presence.show);
		this.set('presence', presence.show);
		if (presence.show == 'available'){
			this.set('status', 'online');
		}
		else {
			this.set('status', 'offline');
		}
	},
});
