/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */
/**
 * JSON Schema for `ng-package.json` description file
 */
export interface NgPackageConfig {
    $schema?: string;
    /**
     * Delete output path before build.
     */
    deleteDestPath?: boolean;
    /**
     * Destination folder where distributable binaries of the Angular library are written (default: `dist`).
     */
    dest?: string;
    /**
     * Enable this to keep the 'scripts' section in package.json. Read the NPM Blog on 'Package install scripts vulnerability' – http://blog.npmjs.org/post/141702881055/package-install-scripts-vulnerability
     */
    keepLifecycleScripts?: boolean;
    /**
     * Internal working directory of ng-packagr where intermediate build files are stored (default: `.ng_pkg_build`).
     */
    workingDirectory?: string;
    /**
     * A list of dependencies that are allowed in the 'dependendencies' and 'devDependencies' section of package.json. Values in the list are regular expressions matched against npm package names.
     */
    whitelistedNonPeerDependencies?: string[];
    /**
     * Description of the library's entry point.
     */
    lib?: {
        /**
         * Entry file to the public API (default: `src/public_api.ts`).
         */
        entryFile?: string;
        /**
         * Filename of the auto-generated flat module file (if empty, defaults to the package name as given in `package.json`).
         */
        flatModuleFile?: string;
        /**
         * A map of external dependencies and their correspondent UMD module identifiers. Map keys are TypeScript / EcmaScript module identifiers. Map values are UMD module ids. The purpose of this map is to correctly bundle an UMD module file (with `rollup`). By default, `rxjs`, `tslib` and `@angular/*` dependency symbols are supported.
         */
        umdModuleIds?: {
            [k: string]: any;
        };
        /**
         * A property to indicate whether your library is going to be bundling jsx/tsx files. This passes through to tsconfig - see https://www.typescriptlang.org/docs/handbook/jsx.html
         */
        jsx?: "preserve" | "react" | "react-native" | "";
        /**
         * Embed assets in css file using data URIs - see https://css-tricks.com/data-uris
         */
        cssUrl?: "none" | "inline";
        /**
         * Any additional paths that should be used to resolve style imports
         */
        styleIncludePaths?: string[];
        /**
         * Set typescript language level, i.e. tsconfig.lib. This will enable accessing typescript features available in es2016, es2017, etc.
         */
        languageLevel?: string[];
        /**
         * ID for AMD module. By default, uses a value derived from the entry point's module ID (i.e., name property in package.json)
         */
        amdId?: string;
        /**
         * ID for the UMD bundle. By default, uses a value derived from the entry point's module ID (i.e., name property in package.json)
         */
        umdId?: string;
        [k: string]: any;
    };
}
