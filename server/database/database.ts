const { VersionControlSync } = require("json-version-control");

const config = {
  sourceFilePath: "./data/source.json",
  headFilePath: "./data/head.json",
  historyDirectory: "./data/history",
  diffFilePrefix: "diff_",
};

export type DatabaseData = {
  data: string;
  // pill: string;
};

const vc = new VersionControlSync(config);

export function insertData(data: DatabaseData) {
  vc.saveNewVersion(data);
}

export function getLatestData() {
  return vc.getLatestVersion();
}
