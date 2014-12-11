/*global module,require*/
module.exports = function(grunt) {
	'use strict';
	grunt.registerMultiTask('svgIcons', 'Convert svg icons to less file', function() {
		var fs = require('fs')
			,oData = this.data
			,sFontSrc = oData.src
			,sDest = oData.dest
			//
			,sTemp = './temp'
			,sTempSVG = sTemp+'/SVG/'
			//
			,AdmZip = require('adm-zip')
			,zip = new AdmZip(sFontSrc)
			,unzip = zip.extractAllTo(sTemp,true)
			//
			,sLine = '.icon-name { background-image: url(\'data:image/svg+xml;utf8,file\'); }\n'
			,sContents = ''
		;
		unzip; // prevent jshint error
		//
		fs.readdirSync(sTempSVG).forEach(function(file){
			var sFilePath = sTempSVG+file
				,sName = file.split(/\./).shift()
			;
			if (!fs.lstatSync(sFilePath).isDirectory()) {
				var sFile = fs.readFileSync(sFilePath)
					.toString()
					.replace(/[\r\n\t]/g,'')
					.match(/<svg.*svg>/).pop()
				;
				sContents += sLine
					.replace('name',sName)
					.replace('file',sFile)
				;
			}
		});
		fs.writeFileSync(sDest,sContents);
	});
};