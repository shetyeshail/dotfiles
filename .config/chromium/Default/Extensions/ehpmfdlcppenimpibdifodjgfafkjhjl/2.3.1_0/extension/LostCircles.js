function shareNetwork(e){var o,t;o=!document.getElementById("chkboxName").checked,t=!document.getElementById("chkboxFID").checked,svgAsPngUri($("#mainSVG div svg")[0],{scale:3},function(n){for(var a=0;a<globalD3Network.nodes.length;a++)globalNetwork.nodes[a].x=globalD3Network.nodes[a].x,globalNetwork.nodes[a].y=globalD3Network.nodes[a].y,o&&(globalNetwork.nodes[a].name=a,globalNetwork.nodes[a].userName=a),t&&(globalNetwork.nodes[a].id=a),"undefined"!=typeof globalD3Network.nodes[a].additionalProperties&&(globalNetwork.nodes[a].additionalProperties=globalD3Network.nodes[a].additionalProperties);var r={userId:globalD3Network.userId,userName:globalD3Network.userName,nodes:globalNetwork.nodes,links:network.links},l={userId:globalD3Network.userId,image64:n,graph:r};$.ajax({type:"POST",timeout:25e4,url:"https://lostcircles.com:8443/network",data:JSON.stringify(l),contentType:"application/json; charset=utf-8",dataType:"json",success:function(o){var t="https://lostcircles.com/network/"+o.id;e(t)},failure:function(e){console.log(e),alert("could not retrieve backbone")}})})}function savePicture(){saveSvgAsPng($("#mainSVG div svg")[0],globalD3Network.userName+".png")}function shareFacebook(){shareNetwork(function(e){window.open("https://www.facebook.com/sharer/sharer.php?u="+e,"pop","width=600, height=400, scrollbars=no");return!1})}function sharePopup(){$("#urlInput").hide(),$("#waitForProgress").show(),$("#myModal").modal("show").on("shown.bs.modal",function(){shareNetwork(function(e){$("#urlField").attr("value",e),$("#waitForProgress").hide(),$("#urlInput").show()})})}$(document).ready(function(){new Clipboard(".copyToClipboard"),$('[data-toggle="tooltip"]').tooltip(),getJsonGraph(function(e){globalD3Network=e,network=JSON.parse(JSON.stringify(globalD3Network)),globalNetwork=JSON.parse(JSON.stringify(globalD3Network)),setupView(0,e),applyLayoutForce(e)}),$body=$("body"),$(document).on({ajaxStart:function(){$body.addClass("loading")},ajaxStop:function(){$body.removeClass("loading")}}),document.getElementById("mainClear").addEventListener("click",lc.clearData),document.getElementById("mainGraphml").addEventListener("click",downloadGraphml),document.getElementById("mainGraphmlWithoutPics").addEventListener("click",function(){downloadGraphml(jsonReplacer.removeDataUrl)}),document.getElementById("mainJson").addEventListener("click",downloadJsonGraph),document.getElementById("mainJsonWithoutPics").addEventListener("click",function(){downloadJsonGraph(jsonReplacer.removeDataUrl)}),document.getElementById("pictureDownload").addEventListener("click",savePicture),document.getElementById("mainBackbone").addEventListener("click",getBackbone),document.getElementById("share").addEventListener("click",shareFacebook),document.getElementById("shareExtra").addEventListener("click",sharePopup);chrome.app.getDetails().version;$("#facebookShareLink").on("click",function(){var e=$("#urlField").attr("value");window.open("https://www.facebook.com/sharer/sharer.php?u="+e,"pop","width=600, height=400, scrollbars=no");return!1}),$("#openLink").click(function(){var e=$("#urlField").attr("value");OpenInNewTab(e)})});