/**
 * Replicates functionality of Date.toLocaleFormat() as documented on MDC
 * https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Date/toLocaleFormat
 * 
 * Format string follows C function strftime():
 * http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html
 * 
 * SOME TOKENS ARE NOT IMPLEMENTED YET
 * 
 * @param {Date} date A JavaScript Date object 
 * @param {String} formatStr Date format desired
 * @param {Object} locale Optionally specify the locale to be used, en_US by default (en_* and fr_* are supported)
 * @author Bruno Morency bruno@dokdok.com
 * @copyright DokDok Inc.
 * @license MOZILLA PUBLIC LICENSE Version 1.1 - http://www.mozilla.org/MPL/MPL-1.1.txt 
 */
function dateToLocaleFormat(date, formatStr, locale) {
	// ref to complete unsupported cases:
	// http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html
	
	if (typeof locale != 'string') locale = 'en_US';
	var dictKey = locale.split('_').shift();

	var dict = {
		en : {
			monthsAbbr: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
			months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
			daysAbbr: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
			days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
		},
		fr :{
			monthsAbbr: ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'],
			months: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
			daysAbbr: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
			days: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
		}
	};
	
	var padStr = function(str, direction, fillChar, toLength) {
		if (typeof str != 'string') str = '' + str;
		while (str.length < toLength) {
			if (direction == 'left') str = fillChar + '' + str;
			else if (direction == 'right') str = str + '' + fillChar;
		}
		return str;
	};

	// expand shortcuts
	formatStr = formatStr.replace(/(%[DhrRT])/g, function(str, p1, p2){
		var newStr = '';
		switch(str) {
			case '%D': newStr = "%m/%d/%y"; break;
			case '%h': newStr = "%b"; break;
			case '%r': newStr = "%I:%M:%S %p"; break;
			case '%R': newStr = "%H:%M"; break;
			case '%T': newStr = "%H:%M:%S"; break;
		}
		return newStr;
	});
	
	// replace values
	formattedDate = formatStr.replace(/(%[a-zA-Z])/g, function(str, p1, p2){
		var repStr = '';
		var unsupported = '--';
		switch(str) {
			case '%a':
			    repStr = dict[dictKey].daysAbbr[date.getDay()]; break;
			case '%A':
			    repStr = dict[dictKey].days[date.getDay()]; break;
			case '%b':
			    repStr = dict[dictKey].monthsAbbr[date.getMonth()]; break;
			case '%B':
			    repStr = dict[dictKey].months[date.getMonth()]; break;
			case '%c':
			    repStr = unsupported; break;
			case '%C':
			    repStr = Math.floor(date.getFullYear() / 100); break;
			case '%d':
			    repStr = padStr(date.getDate(), 'left', '0', 2); break;
			case '%e':
			    repStr = padStr(date.getDate(), 'left', ' ', 2); break;
			case '%H':
			    repStr = padStr(date.getHours(), 'left', '0', 2); break;
			case '%I':
			    repStr = (date.getHours() % 12 == 0) ? '12' : padStr(date.getHours() % 12,'left', '0', 2); break;
			case '%j':
			    repStr = unsupported; break;
			case '%m':
			    repStr = padStr(date.getMonth() + 1, 'left', '0', 2); break;
			case '%M':
			    repStr = padStr(date.getMinutes(), 'left', '0', 2); break;
			case '%n':
			    repStr = "\n"; break;
			case '%p':
			    repStr = (date.getHours() >= 12) ? 'PM' : 'AM'; break;
			case '%S':
			    repStr = padStr(date.getSeconds(), 'left', '0', 2); break;
			case '%t':
			    repStr = "\t"; break;
			case '%u':
			    repStr = (date.getDay() == 0) ? 7 :date.getDay(); break;
			case '%U':
			    repStr = unsupported; break;
			case '%V':
			    repStr = unsupported; break;
			case '%w':
			    repStr = date.getDay(); break;
			case '%W':
			    repStr = unsupported; break;
			case '%x':
			    repStr = unsupported; break;
			case '%X':
			    repStr = unsupported; break;
			case '%y':
			    repStr = padStr(date.getFullYear() % 100, 'left', '0', 2) ; break;
			case '%Y':
			    repStr = date.getFullYear(); break;
			case '%Z':
			    repStr = unsupported; break;
		}
		return repStr;
	});
	
	return formattedDate;
}
