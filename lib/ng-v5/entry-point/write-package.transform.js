"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const tar = require("tar");
const transform_1 = require("../../brocc/transform");
const path_1 = require("../../util/path");
const copy_1 = require("../../util/copy");
const rimraf_1 = require("../../util/rimraf");
const log = require("../../util/log");
const nodes_1 = require("../nodes");
exports.writePackageTransform = transform_1.transformFromPromise((graph) => __awaiter(this, void 0, void 0, function* () {
    const entryPoint = graph.find(nodes_1.isEntryPointInProgress());
    const ngEntryPoint = entryPoint.data.entryPoint;
    const ngPackage = graph.find(node => node.type === 'application/ng-package').data;
    // 5. COPY SOURCE FILES TO DESTINATION
    log.info('Copying staged files');
    copy_1.copyFiles(`${path.dirname(ngEntryPoint.entryFilePath)}/**/*.d.ts`, entryPoint.data.outDir);
    yield copyJavaScriptBundles(entryPoint.data.stageDir, ngPackage.dest);
    yield copyTypingsAndMetadata(entryPoint.data.outDir, ngEntryPoint.destinationPath);
    // 6. WRITE PACKAGE.JSON
    log.info('Writing package metadata');
    const relativeDestPath = path.relative(ngEntryPoint.destinationPath, ngPackage.primary.destinationPath);
    yield writePackageJson(ngEntryPoint, ngPackage, {
        main: path_1.ensureUnixPath(path.join(relativeDestPath, 'bundles', ngEntryPoint.flatModuleFile + '.umd.js')),
        module: path_1.ensureUnixPath(path.join(relativeDestPath, 'esm5', ngEntryPoint.flatModuleFile + '.js')),
        es2015: path_1.ensureUnixPath(path.join(relativeDestPath, 'esm2015', ngEntryPoint.flatModuleFile + '.js')),
        typings: path_1.ensureUnixPath(`${ngEntryPoint.flatModuleFile}.d.ts`),
        // XX 'metadata' property in 'package.json' is non-standard. Keep it anyway?
        metadata: path_1.ensureUnixPath(`${ngEntryPoint.flatModuleFile}.metadata.json`)
    });
    // 7. CREATE PACKAGE .TGZ
    log.info('Creating package .tgz');
    _tar(`${ngEntryPoint.destinationPath}.tgz`, ngEntryPoint.destinationPath);
    log.success(`Built ${ngEntryPoint.moduleId}`);
    return graph;
}));
/**
 * Creates and writes a `package.json` file of the entry point used by the `node_module`
 * resolution strategies.
 *
 * #### Example
 *
 * A consumer of the enty point depends on it by `import {..} from '@my/module/id';`.
 * The module id `@my/module/id` will be resolved to the `package.json` file that is written by
 * this build step.
 * The proprties `main`, `module`, `typings` (and so on) in the `package.json` point to the
 * flattened JavaScript bundles, type definitions, (...).
 *
 * @param entryPoint An entry point of an Angular package / library
 * @param binaries Binary artefacts (bundle files) to merge into `package.json`
 */
function writePackageJson(entryPoint, pkg, binaries) {
    return __awaiter(this, void 0, void 0, function* () {
        log.debug('Writing package.json');
        const packageJson = entryPoint.packageJson;
        // set additional properties
        for (const fieldName in binaries) {
            packageJson[fieldName] = binaries[fieldName];
        }
        // read tslib version from `@angular/compiler` so that our tslib
        // version at least matches that of angular if we use require('tslib').version
        // it will get what installed and not the minimum version nor if it is a `~` or `^`
        if (!(packageJson.dependencies && packageJson.dependencies.tslib)) {
            const { dependencies: angularDependencies = {} } = require('@angular/compiler/package.json');
            const tsLibVersion = angularDependencies.tslib;
            if (tsLibVersion) {
                packageJson.dependencies = Object.assign({}, packageJson.dependencies, { tslib: tsLibVersion });
            }
        }
        // Verify non-peerDependencies as they can easily lead to duplicated installs or version conflicts
        // in the node_modules folder of an application
        const whitelist = pkg.whitelistedNonPeerDependencies.map(value => new RegExp(value));
        try {
            checkNonPeerDependencies(packageJson, 'dependencies', whitelist);
        }
        catch (e) {
            yield rimraf_1.rimraf(entryPoint.destinationPath);
            throw e;
        }
        // Removes scripts from package.json after build
        if (pkg.keepLifecycleScripts !== true) {
            log.info(`Removing scripts section in package.json as it's considered a potential security vulnerability.`);
            delete packageJson.scripts;
        }
        else {
            log.warn(`You enabled keepLifecycleScripts explicitly. The scripts section in package.json will be published to npm.`);
        }
        // keep the dist package.json clean
        // this will not throw if ngPackage field does not exist
        delete packageJson.ngPackage;
        packageJson.name = entryPoint.moduleId;
        // `outputJson()` creates intermediate directories, if they do not exist
        // -- https://github.com/jprichardson/node-fs-extra/blob/master/docs/outputJson.md
        yield fs.outputJson(path.resolve(entryPoint.destinationPath, 'package.json'), packageJson, { spaces: 2 });
    });
}
exports.writePackageJson = writePackageJson;
/**
 * Copies the JavaScript bundles from the staging directory to the npm package.
 */
function copyJavaScriptBundles(stageDir, destDir) {
    return __awaiter(this, void 0, void 0, function* () {
        yield copy_1.copyFiles(`${stageDir}/bundles/**/*.{js,js.map}`, path.resolve(destDir, 'bundles'));
        yield copy_1.copyFiles(`${stageDir}/esm5/**/*.{js,js.map}`, path.resolve(destDir, 'esm5'));
        yield copy_1.copyFiles(`${stageDir}/esm2015/**/*.{js,js.map}`, path.resolve(destDir, 'esm2015'));
    });
}
exports.copyJavaScriptBundles = copyJavaScriptBundles;
function copyTypingsAndMetadata(from, to) {
    return __awaiter(this, void 0, void 0, function* () {
        yield copy_1.copyFiles(`${from}/**/*.{d.ts,metadata.json}`, to);
    });
}
exports.copyTypingsAndMetadata = copyTypingsAndMetadata;
/**
 * Creates a tgz file with the directory contents.
 */
function _tar(file, dir) {
    return tar.create({
        gzip: true,
        strict: true,
        portable: true,
        cwd: dir,
        file: file,
        sync: true
    }, ['.']);
}
function checkNonPeerDependencies(packageJson, property, whitelist) {
    if (packageJson[property]) {
        Object.keys(packageJson[property]).forEach(dep => {
            if (whitelist.find(regex => regex.test(dep))) {
                log.debug(`Dependency ${dep} is whitelisted in '${property}'`);
            }
            else {
                log.warn(`Distributing npm packages with '${property}' is not recommended. Please consider adding ${dep} to 'peerDepenencies' or remove it from '${property}'.`);
                throw new Error(`Dependency ${dep} must be explicitly whitelisted.`);
            }
        });
    }
}
//# sourceMappingURL=write-package.transform.js.map