/**
 * This module exports an object with configuration options for the i18next-scanner library.
 * It uses the i18next-scanner to extract translation keys from TypeScript React components and update translation files.
 * @module i18nextScannerConfig
 */

const fs = require("fs");

/** The separator used between a key and its translation in the source code. */
const keySeparator = ": ";

/** The namespace separator used between the namespace and the key in the source code. */
const nsSeparator = false; //": ";

module.exports = {
  /** The input file(s) to scan for translation keys. */
  input: ["./**/*.tsx"],
  /** The output directory where updated translation files will be saved. */
  output: "./",
  /** Options for i18next-scanner. */
  options: {
    /** Whether or not the scanner should run in debug mode. */
    debug: false,
    /** Whether or not translation keys should be sorted alphabetically in the translation files. */
    sort: true,
    /** Whether or not unused translation keys should be removed from the translation files. */
    removeUnusedKeys: true,
    /** Functions to search for in the source code that indicate a translation key. */
    func: {
      list: ["i18next.t", "i18n.t", "t", "tr", "__"],
      extensions: [".js", ".tsx"],
    },
    /** The languages to generate translation files for. */
    lngs: ["en", "es"],
    /** The namespaces to use in the translation files. */
    ns: ["locales"],
    /** The default namespace to use in the translation files. */
    defaultNs: "locales",
    /** The default language to use if a translation is missing. */
    defaultLng: "en",
    /** The namespace separator used between the namespace and the key in the translation files. */
    nsSeparator,
    /** The separator used between a key and its translation in the translation files. */
    keySeparator,
    /** Options for the resource file, such as the path to load/save translation files. */
    resource: {
      loadPath: "./public/{{ns}}/{{lng}}.json",
      savePath: "./public/{{ns}}/{{lng}}.json",
      jsonIndent: 2,
      lineEnding: "\n",
    },
  },
  /**
   * Custom transform function to extract translation keys from TypeScript React components.
   * @param {object} file - The file object.
   * @param {string} enc - The encoding type of the file.
   * @param {function} done - Callback function to indicate when processing is complete.
   */
  transform: function customTransform(file, enc, done) {
    "use strict";
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    parser.parseFuncFromString(content, { list: ["i18next.t", "i18n.t", "t"] }, (key, options) => {
      parser.set(
        key,
        Object.assign({}, options, {
          defaultValue: key.includes(keySeparator) ? key.split(keySeparator)[1] : key,
          nsSeparator: key.includes(nsSeparator) ? nsSeparator : false,
          keySeparator,
        }),
      );
    });
    done();
  },
};
