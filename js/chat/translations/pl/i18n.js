(function(window) {
	if (window.translation == undefined) {
		window.translation = new Object();
	}
	if (typeof window.lang_config == 'undefined'){ window.lang_config = {}; }
	
	window.translation.pl = {
		'roster.flayout.title': (window.lang_config['roster.flayout.title']?window.lang_config['roster.flayout.title']:'Czat'),
		'roster.flayout.all_contacts': '<a class="contactslist" href="#">' + (window.lang_config['roster.flayout.all_contacts']?window.lang_config['roster.flayout.all_contacts']:'Wszystkie kontakty')+'</a>',
		'roster.button.label_title': (window.lang_config['roster.button.label_title']?window.lang_config['roster.button.label_title']:'Czat'),
		'chat_tab.flyout.user_is_typing': (window.lang_config['chat_tab.flyout.user_is_typing']?window.lang_config['chat_tab.flyout.user_is_typing']:'pisze...'),

		'chat_tab.more_tabs.title': (window.lang_config['chat_tab.more_tabs.title']?window.lang_config['chat_tab.more_tabs.title']:'Więcej'),
	
		'application.presence.on': (window.lang_config['application.presence.on']?window.lang_config['application.presence.on']:'On'),
		'application.presence.off': (window.lang_config['application.presence.off']?window.lang_config['application.presence.off']:'Off'),
	
		'application.confimation.button': (window.lang_config['application.confimation.button']?window.lang_config['application.confimation.button']:'##nick## chce z Tobą porozmawiać. Zgadzasz się?'),
		'application.confimation.button.accept': (window.lang_config['application.confimation.button.accept']?window.lang_config['application.confimation.button.accept']:'Akceptuj'),
		'application.confimation.button.block': (window.lang_config['application.confimation.button.block']?window.lang_config['application.confimation.button.block']:'Zgłoś'),
		'application.confimation.button.reject': (window.lang_config['application.confimation.button.reject']?window.lang_config['application.confimation.button.reject']:'Odrzuć'),
		'application.confimation.title': (window.lang_config['application.confimation.title']?window.lang_config['application.confimation.title']:'Zaproszenie do rozmowy'),
		'application.confimation.remove_from_roster_title': (window.lang_config['application.confimation.remove_from_roster_title']?window.lang_config['application.confimation.remove_from_roster_title']:'Usuń ##nick## z listy?'),
		'application.confimation.remove_from_roster_desc': (window.lang_config['application.confimation.remove_from_roster_desc']?window.lang_config['application.confimation.remove_from_roster_desc']:'##nick## będzie usunięty z Twojej listy kontaktów'),
		
		'application.confimation.button.yes': (window.lang_config['application.confimation.button.yes']?window.lang_config['application.confimation.button.yes']:'Tak'),
		'application.confimation.button.no': (window.lang_config['application.confimation.button.no']?window.lang_config['application.confimation.button.no']:'Nie'),
	
		'application.message.left_chat': (window.lang_config['application.message.left_chat']?window.lang_config['application.message.left_chat']:'##nick## opuścił czat'),
		'application.message.entered_chat': (window.lang_config['application.message.entered_chat']?window.lang_config['application.message.entered_chat']:'##nick## wszedł na czat'),
		'application.message.user_disagreed': (window.lang_config['application.message.user_disagreed']?window.lang_config['application.message.user_disagreed']:'Niestety, ##nick## nie zaakceptował Twojego zaproszenia'),
		'application.message.user_accepted': (window.lang_config['application.message.user_accepted']?window.lang_config['application.message.user_accepted']:'##nick## wszedł na czat'),
		'application.message.cant_start_chat': (window.lang_config['application.message.cant_start_chat']?window.lang_config['application.message.cant_start_chat']:'Nie możesz rozpocząć rozmowy z ##nick##'),
		'application.message.cant_start_chat_no_accept': (window.lang_config['application.message.cant_start_chat_no_accept']?window.lang_config['application.message.cant_start_chat_no_accept']:'Nie możesz rozmawiać. Użytkownik musi zaakceptować Twoje zaproszenie'),
		'application.message.waiting_accept': (window.lang_config['application.message.waiting_accept']?window.lang_config['application.message.waiting_accept']:'Czekam na akceptację zaproszenia przez ##nick##'),
	
		'roster.chat_off.message': (window.lang_config['roster.chat_off.message']?window.lang_config['roster.chat_off.message']:'Włącz chat, zby zobaczyć kto jest online'),
		'textarea.placeholder': (window.lang_config['textarea.placeholder']?window.lang_config['textarea.placeholder']:'Wpisz wiadomość'),
		'roster.empty': (window.lang_config['roster.empty']?window.lang_config['roster.empty']:'Lista kontaktów jest pusta. Gdy gdy zaczniesz z kimś rozmowę, lista automatycznie się uzupełni.'),
		'roster.remove_user': (window.lang_config['roster.remove_user']?window.lang_config['roster.remove_user']:'Usuń'),
	};

}).call(undefined, this);
