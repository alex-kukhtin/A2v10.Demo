// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190226-7444
// app.js

"use strict";

(function () {

	window.app = {
		modules: {},
		components: {},
		nextToken: nextToken
	};

	window.require = require;
	window.component = component;

	let rootElem = document.querySelector('meta[name=rootUrl]');
	window.$$rootUrl = rootElem ? rootElem.content || '' : '';

	function require(module, noerror) {
		if (module in app.modules) {
			let am = app.modules[module];
			if (typeof am === 'function') {
				am = am(); // always singleton
				app.modules[module] = am;
			}
			return am;
		}
		if (noerror)
			return null;
		throw new Error('module "' + module + '" not found');
	}

	function component(name, noerror) {
		if (name in app.components)
			return app.components[name];
		if (noerror)
			return {};
		throw new Error('component "' + name + '" not found');
	}

	let currentToken = 1603;

	function nextToken() {
		return '' + currentToken++;
	}
})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20181120-7363
// platform/polyfills.js


(function (elem) {
	elem.closest = elem.closest || function (css) {
		let node = this;
		while (node) {
			if (node.matches(css))
				return node;
			else
				node = node.parentElement;
		}
		return null;
	};

	elem.scrollIntoViewCheck = elem.scrollIntoViewCheck || function () {
		let el = this;
		let elRect = el.getBoundingClientRect();
		let pElem = el.parentElement;
		while (pElem) {
			if (pElem.offsetHeight < pElem.scrollHeight)
				break;
			pElem = pElem.parentElement;
		}
		if (!pElem)
			return;
		let parentRect = pElem.getBoundingClientRect();
		if (elRect.top < parentRect.top)
			el.scrollIntoView(true);
		else if (elRect.bottom > parentRect.bottom)
			el.scrollIntoView(false);
	};


})(Element.prototype);

(function (date) {

	date.isZero = date.isZero || function () {
		let td = new Date(0, 0, 1, 0, 0, 0, 0);
		td.setHours(0, -td.getTimezoneOffset(), 0, 0);
		return this.getTime() === td.getTime();
	};

})(Date.prototype);




// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20181204-7382*/
/* platform/webvue.js */

(function () {

	function set(target, prop, value) {
		Vue.set(target, prop, value);
	}

	function defer(func) {
		Vue.nextTick(func);
	}


	app.modules['std:platform'] = {
		set: set,
		defer: defer,
		File: File, /*file ctor*/
		performance: performance
	};

	app.modules['std:eventBus'] = new Vue({});

})();

// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190414-7485
// services/utils.js

app.modules['std:utils'] = function () {

	const locale = require('std:locale');
	const platform = require('std:platform');
	const dateLocale = locale.$Locale;
	const numLocale = locale.$Locale;
	const _2digit = '2-digit';

	const dateOptsDate = { timeZone: 'UTC', year: 'numeric', month: _2digit, day: _2digit };
	const dateOptsTime = { timeZone: 'UTC', hour: _2digit, minute: _2digit };

	const formatDate = new Intl.DateTimeFormat(dateLocale, dateOptsDate).format;
	const formatTime = new Intl.DateTimeFormat(dateLocale, dateOptsTime).format;

	const currencyFormat = new Intl.NumberFormat(numLocale, { minimumFractionDigits: 2, maximumFractionDigits: 6, useGrouping: true }).format;
	const numberFormat = new Intl.NumberFormat(numLocale, { minimumFractionDigits: 0, maximumFractionDigits: 6, useGrouping: true }).format;

	let numFormatCache = {};


	return {
		isArray: Array.isArray,
		isFunction: isFunction,
		isDefined: isDefined,
		isObject: isObject,
		isObjectExact: isObjectExact,
		isDate: isDate,
		isString: isString,
		isNumber: isNumber,
		isBoolean: isBoolean,
		toString: toString,
		defaultValue: defaultValue,
		notBlank: notBlank,
		toJson: toJson,
		fromJson: JSON.parse,
		isPrimitiveCtor: isPrimitiveCtor,
		isDateCtor: isDateCtor,
		isEmptyObject: isEmptyObject,
		defineProperty: defProperty,
		eval: evaluate,
		simpleEval: simpleEval,
		format: format,
		toNumber: toNumber,
		parse: parse,
		getStringId: getStringId,
		isEqual: isEqual,
		date: {
			today: dateToday,
			zero: dateZero,
			parse: dateParse,
			tryParse: dateTryParse,
			equal: dateEqual,
			isZero: dateIsZero,
			formatDate: formatDate,
			format: formatDate,
			add: dateAdd,
			diff: dateDiff,
			create: dateCreate,
			compare: dateCompare,
			endOfMonth: endOfMonth,
			minDate: dateCreate(1901, 1, 1),
			maxDate: dateCreate(2999, 12, 31),
			fromDays: fromDays
		},
		text: {
			contains: textContains,
			containsText: textContainsText,
			sanitize,
			splitPath,
			capitalize
		},
		currency: {
			round: currencyRound,
			format: currencyFormat
		},
		func: {
			curry,
			debounce
		},
		debounce: debounce
	};

	function isFunction(value) { return typeof value === 'function'; }
	function isDefined(value) { return typeof value !== 'undefined'; }
	function isObject(value) { return value !== null && typeof value === 'object'; }
	function isDate(value) { return value instanceof Date; }
	function isString(value) { return typeof value === 'string'; }
	function isNumber(value) { return typeof value === 'number'; }
	function isBoolean(value) { return typeof value === 'boolean'; }
	function isObjectExact(value) { return isObject(value) && !Array.isArray(value); }

	function isPrimitiveCtor(ctor) {
		return ctor === String || ctor === Number || ctor === Boolean || ctor === Date || ctor === platform.File || ctor === Object;
	}

	function isDateCtor(ctor) {
		return ctor === Date;
	}

	function isEmptyObject(obj) {
		return !obj || Object.keys(obj).length === 0 && obj.constructor === Object;
	}

	function isEqual(o1, o2) {
		if (o1 === o2) return true;
		if (isDate(o1) && isDate(o2))
			return o1.getTime() === o2.getTime();
		return false;
	}

	function notBlank(val) {
		if (!val)
			return false;
		if (isDate(val))
			return !dateIsZero(val);
		switch (typeof val) {
			case 'string':
				return val !== '';
			case 'date':
				return false;
			case 'object':
				if ('$id' in val) {
					return !!val.$id;
				}
				break;
		}
		return (val || '') !== '';
	}

	function toJson(data) {
		return JSON.stringify(data, function (key, value) {
			if (dateIsZero(this[key])) return undefined; // value is string!
			return key[0] === '$' || key[0] === '_' ? undefined : value;
		}, 2);
	}

	function toString(obj) {
		if (!isDefined(obj))
			return '';
		else if (obj === null)
			return '';
		else if (isObject(obj))
			return toJson(obj);
		return obj + '';
	}

	function defaultValue(type) {
		switch (type) {
			case undefined: return undefined;
			case Number: return 0;
			case String: return '';
			case Boolean: return false;
			case Date: return dateZero();
			case Object: return null;
			default:
				if (typeof type === 'function')
					return null; // complex object
				throw new Error(`There is no default value for type ${type}`);
		}
	}

	function simpleEval(obj, path) {
		if (!path || !obj)
			return '';
		let ps = (path || '').split('.');
		let r = obj;
		for (let i = 0; i < ps.length; i++) {
			let pi = ps[i];
			if (!(pi in r))
				throw new Error(`Property '${pi}' not found in ${r.constructor.name} object`);
			r = r[ps[i]];
		}
		return r;
	}

	function evaluate(obj, path, dataType, opts, skipFormat) {
		let r = simpleEval(obj, path);
		if (skipFormat) return r;
		if (isDate(r))
			return format(r, dataType);
		else if (isObject(r))
			return toJson(r);
		else
			return format(r, dataType, opts);
	}

	function pad2(num) {
		if (num < 10)
			return '0' + num;
		return '' + num;
	}

	function parse(obj, dataType) {
		switch (dataType) {
			case 'Currency':
			case 'Number':
				return toNumber(obj);
			case 'Date':
				return dateParse(obj);
		}
		return obj;
	}

	function formatNumber(num, format) {
		if (!format)
			return numberFormat(num);
		if (numFormatCache[format])
			return numFormatCache[format](num);
		let re = /^([#][,\s])?(#*)?(0*)?\.?(0*)?(#*)?$/;
		let fmt = format.match(re);
		if (!fmt) {
			console.error(`Invalid number format: '${format}'`);
			return num;
		}
		function getlen(x) {
			return x ? x.length : 0;
		}

		// 1-sep, 2-int part(#), 3-int part(0), 4-fract part (0), 5-fract part (#) 
		let useGrp = !!fmt[1],
			fih = getlen(fmt[2]), fi0 = getlen(fmt[3]),
			fp0 = getlen(fmt[4]), fph = getlen(fmt[5]);

		//console.dir(fmt);
		//console.dir({ useGrp, fp0, fph, fi0, fih });

		let formatFunc = Intl.NumberFormat(numLocale, {
			minimumFractionDigits: fp0,
			maximumFractionDigits: fp0 + fph,
			minimumIntegerDigits: fi0,
			useGrouping: useGrp
		}).format;

		numFormatCache[format] = formatFunc;

		return formatFunc(num);
	}

	function format(obj, dataType, opts) {
		opts = opts || {};
		if (!dataType)
			return obj;
		if (!isDefined(obj))
			return '';
		switch (dataType) {
			case "DateTime":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				return formatDate(obj) + ' ' + formatTime(obj);
			case "Date":
				if (isString(obj))
					obj = string2Date(obj);
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				return formatDate(obj);
			case "DateUrl":
				if (dateIsZero(obj))
					return '';
				return '' + obj.getFullYear() + pad2(obj.getMonth() + 1) + pad2(obj.getDate());
			case "Time":
				if (!isDate(obj)) {
					console.error(`Invalid Date for utils.format (${obj})`);
					return obj;
				}
				if (dateIsZero(obj))
					return '';
				return formatTime(obj);
			case "Period":
				if (!obj.format) {
					console.error(`Invalid Period for utils.format (${obj})`);
					return obj;
				}
				return obj.format('Date');
			case "Currency":
				if (!isNumber(obj)) {
					obj = toNumber(obj);
					//TODO:check console.error(`Invalid Currency for utils.format (${obj})`);
					//return obj;
				}
				if (opts.hideZeros && obj === 0)
					return '';
				if (opts.format)
					return formatNumber(obj, opts.format);
				return currencyFormat(obj);
			case "Number":
				if (!isNumber(obj)) {
					obj = toNumber(obj);
					//TODO:check console.error(`Invalid Number for utils.format (${obj})`);
					//return obj;
				}
				if (opts.hideZeros && obj === 0)
					return '';

				return formatNumber(obj, opts.format);
			default:
				console.error(`Invalid DataType for utils.format (${dataType})`);
		}
		return obj;
	}


	function getStringId(obj) {
		if (!obj)
			return '0';
		if (isNumber(obj))
			return obj;
		else if (isObjectExact(obj)) {
			if ('$id' in obj)
				return obj.$id || 0;
			else if ("Id" in obj)
				return obj.Id || 0;
			else {
				console.error('Id or @id not found in object');
			}
		}
		return '0';
	}

	function toNumber(val) {
		if (isString(val))
			val = val.replace(/\s/g, '').replace(',', '.');
		return isFinite(val) ? +val : 0;
	}

	function dateToday() {
		let td = new Date();
		td.setHours(0, 0, 0, 0);
		td.setHours(0, -td.getTimezoneOffset(), 0, 0);
		return td;
	}

	function dateZero() {
		let td = new Date(0, 0, 1, 0, 0, 0, 0);
		td.setHours(0, -td.getTimezoneOffset(), 0, 0);
		return td;
	}

	function dateTryParse(str) {
		if (!str) return dateZero();
		if (isDate(str)) return str;
		let dt;
		if (str.length === 8) {
			dt = new Date(+str.substring(0, 4), +str.substring(4, 6) - 1, +str.substring(6, 8), 0, 0, 0, 0);
		} else if (str.startsWith('\"\\/\"')) {
			dt = new Date(str.substring(4, str.length - 4));
		} else {
			dt = new Date(str);
		}
		if (!isNaN(dt.getTime())) {
			dt.setHours(0, 0, 0, 0);
			dt.setHours(0, -dt.getTimezoneOffset(), 0, 0);
			return dt;
		}
		return str;
	}

	function string2Date(str) {
		try {
			let dt = new Date(str);
			dt.setHours(0, -dt.getTimezoneOffset(), 0, 0);
			return dt;
		} catch (err) {
			return str;
		}
	}

	function dateParse(str) {
		str = str || '';
		if (!str) return dateZero();
		let today = dateToday();
		let seg = str.split(/[^\d]/).filter(x => x);
		if (seg.length === 1) {
			seg.push('' + (today.getMonth() + 1));
			seg.push('' + today.getFullYear());
		} else if (seg.length === 2) {
			seg.push('' + today.getFullYear());
		}
		let normalizeYear = function (y) {
			y = '' + y;
			switch (y.length) {
				case 2: y = '20' + y; break;
				case 4: break;
				default: y = today.getFullYear(); break;
			}
			return +y;
		};
		let td = new Date(+normalizeYear(seg[2]), +((seg[1] ? seg[1] : 1) - 1), +seg[0], 0, 0, 0, 0);
		if (isNaN(td.getDate()))
			return dateZero();
		td.setHours(0, -td.getTimezoneOffset(), 0, 0);
		return td;
	}

	function dateEqual(d1, d2) {
		return d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate();
	}

	function dateIsZero(d1) {
		if (!isDate(d1)) return false;
		return dateEqual(d1, dateZero());
	}

	function endOfMonth(dt) {
		var dte = new Date(dt.getFullYear(), dt.getMonth() + 1, 0, 0, 0, 0);
		dte.setHours(0, -dte.getTimezoneOffset(), 0, 0);
		return dte;
	}

	function dateCreate(year, month, day) {
		let dt = new Date(year, month - 1, day, 0, 0, 0, 0);
		dt.setHours(0, -dt.getTimezoneOffset(), 0, 0);
		return dt;
	}

	function dateDiff(unit, d1, d2) {
		if (d1.getTime() > d2.getTime())
			[d1, d2] = [d2, d1];
		switch (unit) {
			case "month":
				let delta = 0;
				if (d2.getDate() < d1.getDate())
					delta = -1;
				if (d1.getFullYear() === d2.getFullYear())
					return d2.getMonth() - d1.getMonth() + delta;
				let month = 0;
				let year = d1.getFullYear();
				while (year < d2.getFullYear()) {
					let day = d2.getDate();
					let dayOfMonth = endOfMonth(new Date(year + 1, d1.getMonth(), 1, 0, 0, 0, 0)).getDate();
					if (day > dayOfMonth)
						day = dayOfMonth;
					d1 = new Date(year + 1, d1.getMonth(), day, 0, 0, 0, 0);
					year = d1.getFullYear();
					month += 12;
				}
				month += d2.getMonth() - d1.getMonth();
				return month + delta;
			case "day":
				let du = 1000 * 60 * 60 * 24;
				return Math.floor((d2 - d1) / du);
			case "year":
			case 'year':
				var dd = new Date(d1.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes(), d2.getSeconds(), d2.getMilliseconds());
				return d2.getFullYear() - d1.getFullYear() + (dd < d1 ? (d2 > d1 ? -1 : 0) : (d2 < d1 ? 1 : 0));
		}
		throw new Error('Invalid unit value for utils.date.diff');
	}

	function fromDays(days) {
		let dt = new Date(1900, 0, days, 0, 0, 0, 0);
		dt.setHours(0, -dt.getTimezoneOffset(), 0, 0);
		return dt;
	}

	function dateAdd(dt, nm, unit) {
		if (!isDate(dt))
			return null;
		var du = 0;
		switch (unit) {
			case 'year':
				// TODO: check getTimezone
				return new Date(dt.getFullYear() + nm, dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
			case 'month':
				// save day of month
				let newMonth = dt.getMonth() + nm;
				let day = dt.getDate();
				var ldm = new Date(dt.getFullYear(), newMonth + 1, 0).getDate();
				if (day > ldm)
					day = ldm;
				var dtx = new Date(dt.getFullYear(), newMonth, day);
				dtx.setHours(0, -dtx.getTimezoneOffset(), 0, 0);
				return dtx;
			case 'day':
				du = 1000 * 60 * 60 * 24;
				break;
			case 'hour':
				du = 1000 * 60 * 60;
				break;
			case 'minute':
				du = 1000 * 60;
				break;
			case 'second':
				du = 1000;
				break;
			default:
				throw new Error('Invalid unit value for utils.date.add');
		}
		return new Date(dt.getTime() + nm * du);
	}

	function dateCompare(d1, d2) {
		if (!isDate(d1) || !isDate(d2)) return null;
		let t1 = d1.getTime();
		let t2 = d2.getTime();
		return t1 - t2;
	}

	function sanitize(text) {
		let t = '' + text || '';
		return t.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
			.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
	}

	function splitPath(path) {
		let propIx = path.lastIndexOf('.');
		return {
			obj: path.substring(0, propIx),
			prop: path.substring(propIx + 1)
		};
	}

	function capitalize(text) {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	function textContains(text, probe) {
		if (!probe)
			return true;
		if (!text)
			return false;
		return (text || '').toString().toLowerCase().indexOf(probe.toLowerCase()) !== -1;
	}

	function textContainsText(obj, props, probe) {
		if (!probe) return true;
		if (!obj)
			return false;
		for (let v of props.split(',')) {
			if (textContains(obj[v], probe))
				return true;
		}
		return false;
	}

	function defProperty(trg, prop, get, set /*todo!*/) {
		Object.defineProperty(trg, prop, {
			enumerable: true,
			configurable: true, /* needed */
			get: get
		});
	}

	function debounce(fn, timeout) {
		let timerId = null;
		return function () {
			clearTimeout(timerId);
			timerId = setTimeout(() => {
				fn.call();
			}, timeout);
		};
	}

	function curry(fn, ...args) {
		return (..._arg) => {
			return fn(...args, ..._arg);
		};
	}

	function currencyRound(n, digits) {
		if (isNaN(n))
			return Nan;
		if (!isDefined(digits))
			digits = 2;
		let m = false;
		if (n < 0) {
			n = -n;
			m = true;
		}
		// toFixed = avoid js rounding error
		let r = Number(Math.round(n.toFixed(12) + `e${digits}`) + `e-${digits}`);
		return m ? -r : r;
	}
};

// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190411-7483*/
/* services/url.js */

app.modules['std:url'] = function () {

	const utils = require('std:utils');
	const period = require('std:period');

	return {
		combine,
		makeQueryString,
		parseQueryString,
		normalizeRoot,
		idChangedOnly,
		idOrCopyChanged,
		makeBaseUrl,
		parseUrlAndQuery,
		replaceUrlQuery,
		createUrlForNavigate,
		firstUrl: '',
		encodeUrl: encodeURIComponent,
		helpHref,
		replaceSegment,
		removeFirstSlash,
		isNewPath
	};

	function normalize(elem) {
		elem = '' + elem || '';
		elem = elem.replace(/\\/g, '/');
		if (elem.startsWith('/'))
			elem = elem.substring(1);
		if (elem.endsWith('/'))
			elem = elem.substring(0, elem.length - 1);
		return elem;
	}

	function normalizeRoot(path) {
		let root = window.$$rootUrl;
		if (root && path.startsWith(root))
			return path.substring(root.length);
		return path;
	}

	function removeFirstSlash(url) {
		if (url && url.startsWith && url.startsWith('/'))
			return url.substring(1);
		return url;
	}
	function combine(...args) {
		return '/' + args.map(normalize).filter(x => !!x).join('/');
	}

	function toUrl(obj) {
		if (!utils.isDefined(obj) || obj === null) return '';
		if (utils.isDate(obj)) {
			return utils.format(obj, "DateUrl");		
		} else if (period.isPeriod(obj)) {
			return obj.format('DateUrl');
		} else if (utils.isObjectExact(obj)) {
			if (obj.constructor.name === 'Object') {
				if (!utils.isDefined(obj.Id))
					console.error('Id is not defined for Filter object');
				return '' + (obj.Id || '');
			} else if (!utils.isDefined(obj.$id)) {
				console.error(`$id is not defined for ${obj.constructor.name}`);
			}
			return '' + (obj.$id || '0');
		}
		return '' + obj;
	}

	function isEmptyForUrl(obj) {
		if (!obj) return true;
		let objUrl = toUrl(obj);
		if (!objUrl) return true;
		if (objUrl === '0') return true;
		return false;
	}

	function makeQueryString(obj) {
		if (!obj) return '';
		if (!utils.isObjectExact(obj)) return '';

		let esc = encodeURIComponent;

		// skip special (starts with '_' or '$')
		let query = Object.keys(obj)
			.filter(k => !k.startsWith('_') && !k.startsWith('$') && !isEmptyForUrl(obj[k]))
			.map(k => esc(k) + '=' + esc(toUrl(obj[k])))
			.join('&');
		return query ? '?' + query : '';
	}

	function parseQueryString(str) {
		var obj = {};
		str.replace(/\??([^=&]+)=([^&]*)/g, function (m, key, value) {
			obj[decodeURIComponent(key)] = '' + decodeURIComponent(value);
		});
		return obj;
	}

	function idChangedOnly(newUrl, oldUrl) {
		let n1 = (newUrl || '').split('?')[0];
		let o1 = (oldUrl || '').split('?')[0];
		let ns = n1.split('/');
		let os = o1.split('/');
		if (ns.length !== os.length)
			return false;

		function isNewPathArr(arr) {
			let ai = arr[arr.length - 1];
			return ai === 'new' || ai === '0';
		}

		if (isNewPathArr(os) && !isNewPathArr(ns)) {
			if (ns.slice(0, ns.length - 1).join('/') === os.slice(0, os.length - 1).join('/'))
				return true;
		}

		return false;
	}

	function idOrCopyChanged(newUrl, oldUrl) {
		let n1 = (newUrl || '').split('?')[0];
		let o1 = (oldUrl || '').split('?')[0];
		let ns = n1.split('/');
		let os = o1.split('/');
		if (ns.length !== os.length)
			return false;
		// remove id
		ns.pop();
		os.pop();
		if (ns.pop() === 'edit' && os.pop() === 'copy') {
			return ns.join('/') === os.join('/');
		}
		return false;
	}

	function makeBaseUrl(url) {
		let x = (url || '').split('/');
		let len = x.length;
		if (len >= 6)
			return x.slice(2, len - 2).join('/');
		return url;
	}

	function parseUrlAndQuery(url, querySrc) {
		let query = {};
		for (let p in querySrc) {
			if (p.startsWith('_')) continue;
			query[p] = toUrl(querySrc[p]); // all values are string
		}
		let rv = { url: url, query: query };
		if (url.indexOf('?') !== -1) {
			let a = url.split('?');
			rv.url = a[0];
			// first from url then from query
			rv.query = Object.assign({}, parseQueryString(a[1]), query);
		}
		return rv;
	}
	function replaceUrlQuery(url, query) {
		if (!url)
			url = window.location.pathname + window.location.search;
		let pu = parseUrlAndQuery(url, query);
		return pu.url + makeQueryString(pu.query);
	}

	function createUrlForNavigate(url, data) {
		let urlId = data || 'new';
		let qs = '';
		if (utils.isDefined(urlId.$id))
			urlId = urlId.$id;
		else if (utils.isObjectExact(urlId)) {
			urlId = data.Id;
			delete data['Id'];
			qs = makeQueryString(data);
			if (!utils.isDefined(urlId))
				urlId = 'new';
		}
		if (url.endsWith('new') && urlId === 'new')
			urlId = '';
		return combine(url, urlId) + qs;
	}

	function helpHref(path) {
		let helpUrlElem = document.querySelector('meta[name=helpUrl]');
		if (!helpUrlElem || !helpUrlElem.content) {
			console.warn('help url is not specified');
			return '';
		}
		return helpUrlElem.content + (path || '');
	}

	function replaceId(url, newId) {
		alert('todo::replaceId');
	}

	function isDialogPath(url) {
		return url.startsWith('/_dialog/');
	}

	function replaceSegment(url, id, action) {
		let parts = url.split('/');
		if (isDialogPath(url)) {
			parts.pop();
			if (id)
				parts.push(id);
		} else {
			if (action) parts.pop();
			if (id) parts.pop();
			if (action) parts.push(action);
			if (id) parts.push(id);
		}
		return parts.join('/');
	}

	function isNewPath(url) {
		url = url.split('?')[0]; // first segment
		if (!url) return false;
		if (url.indexOf('/new') !== -1)
			return true;
		if (isDialogPath(url) && url.endsWith('/0'))
			return true;
		return false;
	}
};






// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190223-7441
// services/period.js

app.modules['std:period'] = function () {

	const utils = require('std:utils');
	const date = utils.date;
	const locale = window.$$locale;

	function TPeriod(source) {
		if (source && 'From' in source) {
			if (!source.From && !source.To) {
				this.From = date.minDate;
				this.To = date.maxDate;
			}
			else {
				this.From = date.tryParse(source.From);
				this.To = date.tryParse(source.To);
			}
		} else {
			this.From = date.minDate;
			this.To = date.maxDate;
		}
		Object.defineProperty(this, 'Name', {
			enumerable: true,
			get() {
				return this.format('Date');
			}
		});
	}

	TPeriod.prototype.assign = function (v) {
		if (isPeriod(v)) {
			this.From = v.From;
			this.To = v.To;
		} else {
			if (v.From === null && v.To === null) {
				this.From = date.minDate;
				this.To = date.maxDate;
			} else {
				this.From = date.tryParse(v.From);
				this.To = date.tryParse(v.To);
			}
		}
		this.normalize();
		return this;
	};

	TPeriod.prototype.equal = function (p) {
		return date.equal(this.From, p.From) && date.equal(this.To, p.To);
	};

	TPeriod.prototype.fromUrl = function (v) {
		if (utils.isObject(v) && 'From' in v) {
			this.From = date.tryParse(v.From);
			this.To = date.tryParse(v.To);
			this.normalize();
			return this;
		}
		let px = (v || '').split('-');
		if (px[0].toLowerCase() === 'all') {
			this.From = date.minDate;
			this.To = date.maxDate;
			return this;
		}
		let df = px[0];
		let dt = px.length > 1 ? px[1] : px[0];
		this.From = date.tryParse(df);
		this.To = date.tryParse(dt);
		return this;
	};

	TPeriod.prototype.isAllData = function () {
		return this.From.getTime() === date.minDate.getTime() &&
			this.To.getTime() === date.maxDate.getTime();
	};

	TPeriod.prototype.format = function (dataType) {
		//console.warn(`${this.From.getTime()}-${date.minDate.getTime()} : ${this.To.getTime()}-${date.maxDate.getTime()}`);
		if (this.isAllData())
			return dataType === 'DateUrl' ? 'All' : locale.$AllPeriodData;
		let from = this.From;
		let to = this.To;
		if (from.getTime() === to.getTime())
			return utils.format(from, dataType);
		if (dataType === "DateUrl")
			return utils.format(from, dataType) + '-' + utils.format(to, dataType);
		return utils.format(from, dataType) + ' - ' + (utils.format(to, dataType) || '???');
	};

	TPeriod.prototype.text = function (showCustom) {
		//console.warn(`${this.From.getTime()}-${date.minDate.getTime()} : ${this.To.getTime()}-${date.maxDate.getTime()}`);
		if (this.isAllData())
			return locale.$AllPeriodData;
		// $PrevMonth, key: 'prevMonth
		let menu = predefined(false);
		for (let mi of menu) {
			//console.dir(mi);
			let np = createPeriod(mi.key);
			if (this.equal(np)) {
				return mi.name;
			}
		}
		if (showCustom)
			return 'Довільно';
		let from = this.From;
		let to = this.To;
		return utils.format(from, 'Date') + ' - ' + (utils.format(to, 'Date') || '???');
	};

	TPeriod.prototype.in = function (dt) {
		let t = dt.getTime();
		let zd = utils.date.zero().getTime();
		if (this.From.getTime() === zd || this.To.getTime() === zd) return;
		return t >= this.From.getTime() && t <= this.To.getTime();
	};

	TPeriod.prototype.normalize = function () {
		if (this.From.getTime() > this.To.getTime())
			[this.From, this.To] = [this.To, this.From];
		return this;
	};

	TPeriod.prototype.set = function (from, to) {
		this.From = from;
		this.To = to;
		return this.normalize();
	};


	
	return {
		isPeriod,
		like: likePeriod,
		constructor: TPeriod,
		zero: zeroPeriod,
		all: allDataPeriod,
		create: createPeriod,
		predefined: predefined
	};

	function isPeriod(value) { return value instanceof TPeriod; }

	function likePeriod(obj) {
		if (!obj)
			return false;
		if (Object.getOwnPropertyNames(obj).length !== 2)
			return false;
		if (obj.hasOwnProperty('From') && obj.hasOwnProperty('To'))
			return true;
		return false;
	}

	function zeroPeriod() {
		return new TPeriod();
	}

	function allDataPeriod() {
		return createPeriod('allData');
	}

	function predefined (showAll) {
		let menu = [
			{ name: locale.$Today, key: 'today' },
			{ name: locale.$Yesterday, key: 'yesterday' },
			{ name: locale.$Last7Days, key: 'last7' },
			//{ name: locale.$Last30Days, key: 'last30' },
			//{ name: locale.$MonthToDate, key: 'startMonth' },
			{ name: locale.$CurrMonth, key: 'currMonth' },
			{ name: locale.$PrevMonth, key: 'prevMonth' },
			//{ name: locale.$QuartToDate, key: 'startQuart' },
			{ name: locale.$CurrQuart, key: 'currQuart' },
			{ name: locale.$PrevQuart, key: 'prevQuart' },
			//{ name: locale.$YearToDate, key: 'startYear' },
			{ name: locale.$CurrYear, key: 'currYear'},
			{ name: locale.$PrevYear, key: 'prevYear' }
		];
		if (showAll) {
			menu.push({ name: locale.$AllPeriodData, key: 'allData' });
		}
		return menu;
	}

	function createPeriod(key, from, to) {
		let today = date.today();
		let p = zeroPeriod();
		switch (key) {
			case 'today':
				p.set(today, today);
				break;
			case 'yesterday':
				let yesterday = date.add(today, -1, 'day');
				p.set(yesterday, yesterday);
				break;
			case 'last7':
				// -6 (include today!)
				let last7 = date.add(today, -6, 'day');
				p.set(last7, today);
				break;
			case 'last30':
				// -29 (include today!)
				let last30 = date.add(today, -29, 'day');
				p.set(last30, today);
				break;
			case 'startMonth':
				let d1 = date.create(today.getFullYear(), today.getMonth() + 1, 1);
				p.set(d1, today);
				break;
			case 'prevMonth': {
					let d1 = date.create(today.getFullYear(), today.getMonth(), 1);
					let d2 = date.create(today.getFullYear(), today.getMonth() + 1, 1);
					p.set(d1, date.add(d2, -1, 'day'));
				}
				break;
			case 'currMonth': {
					let d1 = date.create(today.getFullYear(), today.getMonth() + 1, 1);
					let d2 = date.create(today.getFullYear(), today.getMonth() + 2, 1);
					p.set(d1, date.add(d2, -1, 'day'));
				}
				break;
			case 'startQuart': {
				let q = Math.floor(today.getMonth() / 3);
				let m = q * 3;
				let d1 = date.create(today.getFullYear(), m + 1, 1);
				p.set(d1, today);
			}
				break;
			case 'currQuart': {
				let year = today.getFullYear();
				let q = Math.floor(today.getMonth() / 3);
				let m1 = q * 3;
				let m2 = (q + 1) * 3;
				let d1 = date.create(year, m1 + 1, 1);
				let d2 = date.add(date.create(year, m2 + 1, 1), -1, 'day');
				//console.dir(d1 + ':' + d2);
				p.set(d1, d2);
			}
				break;
			case 'prevQuart': {
				let year = today.getFullYear();
				let q = Math.floor(today.getMonth() / 3) - 1;
				if (q < 0) {
					year -= 1;
					q = 3;
				}
				let m1 = q * 3;
				let m2 = (q + 1) * 3;
				let d1 = date.create(year, m1 + 1, 1);
				let d2 = date.add(date.create(year, m2 + 1, 1), -1, 'day');
				p.set(d1, d2);
			}
				break;
			case 'startYear':
				let dy1 = date.create(today.getFullYear(), 1, 1);
				p.set(dy1, today);
				break;
			case 'currYear': {
					let dy1 = date.create(today.getFullYear(), 1, 1);
					let dy2 = date.create(today.getFullYear(), 12, 31);
					p.set(dy1, dy2);
				}
				break;
			case 'prevYear': {
				let dy1 = date.create(today.getFullYear() - 1, 1, 1);
				let dy2 = date.create(today.getFullYear() - 1, 12, 31);
				p.set(dy1, dy2);
			}
				break;
			case 'allData':
				// full period
				p.set(date.minDate, date.maxDate);
				break;
			case "custom":
				p.set(from, to);
				break;
			default:
				console.error('invalid menu key: ' + key);
		}
		return p;
	}
};


// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20181019-7323
/* services/modelinfo.js */

app.modules['std:modelInfo'] = function () {

	return {
		copyfromQuery: copyFromQuery,
		get: getPagerInfo,
		reconcile: reconcile
	};

	function copyFromQuery(mi, q) {
		let psq = { PageSize: q.pageSize, Offset: q.offset, SortDir: q.dir, SortOrder: q.order, GroupBy: q.group };
		for (let p in psq) {
			mi[p] = psq[p];
		}
		if (mi.Filter) {
			for (let p in mi.Filter) {
				mi.Filter[p] = q[p];
			}
		}
	}

	function getPagerInfo(mi) {
		if (!mi) return undefined;
		let x = { pageSize: mi.PageSize, offset: mi.Offset, dir: mi.SortDir, order: mi.SortOrder, group: mi.GroupBy };
		if (mi.Filter) {
			for (let p in mi.Filter) {
				x[p] = mi.Filter[p];
			}
		}
		return x;
	}

	function reconcile(mi) {
		if (!mi) return;
		if (!mi.Filter) return;
		for (let p in mi.Filter) {
			let fv = mi.Filter[p];
			if (typeof fv === 'string' && fv.startsWith('\"\\/\"')) {
				let dx = new Date(fv.substring(4, fv.length - 4));
				mi.Filter[p] = dx;
				//console.dir(mi.Filter[p]);
			}
		}
	}
};


// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190221-7439
/* services/http.js */

app.modules['std:http'] = function () {

	const eventBus = require('std:eventBus');
	const urlTools = require('std:url');

	let fc = null;

	return {
		get: get,
		post: post,
		load: load,
		upload: upload,
		localpost
	};

	function blob2String(blob, callback) {
		const fr = new FileReader();
		fr.addEventListener('loadend', (e) => {
			const text = fr.result;
			callback(text);
		});
		fr.readAsText(blob);
	}

	function doRequest(method, url, data, raw) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();

			xhr.onload = function (response) {
				eventBus.$emit('endRequest', url);
				if (xhr.status === 200) {
					if (raw) {
						resolve(xhr.response);
						return;
					}
					let ct = xhr.getResponseHeader('content-type') || '';
					let xhrResult = xhr.responseText;
					if (ct && ct.indexOf('application/json') !== -1)
						xhrResult = xhr.responseText ? JSON.parse(xhr.responseText) : '';
					resolve(xhrResult);
				}
				else if (xhr.status === 255) {
					if (raw) {
						if (xhr.response instanceof Blob)
							blob2String(xhr.response, (msg) => reject('server error: ' + msg));
						else
							reject(xhr.statusText); // response is blob!
					}
					else
						reject(xhr.responseText || xhr.statusText);
				}
				else
					reject(xhr.statusText);
			};
			xhr.onerror = function (response) {
				eventBus.$emit('endRequest', url);
				reject(xhr.statusText);
			};
			xhr.open(method, url, true);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.setRequestHeader('Accept', 'application/json, text/html');
			if (raw)
				xhr.responseType = "blob";
			eventBus.$emit('beginRequest', url);
			xhr.send(data);
		});
	}

	function get(url, raw) {
		return doRequest('GET', url, null, raw);
	}

	function post(url, data, raw) {
		return doRequest('POST', url, data, raw);
	}

	function upload(url, data) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();
			xhr.onload = function (response) {
				eventBus.$emit('endRequest', url);
				if (xhr.status === 200) {
					let xhrResult = xhr.responseText ? JSON.parse(xhr.responseText) : '';
					resolve(xhrResult);
				} else if (xhr.status === 255) {
					reject(xhr.responseText || xhr.statusText);
				}
			};
			xhr.onerror = function (response) {
				alert('Error');
			};
			xhr.open("POST", url, true);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.setRequestHeader('Accept', 'application/json');
			eventBus.$emit('beginRequest', url);
			xhr.send(data);
		});
	}

	function load(url, selector, baseUrl) {
		let fc = selector ? selector.firstElementChild : null;
		if (fc && fc.__vue__) {
			fc.__vue__.$destroy();
		}
		return new Promise(function (resolve, reject) {
			doRequest('GET', url)
				.then(function (html) {
					if (html.startsWith('<!DOCTYPE')) {
						// full page - may be login?
						window.location.assign('/');
						return;
					}
					let dp = new DOMParser();
					let rdoc = dp.parseFromString(html, 'text/html');
					// first element from fragment body
					let srcElem = rdoc.body.firstElementChild;
					let elemId = srcElem.id || null;
					selector.innerHTML = srcElem ? srcElem.outerHTML : '';
					if (elemId && !document.getElementById(elemId)) {
						selector.innerHTML = '';
						resolve(false);
						return;
					}
					for (let i = 0; i < rdoc.scripts.length; i++) {
						let s = rdoc.scripts[i];
						if (s.type === 'text/javascript') {
							let newScript = document.createElement("script");
							if (s.src)
								newScript.src = s.src;
							else
								newScript.text = s.text;
							document.body.appendChild(newScript).parentNode.removeChild(newScript);
						}
					}
					if (selector.firstElementChild && selector.firstElementChild.__vue__) {
						let fec = selector.firstElementChild;
						let ve = fec.__vue__;
						ve.$data.__baseUrl__ = baseUrl || urlTools.normalizeRoot(url);
						// save initial search
						ve.$data.__baseQuery__ = urlTools.parseUrlAndQuery(url).query;
						if (fec.classList.contains('modal')) {
							let dca = fec.getAttribute('data-controller-attr');
							if (dca)
								eventBus.$emit('modalSetAttribites', dca, ve);
						}
					}
					resolve(true);
				})
				.catch(function (error) {
					alert(error);
					resolve(false);
				});
		});
	}

	function localpost(command, data) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();

			xhr.onload = function (response) {
				if (xhr.status === 200) {
					let ct = xhr.getResponseHeader('content-type');
					let xhrResult = xhr.responseText;
					if (ct.indexOf('application/json') !== -1)
						xhrResult = JSON.parse(xhr.responseText);
					resolve(xhrResult);
				}
				else if (xhr.status === 255) {
					reject(xhr.responseText || xhr.statusText);
				}
				else {
					reject(xhr.statusText);
				}
			};
			xhr.onerror = function (response) {
				reject(response);
			};
			let url = "http://127.0.0.1:64031/" + command;
			xhr.open("POST", url, true);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.setRequestHeader('Accept', 'text/plain');
			xhr.setRequestHeader('Content-Type', 'text/plain');
			xhr.send(data);
		});
	}
};





// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180227-7121*/
/* services/log.js */

app.modules['std:log'] = function () {


	let _traceEnabled = false;
	let _sessionLoaded = false;
	const traceEnabledKey = 'traceEnabled';

	return {
		info: info,
		warn: warning,
		error: error,
		time: countTime,
		traceEnabled: function () {
			if (!_sessionLoaded)
				loadSession();
			return _traceEnabled;
		},
		enableTrace: function (val) {
			if (!window.$$debug) return;
			_traceEnabled = val;
			console.warn('tracing is ' + (_traceEnabled ? 'enabled' : 'disabled'));
			try {
				window.sessionStorage.setItem(traceEnabledKey, val);
			}
			catch (err) {
				// do nothing
			}
		}
	};

	function info(msg) {
		if (!_traceEnabled) return;
		console.info(msg);
	}

	function warning(msg) {
		if (!_traceEnabled) return;
		console.warn(msg);
	}

	function error(msg) {
		console.error(msg); // always
	}

	function countTime(msg, start, enable) {
		if (!_traceEnabled && !enable) return;
		console.warn(msg + ' ' + (performance.now() - start).toFixed(2) + ' ms');
	}

	function loadSession() {
		let te = window.sessionStorage.getItem(traceEnabledKey);
		if (te !== null) {
			_traceEnabled = te === 'true';
			if (_traceEnabled)
				console.warn('tracing is enabled');
		}
		_sessionLoaded = true;
	}
};

// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180705-7241*/
/*validators.js*/

app.modules['std:validators'] = function () {

	const utils = require('std:utils');
	const eventBus = require('std:eventBus');
	const ERROR = 'error';

	// from chromium ? https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
	const EMAIL_REGEXP = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
	const URL_REGEXP = /^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+\])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i;

	let validateMap = new WeakMap();

	return {
		validate: validateItem,
		removeWeak
	};

	function validateStd(rule, val) {
		switch (rule) {
			case 'notBlank':
				return utils.notBlank(val);
			case "email":
				return validEmail(val);
			case "url":
				return validUrl(val);
			case "isTrue":
				return val === true;
		}
		console.error(`invalid std rule: '${rule}'`);
		return true;
	}

	function removeWeak() {
		validateMap = new WeakMap();
	}

	function addToWeak(rule, item, val) {
		let valMap;
		if (validateMap.has(rule)) {
			valMap = validateMap.get(rule);
		} else {
			valMap = new WeakMap(); // internal
			validateMap.set(rule, valMap);
		}
		if (utils.isObjectExact(val) && '$id' in val)
			val = val.$id;
		let valRes = { val: val, result: null };
		valMap.set(item, valRes);
		return valRes;
	}


	function getValForCompare(o1) {
		if (utils.isObjectExact(o1) && '$id' in o1) {
			return o1.$id;
		}
		return o1;
	}

	function validateImpl(rules, item, val, ff) {
		let retval = [];
		retval.pending = 0;
		rules.forEach(function (rule) {
			const sev = rule.severity || ERROR;
			if (utils.isFunction(rule.applyIf)) {
				if (!rule.applyIf(item, val)) return;
			}
			if (utils.isString(rule)) {
				if (!validateStd('notBlank', val))
					retval.push({ msg: rule, severity: ERROR });
			} else if (utils.isFunction(rule)) {
				let vr = rule(item, val);
				if (utils.isString(vr) && vr) {
					retval.push({ msg: vr, severity: sev });
				} else if (utils.isObject(vr)) {
					retval.push({ msg: vr.msg, severity: vr.severity || sev });
				}
			} else if (utils.isString(rule.valid)) {
				if (!validateStd(rule.valid, val))
					retval.push({ msg: rule.msg, severity: sev });
			} else if (utils.isFunction(rule.valid)) {
				if (rule.async) {
					if (validateMap.has(rule)) {
						let vmset = validateMap.get(rule);
						if (vmset.has(item)) {
							let vmv = vmset.get(item);

							if (vmv.val === getValForCompare(val)) {
								// Let's skip already validated values
								if (vmv.result)
									retval.push(vmv.result);
								return;
							}
						} else {
							// First call. Save valid value.
							addToWeak(rule, item, val);
							return;
						}
					} else {
						// First call. Save valid value.
						addToWeak(rule, item, val);
						return;
					}
				}
				let vr = rule.valid(item, val);
				if (vr && vr.then) {
					retval.pending += 1;
					if (!rule.async) {
						console.error('Async rules should be marked async:true');
						return;
					}
					let valRes = addToWeak(rule, item, val);
					vr.then((result) => {
						let dm = { severity: sev, msg: rule.msg };
						let nu = false;
						if (utils.isString(result)) {
							dm.msg = result;
							valRes.result = dm;
							retval.push(dm);
							nu = true;
						} else if (!result) {
							retval.push(dm);
							valRes.result = dm;
							nu = true;
						}
						// need to update the validators
						item._root_._needValidate_ = true;
						if (nu && ff) ff();
						retval.pending -= 1;
						eventBus.$emit('pendingValidate');
					});
				}
				else if (utils.isString(vr)) {
					retval.push({ msg: vr, severity: sev });
				}
				else if (!vr) {
					retval.push({ msg: rule.msg, severity: sev });
				}
			} else {
				console.error('invalid valid element type for rule');
			}
		});
		return retval;
	}

	function validateItem(rules, item, val, du) {
		//console.warn(item);
		let arr = [];
		if (utils.isArray(rules))
			arr = rules;
		else if (utils.isObject(rules))
			arr.push(rules);
		else if (utils.isFunction(rules))
			arr.push(rules);
		else if (utils.isString(rules))
			arr.push({ valid: 'notBlank', msg: rules });
		let err = validateImpl(arr, item, val, du);
		return err; // always array. may be defer
	}


	function validEmail(addr) {
		return addr === '' || EMAIL_REGEXP.test(addr);
	}

	function validUrl(url) {
		return url === '' || URL_REGEXP.test(url);
	}
};



// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180813-7271
// components/collectionview.js

/*
TODO:
11. GroupBy
*/

(function () {


	const log = require('std:log');
	const utils = require('std:utils');
	const period = require('std:period');

	const DEFAULT_PAGE_SIZE = 20;

	function getModelInfoProp(src, propName) {
		if (!src) return undefined;
		let mi = src.$ModelInfo;
		if (!mi) return undefined;
		return mi[propName];
	}

	function setModelInfoProp(src, propName, value) {
		if (!src) return;
		let mi = src.$ModelInfo;
		if (!mi) return;
		mi[propName] = value;
	}

	function makeNewQueryFunc(that) {
		let nq = { dir: that.dir, order: that.order, offset: that.offset };
		for (let x in that.filter) {
			let fVal = that.filter[x];
			if (period.isPeriod(fVal)) {
				nq[x] = fVal.format('DateUrl');
			}
			else if (utils.isDate(fVal)) {
				nq[x] = utils.format(fVal, 'DateUrl');
			}
			else if (utils.isObjectExact(fVal)) {
				if (!('Id' in fVal)) {
					console.error('The object in the Filter does not have Id property');
				}
				nq[x] = fVal.Id ? fVal.Id : undefined;
			}
			else if (fVal) {
				nq[x] = fVal;
			}
			else {
				nq[x] = undefined;
			}
		}
		return nq;
	}

	function modelInfoToFilter(q, filter) {
		if (!q) return;
		for (let x in filter) {
			if (x in q) {
				let iv = filter[x];
				if (period.isPeriod(iv)) {
					filter[x] = iv.fromUrl(q[x]);
				}
				else if (utils.isDate(iv)) {
					filter[x] = utils.date.tryParse(q[x]);
				}
				else if (utils.isObjectExact(iv)) 
					iv.Id = q[x];
				else {
					filter[x] = q[x];
				}
			}
		}
	}

	// client collection

	Vue.component('collection-view', {
		template: `
<div>
	<slot :ItemsSource="pagedSource" :Pager="thisPager" :Filter="filter">
	</slot>
</div>
`,
		props: {
			ItemsSource: Array,
			initialPageSize: Number,
			initialFilter: Object,
			initialSort: Object,
			runAt: String,
			filterDelegate: Function
		},
		data() {
			let lq = Object.assign({}, {
				offset: 0,
				dir: 'asc',
				order: ''
			}, this.initialFilter);

			return {
				filter: this.initialFilter,
				filteredCount: 0,
				localQuery: lq
			};
		},
		computed: {
			pageSize() {
				if (this.initialPageSize > 0)
					return this.initialPageSize;
				return -1; // invisible pager
			},
			dir() {
				return this.localQuery.dir;
			},
			offset() {
				return this.localQuery.offset;
			},
			order() {
				return this.localQuery.order;
			},
			pagedSource() {
				let s = performance.now();
				let arr = [].concat(this.ItemsSource);

				if (this.filterDelegate) {
					arr = arr.filter((item) => this.filterDelegate(item, this.filter));
				}
				// sort
				if (this.order && this.dir) {
					let p = this.order;
					let d = this.dir === 'asc';
					arr.sort((a, b) => {
						if (a[p] === b[p])
							return 0;
						else if (a[p] < b[p])
							return d ? -1 : 1;
						return d ? 1 : -1;
					});
				}
				// HACK!
				this.filteredCount = arr.length;
				// pager
				if (this.pageSize > 0)
					arr = arr.slice(this.offset, this.offset + this.pageSize);
				arr.$origin = this.ItemsSource;
				if (arr.indexOf(arr.$origin.$selected) === -1) {
					// not found in target array
					arr.$origin.$clearSelected();
				}
				log.time('get paged source:', s);
				return arr;
			},
			sourceCount() {
				return this.ItemsSource.length;
			},
			thisPager() {
				return this;
			},
			pages() {
				let cnt = this.filteredCount;
				return Math.ceil(cnt / this.pageSize);
			}
		},
		methods: {
			$setOffset(offset) {
				this.localQuery.offset = offset;
			},
			sortDir(order) {
				return order === this.order ? this.dir : undefined;
			},
			doSort(order) {
				let nq = this.makeNewQuery();
				if (nq.order === order)
					nq.dir = nq.dir === 'asc' ? 'desc' : 'asc';
				else {
					nq.order = order;
					nq.dir = 'asc';
				}
				if (!nq.order)
					nq.dir = null;
				// local
				this.localQuery.dir = nq.dir;
				this.localQuery.order = nq.order;
			},
			makeNewQuery() {
				return makeNewQueryFunc(this);
			},
			copyQueryToLocal(q) {
				for (let x in q) {
					let fVal = q[x];
					if (x === 'offset')
						this.localQuery[x] = q[x];
					else
						this.localQuery[x] = fVal ? fVal : undefined;
				}
			}
		},
		created() {
			if (this.initialSort) {
				this.localQuery.order = this.initialSort.order;
				this.localQuery.dir = this.initialSort.dir;
			}
			this.$on('sort', this.doSort);
		}
	});


	// server collection view
	Vue.component('collection-view-server', {
		template: `
<div>
	<slot :ItemsSource="ItemsSource" :Pager="thisPager" :Filter="filter">
	</slot>
</div>
`,
		props: {
			ItemsSource: Array,
			initialFilter: Object
		},

		data() {
			return {
				filter: this.initialFilter,
				lockChange: true
			};
		},

		watch: {
			jsonFilter: {
				handler(newData, oldData) {
					this.filterChanged();
				}
			}
		},

		computed: {
			jsonFilter() {
				return utils.toJson(this.filter);
			},
			thisPager() {
				return this;
			},
			pageSize() {
				return getModelInfoProp(this.ItemsSource, 'PageSize');
			},
			dir() {
				return  getModelInfoProp(this.ItemsSource, 'SortDir');
			},
			order() {
				return getModelInfoProp(this.ItemsSource, 'SortOrder');
			},
			offset() {
				return getModelInfoProp(this.ItemsSource, 'Offset');
			},
			pages() {
				cnt = this.sourceCount;
				return Math.ceil(cnt / this.pageSize);
			},
			sourceCount() {
				if (!this.ItemsSource) return 0;
				return this.ItemsSource.$RowCount || 0;
			}
		},
		methods: {
			$setOffset(offset) {
				if (this.offset === offset)
					return;
				setModelInfoProp(this.ItemsSource, 'Offset', offset);
				this.reload();
			},
			sortDir(order) {
				return order === this.order ? this.dir : undefined;
			},
			doSort(order) {
				if (order === this.order) {
					let dir = this.dir === 'asc' ? 'desc' : 'asc';
					setModelInfoProp(this.ItemsSource, 'SortDir', dir);
				} else {
					setModelInfoProp(this.ItemsSource, 'SortOrder', order);
					setModelInfoProp(this.ItemsSource, 'SortDir', 'asc');
				}
				this.reload();
			},
			filterChanged() {
				if (this.lockChange) return;
				let mi = this.ItemsSource.$ModelInfo;
				if (!mi) {
					mi = { Filter: this.filter };
					this.ItemsSource.$ModelInfo = mi;
				}
				else {
					this.ItemsSource.$ModelInfo.Filter = this.filter;
				}
				if ('Offset' in mi)
					setModelInfoProp(this.ItemsSource, 'Offset', 0);
				this.reload();
			},
			reload() {
				this.$root.$emit('cwChange', this.ItemsSource);
			},
			updateFilter() {
				let mi = this.ItemsSource.$ModelInfo;
				if (!mi) return;
				let fi = mi.Filter;
				if (!fi) return;
				this.lockChange = true;
				for (var prop in this.filter) {
					if (prop in fi)
						this.filter[prop] = fi[prop];
				}
				this.$nextTick(() => {
					this.lockChange = false;
				});
			}
		},
		created() {
			// get filter values from modelInfo
			let mi = this.ItemsSource ? this.ItemsSource.$ModelInfo : null;
			if (mi) {
				modelInfoToFilter(mi.Filter, this.filter);
			}
			this.$nextTick(() => {
				this.lockChange = false;
			});
			// from datagrid, etc
			this.$on('sort', this.doSort);
		},
		updated() {
			this.updateFilter();
		}
	});
})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180426-7166
/*statdalony/pager.js*/

Vue.component('a2-pager', {
	props: {
		source: Object,
		noElements: String,
		elements: String
	},
	computed: {
		pages() {
			return Math.ceil(this.count / this.source.pageSize);
		},
		currentPage() {
			return Math.ceil(this.offset / this.source.pageSize) + 1;
		},
		title() {
			let lastNo = Math.min(this.count, this.offset + this.source.pageSize);
			if (!this.count)
				return this.noElements;
			return `${this.elements}: <b>${this.offset + 1}</b>-<b>${lastNo}</b> з <b>${this.count}</b>`;
		},
		offset() {
			return +this.source.offset;
		},
		count() {
			return +this.source.sourceCount;
		}
	},
	methods: {
		setOffset(offset) {
			offset = +offset;
			if (this.offset === offset)
				return;
			this.source.$setOffset(offset);
		},
		isActive(page) {
			return page === this.currentPage;
		},
		click(arg, $ev) {
			$ev.preventDefault();
			switch (arg) {
				case 'prev':
					if (this.offset === 0) return;
					this.setOffset(this.offset - this.source.pageSize);
					break;
				case 'next':
					if (this.currentPage >= this.pages) return;
					this.setOffset(this.offset + this.source.pageSize);
					break;
			}
		},
		goto(page, $ev) {
			$ev.preventDefault();
			let offset = (page - 1) * this.source.pageSize;
			this.setOffset(offset);
		}
	},
	render(h, ctx) {
		if (this.source.pageSize === -1) return; // invisible
		let contProps = {
			class: 'pagination pagination-sm'
		};
		let children = [];
		const dotsClass = { 'class': 'pagination-dots' };
		const renderBtn = (page) => {
			return h('li', { class: { active: this.isActive(page) }},
				[h('a', {
					domProps: { innerText: page },
					on: { click: ($ev) => this.goto(page, $ev) },
					attrs: { href:"#" }
				})]
			);
		};
		// prev
		children.push(h('li', { class: { disabled: this.offset === 0 } },
			[h('a', {
				on: { click: ($ev) => this.click('prev', $ev) },
				attrs: { 'aria-label': 'Previous', href: '#' },
				domProps: { innerHTML: '&laquo;' }
			})]
		));
		// first
		if (this.pages > 0)
			children.push(renderBtn(1));
		if (this.pages > 1)
			children.push(renderBtn(2));
		// middle
		let ms = Math.max(this.currentPage - 2, 3);
		let me = Math.min(ms + 5, this.pages - 1);
		if (me - ms < 5)
			ms = Math.max(me - 5, 3);
		if (ms > 3)
			children.push(h('li', dotsClass, [h('span', null, '...')]));
		for (let mi = ms; mi < me; ++mi) {
			children.push(renderBtn(mi));
		}
		if (me < this.pages - 1)
			children.push(h('li', dotsClass, [h('span', null, '...')]));
		// last
		if (this.pages > 3)
			children.push(renderBtn(this.pages - 1));
		if (this.pages > 2)
			children.push(renderBtn(this.pages));
		// next
		children.push(h('li', {
			class: { disabled: this.currentPage >= this.pages }
		}, [h('a', {
			on: { click: ($ev) => this.click('next', $ev) },
			attrs: { 'aria-label': 'Previous', href: '#' },
			domProps: { innerHTML: '&raquo;' }
		})]
		));

		/*
		children.push(h('span', { class: 'a2-pager-divider' }));
		children.push(h('span', { class: 'a2-pager-title', domProps: { innerHTML: this.title } }));
		*/
		return h('ul', contProps, children);
	}
});


/* Copyright © 2015-2019 Alex Kukhtin. All rights reserved.*/

// 20190604-7498
// services/datamodel.js

(function () {

	"use strict";

	const META = '_meta_';
	const PARENT = '_parent_';
	const SRC = '_src_';
	const PATH = '_path_';
	const ROOT = '_root_';
	const ERRORS = '_errors_';

	const ERR_STR = '#err#';

	const FLAG_VIEW = 1;
	const FLAG_EDIT = 2;
	const FLAG_DELETE = 4;
	const DEFAULT_PAGE_SIZE = 20;

	const platform = require('std:platform');
	const validators = require('std:validators');
	const utils = require('std:utils');
	const log = require('std:log', true);
	const period = require('std:period');

	let __initialized__ = false;

	function loginfo(msg) {
		if (!log) return;
		log.info(msg);
	}

	function logtime(msg, time) {
		if (!log) return;
		log.time(msg, time);
	}

	function defHidden(obj, prop, value, writable) {
		Object.defineProperty(obj, prop, {
			writable: writable || false,
			enumerable: false,
			configurable: false,
			value: value
		});
	}

	function defHiddenGet(obj, prop, get) {
		Object.defineProperty(obj, prop, {
			enumerable: false,
			configurable: false,
			get: get
		});
	}

	function defPropertyGet(trg, prop, get) {
		Object.defineProperty(trg, prop, {
			enumerable: true,
			configurable: true, /* needed */
			get: get
		});
	}

	function ensureType(type, val) {
		if (!utils.isDefined(val))
			val = utils.defaultValue(type);
		if (type === Number) {
			return utils.toNumber(val);
		}
		return val;
	}

	function propFromPath(path) {
		if (!path)
			return '';
		let propIx = path.lastIndexOf('.');
		return path.substring(propIx + 1);
	}

	function defSource(trg, source, prop, parent) {

		let propCtor = trg._meta_.props[prop];
		if (propCtor.type) propCtor = propCtor.type;
		let pathdot = trg._path_ ? trg._path_ + '.' : '';
		let shadow = trg._src_;
		source = source || {};
		if (utils.isObjectExact(propCtor)) {
			//console.warn(`${prop}:${propCtor.len}`);
			if ("type" in propCtor)
				propCtor = propCtor.type;
			else
				throw new Error(`Invalid _meta_ for '${prop}'`);
		}
		switch (propCtor) {
			case Number:
				shadow[prop] = source[prop] || 0;
				break;
			case String:
				shadow[prop] = source[prop] || "";
				break;
			case Boolean:
				shadow[prop] = source[prop] || false;
				break;
			case Date:
				let srcval = source[prop] || null;
				shadow[prop] = srcval ? new Date(srcval) : utils.date.zero();
				break;
			case platform.File:
			case Object:
				shadow[prop] = null;
				break;
			case TMarker: // marker for dynamic property
				let mp = trg._meta_.markerProps[prop];
				shadow[prop] = mp;
				break;
			case period.constructor:
				shadow[prop] = new propCtor(source[prop]);
				break;
			default:
				shadow[prop] = new propCtor(source[prop] || null, pathdot + prop, trg);
				break;
		}
		Object.defineProperty(trg, prop, {
			enumerable: true,
			configurable: true, /* needed */
			get() {
				return this._src_[prop];
			},
			set(val) {
				let eventWasFired = false;
				let skipDirty = prop.startsWith('$$');
				let ctor = this._meta_.props[prop];
				if (ctor.type) ctor = ctor.type;
				val = ensureType(ctor, val);
				if (val === this._src_[prop])
					return;
				let oldVal = this._src_[prop];
				if (!this._lockEvents_) {
					let changingEvent = (this._path_ || 'Root') + '.' + prop + '.changing';
					let ret = this._root_.$emit(changingEvent, this, val, oldVal, prop);
					if (ret === false)
						return;
				}
				if (this._src_[prop] && this._src_[prop].$set) {
					// object
					this._src_[prop].$set(val);
					eventWasFired = true; // already fired
				} else {
					this._src_[prop] = val;
				}
				if (!skipDirty) // skip special properties
					this._root_.$setDirty(true, this._path_);
				if (this._lockEvents_) return; // events locked
				if (eventWasFired) return; // was fired
				let eventName = (this._path_ || 'Root') + '.' + prop + '.change';
				this._root_.$emit(eventName, this, val, oldVal, prop);
			}
		});
	}

	function TMarker() { }

	function createPrimitiveProperties(elem, ctor) {
		const templ = elem._root_.$template;
		if (!templ) return;
		const props = templ._props_;
		if (!props) return;
		let objname = ctor.name;

		if (objname in props) {
			for (let p in props[objname]) {
				let propInfo = props[objname][p];
				if (utils.isPrimitiveCtor(propInfo)) {
					loginfo(`create scalar property: ${objname}.${p}`);
					elem._meta_.props[p] = propInfo;
				} else if (utils.isObjectExact(propInfo)) {
					if (!propInfo.get) { // plain object
						loginfo(`create object property: ${objname}.${p}`);
						elem._meta_.props[p] = TMarker;
						if (!elem._meta_.markerProps)
							elem._meta_.markerProps = {};
						elem._meta_.markerProps[p] = propInfo;
					}
				}
			}
		}
	}

	function createObjProperties(elem, ctor) {
		let templ = elem._root_.$template;
		if (!templ) return;
		let props = templ._props_;
		if (!props) return;
		let objname = ctor.name;
		if (objname in props) {
			for (let p in props[objname]) {
				let propInfo = props[objname][p];
				if (utils.isPrimitiveCtor(propInfo)) {
					continue;
				}
				else if (utils.isFunction(propInfo)) {
					loginfo(`create property: ${objname}.${p}`);
					Object.defineProperty(elem, p, {
						configurable: false,
						enumerable: true,
						get: propInfo
					});
				} else if (utils.isObjectExact(propInfo)) {
					if (propInfo.get) { // has get, maybe set
						loginfo(`create property: ${objname}.${p}`);
						Object.defineProperty(elem, p, {
							configurable: false,
							enumerable: true,
							get: propInfo.get,
							set: propInfo.set
						});
					}
				} else {
					alert('todo: invalid property type');
				}
			}
		}
	}

	function createObject(elem, source, path, parent) {
		const ctorname = elem.constructor.name;
		let startTime = null;
		if (ctorname === 'TRoot')
			startTime = platform.performance.now();
		parent = parent || elem;
		defHidden(elem, SRC, {});
		defHidden(elem, PATH, path || '');
		defHidden(elem, ROOT, parent._root_ || parent);
		defHidden(elem, PARENT, parent);
		defHidden(elem, ERRORS, null, true);
		defHidden(elem, '_lockEvents_', 0, true);
		elem._uiprops_ = {};

		let hasTemplProps = false;
		const templ = elem._root_.$template;
		if (templ && !utils.isEmptyObject(templ._props_))
			hasTemplProps = true;

		if (hasTemplProps)
			createPrimitiveProperties(elem, elem.constructor);

		for (let propName in elem._meta_.props) {
			defSource(elem, source, propName, parent);
		}

		if (hasTemplProps)
			createObjProperties(elem, elem.constructor);

		if (path && path.endsWith(']'))
			elem.$selected = false;

		if (elem._meta_.$items)
			elem.$expanded = false; // tree elem

		defPropertyGet(elem, '$valid', function () {
			if (this._root_._needValidate_)
				this._root_._validateAll_();
			if (this._errors_)
				return false;
			for (var x in this) {
				if (x[0] === '$' || x[0] === '_')
					continue;
				let sx = this[x];
				if (utils.isArray(sx)) {
					for (let i = 0; i < sx.length; i++) {
						let ax = sx[i];
						if (utils.isObject(ax) && '$valid' in ax) {
							if (!ax.$valid)
								return false;
						}
					}
				} else if (utils.isObject(sx) && '$valid' in sx) {
					if (!sx.$valid)
						return false;
				}
			}
			return true;
		});
		defPropertyGet(elem, "$invalid", function () {
			return !this.$valid;
		});

		elem.$errors = function (prop) {
			if (!this) return null;
			let root = this._root_;
			if (!root) return null;
			if (!root._validate_)
				return null;
			let path = `${this._path_}.${prop}`; 
			let arr = root._validate_(this, path, this[prop]);
			if (arr && arr.length === 0) return null;
			return arr;
		};
		
		if (elem._meta_.$group === true) {
			defPropertyGet(elem, "$groupName", function () {
				if (!utils.isDefined(this.$level))
					return ERR_STR;
				// this.constructor.name == objectType;
				const mi = this._root_.__modelInfo.Levels;
				if (mi) {
					const levs = mi[this.constructor.name];
					if (levs && this.$level <= levs.length)
						return this[levs[this.$level - 1]];
				}
				console.error('invalid data for $groupName');
				return ERR_STR;
			});
		}

		if (elem._meta_.$itemType) {
			elem.$setProperty = function (prop, src) {
				let itmPath = path + '.' + prop;
				let ne = new elem._meta_.$itemType(src, itmPath, elem);
				platform.set(this, prop, ne);
				this._root_.$setDirty(true);
				return ne;
			};
		}

		let constructEvent = ctorname + '.construct';
		let _lastCaller = null;
		let propForConstruct = path ? propFromPath(path) : '';
		elem._root_.$emit(constructEvent, elem, propForConstruct);
		if (elem._root_ === elem) {
			// root element
			elem._root_ctor_ = elem.constructor;
			elem.$dirty = false;
			elem._query_ = {};
			// rowcount implementation
			for (var m in elem._meta_.props) {
				let rcp = m + '.$RowCount';
				if (source && rcp in source) {
					let rcv = source[rcp] || 0;
					elem[m].$RowCount = rcv;
				}
			}
			elem._setModelInfo_ = setRootModelInfo;
			elem._findRootModelInfo = findRootModelInfo;
			elem._saveSelections = saveSelections;
			elem._restoreSelections = restoreSelections;
			elem._enableValidate_ = true;
			elem._needValidate_ = false;
			elem._modelLoad_ = (caller) => {
				_lastCaller = caller;
				elem._fireLoad_();
				__initialized__ = true;
			};
			elem._fireLoad_ = () => {
				platform.defer(() => {
					let isRequery = elem.$vm.__isModalRequery();
					elem.$emit('Model.load', elem, _lastCaller, isRequery);
					elem._root_.$setDirty(false);
				});
			};
			defHiddenGet(elem, '$readOnly', isReadOnly);
			defHiddenGet(elem, '$stateReadOnly', isStateReadOnly);
			defHiddenGet(elem, '$isCopy', isModelIsCopy);
			elem._seal_ = seal;
		}
		if (startTime) {
			logtime('create root time:', startTime, false);
		}
		return elem;
	}

	function seal(elem) {
		Object.seal(elem);
		for (let p in elem._meta_.props) {
			let ctor = elem._meta_.props[p];
			if (ctor.type) ctor = ctor.type;
			if (utils.isPrimitiveCtor(ctor)) continue;
			if (ctor === period.constructor) continue;
			let val = elem[p];
			if (utils.isArray(val)) {
				val.forEach(itm => seal(itm));
			} else if (utils.isObjectExact(val)) {
				seal(val);
			}
		}
	}

	function findRootModelInfo() {
		for (let p in this._meta_.props) {
			let x = this[p];
			if (x.$ModelInfo)
				return x.$ModelInfo;
		}
		return null;
	}

	function isReadOnly() {
		if ('__modelInfo' in this) {
			let mi = this.__modelInfo;
			if (utils.isDefined(mi.ReadOnly) && mi.ReadOnly)
				return true;
			if (utils.isDefined(mi.StateReadOnly) && mi.StateReadOnly)
				return true;
		}
		return false;
	}

	function isStateReadOnly() {
		if ('__modelInfo' in this) {
			let mi = this.__modelInfo;
			if (utils.isDefined(mi.StateReadOnly) && mi.StateReadOnly)
				return true;
		}
		return false;
	}

	function isModelIsCopy() {
		if ('__modelInfo' in this) {
			let mi = this.__modelInfo;
			if (utils.isDefined(mi.Copy))
				return mi.Copy;
		}
		return false;
	}

	function createArray(source, path, ctor, arrctor, parent) {
		let arr = new _BaseArray(source ? source.length : 0);
		let dotPath = path + '[]';
		defHidden(arr, '_elem_', ctor);
		defHidden(arr, PATH, path);
		defHidden(arr, PARENT, parent);
		defHidden(arr, ROOT, parent._root_ || parent);
		defPropertyGet(arr, "$valid", function () {
			if (this._errors_)
				return false;
			for (var x of this) {
				if (x._errors_)
					return false;
			}
			return true;
		});
		defPropertyGet(arr, "$invalid", function () {
			return !this.$valid;
		});

		createObjProperties(arr, arrctor);

		let constructEvent = arrctor.name + '.construct';
		arr._root_.$emit(constructEvent, arr);

		if (!source)
			return arr;
		for (let i = 0; i < source.length; i++) {
			arr[i] = new arr._elem_(source[i], dotPath, arr);
			arr[i].$checked = false;
		}
		return arr;
	}

	function _BaseArray(length) {
		let arr = new Array(length || 0);
		addArrayProps(arr);
		return arr;
	}

	//_BaseArray.prototype = Array.prototype;

	function addArrayProps(arr) {

		defineCommonProps(arr);

		arr.$new = function (src) {
			let newElem = new this._elem_(src || null, this._path_ + '[]', this);
			newElem.$checked = false;
			return newElem;
		};

		defPropertyGet(arr, "$selected", function () {
			for (let x of this.$elements) {
				if (x.$selected) {
					return x;
				}
			}
			return undefined;
		});

		defPropertyGet(arr, "$selectedIndex", function () {
			for (let i = 0; i < this.length; i++) {
				if (this[i].$selected) return i;
			}
			return -1;
		});

		defPropertyGet(arr, "$elements", function () {
			function* elems(arr) {
				for (let i = 0; i < arr.length; i++) {
					let val = arr[i];
					yield val;
					if (val.$items) {
						yield* elems(val.$items);
					}
				}
			}
			return elems(this);
		});

		defPropertyGet(arr, "Count", function () {
			return this.length;
		});

		defPropertyGet(arr, "$isEmpty", function () {
			return !this.length;
		});

		defPropertyGet(arr, "$checked", function () {
			return this.filter((el) => el.$checked);
		});

		defPropertyGet(arr, "$hasSelected", function () {
			return !!this.$selected;
		});

		arr.Selected = function (propName) {
			let sel = this.$selected;
			return sel ? sel[propName] : null;
		};

		arr.$isLazy = function () {
			const meta = this.$parent._meta_;
			if (!meta.$lazy) return false;
			let prop = propFromPath(this._path_);
			return meta.$lazy.indexOf(prop) !== -1;
		};

		arr.$load = function () {
			if (!this.$isLazy()) return;
			platform.defer(() => this.$loadLazy());
		};

		arr.$loadLazy = function () {
			return new Promise((resolve, reject) => {
				if (this.$loaded) { resolve(this); return; }
				if (!this.$parent) { resolve(this); return; }
				const meta = this.$parent._meta_;
				if (!meta.$lazy) { resolve(this); return; }
				let prop = propFromPath(this._path_);
				if (!meta.$lazy.indexOf(prop) === -1) { resolve(this); return; }
				this.$vm.$loadLazy(this.$parent, prop).then(() => resolve(this));
			});
		};

		arr.$append = function (src) {
			return this.$insert(src, 'end');
		};

		arr.$prepend = function (src) {
			return this.$insert(src, 'start');
		};

		arr.$insert = function (src, to, current) {
			const that = this;

			function append(src, select) {
				let addingEvent = that._path_ + '[].adding';
				let newElem = that.$new(src);
				// emit adding and check result
				let er = that._root_.$emit(addingEvent, that/*array*/, newElem/*elem*/);
				if (er === false)
					return null; // disabled
				let len = that.length;
				let ne = null;
				let ix;
				switch (to) {
					case 'end':
						len = that.push(newElem);
						ne = that[len - 1]; // maybe newly created reactive element
						break;
					case 'start':
						that.unshift(newElem);
						ne = that[0];
						len = 1; 
						break;
					case 'above':
						ix = that.indexOf(current);
						that.splice(ix, 0, newElem);
						ne = that[ix];
						len = ix + 1;
						break;
					case 'below':
						ix = that.indexOf(current) + 1;
						that.splice(ix, 0, newElem);
						ne = that[ix];
						len = ix + 1;
						break;
				}
				if ('$RowCount' in that) that.$RowCount += 1;
				let eventName = that._path_ + '[].add';
				that._root_.$setDirty(true);
				that._root_.$emit(eventName, that /*array*/, ne /*elem*/, len - 1 /*index*/);
				if (select) {
					ne.$select();
					emitSelect(that, ne);
				}
				// set RowNumber
				if ('$rowNo' in newElem._meta_) {
					let rowNoProp = newElem._meta_.$rowNo;
					for (let i = 0; i < that.length; i++)
						that[i][rowNoProp] = i + 1; // 1-based
				}
				return ne;
			}
			if (utils.isArray(src)) {
				let ra = [];
				let lastElem = null;
				src.forEach(function (elem) {
					lastElem = append(elem, false);
					ra.push(lastElem);
				});
				if (lastElem) {
					// last added element
					lastElem.$select();
				}
				return ra;
			} else
				return append(src, true);

		};

		arr.$empty = function () {
			if (this.$root.isReadOnly)
				return this;
			this.splice(0, this.length);
			if ('$RowCount' in this) this.$RowCount = 0;
			return this;
		};

		arr.$renumberRows = function () {
			if (!this.length) return this;
			let item = this[0];
			// renumber rows
			if ('$rowNo' in item._meta_) {
				let rowNoProp = item._meta_.$rowNo;
				for (let i = 0; i < this.length; i++) {
					this[i][rowNoProp] = i + 1; // 1-based
				}
			}
			return this;
		};

		arr.$sort = function (compare) {
			this.sort(compare);
			this.$renumberRows();
			return this;
		};

		arr.$clearSelected = function () {
			let sel = this.$selected;
			if (!sel) return; // already null
			sel.$selected = false;
			emitSelect(this, null);
			return this;
		};

		arr.$remove = function (item) {
			if (this.$root.isReadOnly)
				return this;
			if (!item)
				return this;
			let index = this.indexOf(item);
			if (index === -1)
				return this;
			this.splice(index, 1);
			if ('$RowCount' in this) this.$RowCount -= 1;
			// EVENT
			let eventName = this._path_ + '[].remove';
			this._root_.$setDirty(true);
			this._root_.$emit(eventName, this /*array*/, item /*elem*/, index);
			if (!this.length) return this;
			if (index >= this.length)
				index -= 1;
			this.$renumberRows();
			if (this.length > index) {
				this[index].$select();
			}
			return this;
		};

		arr.$copy = function (src) {
			if (this.$root.isReadOnly)
				return;
			this.$empty();
			if (utils.isArray(src)) {
				for (let i = 0; i < src.length; i++) {
					this.push(this.$new(src[i]));
				}
			}
			return this;
		};

		arr.__fireChange__ = function (opts) {
			let root = this.$root;
			let itm = this;
			if (opts === 'selected')
				itm = this.$selected;
			root.$emit(this._path_ + '[].change', this, itm);
		};
	}

	function defineCommonProps(obj) {
		defHiddenGet(obj, "$host", function () {
			return this._root_._host_;
		});

		defHiddenGet(obj, "$root", function () {
			return this._root_;
		});

		defHiddenGet(obj, "$parent", function () {
			return this._parent_;
		});

		defHiddenGet(obj, "$vm", function () {
			if (this._root_ && this._root_._host_)
				return this._root_._host_.$viewModel;
			return null;
		});

		defHiddenGet(obj, "$ctrl", function () {
			if (this._root_ && this._root_._host_)
				return this._root_._host_.$ctrl;
			return null;
		});

		obj.$isValid = function (props) {
			return true;
		};
	}

	function defineObject(obj, meta, arrayItem) {
		defHidden(obj.prototype, META, meta);

		obj.prototype.$merge = merge;
		obj.prototype.$empty = empty;
		obj.prototype.$set = setElement;
		obj.prototype.$maxLength = getMaxLength;

		defineCommonProps(obj.prototype);

		defHiddenGet(obj.prototype, "$isNew", function () {
			return !this.$id;
		});

		defHiddenGet(obj.prototype, "$isEmpty", function () {
			return !this.$id;
		});

		defHiddenGet(obj.prototype, "$id", function () {
			let idName = this._meta_.$id;
			if (!idName) {
				let tpname = this.constructor.name;
				throw new Error(tpname + ' object does not have an Id property');
			}
			return this[idName];
		});

		defHiddenGet(obj.prototype, "$id__", function () {
			let idName = this._meta_.$id;
			if (!idName) {
				return undefined;
			}
			return this[idName];
		});

		defHiddenGet(obj.prototype, "$name", function () {
			let nameName = this._meta_.$name;
			if (!nameName) {
				let tpname = this.constructor.name;
				throw new Error(tpname + ' object does not have a Name property');
			}
			return this[nameName];
		});

		if (arrayItem) {
			defArrayItem(obj);
		}

		if (meta.$hasChildren) {
			defHiddenGet(obj.prototype, "$hasChildren", function () {
				let hcName = this._meta_.$hasChildren;
				if (!hcName) return undefined;
				return this[hcName];
			});
		}
		if (meta.$items) {
			defHiddenGet(obj.prototype, "$items", function () {
				let itmsName = this._meta_.$items;
				if (!itmsName) return undefined;
				return this[itmsName];
			});
		}
	}

	function emitSelect(arr, item) {
		let selectEvent = arr._path_ + '[].select';
		let er = arr._root_.$emit(selectEvent, arr/*array*/, item);
	}

	function defArrayItem(elem) {

		elem.prototype.$remove = function () {
			let arr = this._parent_;
			arr.$remove(this);
		};
		elem.prototype.$select = function (root) {
			let arr = root || this._parent_;
			let sel = arr.$selected;
			if (sel === this) return;
			if (sel) sel.$selected = false;
			this.$selected = true;
			emitSelect(arr, this);
			if (this._meta_.$items) {
				// expand all parent items
				let p = this._parent_._parent_;
				while (p) {
					p.$expanded = true;
					p = p._parent_._parent_;
					if (!p || p === this.$root)
						break;
				}
			}
		};
	}

	function emit(event, ...arr) {
		if (this._enableValidate_) {
			if (!this._needValidate_) {
				this._needValidate_ = true;
			}
		}
		loginfo('emit: ' + event);
		let templ = this.$template;
		if (!templ) return;
		let events = templ.events;
		if (!events) return;
		if (event in events) {
			// fire event
			loginfo('handle: ' + event);
			let func = events[event];
			let rv = func.call(this, ...arr);
			if (rv === false)
				loginfo(event + ' returns false');
			return rv;
		}
	}

	function getDelegate(name) {
		let tml = this.$template;
		if (!tml.delegates) {
			console.error('There are no delegates in the template');
			return null;
		}
		if (name in tml.delegates) {
			return tml.delegates[name].bind(this.$root);
		}
		console.error(`Delegate "${name}" not found in the template`);
	}

	function canExecuteCommand(cmd, arg, opts) {
		const tml = this.$template;
		if (!tml) return false;
		if (!tml.commands) return false;
		const cmdf = tml.commands[cmd];
		if (!cmdf) return false;

		const optsCheckValid = opts && opts.validRequired === true;
		const optsCheckRO = opts && opts.checkReadOnly === true;
		const optsCheckArg = opts && opts.checkArgument === true;

		if (optsCheckArg && !arg)
			return false;

		if (cmdf.checkReadOnly === true || optsCheckRO) {
			if (this.$root.$readOnly)
				return false;
		}
		if (cmdf.validRequired === true || optsCheckValid) {
			if (!this.$root.$valid)
				return false;
		}
		if (utils.isFunction(cmdf.canExec)) {
			return cmdf.canExec.call(this, arg);
		} else if (utils.isBoolean(cmdf.canExec)) {
			return cmdf.canExec; // for debugging purposes
		} else if (utils.isDefined(cmdf.canExec)) {
			console.error(`${cmd}.canExec should be a function`);
			return false;
		}
		return true;
	}

	function executeCommand(cmd, arg, confirm, opts) {
		try {
			this._root_._enableValidate_ = false;
			let vm = this.$vm;
			const tml = this.$template;
			if (!tml) return;
			if (!tml.commands) return;
			let cmdf = tml.commands[cmd];
			if (!cmdf) {
				console.error(`Command "${cmd}" not found`);
				return;
			}
			const optConfirm = cmdf.confirm || confirm;
			const optSaveRequired = cmdf.saveRequired || opts && opts.saveRequired;
			const optValidRequired = cmdf.validRequired || opts && opts.validRequired;

			if (optValidRequired && !vm.$data.$valid) return; // not valid

			if (utils.isFunction(cmdf.canExec)) {
				if (!cmdf.canExec.call(this, arg)) return;
			}

			let that = this;
			const doExec = function () {
				const realExec = function () {
					if (utils.isFunction(cmdf))
						return cmdf.call(that, arg);
					else if (utils.isFunction(cmdf.exec))
						return cmdf.exec.call(that, arg);
					else
						console.error($`There is no method 'exec' in command '${cmd}'`);
				};

				if (optConfirm) {
					vm.$confirm(optConfirm).then(realExec);
				} else {
					return realExec();
				}
			};

			if (optSaveRequired && vm.$isDirty)
				vm.$save().then(doExec);
			else
				return doExec();

		} finally {
			this._root_._enableValidate_ = true;
			this._root_._needValidate_ = true;
		}
	}

	function validateImpl(item, path, val, du) {
		if (!item) return null;
		let tml = item._root_.$template;
		if (!tml) return null;
		var vals = tml.validators;
		if (!vals) return null;
		var elemvals = vals[path];
		if (!elemvals) return null;
		return validators.validate(elemvals, item, val, du);
	}

	function saveErrors(item, path, errors) {
		if (!item._errors_ && !errors)
			return; // already null
		else if (!item._errors_ && errors)
			item._errors_ = {}; // new empty object
		if (errors && errors.length > 0)
			item._errors_[path] = errors;
		else if (path in item._errors_)
			delete item._errors_[path];
		if (utils.isEmptyObject(item._errors_))
			item._errors_ = null;
		return errors;
	}

	function validate(item, path, val, ff) {
		if (!item._root_._needValidate_) {
			// already done
			if (!item._errors_)
				return null;
			if (path in item._errors_)
				return item._errors_[path];
			return null;
		}
		let res = validateImpl(item, path, val, ff);
		return saveErrors(item, path, res);
	}

	function* enumData(root, path, name, index) {
		index = index || '';
		if (!path) {
			// scalar value in root
			yield { item: root, val: root[name], ix: index };
			return;
		}
		let sp = path.split('.');
		let currentData = root;
		for (let i = 0; i < sp.length; i++) {
			let last = i === sp.length - 1;
			let prop = sp[i];
			if (prop.endsWith('[]')) {
				// is array
				let pname = prop.substring(0, prop.length - 2);
				if (!(pname in currentData)) {
					console.error(`Invalid validator key. Property '${pname}' not found in '${currentData.constructor.name}'`);
				}
				let objto = currentData[pname];
				if (!objto) continue;
				for (let j = 0; j < objto.length; j++) {
					let arrItem = objto[j];
					if (last) {
						yield { item: arrItem, val: arrItem[name], ix: index + ':' + j };
					} else {
						let newpath = sp.slice(i + 1).join('.');
						yield* enumData(arrItem, newpath, name, index + ':' + j);
					}
				}
				return;
			} else {
				// simple element
				if (!(prop in currentData)) {
					console.error(`Invalid Validator key. property '${prop}' not found in '${currentData.constructor.name}'`);
				}
				let objto = currentData[prop];
				if (last) {
					if (objto)
						yield { item: objto, val: objto[name], ix: index };
					return;
				}
				else {
					currentData = objto;
				}
			}
		}
	}

	// enumerate all data (recursive)
	function* dataForVal(root, path) {
		let ld = path.lastIndexOf('.');
		let dp = '';
		let dn = path;
		if (ld !== -1) {
			dp = path.substring(0, ld);
			dn = path.substring(ld + 1);
		}
		yield* enumData(root, dp, dn, '');
	}

	function validateOneElement(root, path, vals) {
		if (!vals)
			return;
		let errs = [];
		for (let elem of dataForVal(root, path)) {
			let res = validators.validate(vals, elem.item, elem.val);
			saveErrors(elem.item, path, res);
			if (res && res.length) {
				errs.push(...res);
				// elem.ix - array indexes
				// console.dir(elem.ix);
			}

		}
		return errs.length ? errs : null;
	}

	function forceValidateAll() {
		let me = this;
		me._needValidate_ = true;
		var retArr = me._validateAll_(false);
		me._validateAll_(true); // and validate async again
		return retArr;

	}

	function validateAll(force) {
		var me = this;
		if (!me._host_) return;
		if (!me._needValidate_) return;
		me._needValidate_ = false;
		if (force)
			validators.removeWeak();
		var startTime = platform.performance.now();
		let tml = me.$template;
		if (!tml) return;
		let vals = tml.validators;
		if (!vals) return;
		let allerrs = [];
		for (var val in vals) {
			let err1 = validateOneElement(me, val, vals[val]);
			if (err1) {
				allerrs.push({ x: val, e: err1 });
			}
		}
		logtime('validation time:', startTime);
		return allerrs;
		//console.dir(allerrs);
	}

	function setDirty(val, path) {
		if (this.$root.$readOnly)
			return;
		if (path && path.toLowerCase().startsWith('query'))
			return;
		if (isNoDirty(this.$root))
			return;
		// TODO: template.options.skipDirty
		this.$dirty = val;
	}

	function empty() {
		this.$set({});
		return this;
	}

	function setElement(src) {
		if (this.$root.isReadOnly)
			return;
		this.$merge(src);
	}

	function getMaxLength(prop) {
		let m = this._meta_.props;
		if (!m) return undefined;
		let x = m[prop];
		if (utils.isObjectExact(x))
			return x.len;
		return undefined;
	}

	function isSkipMerge(root, prop) {
		let t = root.$template;
		let opts = t && t.options;
		let bo = opts && opts.bindOnce;
		if (!bo) return false;
		return bo.indexOf(prop) !== -1;
	}

	function isNoDirty(root) {
		let t = root.$template;
		let opts = t && t.options;
		return opts && opts.noDirty;
	}

	function saveSelections() {
		let root = this;
		let t = root.$template;
		let opts = t && t.options;
		if (!opts) return;
		let ps = opts.persistSelect;
		if (!ps || !ps.length) return;
		let result = {};
		for (let p of ps) {
			let arr = utils.simpleEval(root, p);
			if (utils.isArray(arr)) {
				result[p] = arr.$selectedIndex;
			}
		}
		return result;
	}


	function restoreSelections(sels) {
		if (!sels) return;
		let root = this;
		for (let p in sels) {
			let arr = utils.simpleEval(root, p);
			let si = sels[p];
			if (utils.isArray(arr) && si >= 0 && si < arr.length) {
				arr[si].$select();
			}
		}
	}

	function merge(src, afterSave, existsOnly) {
		let oldId = this.$id__;
		try {
			if (src === null)
				src = {};
			this._root_._enableValidate_ = false;
			this._lockEvents_ += 1;
			for (var prop in this._meta_.props) {
				if (prop.startsWith('$$')) continue; // always skip
				if (afterSave && isSkipMerge(this._root_, prop)) continue;
				let ctor = this._meta_.props[prop];
				if (ctor.type) ctor = ctor.type;
				let trg = this[prop];
				if (Array.isArray(trg)) {
					if (trg.$loaded)
						trg.$loaded = false; // may be lazy
					trg.$copy(src[prop]);
					// copy rowCount
					if ('$RowCount' in trg) {
						let rcProp = prop + '.$RowCount';
						if (rcProp in src)
							trg.$RowCount = src[rcProp] || 0;
						else
							trg.$RowCount = 0;
					}
					//TODO: try to select old value
				} else {
					if (utils.isDateCtor(ctor)) {
						let dt = src[prop];
						if (!dt)
							platform.set(this, prop, utils.date.zero());
						else
							platform.set(this, prop, new Date(src[prop]));
					} else if (utils.isPrimitiveCtor(ctor)) {
						platform.set(this, prop, src[prop]);
					} else {
						if (existsOnly && !(prop in src))
							continue; // no item in src
						let newsrc = new ctor(src[prop], prop, this);
						platform.set(this, prop, newsrc);
					}
				}
			}
		} finally {
			this._root_._enableValidate_ = true;
			this._root_._needValidate_ = true;
			this._lockEvents_ -= 1;
		}
		let newId = this.$id__;
		let fireChange = false;
		if (utils.isDefined(newId) && utils.isDefined(oldId))
			fireChange = newId !== oldId; // check id, no fire event
		if (fireChange) {
			// emit .change event for entire object
			let eventName = this._path_ + '.change';
			this._root_.$emit(eventName, this.$parent, this, this, propFromPath(this._path_));
		}
	}

	function implementRoot(root, template, ctors) {
		root.prototype.$emit = emit;
		root.prototype.$setDirty = setDirty;
		root.prototype.$defer = platform.defer;
		root.prototype.$merge = merge;
		root.prototype.$template = template;
		root.prototype._exec_ = executeCommand;
		root.prototype._canExec_ = canExecuteCommand;
		root.prototype._delegate_ = getDelegate;
		root.prototype._validate_ = validate;
		root.prototype._validateAll_ = validateAll;
		root.prototype.$forceValidate = forceValidateAll;
		// props cache for t.construct
		if (!template) return;
		let xProp = {};
		for (let p in template.properties) {
			let px = p.split('.'); // Type.Prop
			if (px.length !== 2) {
				console.error(`invalid propery name '${p}'`);
				continue;
			}
			let typeName = px[0];
			let propName = px[1];
			let pv = template.properties[p]; // property value
			if (!(typeName in xProp))
				xProp[typeName] = {};
			xProp[typeName][propName] = pv;
		}
		template._props_ = xProp;
        /*
        platform.defer(() => {
            console.dir('end init');
        });
        */
	}

	function checkPeriod(obj) {
		let f = obj.Filter;
		if (!f) return obj;
		if (!('Period' in f))
			return obj;
		let p = f.Period;
		if (period.like(p))
			f.Period = new period.constructor(p);
		return obj;
	}

	function setRootModelInfo(item, data) {
		if (!data.$ModelInfo) return;
		let elem = item;
		for (let p in data.$ModelInfo) {
			if (!elem) elem = this[p];
			elem.$ModelInfo = checkPeriod(data.$ModelInfo[p]);
			return; // first element only
		}
	}

	function setModelInfo(root, info, rawData) {
		// may be default
		root.__modelInfo = info ? info : {
			PageSize: DEFAULT_PAGE_SIZE
		};
		let mi = rawData.$ModelInfo;
		if (!mi) return;
		for (let p in mi) {
			root[p].$ModelInfo = checkPeriod(mi[p]);
		}
	}

	app.modules['std:datamodel'] = {
		createObject: createObject,
		createArray: createArray,
		defineObject: defineObject,
		implementRoot: implementRoot,
		setModelInfo: setModelInfo,
		enumData: enumData
	};
})();


// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180319-7135
// dataservice.js
(function () {

	let http = require('std:http');
	let utils = require('std:utils');

	function post(url, data, raw) {
		return http.post(url, data, raw);
	}

	function get(url) {
		return http.get(url);
	}

	app.modules['std:dataservice'] = {
		post: post,
		get: get
	};
})();




// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190402-7475
/*components/include.js*/

(function () {

	const http = require('std:http');
	const urlTools = require('std:url');
	const eventBus = require('std:eventBus');

	function _destroyElement(el) {
		let fc = el.firstElementChild;
		if (!fc) return;
		let vue = fc.__vue__;
		// Maybe collectionView created the wrapper!
		if (vue && !vue.$marker)
			vue = vue.$parent;
		if (vue && vue.$marker()) {
			vue.$destroy();
		}
	}

	Vue.component('include', {
		template: '<div :class="implClass"></div>',
		props: {
			src: String,
			cssClass: String,
			needReload: Boolean,
			insideDialog: Boolean,
			done: Function
		},
		data() {
			return {
				loading: true,
				currentUrl: '',
				_needReload: true
			};
		},
		methods: {
			loaded(ok) {
				this.loading = false;
				if (this.insideDialog)
					eventBus.$emit('modalCreated', this);
				if (this.done)
					this.done();
			},
			requery() {
				if (this.currentUrl) {
					// Do not set loading. Avoid blinking
					this.__destroy();
					http.load(this.currentUrl, this.$el).then(this.loaded);
				}
			},
			__destroy() {
				//console.warn('include has been destroyed');
				_destroyElement(this.$el);
			},
			modalRequery() {
				if (!this.insideDialog) return;
				setTimeout(() => {
					this.requery();
				}, 1);
			}
		},
		computed: {
			implClass() {
				return `include ${this.cssClass || ''} ${this.loading ? 'loading' : ''}`;
			}
		},
		mounted() {
			//console.warn('include has been mounted');
			if (this.src) {
				this.currentUrl = this.src;
				http.load(this.src, this.$el).then(this.loaded);
			}
		},
		destroyed() {
			this.__destroy(); // and for dialogs too
		},
		watch: {
			src: function (newUrl, oldUrl) {
				if (this.insideDialog) {
					// Dialog. No need to reload always.
					this.currentUrl = newUrl;
				}
				else if (newUrl.split('?')[0] === oldUrl.split('?')[0]) {
					// Only the search has changed. No need to reload.
					this.currentUrl = newUrl;
				}
				else if (urlTools.idChangedOnly(newUrl, oldUrl)) {
					// Id has changed after save. No need to reload.
					this.currentUrl = newUrl;
				} else if (urlTools.idOrCopyChanged(newUrl, oldUrl)) {
					// Id has changed after save. No need to reload.
					this.currentUrl = newUrl;
				}
				else {
					this.loading = true; // hides the current view
					this.currentUrl = newUrl;
					this.__destroy();
					http.load(newUrl, this.$el).then(this.loaded);
				}
			},
			needReload(val) {
				// works like a trigger
				if (val) this.requery();
			}
		}
	});


	Vue.component('a2-include', {
		template: '<div class="a2-include"></div>',
		props: {
			source: String,
			arg: undefined
		},
		data() {
			return {
				needLoad: 0
			};
		},
		methods: {
			__destroy() {
				//console.warn('include has been destroyed');
				_destroyElement(this.$el);
			},
			loaded() {
			},
			makeUrl() {
				let arg = this.arg || '0';
				return urlTools.combine('_page', this.source, arg);
			},
			load() {
				let url = this.makeUrl();
				this.__destroy();
				http.load(url, this.$el).then(this.loaded);
			}
		},
		watch: {
			source(newVal, oldVal) {
				//console.warn(`source changed ${newVal}, ${oldVal}`);
				this.needLoad += 1;
			},
			arg(newVal, oldVal) {
				//console.warn(`arg changed ${newVal}, ${oldVal}`);
				this.needLoad += 1;
			},
			needLoad() {
				//console.warn(`load iteration: ${this.needLoad}`);
				this.load();
			}
		},
		mounted() {
			if (this.source) {
				this.currentUrl = this.makeUrl(this.source);
				http.load(this.currentUrl, this.$el).then(this.loaded);
			}
		},
		destroyed() {
			this.__destroy(); // and for dialogs too
		}
	});
})();
// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190305-7456
// components/modal.js


(function () {

	const eventBus = require('std:eventBus');
	const locale = window.$$locale;
	const utils = require('std:utils');

	const modalTemplate = `
<div class="modal-window" @keydown.tab="tabPress" :class="mwClass">
	<include v-if="isInclude" class="modal-body" :src="dialog.url" :done="loaded" :inside-dialog="true"></include>
	<div v-else class="modal-body">
		<div class="modal-header" v-drag-window><span v-text="title"></span><button ref='btnclose' class="btnclose" @click.prevent="modalClose(false)">&#x2715;</button></div>
		<div :class="bodyClass">
			<i v-if="hasIcon" :class="iconClass" />
			<div class="modal-body-content">
				<div v-html="messageText()" />
				<ul v-if="hasList" class="modal-error-list">
					<li v-for="(itm, ix) in dialog.list" :key="ix" v-text="itm"/>
				</ul>
			</div>
		</div>
		<div class="modal-footer">
			<button class="btn btn-default" v-for="(btn, index) in buttons"  :key="index" @click.prevent="modalClose(btn.result)" v-text="btn.text"/>
		</div>
	</div>
</div>
`;

	const setWidthComponent = {
		inserted(el, binding) {
			// TODO: width or cssClass???
			let mw = el.closest('.modal-window');
			if (mw) {
				if (binding.value.width)
					mw.style.width = binding.value.width;
				let cssClass = binding.value.cssClass;
				switch (cssClass) {
					case 'modal-large':
						mw.style.width = '800px'; // from less
						break;
					case 'modal-small':
						mw.style.width = '300px'; // from less
						break;
				}
			}
		}
	};

	const dragDialogDirective = {
		inserted(el, binding) {

			const mw = el.closest('.modal-window');
			if (!mw)
				return;
			const opts = {
				down: false,
				init: { x: 0, y: 0, cx: 0, cy: 0 },
				offset: { x: 0, y: 0 }
			};

			function onMouseDown(event) {
				opts.down = true;
				opts.offset.x = event.pageX;
				opts.offset.y = event.pageY;
				const cs = window.getComputedStyle(mw);
				opts.init.x = Number.parseFloat(cs.marginLeft);
				opts.init.y = Number.parseFloat(cs.marginTop);
				opts.init.cx = Number.parseFloat(cs.width);
				opts.init.cy = Number.parseFloat(cs.height);
				document.addEventListener('mouseup', onRelease, false);
				document.addEventListener('mousemove', onMouseMove, false);
			}

			function onRelease(event) {
				opts.down = false;
				document.removeEventListener('mouseup', onRelease);
				document.removeEventListener('mousemove', onMouseMove);
			}

			function onMouseMove(event) {
				if (!opts.down)
					return;
				let dx = event.pageX - opts.offset.x;
				let dy = event.pageY - opts.offset.y;
				let mx = opts.init.x + dx;
				let my = opts.init.y + dy;
				// fit
				let maxX = window.innerWidth - opts.init.cx;
				let maxY = window.innerHeight - opts.init.cy;
				if (my < 0) my = 0;
				if (mx < 0) mx = 0;
				if (mx > maxX) mx = maxX;
				//if (my > maxY) my = maxY; // any value available
				//console.warn(`dx:${dx}, dy:${dy}, mx:${mx}, my:${my}, cx:${opts.init.cx}`);
				mw.style.marginLeft = mx + 'px';
				mw.style.marginTop = my + 'px';
			}

			el.addEventListener('mousedown', onMouseDown, false);
		}
	};

	Vue.directive('drag-window', dragDialogDirective);

	Vue.directive('modal-width', setWidthComponent);

	const modalComponent = {
		template: modalTemplate,
		props: {
			dialog: Object
		},
		data() {
			// always need a new instance of function (modal stack)
			return {
				modalCreated: false,
				keyUpHandler: function (event) {
					// escape
					if (event.which === 27) {
						eventBus.$emit('modalClose', false);
						event.stopPropagation();
						event.preventDefault();
					}
				}
			};
		},
		methods: {
			modalClose(result) {
				eventBus.$emit('modalClose', result);
			},
			loaded() {
				// include loading is complete
			},
			messageText() {
				return utils.text.sanitize(this.dialog.message);
			},
			tabPress(event) {
				function createThisElems() {
					let qs = document.querySelectorAll('.modal-body [tabindex]');
					let ea = [];
					for (let i = 0; i < qs.length; i++) {
						//TODO: check visibilty!
						ea.push({ el: qs[i], ti: +qs[i].getAttribute('tabindex') });
					}
					ea = ea.sort((a, b) => a.ti > b.ti);
					//console.dir(ea);
					return ea;
				}


				if (this._tabElems === undefined) {
					this._tabElems = createThisElems();
				}
				if (!this._tabElems || !this._tabElems.length)
					return;
				let back = event.shiftKey;
				let lastItm = this._tabElems.length - 1;
				let maxIndex = this._tabElems[lastItm].ti;
				let aElem = document.activeElement;
				let ti = +aElem.getAttribute("tabindex");
				//console.warn(`ti: ${ti}, maxIndex: ${maxIndex}, back: ${back}`);
				if (ti === 0) {
					event.preventDefault();
					return;
				}
				if (back) {
					if (ti === 1) {
						event.preventDefault();
						this._tabElems[lastItm].el.focus();
					}
				} else {
					if (ti === maxIndex) {
						event.preventDefault();
						this._tabElems[0].el.focus();
					}
				}
			},
			__modalRequery() {
				alert('requery');
			}
		},
		computed: {
			isInclude: function () {
				return !!this.dialog.url;
			},
			mwClass() {
				return this.modalCreated ? 'loaded' : null;
			},
			hasIcon() {
				return !!this.dialog.style;
			},
			title: function () {
				// todo localization
				if (this.dialog.title)
					return this.dialog.title;
				return this.dialog.style === 'confirm' ? locale.$Confirm :
					this.dialog.style === 'info' ? locale.$Message : locale.$Error;
			},
			bodyClass() {
				return 'modal-body ' + (this.dialog.style || '');
			},
			iconClass() {
				let ico = this.dialog.style;
				if (ico === 'info')
					ico = 'info-blue';
				return "ico ico-" + ico;
			},
			hasList() {
				return this.dialog.list && this.dialog.list.length;
			},
			buttons: function () {
				//console.warn(this.dialog.style);
				let okText = this.dialog.okText || locale.$Ok;
				let cancelText = this.dialog.cancelText || locale.$Cancel;
				if (this.dialog.buttons)
					return this.dialog.buttons;
				else if (this.dialog.style === 'alert')
					return [{ text: okText, result: false, tabindex: 1 }];
				else if (this.dialog.style === 'alert-ok') {
					this.dialog.style = 'alert';
					return [{ text: okText, result: true, tabindex: 1 }];
				}
				else if (this.dialog.style === 'info')
					return [{ text: okText, result: false, tabindex:1 }];
				return [
					{ text: okText, result: true, tabindex:2 },
					{ text: cancelText, result: false, tabindex:1 }
				];
			}
		},
		created() {
			document.addEventListener('keyup', this.keyUpHandler);
			if (document.activeElement)
				document.activeElement.blur();
		},
		mounted() {
			setTimeout(() => {
				this.modalCreated = true;
			}, 50); // same as shell
		},
		destroyed() {
			document.removeEventListener('keyup', this.keyUpHandler);
		}
	};

	app.components['std:modal'] = modalComponent;
})();
// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190610-7499
// components/toastr.js


(function () {

	const locale = window.$$locale;
	const eventBus = require('std:eventBus');

	const toastTemplate = `
<li class="toast" :class="toast.style">
	<i class="ico" :class="icoCssClass"></i>
	<span v-text="toast.text" />
</li>
`;

	const toastrTemplate = `
<div class="toastr-stack" >
	<transition-group name="list" tag="ul">
		<a2-toast v-for="(t, k) in items":toast="t" :key="t.$index"></a2-toast>
	</transition-group>
</div>
`;

	/*
	{{toast}}
		<li class="toast success">
			<i class="ico ico-check"></i><span>i am the toast 1 (11)</span>
		</li>
		<li class="toast warning">
			<i class="ico ico-warning-outline"></i><span>i am the toast warning (test for bundle)</span>
		</li>
		<li class="toast info">
			<i class="ico ico-info-outline"></i><span>Документ сохранен успешно и записан в базу данных!</span>
		</li>
		<li class="toast danger">
			<i class="ico ico-error-outline-nocolor"></i><span>Документ сохранен c ошибкой. Проверьте все, что можно</span>
		</li>
	 */

	const toastComponent = {
		template: toastTemplate,
		props: {
			toast: Object
		},
		computed: {
			icoCssClass() {
				switch (this.toast.style) {
					case 'success' : return 'ico-check';
					case 'danger':
					case 'error':
						return 'ico-error-outline-nocolor';
					case 'warning': return 'ico-warning-outline';
					case 'info': return 'ico-info-outline';
				}
				return 'ico-dot';
			}
		}
	};

	const toastrComponent = {
		template: toastrTemplate,
		components: {
			'a2-toast': toastComponent
		},
		props: {
		},
		data() {
			return {
				items: [],
				currentIndex: 0
			};
		},
		methods: {
			showToast(toast) {
				toast.$index = ++this.currentIndex;
				this.items.unshift(toast);

				setTimeout(() => {
					this.removeToast(toast.$index);
				}, 2000);
			},
			removeToast(tstIndex) {
				let ix = this.items.findIndex(x => x.$index === tstIndex);
				if (ix === -1) return;
				this.items.splice(ix, 1);
			}
		},
		created() {
			eventBus.$on('toast', this.showToast);
		}
	};

	app.components['std:toastr'] = toastrComponent;
})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20181108-7350
// standalone/controller.js

(function () {

	const eventBus = require('std:eventBus');
	const utils = require('std:utils');
	const dataservice = require('std:dataservice');
	const urltools = require('std:url');
	const log = require('std:log');
	const locale = window.$$locale;
	const modelInfo = require('std:modelInfo');

	let __updateStartTime = 0;
	let __createStartTime = 0;

	function makeErrors(errs) {
		let ra = [];
		for (let x of errs) {
			for (let y of x.e) {
				ra.push(y.msg);
			}
		}
		return ra.length ? ra : null;
	}

	function __runDialog(url, arg, query, cb) {
		return new Promise(function (resolve, reject) {
			const dlgData = { promise: null, data: arg, query: query };
			eventBus.$emit('modal', url, dlgData);
			dlgData.promise.then(function (result) {
				if (cb)
					cb(result);
				resolve(result);
			});
		});
	}

	const standalone = Vue.extend({
		// inDialog: Boolean (in derived class)
		// pageTitle: String (in derived class)
		data() {
			return {
				__init__: true,
				__baseUrl__: '',
				__baseQuery__: {},
				__requestsCount__: 0,
				$$currentTab: '' /*for bootstrap tab*/
			};
		},

		computed: {
			$baseUrl() {
				return this.$data.__baseUrl__;
			},
			$baseQuery() {
				return this.$data.__baseQuery__;
			},
			$indirectUrl() {
				return this.$data.__modelInfo.__indirectUrl__ || '';
			},
			$query() {
				return this.$data._query_;
			},
			$isDirty() {
				return this.$data.$dirty;
			},
			$isPristine() {
				return !this.$data.$dirty;
			},
			$isLoading() {
				return this.$data.__requestsCount__ > 0;
			},
			$modelInfo() {
				return this.$data.__modelInfo;
			},
			$canSave() {
				return this.$isDirty && !this.$isLoading;
			}
		},
		methods: {
			$exec(cmd, arg, confirm, opts) {
				if (this.$isReadOnly(opts)) return;
				const root = this.$data;
				root._exec_(cmd, arg, confirm, opts);
			},

			$isReadOnly(opts) {
				return opts && opts.checkReadOnly && this.$data.$readOnly;
			},

			$canExecute(cmd, arg, opts) {
				if (this.$isReadOnly(opts))
					return false;
				let root = this.$data;
				return root._canExec_(cmd, arg, opts);
			},

			$format(value, dataType, hideZeros) {
				if (!dataType) return value;
				return utils.format(value, dataType, { hideZeros: hideZeros });
			},

			$save(opts) {
				if (this.$data.$readOnly)
					return;
				let self = this;
				let root = window.$$rootUrl;
				let url = root + '/data/save';
				let urlToSave = this.$indirectUrl || this.$baseUrl;
				const isCopy = this.$data.$isCopy;
				return new Promise(function (resolve, reject) {
					let jsonData = utils.toJson({ baseUrl: urlToSave, data: self.$data });
					let wasNew = self.$baseUrl.indexOf('/new') !== -1;
					dataservice.post(url, jsonData).then(function (data) {
						self.$data.$merge(data, true);
						self.$data.$emit('Model.saved', self.$data);
						self.$data.$setDirty(false);
						// data is a full model. Resolve requires only single element.
						let dataToResolve;
						let newId;
						for (let p in data) {
							// always first element in the result
							dataToResolve = data[p];
							newId = self.$data[p].$id; // new element
							if (dataToResolve)
								break;
						}
						if (wasNew && newId) {
							// assign the new id to the __baseUrl__
							self.$data.__baseUrl__ = urltools.replaceSegment(self.$data.__baseUrl__, newId);
						} else if (isCopy) {
							// and in the __baseUrl__
							self.$data.__baseUrl__ = urltools.replaceSegment(self.$data.__baseUrl__, newId, 'edit');
						}
						resolve(dataToResolve); // single element (raw data)
					}).catch(function (msg) {
						alert(msg);
					});
				});
			},

			$invoke(cmd, data, base) {
				let self = this;
				let root = window.$$rootUrl;
				let url = root + '/data/invoke';
				let baseUrl = self.$indirectUrl || self.$baseUrl;
				if (base)
					baseUrl = urltools.combine('_page', base, 'index', 0);
				return new Promise(function (resolve, reject) {
					var jsonData = utils.toJson({ cmd: cmd, baseUrl: baseUrl, data: data });
					dataservice.post(url, jsonData).then(function (data) {
						if (utils.isObject(data)) {
							resolve(data);
						} else {
							throw new Error('Invalid response type for $invoke');
						}
					}).catch(function (msg) {
						alert(msg);
					});
				});
			},

			$asyncValid(cmd, data) {
				const vm = this;
				const cache = vm.__asyncCache__;
				const djson = JSON.stringify(data);
				let val = cache[cmd];
				if (!val) {
					val = { data: '', result: null };
					cache[cmd] = val;
				}
				if (val.data === djson) {
					return val.result;
				}
				val.data = djson;
				return new Promise(function (resolve, reject) {
					Vue.nextTick(() => {
						vm.$invoke(cmd, data).then((result) => {
							val.result = result.Result.Value;
							resolve(val.result);
						});
					});
				});
			},

			$load(id) {
				let self = this;
				let root = window.$$rootUrl;
				let url = root + '/data/load';
				let dat = self.$data;
				return new Promise(function (resolve, reject) {
					let dataToQuery = { baseUrl: urltools.combine(self.$baseUrl, id) };
					let jsonData = utils.toJson(dataToQuery);
					dataservice.post(url, jsonData).then(function (data) {
						if (utils.isObject(data)) {
							dat.$merge(data);
							dat._setModelInfo_(undefined, data);
							dat._fireLoad_();
							resolve(dat);
						} else {
							throw new Error('Invalid response type for load');
						}
					}).catch(function (msg) {
						alert(msg);
					});
				});
			},

			$reload(args) {
				//console.dir('$reload was called for' + this.$baseUrl);
				//debugger;
				let self = this;
				if (utils.isArray(args) && args.$isLazy()) {
					// reload lazy
					let propIx = args._path_.lastIndexOf('.');
					let prop = args._path_.substring(propIx + 1);
					args.$loaded = false; // reload
					return self.$loadLazy(args.$parent, prop);
				}
				let root = window.$$rootUrl;
				let url = root + '/data/reload';
				let dat = self.$data;

				let mi = args ? modelInfo.get(args.$ModelInfo) : null;
				if (!args && !mi) {
					// try to get first $ModelInfo
					let modInfo = this.$data._findRootModelInfo();
					if (modInfo) {
						mi = modelInfo.get(modInfo);
					}
				}

				return new Promise(function (resolve, reject) {
					let dataToQuery = { baseUrl: urltools.replaceUrlQuery(self.$baseUrl, mi) };
					if (utils.isDefined(dat.Query)) {
						// special element -> use url
						dataToQuery.baseUrl = urltools.replaceUrlQuery(self.$baseUrl, dat.Query);
						let newUrl = urltools.replaceUrlQuery(null/*current*/, dat.Query);
						window.history.replaceState(null, null, newUrl);
					}
					let jsonData = utils.toJson(dataToQuery);
					dataservice.post(url, jsonData).then(function (data) {
						if (utils.isObject(data)) {
							dat.$merge(data);
							dat._setModelInfo_(undefined, data);
							dat._fireLoad_();
							resolve(dat);
						} else {
							throw new Error('Invalid response type for $reload');
						}
					}).catch(function (msg) {
						alert(msg);
					});
				});
			},

			$remove(item, confirm) {
				if (this.$data.$readOnly)
					return;
				if (!confirm)
					item.$remove();
				else
					this.$confirm(confirm).then(() => item.$remove());
			},


			$dbRemove(elem, confirm) {
				if (!elem)
					return;
				let id = elem.$id;
				let lazy = elem.$parent.$isLazy ? elem.$parent.$isLazy() : false;
				let root = window.$$rootUrl;
				const self = this;

				function lastProperty(path) {
					let pos = path.lastIndexOf('.');
					if (pos === -1)
						return undefined;
					return path.substring(pos + 1);
				}

				function dbRemove() {
					let postUrl = root + '/data/dbRemove';
					let jsonObj = { baseUrl: self.$baseUrl, id: id };
					if (lazy) {
						jsonObj.prop = lastProperty(elem.$parent._path_);
					}
					let jsonData = utils.toJson(jsonObj);
					dataservice.post(postUrl, jsonData).then(function (data) {
						elem.$remove(); // without confirm
					}).catch(function (msg) {
						alert(msg);
					});
				}
				if (confirm) {
					this.$confirm(confirm).then(function () {
						dbRemove();
					});
				} else {
					dbRemove();
				}
			},


			$loadLazy(elem, propName) {
				let self = this,
					root = window.$$rootUrl,
					url = root + '/data/loadlazy',
					selfMi = elem[propName].$ModelInfo,
					parentMi = elem.$parent.$ModelInfo;

				// HACK. inherit filter from parent
				/*
				if (parentMi && parentMi.Filter) {
					if (!selfMi)
						selfMi = parentMi;
					else
						selfMi.Filter = parentMi.Filter;
				}
				*/

				let mi = modelInfo.get(selfMi);
				let xQuery = urltools.parseUrlAndQuery(self.$baseUrl, mi);
				let newUrl = xQuery.url + urltools.makeQueryString(mi);
				//console.dir(newUrl);
				//let jsonData = utils.toJson({ baseUrl: urltools.replaceUrlQuery(self.$baseUrl, mi), id: elem.$id, prop: propName });
				let jsonData = utils.toJson({ baseUrl: newUrl, id: elem.$id, prop: propName });

				return new Promise(function (resolve, reject) {
					let arr = elem[propName];
					if (arr.$loaded) {
						resolve(arr);
						return;
					}
					dataservice.post(url, jsonData).then(function (data) {
						if (propName in data) {
							arr.$empty();
							for (let el of data[propName])
								arr.push(arr.$new(el));
							let rcName = propName + '.$RowCount';
							if (rcName in data) {
								arr.$RowCount = data[rcName];
							}
							arr._root_._setModelInfo_(arr, data);
						}
						resolve(arr);
					}).catch(function (msg) {
						alert(msg);
					});
					arr.$loaded = true;
				});
			},

			$delegate(name) {
				const root = this.$data;
				return root._delegate_(name);
			},

			$attachment(url, arg, opts) {
				const root = window.$$rootUrl;
				let cmd = opts && opts.export ? 'export' : 'show';
				let id = arg;
				if (arg && utils.isObject(arg))
					id = utils.getStringId(arg);
				let attUrl = urltools.combine(root, 'attachment', cmd, id);
				let qry = { base: url };
				attUrl = attUrl + urltools.makeQueryString(qry);
				if (opts && opts.newWindow)
					window.open(attUrl, '_blank');
				else
					window.location.assign(attUrl);
			},

			$showDialog(url, arg, query) {
				return __runDialog(url, arg, query);
			},

			$modalClose(result) {
				eventBus.$emit('modalClose', result);
			},

			$modalSaveAndClose(result, opts) {
				if (this.$isDirty) {
					const root = this.$data;
					if (opts && opts.validRequired && root.$invalid) {
						let errs = makeErrors(root.$forceValidate());
						//console.dir(errs);
						alert(locale.$MakeValidFirst, undefined, errs);
						return;
					}
					this.$save().then((result) => eventBus.$emit('modalClose', result));
				}
				else
					eventBus.$emit('modalClose', result);
			},


			__beginRequest() {
				this.$data.__requestsCount__ += 1;
			},
			__endRequest() {
				this.$data.__requestsCount__ -= 1;
			},
			__doInit__() {
				const root = this.$data;
				if (!root._modelLoad_) return;
				root._modelLoad_();
				root._seal_(root);
			},
			_cwChange(args) {
				this.$reload(args);
			}
		},
		created() {
			let out = { caller: null };
			eventBus.$emit('registerData', this, out);

			eventBus.$on('beginRequest', this.__beginRequest);
			eventBus.$on('endRequest', this.__endRequest);

			this.__asyncCache__ = {};
			this.__currentToken__ = window.app.nextToken();
			log.time('create time:', __createStartTime, false);

			this.$on('cwChange', this._cwChange);
		},
		beforeDestroy() {
		},
		destroyed() {
			//console.dir('base.js has been destroyed');
			eventBus.$emit('registerData', null);
			eventBus.$off('beginRequest', this.__beginRequest);
			eventBus.$off('endRequest', this.__endRequest);
		},
		beforeUpdate() {
			__updateStartTime = performance.now();
		},
		beforeCreate() {
			__createStartTime = performance.now();
		},
		updated() {
			log.time('update time:', __updateStartTime, false);
		}
	});

	standalone.init = function (vm, baseUrl, callback) {
		vm.$data.__baseUrl__ = urltools.combine('_page', baseUrl);

		vm.$data._host_ = {
			$viewModel: vm
		};

		vm.__doInit__();

		if (callback)
			callback.call(vm);
	};

	app.components['standaloneController'] = standalone;
})();
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20181108-7350
// standalone/shell.js

(function () {

	const eventBus = require('std:eventBus');
	const modal = component('std:modal');
	const toastr = component('std:toastr');
	const urlTools = require('std:url');
	const utils = require('std:utils');
	const locale = window.$$locale;


	const a2MainView = {
		template: `
<div class="main-view">
	<div class="modal-wrapper" v-for="dlg in modals">
		<a2-modal :dialog="dlg"></a2-modal>
	</div>
	<div class="fade" :class="{show: hasModals, 'modal-backdrop': hasModals}"/>
	<a2-toastr></a2-toastr>
</div>`,
		components: {
			'a2-modal': modal,
			'a2-toastr': toastr
		},
		props: {
		},
		data() {
			return {
				requestsCount: 0,
				modals: []
			};
		},
		computed: {
			hasModals() { return this.modals.length > 0; }
		},
		created() {

			let me = this;
			eventBus.$on('beginRequest', function () {
				if (me.hasModals)
					return;
				me.requestsCount += 1;
			});
			eventBus.$on('endRequest', function () {
				if (me.hasModals)
					return;
				me.requestsCount -= 1;
			});

			eventBus.$on('modal', function (modal, prms) {
				let id = utils.getStringId(prms ? prms.data : null);
				let raw = prms && prms.raw;
				let root = window.$$rootUrl;
				let url = urlTools.combine(root, '/model/dialog', modal, id);
				if (raw)
					url = urlTools.combine(root, modal, id);
				//url = store.replaceUrlQuery(url, prms.query);  // TODO: убрать store????
				let dlg = { title: "dialog", url: url, prms: prms.data };
				dlg.promise = new Promise(function (resolve, reject) {
					dlg.resolve = resolve;
				});
				prms.promise = dlg.promise;
				me.modals.push(dlg);
			});


			eventBus.$on('modalClose', function (result) {
				let dlg = me.modals.pop();
				if (result)
					dlg.resolve(result);
			});

			eventBus.$on('modalCloseAll', function () {
				while (me.modals.length) {
					let dlg = me.modals.pop();
					dlg.resolve(false);
				}
			});

			eventBus.$on('confirm', function (prms) {
				let dlg = prms.data;
				dlg.promise = new Promise(function (resolve) {
					dlg.resolve = resolve;
				});
				prms.promise = dlg.promise;
				me.modals.push(dlg);
			});

		}
	};

	new Vue({
		el: "#shell",
		components: {
			'a2-main-view': a2MainView
		},
		data() {
			return {
			};
		},
		created() {
		}
	});
})();