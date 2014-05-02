## Introduction
This is web based instant messenger XMPP client using node.js and ember.js.

## Installation
First thing you will need is a XMPP server. That can be [Openfire](http://www.igniterealtime.org/projects/openfire/) for example. It is easy to install and configure. You can find installation guide [here](http://www.igniterealtime.org/builds/openfire/docs/latest/documentation/install-guide.html).
When your XMPP server is ready, you have to adjust configuradion in `server-chat.js` file. After that, you should be able to run node.js server.
```
node server-chat.js```
It will be accesible from `localhost:9677`.
Node.js part connects directly to XMPP server and communicate with client (Ember) part via WebSockets (primus lib used for that).
Node server needs some third party libs. All you need to do install them is:
```
npm install package.json```
By default server-chat.js will run server only for http connections. If you want to enable ssl connections, update paths for ssl keys in server-chat.js.
Once you have users in you XMPP server, you can open chat visiting url like:
```
http://localhost:9677/get_chat?name=[username]&password=[password]&i18n=en```

For proper work, you will also need Openfire plugin [Online Users Service](https://github.com/candy-chat/onlineUsersPlugin) installed with additional setting in system properties `plugin.onlineUsers.list.disableAuth = true`. This plugin exposes list of online users through HTTP in the JSON format. If you are using differend XMPP server you should use something similar solution.

If you wants to use minimized js version, you have to run
```
node r.js -o build.js```
from `build` dir.

## License
This software is released under the LGPL v3 license:

http://opensource.org/licenses/LGPL-3.0