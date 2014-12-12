/*global module,require*/
module.exports = function(grunt) {
	'use strict';
	grunt.registerMultiTask('svgIcons', 'Convert svg icons to less file', function() {
		var fs = require('fs')
			,oData = this.data
			,sFontSrc = oData.src
			,sDest = oData.dest
			,rxContents = oData.contents||/<svg.*svg>/
			//
			,sTargetType = sDest.split('.').pop()
			,bTypeCSS = ['less','css','sass','scss'].indexOf(sTargetType)!==-1
			,sLine = '.icon-name { background-image: url(\'data:image/svg+xml;utf8,file\'); }'
			//
			,sTemp = './temp'
			,sTempSVG = sTemp+'/SVG/'
			//
			,AdmZip = require('adm-zip')
			,zip = new AdmZip(sFontSrc)
			,unzip = zip.extractAllTo(sTemp,true)
			//
			,aContents = []
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
					.match(rxContents).pop()
				;
				if (bTypeCSS) {
					aContents.push(
						sLine
						.replace('name',sName)
						.replace('file',sFile.replace(/'/g,'\''))
					);
				} else { // json
					aContents.push(
						'"'+sName+'":"'+sFile.replace(/"/g,'\\"')+'"'
					);
				}
				sContents += sLine
					.replace('name',sName)
					.replace('file',sFile)
				;
			}
			if (bTypeCSS) {
				sContents = aContents.join('\n');
			} else {
				sContents = '{'+aContents.join(',')+'}';
			}
		});
		fs.writeFileSync(sDest,sContents);
	});
};