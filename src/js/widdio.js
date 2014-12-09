/**
 * A simple HTML5 video player
 * @summary A simple HTML5 video player
 * @namespace widdio
 * @version 2.0.2
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
if (widdio===undefined) {
var widdio = (function(document,window,undefined) {
	'use strict';

	var createDiv = createElement.bind(undefined,undefined)
		//
		,mBody
		//
		,iScrW		// screen width
		,iScrH		// screen height
		,fScrAspR	// screen aspect ratio
		//
		,aWiddioObj = []
		//
		,iMaxZ = Math.pow(2,32)/2-1
		//
		// browser/device detection
		,bWebkit = false//$.browser.webkit
		//,bIOs = !!navigator.userAgent.match(/iPod|iPhone|iPad/i)
		,bIPad = !!navigator.userAgent.match(/iPad/i)
		//
		,fnFullscreen
		//
		,sClassnameHide = 'fadeOut'
		//
		,oReturn = {
			// exposed functions


			// exposed properties
			playOne:			true // play only one video at a time

			// constants
			,PLAYPAUSE:			'playpause'
			,SCRUB:				'scrub'
			,STOP:				'stop'
			,MUTE:				'mute'
			,VOLUME:			'volume'
			,FULLSCREEN:		'fullscreen'
			,CENTER:			'center'
			,TIME:				'time'

			,CONTROLS_OVER:		'over'
			,CONTROLS_UNDER:	'under'

			,SCALE_ASPECTRATIO:	'aspectratio'
			,SCALE_BARS:		'bars'
			,SCALE_NOBARS:		'nobars'

			,SIZE_ORIGINAL:		'original'
			,SIZE_FIXED:		'fixed'
			,SIZE_DYNAMIC:		'dynamic'
			,SIZE_FULLSCREEN:	'fullscreen'

			,STATE_START:		'start'
			,STATE_PLAYING:		'playing'
			,STATE_PAUSED:		'paused'
			,STATE_ENDED:		'ended'
		}
		,oDefault = { // todo: merge into oReturn
			 id: 'Widdio'
			,version: '1.1.5'
			,copyright: 'Copyright (c) 2010-2015 Ron Valstar'
			,defaults: {
				 debug:	false
				,fullscreen: false
				,scaleMode:				oReturn.SCALE_BARS
				,fullscreenScaleMode:	oReturn.SCALE_NOBARS
				,size: oReturn.SIZE_ORIGINAL
				,width:		null
				,height:	null
				,fadeVolumeTime: 0

				// controls
				,controls: [oReturn.PLAYPAUSE,oReturn.SCRUB,oReturn.TIME,oReturn.MUTE,oReturn.CENTER]
				,controlsPosition: oReturn.CONTROLS_OVER
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
	}

	/**
	 * Initialise variables
	 */
	function initVariables(){
		mBody = document.body;
		fnFullscreen = mBody.requestFullScreen||mBody.webkitRequestFullScreen||mBody.mozRequestFullScreen;//||mBody.msRequestFullScreen;
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
	 */
	function initVideo(video,options){
		var fnConstructor = video.constructor;
		if (fnConstructor===NodeList) {
			for (var i=0,l=video.length;i<l;i++) {
				instance(video[i],options);

			}
		} else if (fnConstructor===HTMLVideoElement) {
			instance(video,options);
		}
	}

	/**
	 * Handles fullscreenchange event
	 * @param {Event} e
	 */
	function handleFullscreenChange(e){
		if (!isFullscreen()) getWiddio(e.target).setFullscreenView();
	}

	/**
	 * Handles the window resize event
	 */
	function handleWindowResize() {
		try{
			iScrW = window.innerWidth;
			iScrH = window.innerHeight;
			fScrAspR = iScrW/iScrH;
		}catch(err){}
		for (var i=0,l=aWiddioObj.length;i<l;i++) {
			aWiddioObj[i].resize();
		}
	}

	/**
	 * Tests if document is fullscreen
	 * @returns {*}
	 */
	function isFullscreen(){
		return document.isFullScreen||document.mozFullScreen||document.webkitIsFullScreen;
	}
	//
	// playOne
	function playOne(video){
		for (var i=0,l=aWiddioObj.length;i<l;i++) {
			var oVideo = aWiddioObj[i];
			if (oVideo.video!==video) oVideo.pause();
		}
	}
	//
	// getVideo
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

	/**
	 * Factory method for video instances
	 * @param {HTMLVideoElement} video
	 * @param {Object} _settings
	 * @returns {widdio}
	 */
	function instance(video,_settings) {
		//
		// private variables
		var oSettings = extend(extend({},_settings),oDefault.defaults)
			//
			,iVidW		// video width
			,iVidH		// video height
			,fVidAspR	// video aspect ratio
			//
			,iWidW		// widdio width
			,iWidH		// widdio height (excludes the controls bar)
			,fWidAspR	// widdio aspect ratio
			//
			,mVideo = video
			,mParent = mVideo.parentNode
			,mWiddio
			,mStaticWrap
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
			//var oMimes = {
			//	ogg:	"ogv"
			//};
			//
			//
			,sOriginalSize
			,mWiddioGhost
			//
			,iCenterFadeID = 0
			,iControlsFadeID = 0
			,iCenterFadeTime = 1500
			//
			,iControlsHeight;
		//
		// PRIVATE FUNCTIONS
		//
		// init (self invoking)
		(function init() {
			if (!sVideoID) {
				sVideoID = btoa(Math.random()).replace(/^\d*|[^\w]/g,'');
				mVideo.setAttribute('id',sVideoID);
			}
			//
			// width and height for fixed size
			var iVidAtrW = mVideo.getAttribute('width');
			var iVidAtrH = mVideo.getAttribute('height');
			iVidW = mVideo.offsetWidth;
			iVidH = mVideo.offsetHeight;
			if (oSettings.width===null)	oSettings.width =  !!iVidAtrW?parseInt(iVidAtrW):iVidW;
			if (oSettings.height===null)oSettings.height = !!iVidAtrH?parseInt(iVidAtrH):iVidH;
			//
			// prepare video
			axSources = mVideo.querySelectorAll('source');
			video.controls = false;
			//
			// fix iPad
			if (bIPad) {
				Array.prototype.forEach.call(axSources,function(source){
					var bCanPlay = video.canPlayType(source.getAttribute('type'));
					if (bCanPlay) mVideo.setAttribute('src',source.getAttribute('src'));
					mVideo.removeChild(source);
				});
			}
			//
			// video objects
			mVideo.widdio = {
				 video:			video
				,play: function(file) {
					if (file===undefined) {
						togglePlay(true);
					} else {
						playVideo(file);
					}
				}
				,stop:			stop
				,toggle:		function(){togglePlay();}
				,pause:			function(){togglePlay(false);}
				,sound:			toggleSound
				,fullscreen:	toggleFullscreen
				,isPlaying:		isPlaying
				,getState:		function(){return sState;}
				,toString:		function(){return '[WiddioInstance #'+sVideoID+']';}
			};
			aWiddioObj.push({
				 video:					video
				,resize:				resize
				,setFullscreenView:		setFullscreenView
				,pause:					function(){togglePlay(false);}
			});
			//
			// add events
			[
				//,'loadstart'		// The user agent begins looking for media data, as part of the resource selection algorithm.	networkState equals NETWORK_LOADING
				//,'progress'			// The user agent is fetching media data.	networkState equals NETWORK_LOADING
				//,'suspend'			// The user agent is intentionally not currently fetching media data, but does not have the entire media resource downloaded.	networkState equals NETWORK_IDLE
				//,'abort'			// The user agent stops fetching the media data before it is completely downloaded, but not due to an error.	error is an object with the code MEDIA_ERR_ABORTED. networkState equals either NETWORK_EMPTY or NETWORK_IDLE, depending on when the download was aborted.
				'error'			// An error occurs while fetching the media data.	error is an object with the code MEDIA_ERR_NETWORK or higher. networkState equals either NETWORK_EMPTY or NETWORK_IDLE, depending on when the download was aborted.
				//,'emptied'			// A media element whose networkState was previously not in the NETWORK_EMPTY state has just switched to that state (either because of a fatal error during load that's about to be reported, or because the load() method was invoked while the resource selection algorithm was already running).	networkState is NETWORK_EMPTY; all the IDL attributes are in their initial states.
				//,'stalled'			// The user agent is trying to fetch media data, but data is unexpectedly not forthcoming.	networkState is NETWORK_LOADING.
				,'loadedmetadata'	// Event	The user agent has just determined the duration and dimensions of the media resource and the text tracks are ready.	readyState is newly equal to HAVE_METADATA or greater for the first time.
				//,'loadeddata'		// The user agent can render the media data at the current playback position for the first time.	readyState newly increased to HAVE_CURRENT_DATA or greater for the first time.
				//,'canplay'			// The user agent can resume playback of the media data, but estimates that if playback were to be started now, the media resource could not be rendered at the current playback rate up to its end without having to stop for further buffering of content.	readyState newly increased to HAVE_FUTURE_DATA or greater.
				//,'canplaythrough'	// The user agent estimates that if playback were to be started now, the media resource could be rendered at the current playback rate all the way to its end without having to stop for further buffering.	readyState is newly equal to HAVE_ENOUGH_DATA.
				//,'playing'			// Playback is ready to start after having been paused or delayed due to lack of media data.	readyState is newly equal to or greater than HAVE_FUTURE_DATA and paused is false, or paused is newly false and readyState is equal to or greater than HAVE_FUTURE_DATA. Even if this event fires, the element might still not be potentially playing, e.g. if the element is blocked on its media controller (e.g. because the current media controller is paused, or another slaved media element is stalled somehow, or because the media resource has no data corresponding to the media controller position), or the element is paused for user interaction.
				//,'waiting'			// Playback has stopped because the next frame is not available, but the user agent expects that frame to become available in due course.	readyState is equal to or less than HAVE_CURRENT_DATA, and paused is false. Either seeking is true, or the current playback position is not contained in any of the ranges in buffered. It is possible for playback to stop for other reasons without paused being false, but those reasons do not fire this event (and when those situations resolve, a separate playing event is not fired either): e.g. the element is newly blocked on its media controller, or playback ended, or playback stopped due to errors, or the element has paused for user interaction.
				//,'seeking'			// The seeking IDL attribute changed to true and the seek operation is taking long enough that the user agent has time to fire the event.
				//,'seeked'			// The seeking IDL attribute changed to false.
				,'ended'			// Playback has stopped because the end of the media resource was reached.	currentTime equals the end of the media resource; ended is true.
				//,'durationchange'	// The duration attribute has just been updated.
				,'timeupdate'		// The current playback position changed as part of normal playback or in an especially interesting way, for example discontinuously.
				,'play'				// The element is no longer paused. Fired after the play() method has returned, or when the autoplay attribute has caused playback to begin.	paused is newly false.
				,'pause'			// The element has been paused. Fired after the pause() method has returned.	paused is newly true.
				//,'ratechange'		// Either the defaultPlaybackRate or the playbackRate attribute has just been updated.
				,'volumechange'		// Either the volume attribute or the muted attribute has changed. Fired after the relevant attribute's setter has returned.
			].forEach(function(event){
				video.addEventListener(event,handleMediaEvent);
			});
			//
			mVideo.addEventListener('click',togglePlay);
			//
			addCss();
			addControls();
			//
			//
			resize();
		})();


		function addControls(){
			var sVideoClass = mVideo.getAttribute('class')
				,aVideoClass = sVideoClass?sVideoClass.split(' '):[];
			Array.prototype.push.call(aVideoClass,'widdio',oReturn.STATE_START,oSettings.size,oSettings.scaleMode);
			mWiddio = createDiv(aVideoClass,undefined,{id:oDefault.id.toLowerCase()+'_'+sVideoID});
			mStaticWrap = createDiv('staticwrap',mWiddio);
			mWrap = createDiv('wrap',mStaticWrap);
			mControls = createDiv(['controls',oSettings.controlsPosition],mWiddio);
			mWiddio.style.width = oSettings.width+'px';
			mParent.insertBefore(mWiddio,mVideo);
			mWrap.appendChild(mVideo);
			//
			iControlsHeight = mControls.offsetHeight;
			//
			oSettings.controls.forEach(function(el){
				if (el===oReturn.PLAYPAUSE) {
					mCnPlayPause = createDiv('icon playpause play',mControls,undefined,undefined,togglePlay);
				} else if (el===oReturn.STOP) {
					mCnStop = createDiv('icon stop',mControls,undefined,undefined,stop);
				} else if (el===oReturn.VOLUME) {
					mCnVolume = createDiv('icon volume',mControls); // todo: implement
				} else if (el===oReturn.MUTE) {
					mCnMute = createDiv('icon mute',mControls,undefined,undefined,toggleSound);
				} else if (el===oReturn.FULLSCREEN) {
					mCnFullscreen = createDiv('icon fullscreen',mControls,undefined,undefined,toggleFullscreen);
				} else if (el===oReturn.SCRUB) {
					mCnScrub = createDiv('scrub',mControls,undefined,undefined,scrub);
					var mGutter = createDiv('gutter',mCnScrub,undefined,undefined,scrub);
					mControlsBar = createDiv('bar',mGutter);
					mControlsBuffer = createDiv('buffer',mGutter);
				} else if (el===oReturn.TIME) {
					mCnTime = createDiv('time',mControls);
					showTime();
				} else if (el===oReturn.CENTER) {
					mCenter = createDiv('icon center play',mWrap,undefined,undefined,togglePlay);
					if (oSettings.controls.length===1) mWiddio.removeChild(mControls); // if center is only ui element
				}
			});
			//
			createDiv('overlay',mWrap,undefined,undefined,togglePlay);
			//
			// fade ui when playing
			if (oSettings.controlsFadeTime!==0) {
				if (oSettings.controlsFadeWhenPaused) {
					mCenter&&mCenter.classList.add(sClassnameHide);
					if (oSettings.controlsPosition===oReturn.CONTROLS_OVER) mControls.classList.add(sClassnameHide);
				}
				mWiddio.addEventListener('mouseout',function(){
					clearTimeout(iCenterFadeID);
					if (oSettings.controlsFadeWhenPaused||!video.paused) {
						mCenter&&mCenter.classList.add(sClassnameHide);
						if (oSettings.controlsPosition===oReturn.CONTROLS_OVER) {
							clearTimeout(iControlsFadeID);
							mControls.classList.add(sClassnameHide);
						}
					}
				});
				mWiddio.addEventListener('mousemove',function(){
					clearTimeout(iCenterFadeID);
					mCenter&&mCenter.classList.remove(sClassnameHide);
					iCenterFadeID = setTimeout(function(){
						if (!video.paused) mCenter&&mCenter.classList.add(sClassnameHide);
					},iCenterFadeTime);
					if (oSettings.controlsPosition===oReturn.CONTROLS_OVER) {
						clearTimeout(iControlsFadeID);
						mControls.classList.remove(sClassnameHide);
						iControlsFadeID = setTimeout(function(){
							if (!video.paused) mControls.classList.add(sClassnameHide);
						},iCenterFadeTime);
					}
				});
			}
		}

		// resize
		function resize() {
			switch (oSettings.size) {
				case oReturn.SIZE_ORIGINAL:
					iWidW = iVidW;
					iWidH = iVidH;
				break;
				case oReturn.SIZE_FIXED:
					iWidW = oSettings.width;
					iWidH = oSettings.height;
				break;
				case oReturn.SIZE_FULLSCREEN:
					iWidW = iScrW;
					iWidH = iScrH;
				break;
			}
			fWidAspR = iWidW/iWidH;
			mWiddio.style.width = iWidW+'px';
			//
			if (oSettings.size!==oReturn.SIZE_FULLSCREEN) {
				var iWreal = mWiddio.offsetWidth;
				var bWisW = iWreal===iWidW;
				if (!bWisW) {
					iWidH = parseInt(iWidH*(iWreal/iWidW));
					iWidW = iWreal;
				}
			}
			var iWH = iWidH + (oSettings.size!==oReturn.SIZE_FULLSCREEN&&oSettings.controlsPosition!==oReturn.CONTROLS_OVER?iControlsHeight:0);
			mWiddio.style.width = iWH+'px';
			resizeVideo();
			resizeControls();
			resizeScrub();
		}
		// resizeVideo
		function resizeVideo() {//todo:iWidW
			var sL = 'auto';//todo:iWidW
			var sT = 'auto';//todo:iWidW
			var sW = '100%';//todo:iWidW
			var sH = '100%';//todo:iWidW
			mWiddio.style.width = iWidW+'px';
			mWiddio.style.height = iWidH+'px';
//				var bNoBars = oSettings.scaleMode===ww.SCALE_NOBARS;
			if (oSettings.scaleMode===oReturn.SCALE_NOBARS&&oSettings.size!==oReturn.SIZE_ORIGINAL) {
				var bFullscreen = oSettings.size===oReturn.SIZE_FULLSCREEN;
				var iTmpW = bFullscreen?iScrW:iWidW;
				var iTmpH = bFullscreen?iScrH:iWidH;
				var fTmpAspR = bFullscreen?fScrAspR:fWidAspR;
				if (fTmpAspR>fVidAspR) {
					var iTH = Math.floor(iTmpW/fVidAspR);
					sT = parseInt((iTmpH-iTH)/2)+'px';
					sH = iTH+'px';
				} else {
					var iTW = Math.floor(iTmpH*fVidAspR);
					sL = parseInt((iTmpW-iTW)/2)+'px';
					sW = iTW+'px';
					sH = iTmpH+'px';
				}
				mVideo.style.width = mVideo.style.height = '100%';
				mStaticWrap.style.width = iWidW+'px';
				mStaticWrap.style.height = iWidH+'px';
			}
			mWrap.style.width = sW;
			mWrap.style.height = sH;
			mVideo.style.marginLeft = sL;
			mVideo.style.marginTop = sT;
		}
		// resizeControls
		function resizeControls() {
			mControls.style.width = iWidW+'px';
			var iOverW = mControls.offsetWidth-iWidW;
			if (iOverW) mControls.style.width = (iWidW-iOverW)+'px';
		}
		// resizeScrub (todo: does not always init with multiple videos)
		//var iReisizeScrub;
		function resizeScrub() {
			if (mCnScrub) {
				//clearTimeout(iReisizeScrub);
				//iReisizeScrub = setTimeout(function(){
					//console.log('iReisizeScrub'); // log
					var iWidthMinusScrub = 0;
					Array.prototype.forEach.call(mControls.children,function(child){
						if (!child.classList.contains('scrub')) {
							iWidthMinusScrub += child.offsetWidth;
						}
					});
					mCnScrub.style.width = (mControls.offsetWidth-iWidthMinusScrub)+'px';
				//},400);
			}
		}

		// toggleFullscreen
		function toggleFullscreen(){
			console.log('toggleFullscreen',!!fnFullscreen,bWebkit); // log
			// browser fullscreen (with user interface)
			if (fnFullscreen||bWebkit) {
				if (fnFullscreen) {
					if (isFullscreen()) {
						// this is fucking stupid... why doesn't this work: (document.exitFullScreen||document.webkitCancelFullScreen||document.mozCancelFullScreen)();
						if (document.exitFullScreen) document.exitFullScreen();
						else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
						else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
					} else {
						setFullscreenView(true);
						try	{ // try/catch because mozilla tends to screw it
							fnFullscreen.call(mWiddio);
						} catch(err) {
							console.log(err+' reverting to fake fullscreen'); // log
							fnFullscreen = null; // todo: wrong solution...
						}
					}
				} else {
					setFullscreenView();
				}

			// webkit video fullscreen (reverts to native webkit user interface)
			} else if (bWebkit&&video.webkitSupportsFullscreen) { // &&!oVideo.webkitDisplayingFullscreen
				video.webkitEnterFullscreen();

			} else {
				setFullscreenView();

			}
		}
		// setFullscreenView
		function setFullscreenView(toFull){
			if (toFull===undefined) toFull = oSettings.size!==oReturn.SIZE_FULLSCREEN;
			//
			var bPlaying = !video.paused;
			mWiddio.classList.remove(oSettings.size);
			if (toFull) {
				sOriginalSize = oSettings.size; // store size when going fullscreen
				oSettings.size = oReturn.SIZE_FULLSCREEN;
				if (!fnFullscreen) {
					mWiddioGhost = createDiv();
					mParent.appendChild(mWiddioGhost,mWiddio);
					mBody.appendChild(mWiddio);
				}
			} else {
				oSettings.size = sOriginalSize?sOriginalSize:oReturn.SIZE_ORIGINAL;
				if (mWiddioGhost) {
					mParent.appendChild(mWiddio,mWiddioGhost);
					mParent.removeChild(mWiddioGhost);
					mWiddioGhost = null;
				}
			}
			mWiddio.classList.add(oSettings.size);
			resize();
			!fnFullscreen&&bPlaying&&video.play();
		}

		//
		// scrub
		function scrub(e) {
			setPartPlayed((e.pageX-mCnScrub.getBoundingClientRect().left)/mCnScrub.offsetWidth);
		}

		// setPartPlayed
		function setPartPlayed(f) {
			console.log('setPartPlayed',f,video.duration); // log
			video.currentTime = f*video.duration;
		}

		// getPartPlayed
		function getPartPlayed() {
			var fPartPlayed = 0;
			if (video.currentTime&&video.duration) fPartPlayed = video.currentTime/video.duration;
			return fPartPlayed;
		}

		// isPlaying
		function isPlaying() {
			return video.currentTime>0&&!video.paused&&!video.ended;
		}

		// playVideo
		function playVideo(file) {
			if (!video.paused&&oSettings.fadeVolumeTime>0) {
				fadeOutBeforeLoad(file);
				return;
			}
			switch (typeof(file)) {
				case "string":
					video.src = file;
				break;
				case "object": // removes all sources and inserts the new ones from the object
					Array.prototype.forEach.call(axSources,function(source){
						mVideo.removeChild(source);// todo: bind
					});
					var bFound = false;
					file.forEach(function(src,type){
						if (!bFound) {
							var sCanPlay = video.canPlayType("video/"+type);
							if (sCanPlay=="maybe"||sCanPlay=="probably") {
								video.src = src;
								bFound = true;
							}
						}
					});
					axSources = mVideo.querySelectorAll('source');
				break;
			}
			video.load();
			video.play();
			if (video.muted) { // hack for oVideo not remembering the sound state correctly after load
				toggleSound(true);
				toggleSound(false);
			}
			showPlayPause();
		}

		// stop
		function stop() {
			togglePlay(false);
			video.currentTime = 0;
		}

		// togglePlay
		function togglePlay(e) {
			var bT = e===true;
			var bF = e===false;
			var bE = bT||bF;
			if ((!bE&&video.paused)||(bE&&bT)) {
				video.play();
			} else if ((!bE&&!video.paused)||(bE&&bF)) {
				video.pause();
			}
		}

		// showPlayPause
		function showPlayPause() {
			[mCenter,mCnPlayPause].forEach(function(elm){
				if (elm) {
					elm.classList.remove(!video.paused?'play':'pause');
					elm.classList.add(video.paused?'play':'pause');
				}
			});
		}

		// showTime
		function showTime() {
			if (mCnTime) {
				mCnTime.textContent = formatMinutes(video.currentTime||0)+' / '+formatMinutes(video.duration||0);
			}
		}

		// formatMinutes
		function formatMinutes(f) {
			return strPad(''+parseInt(f/60,10),2,0,true)+':'+strPad(''+parseInt(f,10)%60,2,0,true);
		}


		// toggleSound
		function toggleSound(e) { // volume :: float (0-1), muted :: Boolean, null :: toggle mute
			// todo: save states in cookie
			if (typeof(e)==='object'||e===null||e===undefined) e = video.muted;
			var bT = e===true;
			var bF = e===false;
			if (bT||bF) { // mute
				video.muted = !e;
			} else { // volume
				toggleSound(true);
				video.volume = e;
			}
		}

		// showSound
		function showSound() {
			mCnMute.classList.remove(!video.muted?'muted':'mute');
			mCnMute.classList.add(video.muted?'muted':'mute');
		}

		// handleMediaEvent
		function handleMediaEvent(e) {
			//console.log('handleMediaEvent',e.type,e); // log
			switch (e.type) {
				case 'loadedmetadata':
					iVidW = video.videoWidth;
					iVidH = video.videoHeight;
					fVidAspR = iVidW/iVidH;
					resize();
					showTime();
				break;
				case 'play':
					showPlayPause();
					setCssState();
					if (oReturn.playOne) playOne(video);
				break;
				case 'pause':
					showPlayPause();
					setCssState();
				break;
				case 'timeupdate':
					if (mControlsBar) mControlsBar.style.width = (100*getPartPlayed())+'%';
					showTime();
					setCssState();
				break;
				case 'ended':
					video.pause();
					setCssState();
				break;
				case 'volumechange':
					showSound();
				break;
				case 'error':
					switch (e.target.error.code) {
						case e.target.error.MEDIA_ERR_ABORTED: console.warn('You aborted the video playback.'); break;
						case e.target.error.MEDIA_ERR_NETWORK: console.warn('A network error caused the video download to fail part-way.'); break;
						case e.target.error.MEDIA_ERR_DECODE: console.warn('The video playback was aborted due to a corruption problem or because the video used features your browser did not support.'); break;
						case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED: console.warn('The video could not be loaded, either because the server or network failed or because the format is not supported.'); break;
						default: console.warn('An unknown error occurred.'); break;
					}
				break;
			}
		}

		// set css state
		var sState = oReturn.STATE_START;
		function setCssState() {
			var sOldState = sState;
			if (video.paused) {
				if (video.currentTime===0) sState = oReturn.STATE_START;
				else if (video.currentTime===video.duration) sState = oReturn.STATE_ENDED;
				else sState = oReturn.STATE_PAUSED;
			} else {
				sState = oReturn.STATE_PLAYING;
			}
			if (sOldState!=sState) {
				mWiddio.classList.remove(sOldState);
				mWiddio.classList.add(sState);
				if (oSettings.stateChange) oSettings.stateChange(sState);
			}
		}

		// fadeOutBeforeLoad
		function fadeOutBeforeLoad(file) {
			/*$Video.animate(
				 {opacity:0}
				,{
					 duration: oSettings.fadeVolumeTime
					,step: function(i,o){
						video.volume = 1-o.pos;
					}
					,complete: function(){
						togglePlay(false);
						playVideo(file);
						$Video.fadeTo(1,1);
						video.volume = 1;
					}
				}
			);*/
		}

		return video;
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
			if (overwrite||obj[s]===undefined) {
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
		var oSheet;
		var sSheet = '';
		//var aValidMedia = ['screen','all','handheld'];
		if (document.styleSheets&&document.styleSheets.length) {
			oSheet = getSheetByMedia('all')||getSheetByMedia('screen')||document.styleSheets[0];
		}
		//document.querySelector('head').appendChild(document.createElement('link'));
		//$('<link type="text/css" rel="stylesheet" />').prependTo($('head'));

		function addRule(selector,rule){
			try {
				if (!oSheet) sSheet = selector+'{'+rule+'}'+"\n"+sSheet;
				else if (oSheet.insertRule) oSheet.insertRule(selector+'{'+rule+'}', 0);
				else oSheet.addRule(selector,rule);
			} catch (err) { // todo: code this better
				sSheet = selector+'{'+rule+'}'+"\n"+sSheet;
			}
		}
		//

		addRule('.widdio .time',glue([
			'font-weight:bold;'
			,'font-size:12px;'
			,'line-height:30px;']));

		addRule('.widdio .icon.center',glue([
			'position:absolute;'
			,'left:50%;'
			,'top:50%;'
			,'width: 50px;'
			,'height: 50px;'
			,'margin: -25px 0 0 -25px;']));

		addRule('.widdio .bar>*',glue([
			'position:absolute;'
			,'left:0;'
			,'top:0;']));
		addRule('.widdio .bar',glue([
			'position:relative;'
			,'width:1px;'
			,'margin-top:10px;'
			,'height:10px;'
			,'background-color:#FFF;']));

		addRule('.widdio .icon.center.play:hover',	'background-position: -240px 0px;');
		addRule('.widdio .icon.center.pause:hover',	'background-position: -360px 0px;');
		addRule('.widdio .icon.play:hover',			'background-position:    0px -30px;');
		addRule('.widdio .icon.pause:hover',		'background-position:  -30px -30px;');
		addRule('.widdio .icon.stop:hover',			'background-position:  -60px -30px;');
		addRule('.widdio .icon.mute:hover',			'background-position:  -90px -30px;');
		addRule('.widdio .icon.muted:hover',		'background-position: -120px -30px;');
		addRule('.widdio .icon.fullscreen:hover',	'background-position: -150px -30px;');

		addRule('.widdio .icon.play.center',		'background-position: -180px 0px;');
		addRule('.widdio .icon.pause.center',		'background-position: -300px 0px;');
		addRule('.widdio .icon.play',				'background-position:    0px 0px;');
		addRule('.widdio .icon.pause',				'background-position:  -30px 0px;');
		addRule('.widdio .icon.stop',				'background-position:  -60px 0px;');
		addRule('.widdio .icon.mute',				'background-position:  -90px 0px;');
		addRule('.widdio .icon.muted',				'background-position: -120px 0px;');
		addRule('.widdio .icon.fullscreen',			'background-position: -150px 0px;');

		addRule('.widdio .icon',glue([
			'background-image: url(data:image/png;base64,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);'
			,'backround-repeat: no-repeat;'
			,'height: 30px;'
			,'width: 30px;']));

		addRule('.widdio .overlay',glue([
			'position:absolute;'
			,'left:0;'
			,'top:0;'
			,'width:100%;'
			,'height:100%;']));

		addRule('.widdio .controls>*',glue([
			'position:relative;'
			,'height:100%;'
			,'overflow:hidden;'
			,'display:block;'
			,'float:left;'
			,'cursor:pointer;'
			,'text-align:center;']));

		addRule('.widdio .fadeOut',glue([
			'visibility:hidden;'
			,'opacity:0;'
			,'transition:visibility 0s 1000ms,opacity 1000ms linear;'
			,'-webkit-transition:visibility 0s 1000ms,opacity 1000ms linear;']));

		addRule('.widdio .icon.center.play, .widdio .controls',glue([
			'visibility:visible;'
			,'opacity:1;'
			,'transition:opacity 200ms linear;'
			,'-webkit-transition:opacity 200ms linear;']));

		addRule('.widdio.'+oReturn.SIZE_FULLSCREEN+' .controls',glue([
			'position:fixed;'
			,'bottom:0;']));
		addRule('.widdio .controls.over',glue([
			'position:absolute;'
			,'bottom:0;']));
		addRule('.widdio .controls',glue([
			'height:30px;'
			,'overflow:hidden;'
			,'background-color: rgba(0,0,0,0.4);']));

		//addRule('.widdio.'+ww.SCALE_NOBARS+' video',
		//	'overflow:hidden;');
		addRule('.widdio.'+oReturn.SIZE_FULLSCREEN+' video',glue([
			'width:100%;'
			,'height:100%;']));
		addRule('.widdio video',
			'display:block;');

		//addRule('.widdio.'+ww.SCALE_NOBARS+' .wrap',
		//	'overflow:hidden;');

		addRule('.widdio.'+oReturn.SCALE_NOBARS+' .staticwrap',glue([
			'width:100%;'
			,'height:100%;'
			,'overflow:hidden;']));

		addRule('.widdio.'+oReturn.SIZE_FULLSCREEN,glue([
			'position:fixed;'
			,'left:0;'
			,'top:0;'
			,'width:100%;'
			,'height:100%;'
			,'z-index:'+iMaxZ+';']));
		addRule('.widdio',glue([
			'position:relative;'
			//,'overflow:hidden;'
			,'z-index:auto;'
			,'color:white;']));

		//addRule('.widdio .icon.play::before,  .widdio .center.play::before',	'content:\'\';');	// String.fromCharCode(0xe047)
		//addRule('.widdio .icon.pause::before, .widdio .center.pause::before',	'content:\'\';');	// String.fromCharCode(0xe049)
		//addRule('.widdio .icon.stop:before',		'content:\'\';');								// String.fromCharCode(0xe04a)
		//addRule('.widdio .icon.mute:before',		'content:\'\';');								// String.fromCharCode(0xe072)
		//addRule('.widdio .icon.muted:before',		'content:\'\';');								// String.fromCharCode(0xe071)
		//addRule('.widdio .icon.fullscreen:before',	'content:\'\';');								// String.fromCharCode(0xe04e)

		if (sSheet!=='') $('head').append('<style>'+sSheet+'</style>');
		//bCssAdded = true;
		//
		/* jshint ignore:start */
		// overwrite addCss method so we don't need a boolean check
		addCss = function(){};
		/* jshint ignore:end */
	}


	/**
	 * Foo
	 * @param type
	 * @returns {CSSStyleSheet}
	 */
	function getSheetByMedia(type) {
		var aDocStyle = document.styleSheets
			,aMedia
			,oStyleSheet;
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
		return oStyleSheet;
	}

	/**
	 * Functional join with empty separator
	 * @param {Array} a The array
	 * @returns {string}
	 */
	function glue(a){
		return a.join('');
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
		if (attributes) for (var attr in attributes) mElement.setAttribute(attr,attributes[attr]);
		if (classes) {
			var oClassList = mElement.classList
				,aArguments = typeof(classes)==='string'?classes.split(' '):classes;
			oClassList.add.apply(oClassList,aArguments);
		}
		if (text) mElement.textContent = text;
		click&&mElement.addEventListener('click',click);
		parent&&parent.appendChild(mElement);
		return mElement;
	}

	return extend(initVideo,oReturn);
})(document,window);
}

