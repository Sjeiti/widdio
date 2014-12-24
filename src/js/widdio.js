/**
 * A simple HTML5 video player
 * @summary A simple HTML5 video player
 * @namespace widdio
 * @version 2.0.26
 * @license http://www.opensource.org/licenses/mit-license.php, http://www.gnu.org/licenses/gpl.html
 * @author Ron Valstar (http://ronvalstar.nl/)
 * @copyright (c) 2014 Ron Valstar
 */
/* possibly handy properties functions for oVideo:

	controls		Boolean

	volume			float (0,1)
	muted			Boolean

	canPlayType()	String :: "probably" "maybe"
	load()
	play()
	pause()

	networkState	int :: NETWORK_EMPTY NETWORK_IDLE NETWORK_LOADING NETWORK_NO_SOURCE

	loop			Boolean
	autoplay		Boolean
	paused			Boolean
	ended			Boolean
	preload			int

	readyState		int :: HAVE_NOTHING HAVE_METADATA HAVE_CURRENT_DATA HAVE_FUTURE_DATA HAVE_ENOUGH_DATA

	startTime		int
	duration		int || NaN
	currentTime		int

	seekable		[object TimeRanges]
	buffered		[object TimeRanges]
	played			[object TimeRanges]

*/
if (window.widdio===undefined) window.widdio = (function(document,window,undefined) {
	'use strict';

	var createDiv = createElement.bind(undefined,undefined)
		//
		,sId = 'Widdio'
		,sVersion = '2.0.16'
		,sCopyright = 'Copyright (c) 2010-2015 Ron Valstar'
		//
		,mBody
		,mHead
		//
		,iScreenW
		,iScreenH
		,fScreenAspectRatio
		//
		,fn = function(){}
		//
		,aWiddioObj = []
		//
		,fnFullscreen
		,fnFullscreenExit
		,mFullscreenLast
		//
		,oSVGIcons = {"contract":"M2 18h12v12l-4.321-4.321-6.313 6.313-3.359-3.359 6.313-6.313zM25.679 22.321l6.313 6.313-3.359 3.359-6.313-6.313-4.321 4.321v-12h12zM30 14h-12v-12l4.321 4.321 6.313-6.313 3.359 3.359-6.313 6.313zM9.679 6.321l4.321-4.321v12h-12l4.321-4.321-6.313-6.313 3.359-3.359z","expand":"M32 0v12l-4.321-4.321-6.625 6.625-3.359-3.359 6.625-6.625-4.321-4.321zM7.679 4.321l6.625 6.625-3.359 3.359-6.625-6.625-4.321 4.321v-12h12zM27.679 24.321l4.321-4.321v12h-12l4.321-4.321-6.625-6.625 3.359-3.359zM14.304 21.054l-6.625 6.625 4.321 4.321h-12v-12l4.321 4.321 6.625-6.625z","pause":"M4 4h10v24h-10zM18 4h10v24h-10z","play":"M6 4l20 12-20 12z","stop":"M4 4h24v24h-24z","volume-high":"M27.814 28.814c-0.384 0-0.768-0.146-1.061-0.439-0.586-0.586-0.586-1.535 0-2.121 2.739-2.739 4.247-6.38 4.247-10.253s-1.508-7.514-4.247-10.253c-0.586-0.586-0.586-1.536 0-2.121s1.536-0.586 2.121 0c3.305 3.305 5.126 7.7 5.126 12.374s-1.82 9.069-5.126 12.374c-0.293 0.293-0.677 0.439-1.061 0.439zM22.485 25.985c-0.384 0-0.768-0.146-1.061-0.439-0.586-0.586-0.586-1.535 0-2.121 4.094-4.094 4.094-10.755 0-14.849-0.586-0.586-0.586-1.536 0-2.121s1.536-0.586 2.121 0c2.55 2.55 3.954 5.94 3.954 9.546s-1.404 6.996-3.954 9.546c-0.293 0.293-0.677 0.439-1.061 0.439zM17.157 23.157c-0.384 0-0.768-0.146-1.061-0.439-0.586-0.586-0.586-1.535 0-2.121 2.534-2.534 2.534-6.658 0-9.192-0.586-0.586-0.586-1.536 0-2.121s1.535-0.586 2.121 0c3.704 3.704 3.704 9.731 0 13.435-0.293 0.293-0.677 0.439-1.061 0.439zM12.542 2.458c0.802-0.802 1.458-0.53 1.458 0.604v25.875c0 1.134-0.656 1.406-1.458 0.604l-7.542-7.542h-5v-12h5l7.542-7.542z","volume-medium":"M22.485 25.985c-0.384 0-0.768-0.146-1.061-0.439-0.586-0.586-0.586-1.535 0-2.121 4.094-4.094 4.094-10.755 0-14.849-0.586-0.586-0.586-1.536 0-2.121s1.536-0.586 2.121 0c2.55 2.55 3.954 5.94 3.954 9.546s-1.404 6.996-3.954 9.546c-0.293 0.293-0.677 0.439-1.061 0.439zM17.157 23.157c-0.384 0-0.768-0.146-1.061-0.439-0.586-0.586-0.586-1.535 0-2.121 2.534-2.534 2.534-6.658 0-9.192-0.586-0.586-0.586-1.536 0-2.121s1.535-0.586 2.121 0c3.704 3.704 3.704 9.731 0 13.435-0.293 0.293-0.677 0.439-1.061 0.439zM12.542 2.458c0.802-0.802 1.458-0.53 1.458 0.604v25.875c0 1.134-0.656 1.406-1.458 0.604l-7.542-7.542h-5v-12h5l7.542-7.542z","volume-mute":"M12.542 2.458c0.802-0.802 1.458-0.53 1.458 0.604v25.875c0 1.134-0.656 1.406-1.458 0.604l-7.542-7.542h-5v-12h5l7.542-7.542z"}
		,sCSS = '.widdio{position:relative;color:#fff;background-color:#333;overflow:hidden;max-width:100%;max-height:100%;line-height:100%;box-sizing:border-box}.widdio.original,.widdio.fixed{max-width:none;max-height:none}.widdio.fullscreen{position:fixed;left:0;top:0;width:100%!important;height:100%!important;z-index:2147483647}.widdio *,.widdio *:before,.widdio *:after{box-sizing:inherit}.widdio .wrap{position:relative;width:100%;height:100%}.widdio video{max-height:100%;width:auto;height:100%;position:absolute;left:50%;top:49.9%;-webkit-transform:translateX(-50%) translateY(-50%);-moz-transform:translateX(-50%) translateY(-50%);-ms-transform:translateX(-50%) translateY(-50%);-o-transform:translateX(-50%) translateY(-50%);transform:translateX(-50%) translateY(-50%)}.widdio video .vertical{max-width:100%;max-heigth:none}.widdio.nobars video{min-width:100%;min-height:100%;width:auto;height:auto}.widdio.bars video{max-height:none;width:100%;max-width:100%;height:auto}.widdio.bars.barsflipped video{max-height:100%;width:auto;max-width:none;height:100%}.widdio.controls-under{padding-bottom:30px}.widdio .controls{position:absolute;left:0;bottom:0;width:100%;height:30px;overflow:hidden;background-color:rgba(0,0,0,0.4);display:table}.widdio .controls>*{position:relative;height:100%;padding:0;overflow:hidden;display:table-cell;vertical-align:middle;cursor:pointer;text-align:center}.widdio .icon{height:30px;width:30px;padding:4px}.widdio .icon svg{width:100%;height:100%}.widdio .icon path{-webkit-transition:fill 300ms linear;-moz-transition:fill 300ms linear;-ms-transition:fill 300ms linear;-o-transition:fill 300ms linear;transition:fill 300ms linear;fill:#fff}.widdio .icon:hover path{fill:#d0ffea}.widdio .icon.play path.pause{display:none}.widdio .icon.pause path.play{display:none}.widdio .icon.mute path.volume-mute{display:none}.widdio .icon.muted path.volume-medium{display:none}.widdio .icon.fullscreen path.contract{display:none}.widdio .icon.center{position:absolute;left:50%;top:50%;width:70px;height:70px;-webkit-transform:translateX(-50%) translateY(-50%);-moz-transform:translateX(-50%) translateY(-50%);-ms-transform:translateX(-50%) translateY(-50%);-o-transform:translateX(-50%) translateY(-50%);transform:translateX(-50%) translateY(-50%);padding:0}.widdio .gutter{position:relative}.widdio .buffer{position:absolute;left:0;top:0;height:10px;background-color:rgba(255,255,255,0.2)}.widdio .bar{position:relative;width:1px;height:10px;background-color:#fff}.widdio .bar>*{position:absolute;left:0;top:0}.widdio .time{width:90px;font-weight:bold;font-size:12px}.widdio .fadeOut{visibility:hidden;opacity:0;transition:visibility 0s 1000ms, opacity 1000ms linear;-webkit-transition:visibility 0s 1000ms, opacity 1000ms linear}'
		//
		,sClassnameHide = 'fadeOut'
		,sClassnameBarsFlipped = 'barsflipped'
		//
		,sUIPlaypause = 'playpause'
		,sUIScrub = 'scrub'
		,sUIStop = 'stop'
		,sUIMute = 'mute'
		,sUIVolume = 'volume'
		,sUIFullscreen = 'fullscreen'
		,sUICenter = 'center'
		,sUITime = 'time'
		,sControlsOver = 'over'
		,sControlsUnder = 'under'
		,sScaleAspectRatio = 'aspectratio'
		,sScaleBars = 'bars'
		,sScaleNobars = 'nobars'
		,sSizeOriginal = 'original'
		,sSizeFixed = 'fixed'
		,sSizeDynamic = 'dynamic'
		,sSizeFullscreen = 'fullscreen'
		,sStateStart = 'start'
		,sStatePlaying = 'playing'
		,sStatePaused = 'paused'
		,sStateEnded = 'ended'
		,oWiddio = {
			/**
			 * @prop {boolean} widdio.playOne play only one video at a time
			 */
			playOne:			true // play only one video at a time
			// constants
			/** @const {string} widdio.PLAYPAUSE=playpause */
			,PLAYPAUSE:			sUIPlaypause
			/** @const {string} widdio.SCRUB=scrub */
			,SCRUB:				sUIScrub
			,STOP:				sUIStop
			,MUTE:				sUIMute
			,VOLUME:			sUIVolume
			,FULLSCREEN:		sUIFullscreen
			,CENTER:			sUICenter
			,TIME:				sUITime
			,CONTROLS_OVER:		sControlsOver
			,CONTROLS_UNDER:	sControlsUnder
			,SCALE_ASPECTRATIO:	sScaleAspectRatio
			,SCALE_BARS:		sScaleBars
			,SCALE_NOBARS:		sScaleNobars
			,SIZE_ORIGINAL:		sSizeOriginal
			,SIZE_FIXED:		sSizeFixed
			,SIZE_DYNAMIC:		sSizeDynamic
			,SIZE_FULLSCREEN:	sSizeFullscreen
			,STATE_START:		sStateStart
			,STATE_PLAYING:		sStatePlaying
			,STATE_PAUSED:		sStatePaused
			,STATE_ENDED:		sStateEnded
			//
			,defaults: {
				 debug:	false
				,fullscreen: false
				,scaleMode:				sScaleBars
				,fullscreenScaleMode:	sScaleNobars
				,size:					sSizeOriginal
				,width:		null
				,height:	null
				,fadeVolumeTime: 0

				// controls
				,controls: [sUIPlaypause,sUIScrub,sUITime,sUIMute,sUICenter]
				,controlsPosition: sControlsOver
				,controlsFadeTime: 500
				,controlsFadeWhenPaused: false

				// event functions
				,stateChange: null
			}
		}
	;

	/**
	 * Main initialisation
	 */
	(function(){
		initPolyfills();
		initVariables();
		initEvents();
		initView();
	})();

	/**
	 * Initialise polyfills
	 */
	function initPolyfills(){
		// Production steps of ECMA-262, Edition 5, 15.4.4.18
		// Reference: http://es5.github.io/#x15.4.4.18
		if (!Array.prototype.forEach) {
			Array.prototype.forEach = function (callback,thisArg) {
				var T, k;
				if (this===null) {
					throw new TypeError(' this is null or not defined');
				}
				var O = Object(this);
				var len = O.length >>> 0;
				if (typeof callback!=="function") {
					throw new TypeError(callback + ' is not a function');
				}
				if (arguments.length>1) {
					T = thisArg;
				}
				k = 0;
				while (k<len) {
					var kValue;
					if (k in O) {
						kValue = O[k];
						callback.call(T,kValue,k,O);
					}
					k++;
				}
			};
		}
		// overload classList.add
		(function(m){
			if (m.classList) {
				m.classList.add('a','b');
				if (!m.classList.contains('b')) {
					var tokenProto = DOMTokenList.prototype
						,fnAdd = tokenProto.add
						,fnRem = tokenProto.remove;
					tokenProto.add =	function(){ for (var i=0,l=arguments.length;i<l;i++) fnAdd.call(this,arguments[i]); };
					tokenProto.remove =	function(){ for (var i=0,l=arguments.length;i<l;i++) fnRem.call(this,arguments[i]); };
				}
			}
		})(document.createElement('div'));
	}

	/**
	 * Initialise variables
	 */
	function initVariables(){
		mBody = document.body;
		mHead = document.head;
		fnFullscreen = mBody.requestFullScreen||mBody.webkitRequestFullScreen||mBody.mozRequestFullScreen||fn;//||mBody.msRequestFullScreen;
		fnFullscreenExit = (document.exitFullScreen||document.webkitCancelFullScreen||document.mozCancelFullScreen||fn).bind(document);//||mBody.msRequestFullScreen;
	}

	/**
	 * Initialise events
	 */
	function initEvents(){
		['fullscreenchange','webkitfullscreenchange','mozfullscreenchange'].forEach(function(event){
			document.addEventListener(event,handleFullscreenChange);
		});
		window.addEventListener('resize',handleWindowResize);
	}

	/**
	 * Initialise view
	 */
	function initView(){
		handleWindowResize();
	}

	/**
	 *
	 * @param {NodeList|HTMLVideoElement} video
	 * @param {object} options
	 * @returns {object[]|object} List of video objects
	 */
	function initVideo(video,options){
		var isVideoElement = video.constructor===HTMLVideoElement
			,oWiddioInstance;
		if (isVideoElement) video = [video];
		for (var i=0,l=video.length;i<l;i++) {
			oWiddioInstance = instance(video[i],options);
			aWiddioObj.push(oWiddioInstance);
		}
		return isVideoElement?oWiddioInstance:aWiddioObj;
	}

	/**
	 * Handles fullscreenchange event
	 * @param {Event} e
	 */
	function handleFullscreenChange(e){
		var mTarget = e.target.classList?e.target:mFullscreenLast
			,oWiddioInstance = getWiddio(mTarget)
			,bFullscreen = isFullscreen()
		;
		if (oWiddioInstance) { // &&mTarget.classList because FF target is document, not widdio
			if (bFullscreen) {
				mTarget.classList.add(sSizeFullscreen);
			} else {
				mTarget.classList.remove(sSizeFullscreen);
				oWiddioInstance.resize();
			}
		}
	}

	/**
	 * Handles the window resize event
	 */
	function handleWindowResize() {
		try{
			iScreenW = window.innerWidth;
			iScreenH = window.innerHeight;
			fScreenAspectRatio = iScreenW/iScreenH;
		}catch(err){}
		for (var i=0,l=aWiddioObj.length;i<l;i++) {
			aWiddioObj[i].resize();
		}
	}

	/**
	 * Tests if document is fullscreen
	 * @returns {boolean}
	 */
	function isFullscreen(){
		return document.isFullScreen||document.mozFullScreen||document.webkitIsFullScreen;
	}

	/**
	 * Play a video, pause all others.
	 * @param {HTMLVideoElement} video
	 */
	function playOne(video){
		for (var i=0,l=aWiddioObj.length;i<l;i++) {
			var oVideo = aWiddioObj[i];
			if (oVideo.video!==video) oVideo.pause();
		}
	}

	/**
	 * Get the widdio API for a video..
	 * @param {HTMLVideoElement} video
	 * @returns {Object}
	 */
	function getWiddio(video){
		var oReturn;
		if (video.constructor!==HTMLVideoElement) video = video.querySelector('video');
		for (var i=0,l=aWiddioObj.length;i<l;i++) {
			var oVideo = aWiddioObj[i];
			if (oVideo.video===video) oReturn = oVideo;
		}
		return oReturn;
	}


	//############################################################################################################
	//#############################################################################################################
	//##############################################################################################################
	//###############################################################################################################
	//################################################################################################################
// todo controlsFadeWhenPaused on for mobile
	/**
	 * Factory method for video instances
	 * @param {HTMLVideoElement} video
	 * @param {Object} settings
	 * @param {Object} settings.fullscreen Start in fake-fullscreen
	 * @param {Object} settings.scaleMode How to scale
	 * @param {Object} settings.fullscreenScaleMode How to scale in fullscreen
	 * @param {Object} settings.size How to size the video
	 * @param {Object} settings.width Width of Widdio
	 * @param {Object} settings.height Height of Widdio
	 * @param {Object} settings.fadeVolumeTime Milliseconds volume fadeout when loading a new video
	 * @param {Object} settings.controls Determines the order and number of interface elements
	 * @param {Object} settings.controlsPosition Position of the user interface
	 * @param {Object} settings.controlsFadeTime Length fadeout user interface
	 * @param {Object} settings.controlsFadeWhenPaused User interface fades out when paused
	 * @param {Object} settings.stateChange A callback function for when the video state changes, the new state is parsed
	 * @memberof widdio
	 * @public
});
	 * @returns {widdioInstance}
	 */
	function instance(video,settings) {
		var pause = togglePlay.bind(undefined,false)
			,showScrub = function(){}
			,showBuffer = showScrub
			//
			,oSettings = extend(extend({},settings),oWiddio.defaults)
			,sSettingsSize = oSettings.size
			,bSizeFullscreen = sSettingsSize===sSizeFullscreen
			,bSizeFixed = sSettingsSize===sSizeFixed
			,bSizeOriginal = sSettingsSize===sSizeOriginal
			,bSizeDynamic = sSettingsSize===sSizeDynamic
			,sSettingsControlsPosition = oSettings.controlsPosition
			,bControlsOver = sSettingsControlsPosition===sControlsOver
			,sSettingsScaleMode = oSettings.scaleMode
			,bScaleModeBars = sSettingsScaleMode===sScaleBars
			//,bScaleModeNoBars = sSettingsScaleMode===sScaleNobars
			,bScaleModeAspectRatio = sSettingsScaleMode===sScaleAspectRatio
			//
			,iVideoW
			,iVideoH
			,fVideoAspectRatio
			//
			,iWiddioW
			,iWiddioH // excluding controls bar
			,fWiddioAspectRatio = 16/9
			//
			,mVideo = video
			,mParent = mVideo.parentNode
			,mWiddio
			,mWrap
			,mControls
			,mCnPlayPause
			,mCnStop
			,mCnVolume
			,mCnMute
			,mCnFullscreen
			,mCnScrub
			,mControlsBar
			,mControlsBuffer
			,mCnTime
			,mCenter
			//
			,sVideoID = mVideo.getAttribute('id')
			//
			,axSources
			//
			,iCenterFadeID = 0
			,iControlsFadeID = 0
			,iCenterFadeTime = 1500
			//
			,iControlsHeight
			//
			,sState = sStateStart
			//
			,oInstance = {
				 video:			mVideo
				,widdio:		undefined
				,id:			sVideoID
				,play:			play
				,stop:			stop
				,toggle:		togglePlay.bind(undefined,undefined)//function(){togglePlay();}
				,pause:			pause
				,sound:			toggleSound
				,fullscreen:	toggleFullscreen
				,resize:		resize
				,isPlaying:		isPlaying
				,getState:		getState
				,toString:		function(){ return '['+[sId,sVersion,sCopyright].join(' ')+' #'+sVideoID+']'; }
			}
		;

		(function init() {
			initInstVariables();
			initInstAPI();
			initInstEvents();
			initInstView();
		})();

		function  initInstVariables(){
			if (!sVideoID) {
				sVideoID = btoa(Math.random()).replace(/^\d*|[^\w]/g,'');
				mVideo.setAttribute('id',sVideoID);
			}
			//
			// width and height for fixed size
			var iVidAtrW = mVideo.getAttribute('width');
			var iVidAtrH = mVideo.getAttribute('height');
//			if (bSizeOriginal) {
				mVideo.removeAttribute('width');
				mVideo.removeAttribute('height');
//			}
//			console.log('oSettings',oSettings); // log
			iVideoW = mVideo.offsetWidth;
			iVideoH = mVideo.offsetHeight;
			if (oSettings.width===null)	oSettings.width =  !!iVidAtrW?parseInt(iVidAtrW):iVideoW;
			if (oSettings.height===null)oSettings.height = !!iVidAtrH?parseInt(iVidAtrH):iVideoH;
			//
			// prepare video
			axSources = mVideo.querySelectorAll('source');
			mVideo.controls = false;
			//
			// fix iPad
			if (!!navigator.userAgent.match(/iPad/i)) {
				Array.prototype.forEach.call(axSources,function(source){
					var bCanPlay = mVideo.canPlayType(source.getAttribute('type'));
					if (bCanPlay) mVideo.setAttribute('src',source.getAttribute('src'));
					mVideo.removeChild(source);
				});
			}
		}

		/**
		 * Initialise instance external API
		 */
		function  initInstAPI(){
			extend(mVideo,{widdio:oInstance});
		}

		/**
		 * Initialise instance events
		 */
		function  initInstEvents(){
			[
				//,'loadstart'		// The user agent begins looking for media data, as part of the resource selection algorithm.	networkState equals NETWORK_LOADING
				//,'progress'		// The user agent is fetching media data.	networkState equals NETWORK_LOADING
				//,'suspend'		// The user agent is intentionally not currently fetching media data, but does not have the entire media resource downloaded.	networkState equals NETWORK_IDLE
				//,'abort'			// The user agent stops fetching the media data before it is completely downloaded, but not due to an error.	error is an object with the code MEDIA_ERR_ABORTED. networkState equals either NETWORK_EMPTY or NETWORK_IDLE, depending on when the download was aborted.
				'error'				// An error occurs while fetching the media data.	error is an object with the code MEDIA_ERR_NETWORK or higher. networkState equals either NETWORK_EMPTY or NETWORK_IDLE, depending on when the download was aborted.
				//,'emptied'		// A media element whose networkState was previously not in the NETWORK_EMPTY state has just switched to that state (either because of a fatal error during load that's about to be reported, or because the load() method was invoked while the resource selection algorithm was already running).	networkState is NETWORK_EMPTY; all the IDL attributes are in their initial states.
				//,'stalled'		// The user agent is trying to fetch media data, but data is unexpectedly not forthcoming.	networkState is NETWORK_LOADING.
				,'loadedmetadata'	// Event	The user agent has just determined the duration and dimensions of the media resource and the text tracks are ready.	readyState is newly equal to HAVE_METADATA or greater for the first time.
				//,'loadeddata'		// The user agent can render the media data at the current playback position for the first time.	readyState newly increased to HAVE_CURRENT_DATA or greater for the first time.
				,'canplay'			// The user agent can resume playback of the media data, but estimates that if playback were to be started now, the media resource could not be rendered at the current playback rate up to its end without having to stop for further buffering of content.	readyState newly increased to HAVE_FUTURE_DATA or greater.
				//,'canplaythrough'	// The user agent estimates that if playback were to be started now, the media resource could be rendered at the current playback rate all the way to its end without having to stop for further buffering.	readyState is newly equal to HAVE_ENOUGH_DATA.
				//,'playing'		// Playback is ready to start after having been paused or delayed due to lack of media data.	readyState is newly equal to or greater than HAVE_FUTURE_DATA and paused is false, or paused is newly false and readyState is equal to or greater than HAVE_FUTURE_DATA. Even if this event fires, the element might still not be potentially playing, e.g. if the element is blocked on its media controller (e.g. because the current media controller is paused, or another slaved media element is stalled somehow, or because the media resource has no data corresponding to the media controller position), or the element is paused for user interaction.
				//,'waiting'		// Playback has stopped because the next frame is not available, but the user agent expects that frame to become available in due course.	readyState is equal to or less than HAVE_CURRENT_DATA, and paused is false. Either seeking is true, or the current playback position is not contained in any of the ranges in buffered. It is possible for playback to stop for other reasons without paused being false, but those reasons do not fire this event (and when those situations resolve, a separate playing event is not fired either): e.g. the element is newly blocked on its media controller, or playback ended, or playback stopped due to errors, or the element has paused for user interaction.
				//,'seeking'		// The seeking IDL attribute changed to true and the seek operation is taking long enough that the user agent has time to fire the event.
				//,'seeked'			// The seeking IDL attribute changed to false.
				,'ended'			// Playback has stopped because the end of the media resource was reached.	currentTime equals the end of the media resource; ended is true.
				//,'durationchange'	// The duration attribute has just been updated.
				,'timeupdate'		// The current playback position changed as part of normal playback or in an especially interesting way, for example discontinuously.
				,'play'				// The element is no longer paused. Fired after the play() method has returned, or when the autoplay attribute has caused playback to begin.	paused is newly false.
				,'pause'			// The element has been paused. Fired after the pause() method has returned.	paused is newly true.
				//,'ratechange'		// Either the defaultPlaybackRate or the playbackRate attribute has just been updated.
				,'volumechange'		// Either the volume attribute or the muted attribute has changed. Fired after the relevant attribute's setter has returned.
			].forEach(function(event){
					mVideo.addEventListener(event,handleMediaEvent);
				});
			//
			mVideo.addEventListener('click',togglePlay,false);
		}

		/**
		 * Initialise instance view
		 */
		function initInstView(){
			addCss();
			initDOM();
			resize();
		}

		/**
		 * Wrap the video element and add controls
		 */
		function initDOM(){
			var sVideoClass = mVideo.getAttribute('class')
				,aVideoClass = sVideoClass?sVideoClass.split(' '):[];
			Array.prototype.push.call(aVideoClass,'widdio',sStateStart,oSettings.size,oSettings.scaleMode);
			mWiddio = createDiv(aVideoClass,undefined,{id:sId.toLowerCase()+'_'+sVideoID});
			oInstance.widdio = mWiddio;
			mWrap = createDiv('wrap',mWiddio);
			mControls = createDiv(['controls',oSettings.controlsPosition],mWiddio);
			mWiddio.style.width = oSettings.width+'px';
			mParent.insertBefore(mWiddio,mVideo);
			mWrap.appendChild(mVideo);
			//
			iControlsHeight = mControls.offsetHeight;
			//
			oSettings.controls.forEach(function(el){
				if (el===sUIPlaypause) {
					mCnPlayPause = createIcon('icon playpause play',mControls,togglePlay,['play','pause']);
				} else if (el===sUIStop) {
					mCnStop = createIcon('icon stop',mControls,stop,'stop');
				} else if (el===sUIVolume) {
					mCnVolume = createIcon('icon volume',mControls,undefined,'volume-high'); // todo: implement
				} else if (el===sUIMute) {
					mCnMute = createIcon('icon mute',mControls,toggleSound,['volume-mute','volume-medium']);
				} else if (el===sUIFullscreen) {
					mCnFullscreen = createIcon('icon fullscreen',mControls,toggleFullscreen,['expand','contract']);
				} else if (el===sUIScrub) {
					mCnScrub = createDiv('scrub',mControls,undefined,undefined,scrub);
					var mGutter = createDiv('gutter',mCnScrub,undefined,undefined,scrub);
					mControlsBar = createDiv('bar',mGutter);
					mControlsBuffer = createDiv('buffer',mGutter);
					showScrub = showBar.bind(undefined,mControlsBar,getPartPlayed);
					showBuffer = showBar.bind(undefined,mControlsBuffer,getPartBuffered);
				} else if (el===sUITime) {
					mCnTime = createDiv('time',mControls);
					showTime();
				} else if (el===sUICenter) {
					mCenter = createIcon('icon center play',mWrap,togglePlay,['play','pause']);
					if (oSettings.controls.length===1) mWiddio.removeChild(mControls); // if center is only ui element
				}
			});
			//
			var mOverlay = createDiv('overlay',mWrap,undefined,undefined,togglePlay);
			if (mCenter) mOverlay.appendChild(mCenter);
			//
			// fade ui when playing
			if (oSettings.controlsFadeTime!==0) {
				if (oSettings.controlsFadeWhenPaused) {
					mCenter&&mCenter.classList.add(sClassnameHide);
					if (bControlsOver) mControls.classList.add(sClassnameHide);
				}
				mWiddio.addEventListener('mouseout',function(){
					clearTimeout(iCenterFadeID);
					if (oSettings.controlsFadeWhenPaused||!mVideo.paused) {
						mCenter&&mCenter.classList.add(sClassnameHide);
						if (bControlsOver) {
							clearTimeout(iControlsFadeID);
							mControls.classList.add(sClassnameHide);
						}
					}
				});
				mWiddio.addEventListener('mousemove',function(){
					clearTimeout(iCenterFadeID);
					mCenter&&mCenter.classList.remove(sClassnameHide);
					iCenterFadeID = setTimeout(function(){
						if (!mVideo.paused) mCenter&&mCenter.classList.add(sClassnameHide);
					},iCenterFadeTime);
					if (bControlsOver) {
						clearTimeout(iControlsFadeID);
						mControls.classList.remove(sClassnameHide);
						iControlsFadeID = setTimeout(function(){
							if (!mVideo.paused) mControls.classList.add(sClassnameHide);
						},iCenterFadeTime);
					}
				});
			}
		}


		/**
		 * Handles the media event
		 * @param {Event} e
		 */
		function handleMediaEvent(e) {
//			console.log('handleMediaEvent',e.type); // log
			switch (e.type) {
				case 'loadedmetadata':
					iVideoW = mVideo.videoWidth;
					iVideoH = mVideo.videoHeight;
					fVideoAspectRatio = iVideoW/iVideoH;
					resize();
					showTime();
					break;
				case 'canplay':
					//console.log('canplay'); // log
					break;
				case 'play':
					showPlayPause();
					setCssState();
					if (oWiddio.playOne) playOne(mVideo);
					break;
				case 'pause':
					showPlayPause();
					setCssState();
					break;
				case 'timeupdate':
					showScrub();
					showTime();
					setCssState();
					break;
				case 'ended':
					mVideo.pause();
					setCssState();
					break;
				case 'volumechange':
					showSound();
					break;
				case 'error':
					var oError = e.target.error;
					switch (oError.code) {
						case oError.MEDIA_ERR_ABORTED: console.warn('You aborted the video playback.'); break;
						case oError.MEDIA_ERR_NETWORK: console.warn('A network error caused the video download to fail part-way.'); break;
						case oError.MEDIA_ERR_DECODE: console.warn('The video playback was aborted due to a corruption problem or because the video used features your browser did not support.'); break;
						case oError.MEDIA_ERR_SRC_NOT_SUPPORTED: console.warn('The video could not be loaded, either because the server or network failed or because the format is not supported.'); break;
						default: console.warn('An unknown error occurred.'); break;
					}
					break;
			}
			showBuffer();
			if (oSettings.stateChange) {
				oSettings.stateChange(e,oInstance);
			}
		}

		function createIcon(classes,parent,click,icon){
			var mIcon = createDiv(classes,parent,undefined,undefined,click);
			addSvg(mIcon,icon);
			return mIcon;
		}

		function addSvg(parent,name){
			var mSvg = createElement('svg',undefined,parent,{width:32,height:32,viewBox:'0 0 32 32'});
			if (!Array.isArray(name)) name = [name];
			(Array.isArray(name)?name:[name]).forEach(function(icon){
				createElement(
					'path'
					,icon
					,mSvg
					,{d:oSVGIcons[icon]}
				);
			});
			parent.innerHTML = parent.innerHTML;
		}

		/**
		 * Resize the widdio instance
		 */
		function resize() {
			mWiddio.removeAttribute('style');
			if (bSizeFullscreen) {
				iWiddioW = iScreenW;
				iWiddioH = iScreenH;
			} else if (bSizeFixed) {
				iWiddioW = oSettings.width;
				iWiddioH = oSettings.height;
			} else if (bSizeOriginal) {
				iWiddioW = iVideoW;
				iWiddioH = iVideoH;
			} else if (bSizeDynamic) {
				iWiddioW = mWiddio.offsetWidth;
				iWiddioH = mWiddio.offsetHeight;
			}

			if (bScaleModeAspectRatio) {
				iWiddioH = (iWiddioW/fVideoAspectRatio)<<0;
			}
			fWiddioAspectRatio = iWiddioW/iWiddioH;

			mWiddio.style.width = iWiddioW+'px';
			mWiddio.style.height = iWiddioH+'px';

			if (bSizeFixed&&bScaleModeBars) {
				if (fWiddioAspectRatio>fVideoAspectRatio) {
					mWiddio.classList.add(sClassnameBarsFlipped);
				} else {
					mWiddio.classList.remove(sClassnameBarsFlipped);
				}
			}
		}

		function getState(){
			return sState;
		}

		/**
		 * Toggle instance fullscreen
		 */
		function toggleFullscreen(){
			mFullscreenLast = mWiddio;
			if (fnFullscreen!==fn) {
				if (isFullscreen()) {
					fnFullscreenExit();
				} else {
					fnFullscreen.call(mWiddio);
				}
			} else {
				mWiddio.classList.toggle(sSizeFullscreen);
			}
		}

		/**
		 * Scrub
		 * @param {Event} e
		 */
		function scrub(e) {
			setPartPlayed((e.pageX-mCnScrub.getBoundingClientRect().left)/mCnScrub.offsetWidth);
		}

		/**
		 * Change the video time
		 * @param {number} f A floating point between 0 and 1
		 */
		function setPartPlayed(f) {
			mVideo.currentTime = f*mVideo.duration;
		}

		/**
		 * Get the video time as a floating point between 0 and 1
		 * @returns {number}
		 */
		function getPartPlayed() {
			var fPartPlayed = 0;
			if (mVideo.currentTime&&mVideo.duration) fPartPlayed = mVideo.currentTime/mVideo.duration;
			return fPartPlayed;
		}

		/**
		 * Get total amount of buffer as a floating point between 0 and 1
		 * @returns {number}
		 */
		function getPartBuffered() {
			var fPartPlayed = 0
				,oBuffer = mVideo.buffered
				,iBuffer = oBuffer.length
				,i = iBuffer
				,iTotal = 0
			;
			if (iBuffer>0&&mVideo.duration) {
				while (i--) iTotal += oBuffer.end(i)-oBuffer.start(i);
				fPartPlayed = iTotal/mVideo.duration;
			}
			return fPartPlayed;
		}

		/**
		 * Check if the video is playing
		 * @returns {boolean}
		 */
		function isPlaying() {
			return mVideo.currentTime>0&&!mVideo.paused&&!mVideo.ended;
		}

		/**
		 * Play a video
		 * @param {String} file
		 */
		function playVideo(file) {
			if (!mVideo.paused&&oSettings.fadeVolumeTime>0) {
				fadeOutBeforeLoad(file);
				return;
			}
			switch (typeof(file)) {
				case "string":
					mVideo.src = file;
				break;
				case "object": // removes all sources and inserts the new ones from the object
					Array.prototype.forEach.call(axSources,function(source){
						mVideo.removeChild(source);// todo: bind
					});
					var bFound = false;
					file.forEach(function(src,type){
						if (!bFound) {
							var sCanPlay = mVideo.canPlayType("video/"+type);
							if (sCanPlay=="maybe"||sCanPlay=="probably") {
								mVideo.src = src;
								bFound = true;
							}
						}
					});
					axSources = mVideo.querySelectorAll('source');
				break;
			}
			mVideo.load();
			mVideo.play();
			if (mVideo.muted) { // hack for oVideo not remembering the sound state correctly after load
				toggleSound(true);
				toggleSound(false);
			}
			showPlayPause();
		}

		/**
		 * Starts the video playback
		 */
		function play(file) {
			if (file===undefined) {
				togglePlay(true);
			} else {
				playVideo(file);
			}
		}

		/**
		 * Stops the video playback
		 */
		function stop() {
			pause();
			mVideo.currentTime = 0;
		}

		/**
		 * Toggles the video playback
		 * @param {boolean|MouseEvent} [play] Optionally force playback
		 */
		function togglePlay(play) {
			var bEvent = play instanceof MouseEvent
				,bForcePlay = play===true
				,bForcePause = play===false
				,bForce = bForcePlay||bForcePause;
			bEvent&&play.stopPropagation();
			if ((!bForce&&mVideo.paused)||(bForce&&bForcePlay)) {
				mVideo.play();
			} else if ((!bForce&&!mVideo.paused)||(bForce&&bForcePause)) {
				mVideo.pause();
			}
		}

		/**
		 * Changes view depending on video playback
		 */
		function showPlayPause() {
			[mCenter,mCnPlayPause].forEach(function(elm){
				if (elm) {
					elm.classList.remove(!mVideo.paused?'play':'pause');
					elm.classList.add(mVideo.paused?'play':'pause');
				}
			});
		}

		function showBar(elm,fn){
			elm.style.width = (100*fn())+'%';
		}

		/**
		 * Shows elapsed time
		 */
		function showTime() {
			if (mCnTime) {
				mCnTime.textContent = formatMinutes(mVideo.currentTime||0)+' / '+formatMinutes(mVideo.duration||0);
			}
		}

		/**
		 * Formats milliseconds to minutes
		 * @param {number} millis
		 * @returns {string}
		 */
		function formatMinutes(millis) {
			return strPad(''+parseInt(millis/60,10),2,0,true)+':'+strPad(''+parseInt(millis,10)%60,2,0,true);
		}

		/**
		 * Toggles the sound
		 * @param {number|boolean} [e]
		 */
		function toggleSound(e) { // volume :: float (0-1), muted :: Boolean, null :: toggle mute
			// todo: save states in cookie
			if (typeof(e)==='object'||e===null||e===undefined) e = mVideo.muted;
			var bT = e===true
				,bF = e===false;
			if (bT||bF) { // mute
				mVideo.muted = !e;
			} else { // volume
				toggleSound(true);
				mVideo.volume = e;
			}
		}

		/**
		 * Changes view depending on sound
		 */
		function showSound() {
			mCnMute.classList.remove(!mVideo.muted?'muted':'mute');
			mCnMute.classList.add(mVideo.muted?'muted':'mute');
		}

		/**
		 * Sets the CSS state
		 */
		function setCssState() {
			var sOldState = sState;
			if (mVideo.paused) {
				if (mVideo.currentTime===0) sState = sStateStart;
				else if (mVideo.currentTime===mVideo.duration) sState = sStateEnded;
				else sState = sStatePaused;
			} else {
				sState = sStatePlaying;
			}
			if (sOldState!=sState) {
				mWiddio.classList.remove(sOldState);
				mWiddio.classList.add(sState);
			}
		}

		/**
		 * Fades the volume before load?
		 * @param file
		 * @todo re-implement
		 */
		function fadeOutBeforeLoad(file) {
			/*$Video.animate(
				 {opacity:0}
				,{
					 duration: oSettings.fadeVolumeTime
					,step: function(i,o){
						video.volume = 1-o.pos;
					}
					,complete: function(){
						pause();
						playVideo(file);
						$Video.fadeTo(1,1);
						video.volume = 1;
					}
				}
			);*/
		}

		// expose instance methods
		/**
		 * @name widdio.widdioInstance
		 * @instance
		 */
		return oInstance;
	}
	//################################################################################################################
	//###############################################################################################################
	//##############################################################################################################
	//#############################################################################################################
	//############################################################################################################

	/**
	 * Extend an object
	 * @name iddqd.extend
	 * @method
	 * @param {Object} obj Subject.
	 * @param {Object} fns Property object.
	 * @param {boolean} [overwrite=false]  Overwrite properties.
	 * @returns {Object} Subject.
	 */
	function extend(obj,fns,overwrite){
		for (var s in fns) {
			if (fns.hasOwnProperty(s)&&(overwrite||obj[s]===undefined)) {
				obj[s] = fns[s];
			}
		}
		return obj;
	}

	/**
	 * Pads a string
	 * @param str
	 * @param length
	 * @param chr
	 * @param left
	 * @returns {string}
	 */
	function strPad(str,length,chr,left){
		if (left===undefined) left = false;
		var iFill = Math.max(0,length-str.length);
		var aFill = [];
		for (var i=0;i<iFill;i++) aFill.push(chr);
		return left?(aFill.join('')+str):(str+aFill.join(''));
	}

	/**
	 * Adds css directly to document.styleSheets
	 */
	function addCss(){
		var oSheet = getSheetByMedia('all')||getSheetByMedia('screen');
		if (oSheet&&(oSheet.insertRule||oSheet.addRule)) {
			sCSS.split('}').reverse().forEach(function(subst){
				var aRule = subst.split('{')
					,sRule = aRule.shift()
					,sRules = aRule.pop();
				sRule&&sRules&&addRule(oSheet,sRule,sRules);
			});
		} else {
			createElement('style',undefined,mHead).innerHTML = sCSS;
		}
		/* jshint ignore:start */
		// overwrite addCss method so we don't need a boolean check
		addCss = function(){};
		/* jshint ignore:end */
	}

	/**
	 * Add a rule to a stylesheet
	 * @param {CSSStyleSheet} sheet
	 * @param {string} selector
	 * @param {string} rule
	 */
	function addRule(sheet,selector,rule){
		if (sheet.insertRule) sheet.insertRule(selector+'{'+rule+'}', 0);
		else sheet.addRule(selector,rule);
	}

	/**
	 * Get a stylesheet of a specific media type
	 * @param {string} type
	 * @returns {CSSStyleSheet}
	 */
	function getSheetByMedia(type) {
		var aDocStyle = document.styleSheets
			,aMedia
			,oStyleSheet;
		if (aDocStyle) {
			loop1:
			for (var i=0,l=aDocStyle.length;i<l;i++) {
				oStyleSheet = aDocStyle[i];
				aMedia = oStyleSheet.media;
				for (var j=0,ll=aMedia.length;j<ll;j++) {
					var sType = aMedia[j];
					if (sType==type) {
						break loop1;
					}
				}
			}
		}
		return oStyleSheet;
	}

	/**
	 * Small utility method for quickly creating elements.
	 * @name iddqd.createElement
	 * @method
	 * @param {String} [type='div'] The element type
	 * @param {String|Array} classes An optional string or list of classes to be added
	 * @param {HTMLElement} parent An optional parent to add the element to
	 * @param {Object} attributes An optional click event handler
	 * @param {String} text An optional click event handler
	 * @param {Function} click An optional click event handler
	 * @returns {HTMLElement} Returns the newly created element
	 */
	function createElement(type,classes,parent,attributes,text,click){
		var mElement = document.createElement(type||'div');
		if (attributes) {
			for (var attr in attributes) {
				if (attributes.hasOwnProperty(attr)) {
					mElement.setAttribute(attr,attributes[attr]);
				}
			}
		}
		if (classes) {
			var oClassList = mElement.classList
				,aArguments = typeof(classes)==='string'?classes.split(' '):classes;
			oClassList.add.apply(oClassList,aArguments);
		}
		if (text) mElement.textContent = text;
		click&&mElement.addEventListener('click',click,false);
		parent&&parent.appendChild(mElement);
		return mElement;
	}

	return extend(initVideo,oWiddio);
})(document,window);