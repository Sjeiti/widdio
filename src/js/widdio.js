/**
 * A simple HTML5 video player
 * @summary A simple HTML5 video player
 * @namespace widdio
 * @version 2.0.3
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
		// browser/device detection
		,bWebkit = false//$.browser.webkit
		//,bIOs = !!navigator.userAgent.match(/iPod|iPhone|iPad/i)
		,bIPad = !!navigator.userAgent.match(/iPad/i)
		//
		,fnFullscreen
		//
		,sClassnameHide = 'fadeOut'
		//
		,sCSS = '.widdio{position:relative;z-index:auto;color:white}.widdio.fullscreen{position:fixed;left:0;top:0;width:100%;height:100%;z-index:2147483647}.widdio.nobars .staticwrap{width:100%;height:100%;overflow:hidden}.widdio.fullscreen video{width:100%;height:100%}.widdio .staticwrap{height:100%}.widdio video{display:block}.widdio .controls{height:30px;overflow:hidden;background-color:rgba(0,0,0,0.4)}.widdio .controls.over{position:absolute;bottom:0}.widdio .controls>*{position:relative;height:100%;overflow:hidden;display:block;float:left;cursor:pointer;text-align:center}.widdio.fullscreen .controls{position:fixed;bottom:0}.widdio .icon.center.play,.widdio .controls{visibility:visible;opacity:1;transition:opacity 200ms linear;-webkit-transition:opacity 200ms linear}.widdio .fadeOut{visibility:hidden;opacity:0;transition:visibility 0s 1000ms, opacity 1000ms linear;-webkit-transition:visibility 0s 1000ms, opacity 1000ms linear}.widdio .overlay{position:absolute;left:0;top:0;width:100%;height:100%}.widdio .icon{background-image:url(data:image/png;base64,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);backround-repeat:no-repeat;height:30px;width:30px}.widdio .icon.play.center{background-position:-180px 0}.widdio .icon.pause.center{background-position:-300px 0}.widdio .icon.play{background-position:0px 0px}.widdio .icon.pause{background-position:-30px 0}.widdio .icon.stop{background-position:-60px 0}.widdio .icon.mute{background-position:-90px 0}.widdio .icon.muted{background-position:-120px 0}.widdio .icon.fullscreen{background-position:-150px 0}.widdio .icon.center.play:hover{background-position:-240px 0}.widdio .icon.center.pause:hover{background-position:-360px 0}.widdio .icon.play:hover{background-position:0 -30px}.widdio .icon.pause:hover{background-position:-30px -30px}.widdio .icon.stop:hover{background-position:-60px -30px}.widdio .icon.mute:hover{background-position:-90px -30px}.widdio .icon.muted:hover{background-position:-120px -30px}.widdio .icon.fullscreen:hover{background-position:-150px -30px}.widdio .icon.center{position:absolute;left:50%;top:50%;width:50px;height:50px;margin:-25px 0 0 -25px}.widdio .bar{position:relative;width:1px;margin-top:10px;height:10px;background-color:#FFF}.widdio .bar>*{position:absolute;left:0;top:0}.widdio .time{font-weight:bold;font-size:12px;line-height:30px}'
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
		if (video.constructor===HTMLVideoElement) video = [video];
		for (var i=0,l=video.length;i<l;i++) {
			aWiddioObj.push(instance(video[i],options));
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

	/**
	 * Factory method for video instances
	 * @param {HTMLVideoElement} video
	 * @param {Object} _settings
	 * @returns {widdio}
	 */
	function instance(video,_settings) {
		var pause = togglePlay.bind(undefined,false)
			//
			,oSettings = extend(extend({},_settings),oDefault.defaults)
			//
			,iVidW
			,iVidH
			,fVidAspR
			//
			,iWidW
			,iWidH // excluding controls bar
			,fWidAspR
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
			,mWiddioGhost
			//
			,sVideoID = mVideo.getAttribute('id')
			//
			,axSources
			//
			,sOriginalSize
			//
			,iCenterFadeID = 0
			,iControlsFadeID = 0
			,iCenterFadeTime = 1500
			//
			,iControlsHeight
			//
			,sState = oReturn.STATE_START
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
			iVidW = mVideo.offsetWidth;
			iVidH = mVideo.offsetHeight;
			if (oSettings.width===null)	oSettings.width =  !!iVidAtrW?parseInt(iVidAtrW):iVidW;
			if (oSettings.height===null)oSettings.height = !!iVidAtrH?parseInt(iVidAtrH):iVidH;
			//
			// prepare video
			axSources = mVideo.querySelectorAll('source');
			mVideo.controls = false;
			//
			// fix iPad
			if (bIPad) {
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
			extend(mVideo,{widdio:{
				 video:			mVideo
				,play: function(file) {
					if (file===undefined) {
						togglePlay(true);
					} else {
						playVideo(file);
					}
				}
				,stop:			stop
				,toggle:		togglePlay.bind(undefined,undefined)//function(){togglePlay();}
				,pause:			pause
				,sound:			toggleSound
				,fullscreen:	toggleFullscreen
				,isPlaying:		isPlaying
				,getState:		function(){return sState;}
				,toString:		function(){return '[WiddioInstance #'+sVideoID+']';}
			}});
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
			mVideo.addEventListener('click',togglePlay);
		}

		/**
		 * Initialise instance view
		 */
		function  initInstView(){
			addCss();
			addControls();
			resize();
		}

		/**
		 * Wrap the video element and add controls
		 */
		function addControls(){
			var sVideoClass = mVideo.getAttribute('class')
				,aVideoClass = sVideoClass?sVideoClass.split(' '):[];
			Array.prototype.push.call(aVideoClass,'widdio',oReturn.STATE_START,oSettings.size,oSettings.scaleMode);
			mWiddio = createDiv(aVideoClass,undefined,{id:oDefault.id.toLowerCase()+'_'+sVideoID});
			mStaticWrap = createDiv('staticwrap',mWiddio);
			mWrap = createDiv('wrap',mStaticWrap);
			console.log('controls',['controls',oSettings.controlsPosition]); // log
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
					if (oSettings.controlsFadeWhenPaused||!mVideo.paused) {
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
						if (!mVideo.paused) mCenter&&mCenter.classList.add(sClassnameHide);
					},iCenterFadeTime);
					if (oSettings.controlsPosition===oReturn.CONTROLS_OVER) {
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
		 * Resize the widdio instance
		 */
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

		/**
		 * Resize the instance video
		 */
		function resizeVideo() {//todo:iWidW
			var sL = 'auto';//todo:iWidW
			var sT = 'auto';//todo:iWidW
			var sW = '100%';//todo:iWidW
			var sH = '100%';//todo:iWidW
			mWiddio.style.width = iWidW+'px';
			mWiddio.style.height = iWidH+'px';
			//var bNoBars = oSettings.scaleMode===ww.SCALE_NOBARS;
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

		/**
		 * Resize the instance controls
		 */
		function resizeControls() {
			mControls.style.width = iWidW+'px';
			var iOverW = mControls.offsetWidth-iWidW;
			if (iOverW) mControls.style.width = (iWidW-iOverW)+'px';
		}

		//var iReisizeScrub;
		/**
		 * Resize the instance scrub control
		 * @todo does not always init with multiple videos
		 */
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

		/**
		 * Toggle instance fullscreen
		 */
		function toggleFullscreen(){
			//console.log('toggleFullscreen',!!fnFullscreen,bWebkit); // log
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
			} else if (bWebkit&&mVideo.webkitSupportsFullscreen) { // &&!oVideo.webkitDisplayingFullscreen
				mVideo.webkitEnterFullscreen();
			} else {
				setFullscreenView();
			}
		}

		/**
		 * Change to- or from fullscreen
		 * @param {boolean} toFullscreen
		 */
		function setFullscreenView(toFullscreen){
			if (toFullscreen===undefined) toFullscreen = oSettings.size!==oReturn.SIZE_FULLSCREEN;
			//
			var bPlaying = !mVideo.paused;
			mWiddio.classList.remove(oSettings.size);
			if (toFullscreen) {
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
			!fnFullscreen&&bPlaying&&mVideo.play();
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
		 * Stops the video playback
		 */
		function stop() {
			pause();
			mVideo.currentTime = 0;
		}

		/**
		 * Toggles the video playback
		 * @param {boolean} [play] Optionally force playback
		 */
		function togglePlay(play) {
			var bForcePlay = play===true
				,bForcePause = play===false
				,bForce = bForcePlay||bForcePause;
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
			var bT = e===true;
			var bF = e===false;
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
		 * Handles the media event
		 * @param {Event} e
		 */
		function handleMediaEvent(e) {
			switch (e.type) {
				case 'loadedmetadata':
					iVidW = mVideo.videoWidth;
					iVidH = mVideo.videoHeight;
					fVidAspR = iVidW/iVidH;
					resize();
					showTime();
				break;
				case 'canplay':
					//console.log('canplay'); // log
				break;
				case 'play':
					showPlayPause();
					setCssState();
					if (oReturn.playOne) playOne(mVideo);
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
					mVideo.pause();
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

		/**
		 * Sets the CSS state
		 */
		function setCssState() {
			var sOldState = sState;
			if (mVideo.paused) {
				if (mVideo.currentTime===0) sState = oReturn.STATE_START;
				else if (mVideo.currentTime===mVideo.duration) sState = oReturn.STATE_ENDED;
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
		return {
			 video:				mVideo
			,resize:			resize
			,setFullscreenView:	setFullscreenView
			,pause:				pause
		};
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
		var oSheet
			,bCannotAdd = false;
		//var aValidMedia = ['screen','all','handheld'];
		if (document.styleSheets&&document.styleSheets.length) {
			oSheet = getSheetByMedia('all')||getSheetByMedia('screen')||document.styleSheets[0];
		}
		if (!oSheet) bCannotAdd = true;
		//document.querySelector('head').appendChild(document.createElement('link'));
		//$('<link type="text/css" rel="stylesheet" />').prependTo($('head'));
		function addRule(selector,rule){
			try {
				if (oSheet.insertRule) oSheet.insertRule(selector+'{'+rule+'}', 0);
				else oSheet.addRule(selector,rule);
			} catch (err) { // todo: code this better
				bCannotAdd = true;
			}
		}
		if (!bCannotAdd) {
			sCSS.split('}').reverse().forEach(function(subst){
				var rla = subst.split('{')
					,sRule = rla.shift()
					,sRules = rla.pop();
				addRule(sRule,sRules);
			});
		} else {
			createElement('style',undefined,document.querySelector('head')).innerHTML = sCSS;
		}
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

