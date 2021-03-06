/**
 * Generates spec interfaces for Java RAML 1.0 and 0.8 parser.
 * 
 * Command line parameters:
 * -dstPath location of the target workspace. Default is ./java/nativeParser in the 'api-workbench' project
 *
 **/

/// <reference path="../typings/main.d.ts" />

import javaNativeParserWrappersGenerator = require("./javaNativeParserWrappersGenerator");
import path = require("path");
import def = require("raml-definition-system");
import universeDef = def.universesInfo;
import util = require("./util");
import fsutil = require("./fsutil");

var DEFAULT_DST = path.resolve(__dirname,"../java");
var STATIC_CODE_DIR = path.resolve(__dirname,"../staticCode");
var PARENT_PROJECT = "spec-model";

var SPEC_PROJECT_NAME_10 = 'raml-spec-model-1.0';

var SPEC_PROJECT_NAME_08 = 'raml-spec-model-0.8';

var ROOT_PACKAGE = "org.raml";

function generate( _dstWSPath:string, rootPackage )
{

    var defSysVer = definitionSystemVersion();
    var timestamp = new Date().toISOString();

    var options:fsutil.CopyOptions = {
        forceDelete: true,
        contentReplacements: {
            "__TIMESTAMP__": timestamp,
            "__DEFINITION_SYSTEM_VERSION__": defSysVer
        }
    };

    var parentProjectPathDst = path.resolve(_dstWSPath,PARENT_PROJECT);
    var parentProjectPathSrc = path.resolve(STATIC_CODE_DIR,PARENT_PROJECT);
    fsutil.copyDirSyncRecursive(parentProjectPathDst,parentProjectPathSrc,options);

    var universe10 = def.getUniverse("RAML10");
    var apiType10= universe10.type(universeDef.Universe10.Api.name);


    var raml10SrcFolder = path.resolve(parentProjectPathDst, `${SPEC_PROJECT_NAME_10}/src/main/java`);
    var corePackage10 = rootPackage + ".model" + javaNativeParserWrappersGenerator.versionPackageSegment("RAML10") + ".core";
    var fragmentPackage10 = rootPackage + ".model" + javaNativeParserWrappersGenerator.versionPackageSegment("RAML10") +".fragment";
    var wrapperConfig10 = {
        rootPackage: rootPackage,
        sourceFolderAbsolutePath: raml10SrcFolder,
        ramlVersion: "RAML10",
        generateImplementation:false,
        ignoreInSufficientHelpers:true,
        generateRegistry:false,
        corePackage: corePackage10,
        fragmentPackage: fragmentPackage10
    };
    javaNativeParserWrappersGenerator.def2Parser(apiType10, wrapperConfig10, universe10);

    var universe08 = def.getUniverse("RAML08");
    var apiType08= universe08.type(universeDef.Universe08.Api.name);

    var raml08SrcFolder = path.resolve(parentProjectPathDst, `${SPEC_PROJECT_NAME_08}/src/main/java`);
    var corePackage08 = rootPackage + ".model" + javaNativeParserWrappersGenerator.versionPackageSegment("RAML08") +".core";
    var wrapperConfig08 = {
        rootPackage: rootPackage,
        sourceFolderAbsolutePath: raml08SrcFolder,
        ramlVersion: "RAML08",
        generateImplementation:false,
        ignoreInSufficientHelpers:true,
        generateRegistry:false,
        corePackage: corePackage08
    };
    javaNativeParserWrappersGenerator.def2Parser(apiType08, wrapperConfig08, universe08);

    var originalCodeSrc = path.resolve(STATIC_CODE_DIR,"src");

    var replacementOptions10:fsutil.CopyOptions = {
        forceDelete: true,
        contentPatternReplacements: {
            ".java$": {
                "map": {
                    "__core_package__": corePackage10,
                    "__fragment_package__": fragmentPackage10
                }
            }
        },
        pathReplacements: {
            "__core_package__": corePackage10.replace(/\./g, "/"),
            "__fragment_package__": fragmentPackage10.replace(/\./g, "/")
        }
    };

    fsutil.copyDirSyncRecursive(raml10SrcFolder,originalCodeSrc, replacementOptions10);

    var replacementOptions08:fsutil.CopyOptions = {
        forceDelete: true,
        contentPatternReplacements: {
            ".java$": {
                "map": {
                    "__core_package__": corePackage08
                }
            }
        },
        pathReplacements: {
            "__core_package__": corePackage08.replace(/\./g, "/")
        }
    };
    var regExp = new RegExp("[/\\\\]__fragment_package__[/\\\\]");
    fsutil.copyDirSyncRecursive(raml08SrcFolder,originalCodeSrc, replacementOptions08,x=>!regExp.test(x));
}

var dstWorkspacePath;
var rootPackage;

var args:string[] = process.argv;
for(var i = 0 ; i < args.length ; i++){
    if(args[i]=='-dstPath' && i < args.length-1){
        dstWorkspacePath = args[i+1];
    }
    else if(args[i]=='-rootPackage' && i < args.length-1){
        rootPackage = args[i+1];
    }
}

if(!dstWorkspacePath){
    dstWorkspacePath = DEFAULT_DST;
}
if(!rootPackage){
    rootPackage = ROOT_PACKAGE;
}


generate( dstWorkspacePath, rootPackage );

function definitionSystemVersion():string{
    try {
        var defSystemPackageJson:any = require("../node_modules/raml-definition-system/package.json");
        return defSystemPackageJson.version;
    }
    catch(e){
        return "unknown";
    }
}