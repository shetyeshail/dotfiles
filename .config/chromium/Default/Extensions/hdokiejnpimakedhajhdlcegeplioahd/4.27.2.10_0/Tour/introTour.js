var IntroTour=function(e,t,r,n,o,s){"use strict";var u,i;function c(){i.laterThisTour(),s.save(i.getOptions())}function a(){i.neverThisTour(),s.save(i.getOptions())}function T(){i.takeThisTour(),s.save(i.getOptions())}function l(){s.save(null)}function b(){i.makeLaterNowTours(),s.save(i.getOptions())}function v(){u&&(u.closeCurrentStep(),u.unSubscribeAction("later"),u.unSubscribeAction("never"),u.unSubscribeAction("start"),u.unSubscribeAction("close"),u.cleanup(),u=null)}function A(e){o.get(o.CLEAR_DATA).subscribeFirst(function(){e&&e.cleanup&&e.cleanup()})}function f(r){var n=this,l;v(),s.migrateOldPrefs(),r?(l=(i=new e).getAvailableTour(r))&&(u=new t(l),A(n),u.startFlow(r)):(i=new e(s.retrieve()),s.save(i.getOptions()),(l=i.getAvailableTour())?((u=new t(l)).subscribeToAction("later",c),u.subscribeToAction("never",a),u.subscribeToAction("start",T),u.subscribeToAction("close",v),A(n),u.startFlow(r)):o.get(o.INTRO_TOURS_LOADED).publish())}return{start:f,cleanup:v,neverThisTour:a,laterThisTour:c,takeThisTour:T,resetAllTours:l,makeLaterNowTours:b}}(IntroTourQueue,IntroTourFlow,IntroTourData,LPProxy,Topics,IntroTourPreferences);
//# sourceMappingURL=sourcemaps/Tour/introTour.js.map