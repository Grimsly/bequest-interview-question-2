const { VersionControlSync } = require("json-version-control");

const config = {
  sourceFilePath: "./data/source.json",
  headFilePath: "./data/head.json",
  historyDirectory: "./data/history",
  diffFilePrefix: "diff_",
};

export type DatabaseData = {
  data: string;
  pill: string;
};

const vc = new VersionControlSync(config);

/**
 * Insert the data to the JSON database
 * @param data Data to be inserted into the database
 */
export function insertData(data: DatabaseData) {
  vc.saveNewVersion(data);
}

/**
 * Retrieve the latest data in the database
 * @returns Latest data in the database
 */
export function getLatestData() {
  return vc.getLatestVersion();
}
