(async function(w, d){

	/**
	 * Implements communication with a remote server.
	 * Class contain requests caching control. Active caching control reduces server load,
	 * but may show user outdate data.
	 * @class
	 * @param {string} url: API gateway URL
	 * @param {number} requests caching time as ms (if not set or 0 - no cache)
	 */
	class Api {
		#url = '';

		#cacheLifeTimeMs = 0;
		#dataMap = new Map();

		constructor(url, cacheLifeTimeMs = 0) {
			this.#url = url;
			this.#cacheLifeTimeMs = cacheLifeTimeMs;
		}

		request(params){
			const queryStr = (Object.keys(params) ? '?' + (new URLSearchParams(params)).toString() : '');

			if(this.#dataMap.has(queryStr)){
				return Promise.resolve(this.#dataMap.get(queryStr)?.data);
			}
			return new Promise((resolve, reject) => {
				fetch(this.#url + queryStr, {
					method: 'GET',
					mode: 'no-cors',
					cache: 'no-cache',
					credentials: 'same-origin',
					headers: { 'Content-Type': 'application/json'},
					redirect: 'follow',
					referrerPolicy: 'no-referrer'
				})
					.then((response) => response.json())
					.then((data) => {
						this.#dataMap.set(queryStr, {
							data: data,
							countDown: (() => {setTimeout(() => {
								this.#dataMap.delete(queryStr);
							}, this.#cacheLifeTimeMs)})()
						});
						resolve(data);
					})
					.catch((e) => {
						reject(e);
					});
			});
		}
	}

	/**
	 * Implements controls a pagination block component.
	 * @class
	 * @param {DOMElement} btnPrev: button DOM element
	 * @param {DOMElement} btnNext: button DOM element
	 */
	class Pagination {
		#btnPrev = null;
		#btnNext = null;

		constructor(ops) {
			this.#btnPrev = ops.btnPrev;
			this.#btnNext = ops.btnNext;
		}

		#getBtn(type = 'next'){
			let btn = (type === 'next') ? this.#btnNext : this.#btnPrev;
			if(btn === null) return false;
			return btn;
		}

		clickEvent(type = 'next', callback){
			const btn = this.#getBtn(type);
			if(!btn) return false;

			btn.addEventListener('click', (e) => {
				e.preventDefault();
				callback(type);
			});
		}

		btnDisable(type, disabled = false){
			const btn = this.#getBtn(type);
			if(!btn) return false;

			if(disabled === true){
				btn.classList.add('disabled')
			}
			else {
				btn.classList.remove('disabled')
			}

			btn.disabled = disabled;
			btn.setAttribute('aria-disabled', disabled);

			if(disabled === true){
				btn.setAttribute('tabindex', -1);
			}
			else {
				if(type === 'prev') btn.setAttribute('tabindex', 2);
				else btn.setAttribute('tabindex', 3);
			}
		}
	}

	/**
	 * Implements controls a preloader overlay component.
	 * @class
	 * @param {DOMElement} preloader: div DOM element with spinner
	 */
	class Preloader{
		#preloader = null;

		constructor(preloader) {
			this.#preloader = preloader;
		}

		show(){
			this.#preloader.classList.remove('d-none');
		}

		hide() {
			this.#preloader.classList.add('d-none');
		}
	}

	/**
	 * Implements controls a table body component with data presentation.
	 * @class
	 * @param {DOMElement} table: table body DOM element
	 */
	class Table{
		#table = null;

		constructor(table) {
			this.#table = table;
		}

		update(items){
			this.#table.innerHTML = '';
			for(let item of items) {
				let row =  `<tr>` +
					`<th scope="row">${item?.id}</th>` +
					`<td>${item?.title}</td>` +
					`<td>${item?.price}</td>` +
					`<td>${item?.quantity}</td>` +
					`</tr>`;
				this.#table.insertAdjacentHTML('beforeend', row);
			}
		}
	}

	/**
	 * Implements controls a dropdown list with count of items appearing in a table.
	 * @class
	 * @param {DOMElement} dropdown: select DOM element
	 * @param {array} limits: array of varians of items count showing in table per page
	 * @param {function} onChange: callback function (fires when select DOM element would be init or change)
	 */
	class Limits{
		#dropdown = null;
		#onChange = () => {};
		#limits = [];

		constructor(dropdown, limits, onChange) {
			this.#dropdown = dropdown;
			this.#limits = limits;
			this.#limits.sort((a, b) => a - b);

			this.#onChange = onChange;
			this.listenChange();

			this.#draw();
		}

		#draw(){
			let i = 0;
			for(let limit of this.#limits){
				let option = d.createElement('option');
				option.text = limit;
				option.value = limit;
				if(i === 0) {
					option.selected = 'selected';
					this.#onChange(limit);
				}
				this.#dropdown.add(option, i);
				i++;
			}
		}

		listenChange(){
			this.#dropdown.addEventListener('change', (e) => this.#onChange(e.target.value));
		}
	}

	/**
	 * Class App uses as main start point of the SPA.
	 * @class
	 * @param {string} apiUrl: HTTP API gateway,
	 * @param {string} btnPrevId: html button ID for "prev" button pagination functionality,
	 * @param {string} btnNextId: html button ID for "next" button pagination functionality,
	 * @param {string} tableId: html table body ID,
	 * @param {string} preloaderId: html preloader overlap element ID,
	 * @param {string} limitsId: html selector ID of on page show elements limit
	 */
	class App {
		#state = {
			limit: 5,
			page: 0,
			pages: 0
		};

		#api = null;
		#table = null;
		#preloader = null;
		#limits = null;

		#btnPrevId = null;
		#btnNextId = null;

		constructor(ops) {
			// Table
			this.#table = new Table(d.getElementById(ops?.tableId));

			// Preloader
			this.#preloader = new Preloader(d.getElementById(ops?.preloaderId));

			// Pagination
			this.#btnPrevId = ops.btnPrevId;
			this.#btnNextId = ops.btnNextId;

			this.pagination = new Pagination({
				btnPrev: d.getElementById(this.#btnPrevId) ? d.getElementById(this.#btnPrevId) : null,
				btnNext: d.getElementById(this.#btnNextId) ? d.getElementById(this.#btnNextId) : null
			});

			this.pagination.clickEvent('prev', (type) => {
				if(this.#getState('page') === 0) {
					return false;
				}
				this.#setState('page', this.#getState('page') - 1);
				this.#getData();
			});

			this.pagination.clickEvent('next', (type) => {
				this.#setState('page', this.#getState('page') + 1);

				if(this.#getState('page') === this.#getState('pages')) {
					this.#setState('page', this.#getState('page') - 1);
					return false;
				}

				this.#getData();
			});

			// API
			this.#api = new Api(ops.apiUrl, 10000);

			// Limits
			this.#limits = new Limits(d.getElementById(ops?.limitsId), [5, 10], (value) => {
				this.#setState('page', 0);
				this.#setState('limit', value);
				this.#getData();
			});
		}
		
		#uiPaginationRefresh(){
			if(this.#getState('page') === 0){
				this.pagination.btnDisable('prev', true);
			}
			else {
				this.pagination.btnDisable('prev', false);
			}

			if(this.#getState('page') === this.#getState('pages') - 1){
				this.pagination.btnDisable('next', true);
			}
			else {
				this.pagination.btnDisable('next', false);
			}
		}

		#uiTableRefresh(items){
			this.#table.update(items);
		}

		#uiRefresh(items = []){
			this.#uiPaginationRefresh();
			this.#uiTableRefresh(items);
		}

		#getData(){
			this.#preloader.show();
			this.#api.request({l: this.#getState('limit'), p: this.#getState('page')})
				.then((data) => {
					this.#setState('page', data?.page);
					this.#setState('pages', data?.pages);
					this.#uiRefresh(data?.items);
				})
				.catch((e) => {
					console.error(e);
					alert('Some network error occurred.');
				})
				.finally(() => {
					this.#preloader.hide();
				});
		}

		#getState(param){
			return this.#state[param];
		}

		#setState(param, value){
			this.#state[param] = value;
		}
	}

	// START APP
	new App({
		apiUrl: '/api.php',
		btnPrevId: 'js-btn-prev',
		btnNextId: 'js-btn-next',
		tableId: 'js-table',
		preloaderId: 'js-preloader',
		limitsId: 'js-limits'
	});
})(window, document);