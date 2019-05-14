var FORCE_PROD_ADDIN = true; // TRUE == ADDIN BEHAVES LIKE IN PROD
var FORCE_PROD_API = true; // TRUE == ADDIN BEHAVES NORMALLY BUT USES PROD FOR API CALLS (will have no effect if app is run with test shim)

var PROD_ID_LIST = [
  "eekjikilggkdpjklgpnceahcioemadje",
  "eglnfcpgpojcdmbecbcodfmlamhiknpb",
  "gffjonifjkapchkehopefpbfdepcdjpp",
  "cgaokphfclaihjlldacdibniajokggkh"
];

var GLOBAL = window.GLOBAL;

if (GLOBAL === undefined) {
  GLOBAL = {};
}

if (GLOBAL.URI === undefined) {
  GLOBAL.URI = {};
}

if (GLOBAL.SERVER === undefined) {
  GLOBAL.SERVER = {};
}

if (GLOBAL.BUNDLE === undefined) {
  GLOBAL.BUNDLE = {};
}

// *****************************************************************************

GLOBAL.URI.GMAIL = "https://mail.google.com/";

GLOBAL.SERVER.DEV = "https://www.linkedin.com/";
GLOBAL.SERVER.PROD = "https://www.linkedin.com/";
GLOBAL.SERVER.SFDC_DEV = "https://linkedin--1337b.cs18.my.salesforce.com/";
GLOBAL.SERVER.SFDC_PROD = "https://linkedin.my.salesforce.com/";

// Environment specific
if (FORCE_PROD_ADDIN || PROD_ID_LIST.indexOf(chrome.runtime.id) !== -1) {
  GLOBAL.IS_PROD_ADDIN = true;
} else {
  console.log("SN4X IS IN DEV MODE >", chrome.runtime.id);
  GLOBAL.IS_PROD_ADDIN = true;
}

GLOBAL.SERVER.SFDC = GLOBAL.IS_PROD_ADDIN
  ? GLOBAL.SERVER.SFDC_PROD
  : GLOBAL.SERVER.SFDC_DEV;
GLOBAL.SERVER.APP = GLOBAL.IS_PROD_ADDIN
  ? GLOBAL.SERVER.PROD
  : GLOBAL.SERVER.DEV;
GLOBAL.SERVER.UI = GLOBAL.SERVER.APP + "sales/";

GLOBAL.BUNDLE.JS =
  GLOBAL.SERVER.UI +
  "assets/%2Flighthouse-frontend%2Fjavascripts%2Fintegrations%2FSN4X%2Fcompiled%2Fbundle.min.js";
GLOBAL.BUNDLE.CSS =
  GLOBAL.SERVER.UI +
  "assets/%2Flighthouse-frontend%2Fconcat%2Flfg-plugin" +
  (GLOBAL.IS_PROD_ADDIN ? "-prod" : "") +
  "_en_US.css";
GLOBAL.DEPENDENCIES = [
  GLOBAL.SERVER.APP +
    "sales/assets/%2Flighthouse-frontend%2Fconcat%2Flfg-profile-view_en_US.css",
  GLOBAL.SERVER.APP +
    "sales/assets/%2Flighthouse-frontend%2Fconcat%2Flfg-tasks_en_US.css",
  GLOBAL.SERVER.APP +
    "sales/assets/%2Flighthouse-frontend%2Fconcat%2Flfg-common_en_US.css",
  GLOBAL.BUNDLE.CSS,
  GLOBAL.BUNDLE.JS,
  GLOBAL.SERVER.APP +
    "sales/assets/%2Flighthouse-frontend%2Fjavascripts%2Fintegrations%2FSN4X%2Fpublic%2Fjquery-ui.min.js"
];
GLOBAL.LOADING_TIMEOUT_MS = 20000;

if (FORCE_PROD_API && chrome.runtime.id !== "chrome_test_shim") {
  GLOBAL.SERVER.SFDC = GLOBAL.SERVER.SFDC_PROD;
  GLOBAL.SERVER.APP = GLOBAL.SERVER.PROD;
}
