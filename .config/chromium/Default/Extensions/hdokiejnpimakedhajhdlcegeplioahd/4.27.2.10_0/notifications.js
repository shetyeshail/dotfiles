Notifications=function(){var e=null,t=null,s=function(e,t){var s;if(t){var i=e.find(".message");s=i.text(),"string"==typeof t?""!=s?i.text(s+"   "+t):i.text(t):t instanceof Array&&(i.empty(),i.append(t)),e.css("top",0)}},i=function(t){s(e,t)},n=function(e,t){var s;t.css("top",-t.outerHeight()),t.find(".message").empty(),e&&(e.stopPropagation(),e.preventDefault())},o=function(t){n(t,e)},a=function(e){n(e,t)},l=null,c=function(e){s(t,e),clearTimeout(l),l=setTimeout(function(){a()},3e3)},r=function(e){var t=["notification"].concat(LPTools.getOption(e,"additionalClasses",[])),s=LPTools.createElement("div",{class:t.join(" "),id:e.id,role:"alert","aria-atomic":"true"}),i="undefined"!=typeof dialogs&&void 0!==dialogs.baseURL?dialogs.baseURL:"",n=LPTools.createElement("div","messageCell");n.appendChild(LPTools.createElement("img",{src:i+e.img})),n.appendChild(LPTools.createElement("span","title",e.title)),n.appendChild(LPTools.createElement("span","message")),s.appendChild(n);var o=LPTools.createElement("div",{class:"close midToneHover",title:Strings.translateString("Close")});return o.appendChild(LPTools.createElement("img",{src:i+e.closeImg})),LPPlatform.addEventListener(o,"click",e.closeHandler),s.appendChild(o),document.body.appendChild(s),$(s)},d;return{displayErrorMessage:i,displaySuccessMessage:c,initialize:function(s){e=r($.extend(s,{id:"errorMessage",img:"images/vault_4.0/Error.png",title:Strings.translateString("ERROR")+": ",closeImg:"images/vault_4.0/Error_Close.png",closeHandler:o})),t=r($.extend(s,{id:"successMessage",img:"images/vault_4.0/Success.png",title:Strings.translateString("SUCCESS")+": ",closeImg:"images/vault_4.0/Success_Close.png",closeHandler:a})),Topics.get(Topics.ERROR).subscribe(function(e){i(e)}),Topics.get(Topics.SUCCESS).subscribe(function(e){c(e)}),Topics.get(Topics.REQUEST_START).subscribe(function(){o()}),Topics.get(Topics.DIALOG_CLOSE).subscribe(function(){o()})}}}();
//# sourceMappingURL=sourcemaps/notifications.js.map
