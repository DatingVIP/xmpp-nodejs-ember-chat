var primus = null;
require.config({
	waitSeconds: 30,
	paths: {
		'jquery': '../libs/jquery-1.9.1.min',
		'jquery-json': '../libs/jquery.json-2.4',
		'jquery-cookie': '../libs/jquery.cookie',
		'jquery-ba-tinypubsub': '../libs/jquery.ba-tinypubsub',
		'jquery-textarea-autogrow': '../libs/jquery.textarea-autogrow',
		'jquery-emoticons': '../libs/jquery.emoticons',
		'jquery-emoticons-picker': '../libs/jquery.emoticons-picker',
		'jquery-insertatcaret': '../libs/jquery.insertatcaret',
		'jquery-mklinks': '../libs/jquery.mklinks',
		'jquery-playsound': '../libs/jquery.play-sound',

		'underscore': '../libs/underscore-min',
		'utils': '../libs/utils',
		'primus': '../libs/primus/primus-client',
		'ember': '../libs/ember.prod',
		'handlebars': '../libs/handlebars',
		'element': '../libs/element',
		'htmlparser': '../libs/htmlparser',

		'cldr': '../libs/cldr-1.0.0',
		'i18n': '../libs/i18n',
		'translation': '../libs/translation',
		'lang_en': 'translations/en/i18n',
		'lang_pl': 'translations/pl/i18n',

		'app': '../chat/app',

		'model-user': '../chat/models/user',
		'model-resource': '../chat/models/resource',
		'model-chat-tab': '../chat/models/chat_tab',
		'model-message': '../chat/models/message',
		'model-message-group': '../chat/models/message_group',

		'ctrl-application': '../chat/controllers/application',
		'ctrl-roster': '../chat/controllers/roster',
		'ctrl-roster-visible': '../chat/controllers/roster_visible',
		'ctrl-chat-tabs': '../chat/controllers/chat_tabs',

		'view-application': '../chat/views/application',

		'view-roster-friend': '../chat/views/roster/friend',
		'view-roster-friend-collection': '../chat/views/roster/friend_collection',
		'view-roster-button': '../chat/views/roster/button',
		'view-roster-closer': '../chat/views/roster/closer',
		'view-roster-flyout': '../chat/views/roster/flyout',
		'view-roster-chat-off': '../chat/views/roster/chat_off',
		'view-roster-flyout-list': '../chat/views/roster/flyout_list',
		'view-roster-layout': '../chat/views/roster/layout',

		'view-chat-tab-more-tabs': '../chat/views/chat_tab/more_tabs',
		'view-chat-tab-more-tabs-collection': '../chat/views/chat_tab/more_tabs_collection',
		'view-chat-tab-more-tabs-tab': '../chat/views/chat_tab/more_tabs_tab',
		'view-chat-tab-more-tabs-tab-count': '../chat/views/chat_tab/more_tabs_tab_count',
		'view-chat-tab-more-tabs-count': '../chat/views/chat_tab/more_tabs_count',
		'view-chat-tab-message': '../chat/views/chat_tab/message',
		'view-chat-tab-message-collection': '../chat/views/chat_tab/message_collection',
		'view-chat-tab-message-group': '../chat/views/chat_tab/message_group',
		'view-chat-tab-message-group-collection': '../chat/views/chat_tab/message_group_collection',
		'view-chat-tab-unread-messages-count': '../chat/views/chat_tab/unread_messages_count',
		'view-chat-tab-text-area-container': '../chat/views/chat_tab/text_area_container',
		'view-chat-tab-text-area': '../chat/views/chat_tab/text_area',
		'view-chat-tab-button': '../chat/views/chat_tab/button',
		'view-chat-tab-flyout': '../chat/views/chat_tab/flyout',
		'view-chat-tab-layout': '../chat/views/chat_tab/layout',
		'view-chat-tab-collection': '../chat/views/chat_tab_collection'
	},
	shim: {
		'jquery': 									{ exports: '$' },
		'underscore': 								{ exports: '_' },
		'ember': 									{ exports: 'Ember', deps: ['handlebars'] },
		'app':										{ exports: 'Chat', deps: ['primus', 'ember', 'jquery-json', 'jquery-cookie', 'jquery-ba-tinypubsub', 'jquery-playsound', 'jquery-textarea-autogrow', 'jquery-emoticons', 'jquery-emoticons-picker', 'jquery-mklinks', 'jquery-insertatcaret'] },
		'jquery-json': 								(!window.jQuery)?['jquery']:[],
		'jquery-cookie': 							(!window.jQuery)?['jquery']:[],
		'jquery-ba-tinypubsub': 					(!window.jQuery)?['jquery']:[],
		'jquery-playsound':							(!window.jQuery)?['jquery']:[],
		'jquery-textarea-autogrow': 				(!window.jQuery)?['jquery']:[],
		'jquery-emoticons': 						(!window.jQuery)?['jquery']:[],
		'jquery-emoticons-picker': 					(!window.jQuery)?['jquery']:[],
		'jquery-mklinks': 							(!window.jQuery)?['jquery']:[],
		'jquery-insertatcaret': 					(!window.jQuery)?['jquery']:[],
		'i18n': 									['ember'],
		'translation': 								['i18n'],
		'lang_en':									['translation'],
		'lang_pl':									['translation'],
		'model-user':								['ember', 'app', 'utils'],
		'model-resource':							['ember', 'app', 'utils'],
		'model-message':							['ember', 'app', 'utils'],
		'model-message-group':						['ember', 'app', 'utils'],
		'model-chat-tab':							['ember', 'app', 'utils'],
		'ctrl-application': 						['ember', 'app', 'utils'],
		'ctrl-roster': 								['ember', 'app', 'utils'],
		'ctrl-roster-visible': 						['ember', 'app', 'utils'],
		'ctrl-chat-tabs': 							['ember', 'app', 'utils'],
		'view-roster-friend': 						['ember', 'app', 'utils'],
		'view-roster-friend-collection': 			['ember', 'app', 'utils', 'view-roster-friend'],
		'view-roster-button': 						['ember', 'app', 'utils', 'jquery-cookie'],
		'view-roster-closer': 						['ember', 'app', 'utils'],
		'view-roster-chat-off': 					['ember', 'app', 'utils'],
		'view-roster-flyout-list': 					['ember', 'app', 'utils', 'view-roster-friend-collection'],
		'view-roster-flyout': 						['ember', 'app', 'utils', 'view-roster-flyout-list', 'view-roster-chat-off'],
		'view-roster-layout': 						['ember', 'app', 'utils', 'ctrl-roster', 'ctrl-roster-visible', 'view-roster-button', 'view-roster-flyout'],
		'view-chat-tab-more-tabs': 					['ember', 'app', 'utils', 'view-chat-tab-more-tabs-count'],
		'view-chat-tab-more-tabs-collection': 		['ember', 'app', 'utils', 'view-chat-tab-more-tabs'],
		'view-chat-tab-more-tabs-tab': 				['ember', 'app', 'utils', 'view-chat-tab-more-tabs-collection'],
		'view-chat-tab-more-tabs': 					['ember', 'app', 'utils'],
		'view-chat-tab-more-tabs-tab': 				['ember', 'app', 'utils'],
		'view-chat-tab-more-tabs-tab-count':		['ember', 'app', 'utils'],
		'view-chat-tab-more-tabs-count':			['ember', 'app', 'utils'],
		'view-chat-tab-more-tabs-collection':		['ember', 'app', 'utils', 'view-chat-tab-more-tabs-tab', 'view-chat-tab-more-tabs-tab-count'],
		'view-chat-tab-message': 					['ember', 'app', 'utils'],
		'view-chat-tab-message-collection':			['ember', 'app', 'utils', 'view-chat-tab-message'],
		'view-chat-tab-message-group':				['ember', 'app', 'utils'],
		'view-chat-tab-message-group-collection':	['ember', 'app', 'utils', 'view-chat-tab-message-group'],
		'view-chat-tab-unread-messages-count': 		['ember', 'app', 'utils'],
		'view-chat-tab-text-area-container': 		['ember', 'app', 'utils'],
		'view-chat-tab-text-area': 					['ember', 'app', 'utils'],
		'view-chat-tab-button': 					['ember', 'app', 'utils'],
		'view-chat-tab-flyout': 					['ember', 'app', 'utils', 'view-chat-tab-message-group-collection', 'view-chat-tab-unread-messages-count'],
		'view-chat-tab-layout': 					['ember', 'app', 'utils', 'view-chat-tab-button', 'view-chat-tab-flyout', 'view-chat-tab-more-tabs-tab'],
		'view-chat-tab-collection': 				['ember', 'app', 'utils', 'ctrl-chat-tabs', 'view-roster-layout'],
		'view-application':							['ember', 'app', 'utils', 'ctrl-application', 'model-chat-tab', 'model-message-group', 'model-message', 'model-resource', 'model-user', 'view-chat-tab-collection', 'view-roster-layout', 'view-roster-closer', 'view-chat-tab-text-area-container', 'view-chat-tab-text-area'],
	}
});

var _libs = [
	'jquery-json',
	'jquery-cookie',
	'underscore',
	'ember',
	'app',
	'element',
	'jquery-ba-tinypubsub',
	'jquery-playsound',
	'jquery-textarea-autogrow',
	'jquery-emoticons',
	'jquery-emoticons-picker',
	'jquery-insertatcaret',
	'jquery-mklinks',
	'htmlparser',
	'model-user',
	'model-resource',
	'model-chat-tab',
	'model-message',
	'model-message-group',
	'ctrl-application',
	'ctrl-roster',
	'ctrl-roster-visible',
	'ctrl-chat-tabs',
	'view-roster-friend',
	'view-roster-friend-collection',
	'view-roster-button',
	'view-roster-closer',
	'view-roster-chat-off',
	'view-roster-flyout-list',
	'view-roster-flyout',
	'view-roster-layout',
	'view-chat-tab-more-tabs',
	'view-chat-tab-more-tabs-collection',
	'view-chat-tab-more-tabs-tab',
	'view-chat-tab-more-tabs-tab-count',
	'view-chat-tab-more-tabs-count',
	'view-chat-tab-message',
	'view-chat-tab-message-collection',
	'view-chat-tab-message-group',
	'view-chat-tab-message-group-collection',
	'view-chat-tab-unread-messages-count',
	'view-chat-tab-text-area-container',
	'view-chat-tab-text-area',
	'view-chat-tab-button',
	'view-chat-tab-flyout',
	'view-chat-tab-layout',
	'view-chat-tab-collection',
	'view-application', 
	'cldr',
	'i18n',
	'translation',
	'lang_en',
	'lang_pl',
];

require(_libs, function ( jqueryjson, jquerycookie, underscore, Ember, app, element, jqueryBaTinypubsub, jqueryPlaysound, jqueryTextareaAutogrow, jqueryEmoticons, jqueryEmoticonsPicker, jqueryInsertatcaret, jqueryMklinks, htmlparser, modelUser, modelResource, modelChatTab, modelMessage, modelMessageGroup, ctrlApplication, ctrlRoster, ctrlRosterVisible, ctrlChatTabs, viewRosterFriend, viewRosterFriendCollection, viewRosterButton, viewRosterCloser, viewRosterChatOff, viewRosterFlyoutList, viewRosterFlyout, viewRosterLayout, viewChatTabMoreTabs, viewChatTabMoreTabsCollection, viewChatTabMoreTabsTab, viewChatTabMessage, viewChatTabMessageCollection, viewChatTabMessageGroup, viewChatTabMessageGroupCollection, viewChatTabUnreadMessagesCount, viewChatTabTextAreaContainer, viewChatTabTextArea, viewChatTabButton, viewChatTabFlyout, viewChatTabLayout, viewChatTabCollection, viewApplication, cldr, i18n, translation, langEn) {
	CLDR.defaultLocale = 'en';
	CLDR.defaultLanguage  = 'en';
	
	if(app_i18n.length != 2 || window['translation'][app_i18n] === undefined) {
		current_lang = 'en';
		Ember.I18n.translations = window['translation'].en;
	} else {
		current_lang = app_i18n;
		Ember.I18n.translations = window['translation'][app_i18n];
	}

	Chat.Views.ChatTabCollection.create();
	Chat.Views.Application.create().append();

	Chat.connect({
		jid: main_jid,
		debug: true
	});
	
	$('#sout').click(function(){
		Chat.disconnect();
		return true;
	});

	window.focus_state = true;
	$(window).focus(function() {
		Chat.Controllers.application.hideNumUnreadedMessages();
		Chat.Controllers.application.resetNumUnreadedMessages();
		window.focus_state = true;
	});

	$(window).blur(function() {
		window.focus_state = false;
	});

	var socket_no_reconnect = false;
	
	Chat.connectPrimus = function(){
		var primus = Primus.connect(main_url, {ping: 5000});
		
		primus.on('open', function open() {
			primus.disconnected = false;
			connectAttempt = 0;
			var initialMsg = JSON.stringify({'event': 'adduser', 'data': {'username': main_jid} });
			this.write(initialMsg);
		});

		primus.on('data', function incoming(e) {
			var request = JSON.parse(e);
			switch (request.event) {
				case 'stanza':
					Chat.Controllers.application.getFromSocket(request.data);
					break;
				case 'ownstanza':
					Chat.Controllers.application.getFromMyself(request.data);
					break;
				case 'archiveall':
					Chat.Controllers.application.getArchiveAll(request.data);
					break;
				case 'getarchivebyuserresponse':
					Chat.Controllers.application.getArchiveByUserResponse(request.data.messages, request.data.to);
					break;
				case 'clientleftchat':
					Chat.Controllers.application.clientLeftChat(request.data);
					break;
				case 'cliententeredchat':
					Chat.Controllers.application.clientEnteredChat(request.data);
					break;
				case 'client_invitationclosed':
					Chat.Controllers.application.closeInvitationDialog(request.data);
					break;
				case 'removetab':
					Chat.Controllers.application.removeTab(request.data);
					break;
				
				case 'sendtyping':
					Chat.Controllers.application.showTyping(request.data.from);
					break;
					
				case 'disconnect':
					if (socket_no_reconnect == false){
						if (Chat.Controllers.application.user.show2.toString() == translate('application.presence.on')){
							Chat.Controllers.application.chatOff(false);
						}
						Chat.Controllers.application.set('archived_messages_loaded',false);
					}
					break;
				case 'fixconnection':
					Chat.Controllers.application.recreateConnection();
					break;
				case 'getonlineusers':
					Chat.Controllers.application.setOnlineUsers(request.data);
					break;
				default:
					break;
			}
		});
		
		primus.on('close', function ( ) {
			if (socket_no_reconnect == false){
				primus.disconnected = true;
				if (Chat.Controllers.application.user.show2.toString() == translate('application.presence.on')){
					Chat.Controllers.application.chatOff(true);
				}
				Chat.Controllers.application.set('archived_messages_loaded', false);
			}
		});
		
		return primus;
	}
	
	Chat.Controllers.application.socket = Chat.connectPrimus();
});
