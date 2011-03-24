
/*
   jQuery.dateselect.js

   Version 0.2
*/
var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};

$.fn.dateselect = function( options ) {
    var opts = $.extend({ 
        change: null,
        valueField: null,
        dateFormat: 'yyyy-mm-dd',
        },options);

    var el = $(this);
    el.addClass('date-select');

    var defValue = el.html() ? el.html() : null;
    var defDate;

    if( defValue ) {
        defDate = new Date( defValue );
        el.html( "" );
    }

    var s_y = $('<select/>');
    var s_m = $('<select/>');
    var s_d = $('<select/>');

    s_y.addClass('date-select-unit date-select-year');
    s_m.addClass('date-select-unit date-select-month');
    s_d.addClass('date-select-unit date-select-day');

    var d = new Date;

    for( var y = d.getFullYear() ; y < d.getFullYear() + 5 ; y++ ) {
        var o = $('<option/>').html(y).val( y );
        s_y.append( o );
    }


    for( var m = 1 ; m <= 12 ; m++ ) {
        var o = $('<option/>').html(m).val(m);
        s_m.append( o );
    }

    function daysInMonth(month,year) {
        var m = [31,28,31,30,31,30,31,31,30,31,30,31];
        if (month != 2) return m[month - 1] ;
        if (year % 4 != 0) return m[1] ;
        if (year % 100 == 0 && year%400 != 0) return m[1];
        return m[1] + 1;
    }

    var daysUpdater = function() { 
        var val = $(this).val();
        var days = daysInMonth( val , s_y.val() );
        s_d.html("");
        for( var m = 1 ; m <= days ; m++ ) {
            var o = $('<option/>').html(m).val(m);
            s_d.append( o );
        }
    };

    s_m.change( daysUpdater );
    daysUpdater.call( s_m );

    if( defDate ) {
        s_y.find('option[value='+ defDate.getFullYear() +']').attr('selected',true);
        s_m.find('option[value='+ (defDate.getMonth() + 1) +']').attr('selected',true);
        s_d.find('option[value='+ (defDate.getDate()) +']').attr('selected',true);
    }


    if( opts.channge )  {
        s_y.bind('change', opts.channge );
        s_m.bind('change', opts.channge );
        s_d.bind('change', opts.channge );
    }

    if( opts.valueField ) {
        var updater = function() {
            var d = new Date;
            d.setFullYear( s_y.val() );
            d.setMonth( s_m.val() - 1 );
            d.setDate( s_d.val() );
            var d_str = d.format( opts.dateFormat );
            opts.valueField.val( d_str );
        };

        s_y.bind('change', updater );
        s_m.bind('change', updater );
        s_d.bind('change', updater );

        updater();
    }

    $(this).append( s_y ).append( s_m ).append( s_d );
};

