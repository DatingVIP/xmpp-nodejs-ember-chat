RegExp.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
};
jQuery.fn.emoticons = function(icon_folder) {
    /* emoticons is the folder where the emoticons are stored*/
    var icon_folder = icon_folder || "1";

    var emotes = {"smile": Array(":-)",":)","=]","=)"),
                  "sad": Array(":(", ":-(","=(",":[",":&lt;"),
                  "wink": Array(";-)",";)",";]","*)"),
                  "grin": Array(":D","=D"),
                  "surprise": Array(":O","=O",":-O","=-O"),
                  "devilish": Array("(6)"),
                  "angel": Array("(A)"),
                  "crying": Array(":'(",":'-("),
                  "plain": Array(":|"),
                  "glasses": Array("8)","8-)"),
                  "kiss": Array("(K)",":-*",":*"),
                  "monkey": Array("(M)")};
                  
    /* Replaces all ocurrences of emoticons in the given html with images
     */
    function emoticons(html){
        for(var emoticon in emotes){
            for(var i = 0; i < emotes[emoticon].length; i++){
                /* css class of images is emoticonimg for styling them*/
                html = html.replace(new RegExp(RegExp.escape(emotes[emoticon][i]), "gi"),"<img src=\""+main_url+"/images/empty.gif\" class=\"emots-"+icon_folder+" emot-face-"+emoticon+"\" title=\""+emotes[emoticon][i]+"\" alt=\""+emotes[emoticon][i]+"\">");
            }
        }
        return html;
    }
    return this.each(function(){
        $(this).html(emoticons($(this).html()));
    });
};