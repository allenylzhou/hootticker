/*
 * Copyright 2011 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This script serves as an intermediary between oauth2.html and oauth2.js.

// Get all query string parameters from the original URL.
var url = decodeURIComponent(window.location.href.match(/&from=([^&]+)/)[1]);
var index = url.indexOf('?');
if (index > -1) {
  url = url.substring(0, index);
}

// Derive adapter name from URI and then finish the process.
var adapterName = OAuth2.lookupAdapterName(url);
var finisher = new OAuth2(adapterName, OAuth2.FINISH);


// var searchString = window.location.search.substring(1);
// var searchParams = searchString.split('&');


// var i, searchParam;
// for (i = 0; i < searchParams.length; i++) {
// 	searchParam = searchParams[i].split('=');
// 	if ('code' == searchParam[0]) {
// 		debugger;
// 		$.ajax({
// 			url: "https://hootsuite.com/oauth2/token",
// 			type: "POST",
// 			data: {
// 				"grant_type":"authorization_code",
// 				"code": searchParam[1],
// 				"redirect_uri":"https://hootsuite.com/robots.txt"
// 			},
// 			beforeSend: function(xhr) {
// 				xhr.setRequestHeader("Authorization", "Basic " + btoa("Cc6zW32Acp5cc64lPvGB:ZdQEgP2vW9j4W64pvWQrbdCmDEAEEcFqhXLC6hNf"));
// 			}
// 		});
// 	}
// }