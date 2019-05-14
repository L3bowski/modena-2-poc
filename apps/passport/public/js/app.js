(function() {
	const postData = (url = '', data = {}) => {
	    return fetch(url, {
	        method: 'POST', // *GET, POST, PUT, DELETE, etc.
	        mode: 'cors', // no-cors, cors, *same-origin
	        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
	        credentials: 'same-origin', // include, *same-origin, omit
	        headers: {
	            'Content-Type': 'application/json'
	        },
	        redirect: 'follow', // manual, *follow, error
	        referrer: 'no-referrer', // no-referrer, *client
	        body: JSON.stringify(data), // body data type must match "Content-Type" header
	    })
	    .then(response => response.json());
	};

	window['logIn'] = () => {
		postData('/login', {username: 'admin', password: 'admin'})
		  .then(data => console.log(JSON.stringify(data)))
		  .catch(error => console.error(error));
	}
	window['logOut'] = () => {
		postData('/logout')
		  .then(data => console.log(JSON.stringify(data)))
		  .catch(error => console.error(error));
	}
})();