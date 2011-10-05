$(document).ready(function () {
	
	// Monitor key entries in search box and send search query on server
	// automatically. Force a delay before actually sending the request
	// in order to accept more characters being typed in.
	
	var _searchKeyTimer = null;
	
	$('#searchBox input').keyup(function (evt) {
		
		// clear running timeouts from any previous key inputs
		if (_searchKeyTimer) {
			clearTimeout(_searchKeyTimer);
		}
		
		if (String.fromCharCode(evt.which).search(/\r|\n/) != -1) {
			// pressed ENTER key, send search now
			search($(this).val());
		} else if (!(evt.metaKey || evt.shiftKey || evt.altKey || evt.ctrlKey)) {
			// wait half a second for more key inputs then send search
			var elm = this;
			_searchKeyTimer = setTimeout(function () {
				search($(elm).val());
			}, 500);
		}
	});
	
	$('#searchBox input').click(function (evt) {
		if (_searchKeyTimer) {
			clearTimeout(_searchKeyTimer);
		}
		if ($(this).val() == '') {
			search('');
		}
	});
	
	
	// Handle clicks on search results elements
	
	$('#searchResultsCtnr').delegate('.searchResult','click', function (evt) {
		
		$(this).addClass('selected').siblings('.selected').removeClass('selected');
		
		if ($('#contentDisplay .noSelection').is(':visible')) {
			$('#contentDisplay .noSelection').hide();
			$('#contentDisplay .hasSelection').show();
		}
		
		if ($('#contentNav li.selected').attr('rel') == 'messages') {
			showMessages($(this).data('email'));
		} else {
			showFiles($(this).data('email'));
		}
	});
	
	$('#contentDisplay .noSelection').show();
	$('#contentDisplay .hasSelection').hide();
	
	// toggling between files and messages in contentDisplay
	$('#contentNav li').click(function (evt) {
		var elm = $(this);
		if (!(elm.hasClass('selected'))) {
			
			elm.siblings('.selected').removeClass('selected');
			elm.addClass('selected');
			
			if (elm.attr('rel') == 'messages') {
				showMessages($('.searchResult.selected').data('email'));
			} else {
				showFiles($('.searchResult.selected').data('email'));
			}
		}
	});
	
	
	$('#contentDisplay').delegate(".actions a", "click", function (evt) {
		alert("This feature is not implemented in the demo. If you're curious how you'd do it, feel free to contact us at hello@context.io!");
	});

	if ($('#searchResultsCtnr').css('-moz-box-flex')) {
		function setHeight(elm) {
			elm.height( elm.parent().innerHeight() - elm.parent().children(":eq(0)").outerHeight());
		};
		$(window).resize(function (evt) {
			setHeight($('#searchResultsCtnr'));
			setHeight($('.contentListCtnr'));
		});
		$(window).trigger('resize');
	}
});

function search(searchStr) {
	
	//tmpl-searchResult
	if (typeof this.lastSearchString == 'undefined') {
		this.lastSearchString = '';
	}
	
	if (searchStr != this.lastSearchString) {
		this.lastSearchString = searchStr;

		var ctnr = $('#searchResultsCtnr');
		
		if (searchStr == '') {
			
			console.log('Clearing search results');
			ctnr.empty();
			$('#contentDisplay .noSelection').show();
			$('#contentDisplay .hasSelection').hide();
			
		} else {
		
			console.log('sending search for: ', searchStr);
			ctnr.css({opacity:'0.5'});
			
			$.getJSON('/search.json',{str: searchStr}, function (results) {
				console.log('search results: ', results);
				// empty results container and append the new ones
				ctnr.empty();
				var max = results.length;
				if (max == 0) {
					ctnr.append('<p class="noResults">No results found.</p>');
				} else {
					for (var i = 0; i < max; ++i) {
						var fullName = (typeof results[i].name == 'undefined') ? '-': results[i].name;
						ctnr.append($("<div/>", {
							'class': 'searchResult',
							'html': '<span class="thumbnail"><img src="'+results[i].thumbnail+'" /></span><span class="displayName">'+results[i].name+'</span><span class="email">'+results[i].email+'</span>',
							'data-email': results[i].email
						}));
					}
				}
				ctnr.animate({opacity:'1'});
			});
		}
	}
};

function showFiles(email) {
	console.log("loading files for contact ",email);

	$('#messageListCtnr').hide();
	var ctnr = $('#attachmentListCtnr');
	var tbody = $('#attachmentListCtnr').find('tbody');
	ctnr.show().css({opacity:'0.5'});

	$.getJSON('/files.json',{email: email}, function (results) {
		console.dir(results);
		tbody.empty();
		var max = results.length;
		if (max == 0) {
			tbody.append('<tr><td colspan="4">No results found.</td></tr>');
		} else {
			for (var i = 0; i < max; ++i) {
				var elm = $("<tr/>", {'class':'fileElm'}).appendTo(tbody);
				$("<td/>", {'class':'name', 'text': results[i].file_name}).appendTo(elm);
				$("<td/>", {'class':'from'}).append(buildPersonElm(results[i].addresses.from, results[i].person_info[results[i].addresses.from.email])).appendTo(elm);
				$("<td/>", {'class':'subject', 'text': results[i].subject}).appendTo(elm);
				$("<td/>", {'class':'actions'}).append(buildActionElm("download")).append(buildActionElm("preview")).appendTo(elm);
			}
		}
		ctnr.animate({opacity:'1'});
	});
};

function showMessages(email) {
	console.log("loading messages for contact ",email);

	$('#attachmentListCtnr').hide();
	var ctnr = $('#messageListCtnr');
	ctnr.show().css({opacity:'0.5'});

	$.getJSON('/messages.json',{email: email}, function (results) {
		console.dir(results);
		ctnr.empty();
		var tmplElm = $('#tmpl-messageElm > div');
		for (var i = 0, max = results.length; i < max; ++i) {
			var elm = tmplElm.clone(false);
			
			elm.find('.subject').text(results[i].subject);			
			elm.find('.date').text(dateToLocaleFormat(new Date(results[i].date * 1000), "%b %e, %Y"));
			elm.find('.from .address').append(buildPersonElm(results[i].addresses.from, results[i].person_info[results[i].addresses.from.email]));
			
			for (var j = 0; j < results[i].addresses.to.length; ++j) {
				elm.find('.to .address').append(buildPersonElm(results[i].addresses.to[j], results[i].person_info[results[i].addresses.to[j].email]));
			}
			
			if ('cc' in results[i]) {
				for (var j = 0; j < results[i].addresses.cc.length; ++j) {
					elm.find('.cc .address').append(buildPersonElm(results[i].addresses.cc[j], results[i].person_info[results[i].addresses.cc[j].email]));
				}
			} else {
				elm.find('.cc').hide();
			}
			
			elm.addClass('messageElm').data('emailMessageId',results[i].email_message_id).appendTo(ctnr);
		}
		ctnr.animate({opacity:'1'});
	});
};


function buildPersonElm(addr, person_info) {
	return $("<span/>",{
		'class': 'person',
		'html': '<span class="thumbnail"><img src="'+person_info.thumbnail+'" /></span><span class="info"><span class="displayName">'+addr.name+'</span><span class="email">'+addr.email+'</span></span>'
	});
};

function buildActionElm(label) {
	return $("<a/>",{
		'href': 'javascript:void(null);',
		'html': label
	});
}
