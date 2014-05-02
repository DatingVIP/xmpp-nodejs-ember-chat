(function(window) {
	if (window.translation == undefined) {
		window.translation = new Object();
	}
	if (typeof window.lang_config == 'undefined'){ window.lang_config = {}; }
	
	window.translation.en = {
		'roster.flayout.title': (window.lang_config['roster.flayout.title']?window.lang_config['roster.flayout.title']:'Chat'),
		'roster.flayout.all_contacts': '<a class="contactslist" href="/my-lists#chat">' + (window.lang_config['roster.flayout.all_contacts']?window.lang_config['roster.flayout.all_contacts']:'All contacts list')+'</a>',
		'roster.button.label_title': (window.lang_config['roster.button.label_title']?window.lang_config['roster.button.label_title']:'Chat'),
		'chat_tab.flyout.menu.profile': (window.lang_config['chat_tab.flyout.menu.profile']?window.lang_config['chat_tab.flyout.menu.profile']:'Profile'),
		'chat_tab.flyout.menu.photos': (window.lang_config['chat_tab.flyout.menu.photos']?window.lang_config['chat_tab.flyout.menu.photos']:'Photos'),
		'chat_tab.flyout.menu.like': (window.lang_config['chat_tab.flyout.menu.like']?window.lang_config['chat_tab.flyout.menu.like']:'Like'),
		'chat_tab.flyout.menu.block': (window.lang_config['chat_tab.flyout.menu.block']?window.lang_config['chat_tab.flyout.menu.block']:'Block'),
		'chat_tab.flyout.user_is_typing': (window.lang_config['chat_tab.flyout.user_is_typing']?window.lang_config['chat_tab.flyout.user_is_typing']:'is typing...'),
		
		'photo.label': (window.lang_config['photo.label']?window.lang_config['photo.label']:'Photos: {{count}}'),
		'video.label': (window.lang_config['video.label']?window.lang_config['video.label']:'Videos: {{count}}'),
		
		'chat_tab.more_tabs.title': (window.lang_config['chat_tab.more_tabs.title']?window.lang_config['chat_tab.more_tabs.title']:'More'),
	
		'application.presence.on': (window.lang_config['application.presence.on']?window.lang_config['application.presence.on']:'On'),
		'application.presence.off': (window.lang_config['application.presence.off']?window.lang_config['application.presence.off']:'Off'),
	
		'application.confimation.button': (window.lang_config['application.confimation.button']?window.lang_config['application.confimation.button']:'##nick## wants to private chat with you. Do you agree?'),
		'application.confimation.button.accept': (window.lang_config['application.confimation.button.accept']?window.lang_config['application.confimation.button.accept']:'Accept'),
		'application.confimation.button.block': (window.lang_config['application.confimation.button.block']?window.lang_config['application.confimation.button.block']:'Report'),
		'application.confimation.button.reject': (window.lang_config['application.confimation.button.reject']?window.lang_config['application.confimation.button.reject']:'Reject'),
		'application.confimation.title': (window.lang_config['application.confimation.title']?window.lang_config['application.confimation.title']:'Private chat invitation'),
		'application.confimation.remove_from_roster_title': (window.lang_config['application.confimation.remove_from_roster_title']?window.lang_config['application.confimation.remove_from_roster_title']:'Remove ##nick## from list?'),
		'application.confimation.remove_from_roster_desc': (window.lang_config['application.confimation.remove_from_roster_desc']?window.lang_config['application.confimation.remove_from_roster_desc']:'##nick## will be removed from your chat contacts list'),
		
		'application.confimation.button.yes': (window.lang_config['application.confimation.button.yes']?window.lang_config['application.confimation.button.yes']:'Yes'),
		'application.confimation.button.no': (window.lang_config['application.confimation.button.no']?window.lang_config['application.confimation.button.no']:'No'),
	
		'application.message.left_chat': (window.lang_config['application.message.left_chat']?window.lang_config['application.message.left_chat']:'##nick## left this chat'),
		'application.message.entered_chat': (window.lang_config['application.message.entered_chat']?window.lang_config['application.message.entered_chat']:'##nick## entered chat'),
		'application.message.user_disagreed': (window.lang_config['application.message.user_disagreed']?window.lang_config['application.message.user_disagreed']:'Sorry, ##nick## didn\'t accept your chat request'),
		'application.message.user_accepted': (window.lang_config['application.message.user_accepted']?window.lang_config['application.message.user_accepted']:'##nick## entered chat'),
		'application.message.cant_start_chat': (window.lang_config['application.message.cant_start_chat']?window.lang_config['application.message.cant_start_chat']:'You can\'t start chat with ##nick##'),
		'application.message.cant_start_chat_no_accept': (window.lang_config['application.message.cant_start_chat_no_accept']?window.lang_config['application.message.cant_start_chat_no_accept']:'You can\'t talk with that user. He needs to accept your invitation'),
		'application.message.waiting_accept': (window.lang_config['application.message.waiting_accept']?window.lang_config['application.message.waiting_accept']:'Waiting for ##nick## to enter chat'),
	
		'roster.chat_off.message': (window.lang_config['roster.chat_off.message']?window.lang_config['roster.chat_off.message']:'Turn on the chat to see who is log in'),
		'textarea.placeholder': (window.lang_config['textarea.placeholder']?window.lang_config['textarea.placeholder']:'Type your message'),
		'roster.empty': (window.lang_config['roster.empty']?window.lang_config['roster.empty']:'Your contact list is empty, when you contact members they will appear in this list automatically'),
		'roster.remove_user': (window.lang_config['roster.remove_user']?window.lang_config['roster.remove_user']:'Remove'),
	};

}).call(undefined, this);
