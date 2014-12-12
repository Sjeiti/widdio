/*global module, require*/
/**
 * Insert variables into a script.
 */
module.exports = function(grunt) {
	'use strict';
	grunt.registerMultiTask('insert_vars', '', function() {
		var fs = require('fs')
			,oData = this.data
			,sFileName = oData.file
			,oReplace = oData.replace
			,bToString = oData.toString===true
			,sFile = fs.readFileSync(sFileName).toString()
			,sNewFile = sFile
		;
		for (var search in oReplace) {
			var aFile = oReplace[search]
				,sConcat = ''
//				,sTarget = fs.readFileSync(oFile).toString()
//				,sRegexp = new RegExp(','+search+'\\s?=\\s?\'.*$','m')
				,sRegexp = new RegExp(','+search+'\\s?=\\s?.*$','m')
				,sReplacement// = ','+search+' = \''+sTarget.replace(/\\/g,'\\\\').replace(/'/g,'\\\'')+'\''// todo: escape '
			;
			aFile.forEach(function(fileName){
				sConcat += fs.readFileSync(fileName).toString();
			});
			if (bToString) sReplacement = ','+search+' = \''+sConcat.replace(/\\/g,'\\\\').replace(/'/g,'\\\'')+'\'';
			else sReplacement = ','+search+' = '+sConcat;

			console.log('bToString',bToString); // log

			sNewFile = sNewFile.replace(sRegexp,sReplacement);
		}
		if (sFile!==sNewFile) {
			fs.writeFileSync(sFileName,sNewFile);
			console.log('File',sFileName,'changed');
		}
	});
};